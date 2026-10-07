#!/usr/bin/env node

/**
 * Publish audio to the recordings page.
 *
 *   npm run publish-audio -- <library-folder> [--dry-run]
 *
 * Uploads the folder to the recordings bucket and rebuilds index.json, the manifest the
 * /recordings page loads. The first level of folders are the page's sections (albums, tracks,
 * stems, dailies, one-shots, or any other name); folders inside a section are groups such as an
 * album or a sample pack.
 *
 * Publishing is additive: anything already in the bucket that is not in <library-folder> stays on
 * the page, so a single new album can be published on its own. A folder published without its
 * meta.json keeps the details it was last published with. To remove something, delete it from the
 * bucket and run this again.
 *
 * Needs ffmpeg and ffprobe (metadata and waveforms) and gcloud (upload) on PATH.
 * See CLAUDE.md, "Recordings", for the folder layout and meta.json fields.
 */

const fs = require("fs")
const os = require("os")
const path = require("path")
const { spawnSync } = require("child_process")

// Keep in sync with RECORDINGS_BUCKET in web/src/utils/recordings.ts
const BUCKET = "joshwentworth-recordings"
const STORAGE_API = `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o`

const AUDIO_FILE = /\.(mp3|m4a|aac|wav|flac|ogg|opus)$/i
const COVER_FILE = /^cover\.(jpe?g|png|webp)$/i
const META_FILE = "meta.json"
const INDEX_FILE = "index.json"
// Never uploaded: dotfiles, OS droppings, the meta.json sources and a stray local index.json
const RSYNC_EXCLUDE = String.raw`(^|.*[\\/])(\..*|meta\.json|Thumbs\.db|desktop\.ini)$|^index\.json$`

const SECTION_ORDER = ["albums", "tracks", "dailies", "stems", "one-shots"]
const SECTION_LAYOUT = { albums: "album", "one-shots": "grid" }
const NEWEST_FIRST = ["tracks", "dailies"]
const LAYOUTS = ["album", "list", "grid"]

const PEAK_COUNT = 200
const PEAK_SAMPLE_RATE = 8000
// One character per peak, 64 levels. Decoded by decodePeaks in web/src/utils/recordings.ts
const PEAK_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

const fail = (message) => {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { maxBuffer: 1024 * 1024 * 1024, ...options })
  if (result.error || result.status !== 0) {
    const detail = result.error ? result.error.message : String(result.stderr || "").trim()
    throw new Error(`${command} failed: ${detail}`)
  }
  return result.stdout
}

// gcloud is a .cmd shim on Windows, which Node only runs through a shell
const gcloud = (args, options = {}) => {
  if (process.platform !== "win32") {
    return run("gcloud", args, options)
  }
  return run(`gcloud ${args.map((arg) => `"${arg}"`).join(" ")}`, [], { shell: true, ...options })
}

const requireTool = (command, args, hint) => {
  try {
    if (command === "gcloud") {
      gcloud(args)
    } else {
      run(command, args)
    }
  } catch {
    fail(`${command} was not found on PATH. ${hint}`)
  }
}

// ---------------------------------------------------------------------------
// Reading the local library
// ---------------------------------------------------------------------------

