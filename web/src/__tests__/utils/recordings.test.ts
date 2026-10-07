import { fetchRecordings, groupRecordings, RECORDINGS_BUCKET } from "../../utils/recordings"

const object = (name: string, updated = "2026-01-01T00:00:00.000Z") => ({ name, updated })

describe("groupRecordings", () => {
  it("groups tracks by folder and strips the extension from titles", () => {
    const folders = groupRecordings([object("Live Set/Opening.mp3"), object("Live Set/Closing.wav")])

    expect(folders).toHaveLength(1)
    expect(folders[0].name).toBe("Live Set")
    expect(folders[0].tracks.map((track) => track.title)).toEqual(["Closing", "Opening"])
  })

  it("orders tracks by numeric prefix", () => {
    const folders = groupRecordings([object("Set/10 Ten.mp3"), object("Set/2 Two.mp3"), object("Set/1 One.mp3")])

    expect(folders[0].tracks.map((track) => track.title)).toEqual(["1 One", "2 Two", "10 Ten"])
  })

  it("puts the most recently uploaded folder first", () => {
    const folders = groupRecordings([
      object("Old/a.mp3", "2025-01-01T00:00:00.000Z"),
      object("New/a.mp3", "2026-06-01T00:00:00.000Z"),
      object("Old/b.mp3", "2025-02-01T00:00:00.000Z"),
    ])

    expect(folders.map((folder) => folder.name)).toEqual(["New", "Old"])
  })

  it("ignores folder placeholders and files that are not audio", () => {
    const folders = groupRecordings([object("Set/"), object("Set/notes.txt"), object("Set/cover.jpg")])

    expect(folders).toEqual([])
  })

  it("keeps files outside any folder and names nested folders by their path", () => {
    const folders = groupRecordings([object("loose.mp3"), object("2026/Autumn/track.flac")])

    expect(folders.map((folder) => folder.name).sort()).toEqual(["", "2026 / Autumn"])
  })

  it("encodes each path segment of the track URL", () => {
    const [folder] = groupRecordings([object("Live Set #1/Track & Field?.mp3")])

    expect(folder.tracks[0].url).toBe(
      `https://storage.googleapis.com/${RECORDINGS_BUCKET}/Live%20Set%20%231/Track%20%26%20Field%3F.mp3`
    )
  })
})

describe("fetchRecordings", () => {
  const respond = (body: unknown, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => body })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("follows nextPageToken until the listing is complete", async () => {
    const fetchMock = jest
      .fn<Promise<unknown>, [string]>()
      .mockReturnValueOnce(respond({ items: [object("Set/1.mp3")], nextPageToken: "next" }))
      .mockReturnValueOnce(respond({ items: [object("Set/2.mp3")] }))
    global.fetch = fetchMock as unknown as typeof fetch

    const folders = await fetchRecordings()

    expect(folders[0].tracks).toHaveLength(2)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain("pageToken=next")
  })

  it("returns no folders for an empty bucket", async () => {
    global.fetch = jest.fn().mockReturnValue(respond({})) as unknown as typeof fetch

    await expect(fetchRecordings()).resolves.toEqual([])
  })

  it("throws when the listing request fails", async () => {
    global.fetch = jest.fn().mockReturnValue(respond({}, false, 403)) as unknown as typeof fetch

    await expect(fetchRecordings()).rejects.toThrow("403")
  })
})
