/**
 * Recordings are audio files in a public Cloud Storage bucket. The page lists the bucket from the
 * browser on every load, so an upload shows up on the next refresh with no build or deploy.
 * Folders in the bucket become the sections on the page.
 */
export const RECORDINGS_BUCKET = "joshwentworth-recordings"

const STORAGE_ORIGIN = "https://storage.googleapis.com"
const AUDIO_FILE = /\.(mp3|m4a|aac|wav|flac|ogg|opus)$/i

/** The fields this page asks the Cloud Storage JSON API for */
export type StorageObject = {
  name: string
  updated: string
}

type StorageListResponse = {
  items?: StorageObject[]
  nextPageToken?: string
}

export type Track = {
  title: string
  url: string
}

export type RecordingFolder = {
  name: string
  tracks: Track[]
}

type FolderWithDate = RecordingFolder & { updated: string }

const objectUrl = (name: string) =>
  `${STORAGE_ORIGIN}/${RECORDINGS_BUCKET}/${name.split("/").map(encodeURIComponent).join("/")}`

/**
 * Groups bucket objects by folder. Folders are ordered newest upload first; tracks within a folder
 * are ordered by file name, so numeric prefixes ("01 ...", "02 ...") set the running order.
 */
export const groupRecordings = (objects: StorageObject[]): RecordingFolder[] => {
  const folders = new Map<string, FolderWithDate>()

  for (const { name, updated } of objects) {
    if (!AUDIO_FILE.test(name)) {
      continue
    }
    const segments = name.split("/")
    const fileName = segments.pop() ?? name
    const folderName = segments.join(" / ")

    const folder = folders.get(folderName) ?? { name: folderName, tracks: [], updated }
    folder.tracks.push({ title: fileName.replace(AUDIO_FILE, ""), url: objectUrl(name) })
    if (updated > folder.updated) {
      folder.updated = updated
    }
    folders.set(folderName, folder)
  }

  return [...folders.values()]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .map(({ name, tracks }) => ({
      name,
      tracks: tracks.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true })),
    }))
}

export const fetchRecordings = async (): Promise<RecordingFolder[]> => {
  const objects: StorageObject[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({ fields: "items(name,updated),nextPageToken" })
    if (pageToken) {
      params.set("pageToken", pageToken)
    }
    const response = await fetch(`${STORAGE_ORIGIN}/storage/v1/b/${RECORDINGS_BUCKET}/o?${params.toString()}`, {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(`Listing recordings failed with status ${response.status}`)
    }
    const page = (await response.json()) as StorageListResponse
    objects.push(...(page.items ?? []))
    pageToken = page.nextPageToken
  } while (pageToken)

  return groupRecordings(objects)
}