const walk = (root, relative = "") => {
  const files = []
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue
    }
    const child = relative ? `${relative}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...walk(root, child))
    } else if (entry.isFile()) {
      files.push(child)
    }
  }
  return files
}

const hasMeta = (root, folder) => fs.existsSync(path.join(root, folder, META_FILE))

const readMeta = (root, folder) => {
  const file = path.join(root, folder, META_FILE)
  if (!fs.existsSync(file)) {
    return {}
  }
  try {
    const meta = JSON.parse(fs.readFileSync(file, "utf8"))
    if (typeof meta !== "object" || meta === null || Array.isArray(meta)) {
      throw new Error("expected a JSON object")
    }
    return meta
  } catch (error) {
    return fail(`${folder}/${META_FILE} is not valid: ${error.message}`)
  }
}

const probe = (file) => {
  const output = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration:format_tags:stream_tags",
    "-of",
    "json",
    file,
  ])
  const data = JSON.parse(output.toString("utf8"))
  // Ogg and Opus keep tags on the stream; everything else on the container
  const tags = {}
  for (const source of [...(data.streams || []).map((stream) => stream.tags), data.format && data.format.tags]) {
    for (const [key, value] of Object.entries(source || {})) {
      tags[key.toLowerCase()] = String(value).trim()
    }
  }
  return { duration: Number(data.format && data.format.duration) || 0, tags }
}

const computePeaks = (file) => {
  const pcm = run("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(PEAK_SAMPLE_RATE), "-f", "s16le", "-"])
  const sampleCount = Math.floor(pcm.length / 2)
  if (sampleCount === 0) {
    return ""
  }
  const levels = []
  for (let bucket = 0; bucket < PEAK_COUNT; bucket++) {
    const start = Math.floor((bucket * sampleCount) / PEAK_COUNT)
    const end = Math.max(start + 1, Math.floor(((bucket + 1) * sampleCount) / PEAK_COUNT))
    let sumOfSquares = 0
    for (let i = start; i < end && i < sampleCount; i++) {
      const sample = pcm.readInt16LE(i * 2)
      sumOfSquares += sample * sample
    }
    levels.push(Math.sqrt(sumOfSquares / (end - start)))
  }
  const loudest = Math.max(...levels)
  if (loudest === 0) {
    return PEAK_ALPHABET[0].repeat(PEAK_COUNT)
  }
  return levels.map((level) => PEAK_ALPHABET[Math.round((level / loudest) * (PEAK_ALPHABET.length - 1))]).join("")
}

const LEADING_DATE = /^(\d{4}-\d{2}-\d{2})[\s._-]*/
const LEADING_NUMBER = /^(\d{1,3})[\s._-]+(?=\S)/

const firstNumber = (value) => {
  const match = /\d+(\.\d+)?/.exec(value || "")
  return match ? Number(match[0]) : undefined
}

/**
 * Everything the page shows for one audio file, before meta.json overrides. Decoding the audio for
 * the waveform is the slow part, so peaks from the last publish are passed in when the file is unchanged.
 */
const readTrack = (root, relativePath, stat, knownPeaks) => {
  const file = path.join(root, relativePath)
  const { duration, tags } = probe(file)
  const baseName = path.basename(relativePath).replace(AUDIO_FILE, "")
  const fileDate = LEADING_DATE.exec(baseName)
  const tagDate = /^\d{4}(-\d{2}-\d{2})?/.exec(tags.date || "")

  return {
    path: relativePath,
    // The file name with any leading date removed; a leading track number is handled per group
    fileTitle: baseName.replace(LEADING_DATE, "") || baseName,
    tagTitle: tags.title || undefined,
    number: firstNumber(tags.track),
    date: (fileDate && fileDate[1]) || (tagDate && tagDate[0]) || undefined,
    bpm: firstNumber(tags.tbpm || tags.bpm || tags.tmpo),
    key: tags.initialkey || tags.key || tags.tkey || undefined,
    duration: Math.round(duration * 100) / 100,
    peaks: knownPeaks !== undefined ? knownPeaks : computePeaks(file),
    bytes: stat.size,
    modified: stat.mtime.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// The bucket
// ---------------------------------------------------------------------------

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: "no-store" })
  if (response.status === 404) {
    return undefined
  }
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }
  return response.json()
}

const listBucket = async () => {
  const names = new Set()
  let pageToken
  do {
    const params = new URLSearchParams({ fields: "items(name),nextPageToken" })
    if (pageToken) {
      params.set("pageToken", pageToken)
    }
    const page = (await fetchJson(`${STORAGE_API}?${params}`)) || {}
    for (const item of page.items || []) {
      names.add(item.name)
    }
    pageToken = page.nextPageToken
  } while (pageToken)
  return names
}

// ---------------------------------------------------------------------------
// Building the index
// ---------------------------------------------------------------------------

const titleCase = (name) => name.replace(/(^|[\s_-])([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase())

const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })

const sectionRank = (id) => {
  const rank = SECTION_ORDER.indexOf(id)
  return rank === -1 ? SECTION_ORDER.length : rank
}

/** Flattens a published index back into the per-track and per-folder records it was built from */
const flattenIndex = (index) => {
  const tracks = []
  const groups = new Map()
  const sections = new Map()
  for (const section of (index && index.sections) || []) {
    const { groups: sectionGroups, ...sectionFields } = section
    sections.set(section.id, sectionFields)
    for (const group of sectionGroups || []) {
      const { tracks: groupTracks, ...groupFields } = group
      groups.set(group.path, groupFields)
      tracks.push(...(groupTracks || []))
    }
  }
  return { tracks, groups, sections }
}

const sortKey = (track) => track.date || track.modified

const buildIndex = ({ tracks, groups, sections }) => {
  const bySection = new Map()
  for (const track of tracks) {
    const folder = path.posix.dirname(track.path)
    const sectionId = folder.split("/")[0]
    if (!bySection.has(sectionId)) {
      bySection.set(sectionId, new Map())
    }
    const sectionGroups = bySection.get(sectionId)
    if (!sectionGroups.has(folder)) {
      sectionGroups.set(folder, [])
    }
    sectionGroups.get(folder).push(track)
  }

  const builtSections = [...bySection.entries()].map(([id, sectionGroups]) => {
    const sectionFields = sections.get(id) || {}
    const newestFirst = (sectionFields.sort || (NEWEST_FIRST.includes(id) ? "newest" : "name")) === "newest"

    const builtGroups = [...sectionGroups.entries()].map(([folder, groupTracks]) => {
      const groupFields = groups.get(folder) || {}
      groupTracks.sort((a, b) => {
        if (a.number !== undefined && b.number !== undefined && a.number !== b.number) {
          return a.number - b.number
        }
        return newestFirst ? sortKey(b).localeCompare(sortKey(a)) : natural(a.title, b.title)
      })
      return {
        path: folder,
        // Tracks directly inside the section folder form an untitled group
        title: folder === id ? undefined : groupFields.title || folder.split("/").slice(1).join(" / "),
        description: groupFields.description,
        date: groupFields.date,
        cover: groupFields.cover,
        tracks: groupTracks,
      }
    })

    // Groups are newest first unless the section asks for name order
    const groupDate = (group) => group.date || group.tracks.map(sortKey).sort().pop()
    const groupName = (group) => group.title || group.path
    builtGroups.sort((a, b) => {
      if ((a.path === id) !== (b.path === id)) {
        return a.path === id ? -1 : 1
      }
      const byDate = sectionFields.sort === "name" ? 0 : groupDate(b).localeCompare(groupDate(a))
      return byDate || natural(groupName(a), groupName(b)) || natural(a.path, b.path)
    })

    return {
      id,
      title: sectionFields.title || titleCase(id),
      description: sectionFields.description,
      layout: LAYOUTS.includes(sectionFields.layout) ? sectionFields.layout : SECTION_LAYOUT[id] || "list",
      sort: sectionFields.sort,
      groups: builtGroups,
    }
  })

  builtSections.sort((a, b) => sectionRank(a.id) - sectionRank(b.id) || natural(a.id, b.id))
  return { version: 1, generated: new Date().toISOString(), sections: builtSections }
}

// ---------------------------------------------------------------------------

const main = async () => {
  const args = process.argv.slice(2)
  const options = args.filter((arg) => arg.startsWith("-"))
  const folders = args.filter((arg) => !arg.startsWith("-"))
  // A mistyped --dry-run must not turn a preview into a real publish
  if (folders.length !== 1 || options.some((option) => option !== "--dry-run")) {
    fail("Usage: npm run publish-audio -- <library-folder> [--dry-run]")
  }
  const dryRun = options.includes("--dry-run")
  const [source] = folders
  const root = path.resolve(process.env.INIT_CWD || process.cwd(), source)
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    fail(`${root} is not a folder`)
  }

  requireTool("ffprobe", ["-version"], "Install ffmpeg, for example: winget install Gyan.FFmpeg")
  requireTool("ffmpeg", ["-version"], "Install ffmpeg, for example: winget install Gyan.FFmpeg")
  if (!dryRun) {
    requireTool("gcloud", ["--version"], "Install the Google Cloud SDK and run: gcloud auth login")
  }

  const files = walk(root)
  const audioFiles = files.filter((file) => AUDIO_FILE.test(file))
  const loose = audioFiles.filter((file) => !file.includes("/"))
  if (loose.length > 0) {
    console.warn(`! Skipping ${loose.length} audio file(s) outside a section folder: ${loose.join(", ")}`)
  }
  const localAudio = audioFiles.filter((file) => file.includes("/"))

  console.log(`Reading the published index for gs://${BUCKET} ...`)
  const published = flattenIndex(await fetchJson(`${STORAGE_API}/${INDEX_FILE}?alt=media`))
  const publishedByPath = new Map(published.tracks.map((track) => [track.path, track]))

  // 1. Read every local track, reusing the waveform when the file has not changed
  const localFolders = new Map()
  for (const [position, relativePath] of localAudio.entries()) {
    const stat = fs.statSync(path.join(root, relativePath))
    const previous = publishedByPath.get(relativePath)
    const unchanged = previous && previous.bytes === stat.size && previous.modified === stat.mtime.toISOString()
    console.log(`  [${position + 1}/${localAudio.length}] ${unchanged ? "unchanged" : "analysing"} ${relativePath}`)

    const folder = path.posix.dirname(relativePath)
    const track = readTrack(root, relativePath, stat, unchanged ? previous.peaks : undefined)
    localFolders.set(folder, [...(localFolders.get(folder) || []), track])
  }

  // 2. Apply folder conventions and meta.json to each local folder. A meta.json replaces what was
  //    published; without one (a partial publish) the published overrides are kept. Each track
  //    carries its overrides so they can be reapplied over freshly read tags next time.
  const groups = new Map(published.groups)
  const sections = new Map(published.sections)
  const tracks = []
  for (const [folder, folderTracks] of localFolders) {
    const meta = readMeta(root, folder)
    const isSection = !folder.includes("/")

    // A leading number is a track number only when every file in the folder has a different one
    const numbers = folderTracks.map((track) => LEADING_NUMBER.exec(track.fileTitle))
    const numbered = numbers.every(Boolean) && new Set(numbers.map((match) => Number(match[1]))).size === numbers.length

    const described = hasMeta(root, folder)

    for (const { fileTitle, tagTitle, ...track } of folderTracks) {
      const previous = publishedByPath.get(track.path)
      const overrides = described
        ? (meta.tracks && meta.tracks[path.basename(track.path)]) || undefined
        : previous && previous.overrides
      const leading = numbered ? LEADING_NUMBER.exec(fileTitle) : null
      tracks.push({
        ...track,
        title: tagTitle || (leading ? fileTitle.replace(LEADING_NUMBER, "") : fileTitle),
        number: track.number !== undefined ? track.number : leading ? Number(leading[1]) : undefined,
        ...overrides,
        overrides,
      })
    }

    if (!isSection) {
      const localCover = meta.cover || fs.readdirSync(path.join(root, folder)).find((name) => COVER_FILE.test(name))
      const cover = localCover ? `${folder}/${localCover}` : undefined
      const previous = groups.get(folder)
      if (described || !previous) {
        groups.set(folder, { path: folder, title: meta.title, description: meta.description, date: meta.date, cover })
      } else if (cover) {
        groups.set(folder, { ...previous, cover })
      }
    }
  }
  // A section's own meta.json sets its title, description, layout and sort
  for (const id of new Set([...localFolders.keys()].map((folder) => folder.split("/")[0]))) {
    if (hasMeta(root, id) || !sections.has(id)) {
      const { title, description, layout, sort } = readMeta(root, id)
      sections.set(id, { id, title, description, layout, sort })
    }
  }

  // 3. Upload, then keep the published tracks that are still in the bucket
  if (dryRun) {
    console.log("\nDry run: nothing uploaded.")
  } else {
    console.log(`\nUploading ${root} ...`)
    gcloud(["storage", "rsync", "--recursive", `--exclude=${RSYNC_EXCLUDE}`, root, `gs://${BUCKET}`], {
      stdio: "inherit",
    })
  }

  const inBucket = await listBucket()
  const localPaths = new Set(tracks.map((track) => track.path))
  const kept = published.tracks.filter((track) => !localPaths.has(track.path) && inBucket.has(track.path))
  const dropped = published.tracks.filter((track) => !localPaths.has(track.path) && !inBucket.has(track.path))

  // A cover deleted from the bucket must not stay in the index. In a dry run nothing was uploaded,
  // so a cover that exists locally counts as present.
  for (const [folder, group] of groups) {
    const present = group.cover && (inBucket.has(group.cover) || (dryRun && fs.existsSync(path.join(root, group.cover))))
    if (group.cover && !present) {
      groups.set(folder, { ...group, cover: undefined })
    }
  }

  const index = buildIndex({ tracks: [...tracks, ...kept], groups, sections })

  // 4. Publish the index
  if (!dryRun) {
    const temporary = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "publish-audio-")), INDEX_FILE)
    fs.writeFileSync(temporary, JSON.stringify(index))
    gcloud(
      [
        "storage",
        "cp",
        temporary,
        `gs://${BUCKET}/${INDEX_FILE}`,
        "--cache-control=no-store",
        "--content-type=application/json",
      ],
      { stdio: "inherit" }
    )
    fs.rmSync(path.dirname(temporary), { recursive: true })
  }

  console.log("")
  for (const section of index.sections) {
    const count = section.groups.reduce((total, group) => total + group.tracks.length, 0)
    console.log(`  ${section.title} (${section.layout}): ${count} track(s) in ${section.groups.length} group(s)`)
  }
  if (dropped.length > 0) {
    console.log(`  Removed ${dropped.length} track(s) no longer in the bucket`)
  }
  console.log(dryRun ? "\n✓ Dry run complete" : "\n✓ Published: https://joshwentworth.com/recordings")
}

main().catch((error) => fail(error.message))
