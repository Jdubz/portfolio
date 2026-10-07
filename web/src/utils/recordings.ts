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
}

export type TrackGroup = {
  path: string
  /** Absent for tracks that sit directly in the section folder */
  title?: string
  description?: string
  date?: string
  /** Object path of the cover image */
  cover?: string
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
