/**
 * The recordings page is driven by index.json in a public Cloud Storage bucket. The manifest and
 * the audio are uploaded together by `npm run publish-audio` (scripts/publish-audio.js); the page
 * loads the manifest from the browser on every visit, so nothing is built or deployed to publish.
 */
// Keep in sync with BUCKET in scripts/publish-audio.js
export const RECORDINGS_BUCKET = "joshwentworth-recordings"

const STORAGE_ORIGIN = "https://storage.googleapis.com"
// The JSON API allows cross-origin reads without any CORS configuration on the bucket
const INDEX_URL = `${STORAGE_ORIGIN}/storage/v1/b/${RECORDINGS_BUCKET}/o/index.json?alt=media`

export type Track = {
  /** Object path in the bucket; unique, so it doubles as the track's id */
  path: string
  title: string
  /** Seconds */
  duration: number
  /** One character per waveform bar, see decodePeaks */
  peaks: string
  number?: number
  /** YYYY or YYYY-MM-DD */
  date?: string
  bpm?: number
  key?: string
  description?: string
  /** Link target on the page: /recordings#<id>. Unique among tracks, groups and section anchors. */
  id?: string
  status?: "draft" | "final"
  /** Where the finished track is released, an https address */
  link?: string
  /** The id of the group that holds this track's stems */
  stems?: string
  /** The meta.json fields already applied above; kept for the publish script, not shown */
  overrides?: Partial<Track>
  /** The values those overrides replaced; also only for the publish script */
  original?: Partial<Track>
  /** Which of title and number came from the file's tags; also only for the publish script */
  fromTags?: string[]
}

export type TrackGroup = {
  path: string
  /** Link target on the page, as for a track */
  id?: string
  /** Absent for tracks that sit directly in the section folder */
  title?: string
  description?: string
  date?: string
  /** Object path of the cover image */
  cover?: string
  /** Object path of a zip of the group's files, for example lossless stems */
  download?: string
  downloadBytes?: number
  tracks: Track[]
}

/** album: cover and numbered track list. list: one row per track. grid: compact tiles for short sounds. */
export type SectionLayout = "album" | "list" | "grid"

export type Section = {
  id: string
  title: string
  description?: string
  layout: SectionLayout
  groups: TrackGroup[]
}

type Library = {
  sections?: Section[]
}

export const objectUrl = (path: string) =>
  `${STORAGE_ORIGIN}/${RECORDINGS_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`

// Written by computePeaks in scripts/publish-audio.js: 64 levels, quietest to loudest
const PEAK_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

/**
 * Decodes a track's peaks into `bars` values between 0 and 1. When fewer bars are wanted than were
 * stored, each bar takes the loudest peak it covers so short transients stay visible.
 */
export const decodePeaks = (peaks: string, bars: number): number[] => {
  if (peaks.length === 0) {
    return []
  }
  const levels = [...peaks].map(
    (character) => Math.max(0, PEAK_ALPHABET.indexOf(character)) / (PEAK_ALPHABET.length - 1)
  )
  if (bars >= levels.length) {
    return levels
  }
  return Array.from({ length: bars }, (_, bar) => {
    const start = Math.floor((bar * levels.length) / bars)
    const end = Math.max(start + 1, Math.floor(((bar + 1) * levels.length) / bars))
    return Math.max(...levels.slice(start, end))
  })
}

/**
 * An id for each section that is safe in the DOM and as a link target. Section ids are folder
 * names, which can hold spaces and other characters an HTML id cannot.
 * Anchors use single hyphens only, which leaves `--` free for ids derived from them.
 */
export const sectionAnchors = (sections: Section[]): string[] => {
  const taken = new Set<string>()
  return sections.map((section, position) => {
    const slug = section.id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    const base = slug || `section-${position + 1}`
    let anchor = base
    for (let suffix = 2; taken.has(anchor); suffix++) {
      anchor = `${base}-${suffix}`
    }
    taken.add(anchor)
    return anchor
  })
}

/** "soundcloud.com/..." becomes "SoundCloud"; any other address is named by its host */
export const linkLabel = (link: string): string => {
  let host: string
  try {
    host = new URL(link).hostname.replace(/^www\./, "")
  } catch {
    return "Link"
  }
  const known: Record<string, string> = { "soundcloud.com": "SoundCloud", "bandcamp.com": "Bandcamp" }
  const match = Object.keys(known).find((name) => host === name || host.endsWith(`.${name}`))
  return match ? known[match] : host
}

/** 1536 becomes "1.5 KB"; sizes are shown next to downloads */
export const formatBytes = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"]
  let value = Math.max(0, bytes)
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${unit === 0 || value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

/** Whether `id` is the link target of a published track or group */
export const hasRecording = (sections: Section[], id: string): boolean =>
  id !== "" &&
  sections.some((section) =>
    section.groups.some((group) => group.id === id || group.tracks.some((track) => track.id === id))
  )

export const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = String(total % 60).padStart(2, "0")
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "2026-10-06" becomes "Oct 6, 2026"; a bare year is returned as it is */
export const formatDate = (date: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  if (!match) {
    return date
  }
  return `${MONTHS[Number(match[2]) - 1] ?? match[2]} ${Number(match[3])}, ${match[1]}`
}

/** Returns the published sections, or none if nothing has been published yet */
export const fetchSections = async (): Promise<Section[]> => {
  const response = await fetch(INDEX_URL, { cache: "no-store" })
  if (response.status === 404) {
    return []
  }
  if (!response.ok) {
    throw new Error(`Loading the recordings index failed with status ${response.status}`)
  }
  const library = (await response.json()) as Library
  return library.sections ?? []
}
