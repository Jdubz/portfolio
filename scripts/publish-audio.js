#!/usr/bin/env node

/**
 * Publish audio to the recordings page.
 *
 *   npm run publish-audio -- <library-folder> [--dry-run]
 *
 * Uploads the folder's audio and cover art to the recordings bucket and rebuilds index.json, the manifest the
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
const IMAGE_FILE = /^[^\\/"%]+\.(jpe?g|png|webp)$/i

/**
 * The bucket is public, so only what the page uses is uploaded: audio, cover.* images and any
 * cover a meta.json names. rsync can only exclude, so this pattern matches every other path,
 * including anything hidden. Notes, project files and other images in the library stay local.
 */
const rsyncExclude = (namedCovers) => {
  const separator = String.raw`[\\/]`
  // % and " are written as hex escapes so the pattern survives the Windows shell (see gcloud)
  const literal = (text) =>
    text
      .replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
      .replace(/%/g, String.raw`\x25`)
      .replace(/"/g, String.raw`\x22`)
  const allowed = [
    String.raw`.*\.(mp3|m4a|aac|wav|flac|ogg|opus)`,
    String.raw`.*${separator}cover\.(jpe?g|png|webp)`,
    ...namedCovers.map((cover) => cover.split("/").map(literal).join(separator)),
  ]
  const visible = String.raw`(?!(.*${separator})?\.)`
  return `(?i)^(?!${visible}(${allowed.join("|")})$).*$`
}

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

// gcloud is a .cmd shim on Windows, which Node only runs through a shell. cmd.exe expands %NAME%
// and ends a quoted argument at ", even inside quotes, so local paths are never put on the command
// line: callers set `cwd` and pass paths relative to it. Anything else that carries either
// character is refused rather than passed on altered.
const gcloud = (args, options = {}) => {
  if (process.platform !== "win32") {
    return run("gcloud", args, options)
  }
  const unsafe = args.find((arg) => /[%"]/.test(arg))
  if (unsafe) {
    throw new Error(`gcloud argument cannot be passed safely on Windows: ${unsafe}`)
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

// meta.json fields and the type each must have. Checked before anything is uploaded, because a
// wrong type would otherwise reach the page and break it.
const SECTION_FIELDS = {
  title: "string",
  description: "string",
  layout: LAYOUTS,
  sort: ["name", "newest"],
  tracks: "object",
}
const GROUP_FIELDS = {
  title: "string",
  description: "string",
  date: "string",
  cover: "string",
  tracks: "object",
}
const TRACK_FIELDS = {
  title: "string",
  description: "string",
  date: "string",
  key: "string",
  number: "number",
  bpm: "number",
}

const isPlainObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value)

const checkFields = (values, fields, where) => {
  for (const [field, value] of Object.entries(values)) {
    const expected = fields[field]
    if (!expected) {
      throw new Error(`${where}"${field}" is not a supported field (use ${Object.keys(fields).join(", ")})`)
    }
    if (Array.isArray(expected)) {
      if (!expected.includes(value)) {
        throw new Error(`${where}"${field}" must be one of ${expected.join(", ")}`)
      }
    } else if (expected === "object" ? !isPlainObject(value) : typeof value !== expected) {
      throw new Error(`${where}"${field}" must be ${expected === "object" ? "an object" : `a ${expected}`}`)
    } else if (expected === "number" && !Number.isFinite(value)) {
      throw new Error(`${where}"${field}" must be a finite number`)
    }
  }
}

const hasMeta = (root, folder) => fs.existsSync(path.join(root, folder, META_FILE))

const readMeta = (root, folder) => {
  const file = path.join(root, folder, META_FILE)
  if (!fs.existsSync(file)) {
    return {}
  }
  try {
    const meta = JSON.parse(fs.readFileSync(file, "utf8"))
    if (!isPlainObject(meta)) {
      throw new Error("expected a JSON object")
    }
    // A first-level folder is a section; anything deeper is a group
    checkFields(meta, folder.includes("/") ? GROUP_FIELDS : SECTION_FIELDS, "")
    for (const [fileName, overrides] of Object.entries(meta.tracks || {})) {
      if (!isPlainObject(overrides)) {
        throw new Error(`tracks["${fileName}"] must be an object`)
      }
      checkFields(overrides, TRACK_FIELDS, `tracks["${fileName}"] `)
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
  const pcm = run("ffmpeg", [
    "-v",
    "error",
    "-i",
    file,
    "-ac",
    "1",
    "-ar",
    String(PEAK_SAMPLE_RATE),
    "-f",
    "s16le",
    "-",
  ])
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

// The track fields meta.json may set. Everything else is computed from the file.
const OVERRIDABLE = Object.keys(TRACK_FIELDS)

const pickOverrides = (entry) => {
  const picked = Object.fromEntries(Object.entries(entry || {}).filter(([field]) => OVERRIDABLE.includes(field)))
  return Object.keys(picked).length > 0 ? picked : undefined
}

/**
 * Applies meta.json overrides to a track and records them, with the values they replaced, so a
 * later publish can change or remove an override without the audio file being present.
 */
const applyOverrides = (track, overrides) => {
  if (!overrides) {
    return track
  }
  const original = Object.fromEntries(Object.keys(overrides).map((field) => [field, track[field]]))
  return { ...track, ...overrides, overrides, original }
}

/** Whether every one of a folder's file titles starts with a different number */
const isNumbered = (fileTitles) => {
  const numbers = fileTitles.map((name) => LEADING_NUMBER.exec(name))
  return numbers.every(Boolean) && new Set(numbers.map((match) => Number(match[1]))).size === numbers.length
}

/** The file name without its extension or a leading date; a name that is only a date is kept whole */
const fileTitleOf = (trackPath) => {
  const baseName = path.basename(trackPath).replace(AUDIO_FILE, "")
  return baseName.replace(LEADING_DATE, "") || baseName
}

/**
 * Fills in the title and number that tags did not supply from the file name. A leading number is
 * a track number, and is dropped from the title, only when the folder is `numbered`.
 */
const inferFromName = (track, fileTitle, numbered) => {
  const leading = numbered ? LEADING_NUMBER.exec(fileTitle) : null
  const inferred = { ...track }
  if (!track.fromTags.includes("title")) {
    inferred.title = leading ? fileTitle.replace(LEADING_NUMBER, "") : fileTitle
  }
  if (!track.fromTags.includes("number")) {
    inferred.number = leading ? Number(leading[1]) : undefined
  }
  return inferred
}

/** The track as it was before its overrides were applied */
const withoutOverrides = ({ overrides, original, ...track }) => {
  for (const field of Object.keys(overrides || {})) {
    delete track[field]
  }
  // An entry published before originals were recorded cannot be restored without reading its file
  if (overrides && !original) {
    fail(`Include ${track.path} in the folder being published: its meta.json cannot be changed without the audio.`)
  }
  return { ...track, ...original }
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
  const tagDate = /^(\d{4})(-\d{2}-\d{2})?/.exec(tags.date || "")

  return {
    path: relativePath,
    // The file name with any leading date removed; a leading track number is handled per group
    fileTitle: fileTitleOf(relativePath),
    tagTitle: tags.title || undefined,
    number: firstNumber(tags.track),
    // A full date in the tags, then one leading the file name, then a tagged year
    date: (tagDate && tagDate[2] && tagDate[0]) || (fileDate && fileDate[1]) || (tagDate && tagDate[1]) || undefined,
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
      // Track numbers set the order unless the section's meta.json asks for newest first
      const byNumber = sectionFields.sort !== "newest"
      // Numbered tracks come first in number order, so a partly numbered folder still has one order
      const rank = (track) => (byNumber && track.number !== undefined ? track.number : Infinity)
      groupTracks.sort((a, b) => {
        if (rank(a) !== rank(b)) {
          return rank(a) - rank(b)
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
    // The upload sends the whole folder, so these would be public without ever being listed
    fail(`Move these into a section folder such as tracks/ before publishing: ${loose.join(", ")}`)
  }
  const localAudio = audioFiles.filter((file) => file.includes("/"))

  console.log(`Reading the published index for gs://${BUCKET} ...`)
  const published = flattenIndex(await fetchJson(`${STORAGE_API}/${INDEX_FILE}?alt=media`))
  const publishedByPath = new Map(published.tracks.map((track) => [track.path, track]))
  // Published tracks that are not being republished now but are still in the bucket
  const alreadyInBucket = await listBucket()
  const localSet = new Set(localAudio)
  const retained = published.tracks.filter((track) => !localSet.has(track.path) && alreadyInBucket.has(track.path))

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
  const namedCovers = []
  const sections = new Map(published.sections)
  const tracks = []
  const retainedUpdates = new Map()
  // A folder is processed when it has audio to publish, or only a meta.json for what is already there
  const metaFolders = files.filter((file) => path.basename(file) === META_FILE).map((file) => path.posix.dirname(file))
  // ... or only new artwork: a cover.* image, or the file a group's saved cover points at
  const coverFolders = files
    .filter(
      (file) => COVER_FILE.test(path.basename(file)) || [...groups.values()].some((group) => group.cover === file)
    )
    .map((file) => path.posix.dirname(file))
  const publishFolders = new Set(
    [...localFolders.keys(), ...metaFolders, ...coverFolders].filter((folder) => folder !== ".")
  )
  for (const folder of publishFolders) {
    const folderTracks = localFolders.get(folder) || []
    const meta = readMeta(root, folder)
    const isSection = !folder.includes("/")

    // A leading number is a track number only when every file in the folder has a different one,
    // counting the files already published there that this run leaves alone
    const siblings = retained
      .filter((track) => path.posix.dirname(track.path) === folder)
      .map((track) => fileTitleOf(track.path))
    const numbered = isNumbered([...folderTracks.map((track) => track.fileTitle), ...siblings])

    const described = hasMeta(root, folder)

    for (const { fileTitle, tagTitle, ...track } of folderTracks) {
      const previous = publishedByPath.get(track.path)
      const overrides = pickOverrides(
        described ? meta.tracks && meta.tracks[path.basename(track.path)] : previous && previous.overrides
      )
      // Which of title and number came from tags; the rest follow the file name and are worked out
      // again whenever the folder's contents change
      const fromTags = [tagTitle && "title", track.number !== undefined && "number"].filter(Boolean)
      tracks.push(
        applyOverrides(inferFromName({ ...track, title: tagTitle, fromTags }, fileTitle, numbered), overrides)
      )
    }

    // The tracks already published in this folder that are not being uploaded again. Their
    // file-name title and number depend on the whole folder, so they are worked out again; a
    // meta.json replaces their overrides, and without one their overrides are reapplied.
    for (const track of retained.filter((entry) => path.posix.dirname(entry.path) === folder)) {
      // An entry published before fromTags was recorded can only be changed by a meta.json
      if (!described && !track.fromTags) {
        continue
      }
      const fileTitle = fileTitleOf(track.path)
      const base = withoutOverrides(track)
      const overrides = pickOverrides(
        described ? meta.tracks && meta.tracks[path.basename(track.path)] : track.overrides
      )
      retainedUpdates.set(
        track.path,
        applyOverrides(track.fromTags ? inferFromName(base, fileTitle, numbered) : base, overrides)
      )
    }

    if (!isSection) {
      // A cover can be in the folder being published or already in the bucket from an earlier run
      const isLocal = (name) => fs.existsSync(path.join(root, folder, name))
      const isPublished = (name) => alreadyInBucket.has(`${folder}/${name}`)
      if (meta.cover && !(IMAGE_FILE.test(meta.cover) && (isLocal(meta.cover) || isPublished(meta.cover)))) {
        fail(`${folder}/${META_FILE}: "cover" must name a jpg, png or webp file in that folder`)
      }
      if (meta.cover && isLocal(meta.cover)) {
        namedCovers.push(`${folder}/${meta.cover}`)
      }
      const publishedCover = [...alreadyInBucket]
        .filter((name) => path.posix.dirname(name) === folder)
        .map((name) => path.basename(name))
        .find((name) => COVER_FILE.test(name))
      const localCover = fs.readdirSync(path.join(root, folder)).find((name) => COVER_FILE.test(name))
      const inFolder = (name) => (name ? `${folder}/${name}` : undefined)
      const previous = groups.get(folder)
      if (described || !previous) {
        const cover = inFolder(meta.cover || localCover || publishedCover)
        groups.set(folder, { path: folder, title: meta.title, description: meta.description, date: meta.date, cover })
      } else if (previous.cover && isLocal(path.basename(previous.cover))) {
        // No meta.json, and the saved cover is in the folder: upload it again in case it changed
        namedCovers.push(previous.cover)
      } else if (localCover) {
        // No meta.json: keep what was published, and only a cover supplied now replaces the saved one
        groups.set(folder, { ...previous, cover: inFolder(localCover) })
      }
    }
  }
  // Folders that are not being published can still have changed: deleting a file from the bucket
  // can make the rest of its folder numbered, or stop it being so. Their file-name titles and
  // numbers are worked out again from what is left, with each track's own overrides reapplied.
  const untouched = new Set(retained.map((track) => path.posix.dirname(track.path)))
  for (const folder of [...untouched].filter((name) => !publishFolders.has(name))) {
    const remaining = retained.filter((track) => path.posix.dirname(track.path) === folder)
    const numbered = isNumbered(remaining.map((track) => fileTitleOf(track.path)))
    for (const track of remaining.filter((entry) => entry.fromTags)) {
      const inferred = inferFromName(withoutOverrides(track), fileTitleOf(track.path), numbered)
      retainedUpdates.set(track.path, applyOverrides(inferred, pickOverrides(track.overrides)))
    }
  }

  // A section's own meta.json sets its title, description, layout and sort
  for (const id of new Set([...publishFolders].map((folder) => folder.split("/")[0]))) {
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
    gcloud(["storage", "rsync", "--recursive", `--exclude=${rsyncExclude(namedCovers)}`, ".", `gs://${BUCKET}`], {
      cwd: root,
      stdio: "inherit",
    })
  }

  const inBucket = await listBucket()
  const localPaths = new Set(tracks.map((track) => track.path))
  const kept = published.tracks
    .filter((track) => !localPaths.has(track.path) && inBucket.has(track.path))
    .map((track) => retainedUpdates.get(track.path) || track)
  const dropped = published.tracks.filter((track) => !localPaths.has(track.path) && !inBucket.has(track.path))

  // A cover deleted from the bucket must not stay in the index. In a dry run nothing was uploaded,
  // so a cover that exists locally counts as present.
  for (const [folder, group] of groups) {
    const present =
      group.cover && (inBucket.has(group.cover) || (dryRun && fs.existsSync(path.join(root, group.cover))))
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
        INDEX_FILE,
        `gs://${BUCKET}/${INDEX_FILE}`,
        "--cache-control=no-store",
        "--content-type=application/json",
      ],
      { cwd: path.dirname(temporary), stdio: "inherit" }
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
