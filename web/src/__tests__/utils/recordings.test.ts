import {
  decodePeaks,
  fetchSections,
  formatDate,
  formatDuration,
  objectUrl,
  RECORDINGS_BUCKET,
  sectionAnchors,
  type Section,
} from "../../utils/recordings"

describe("objectUrl", () => {
  it("encodes each path segment", () => {
    expect(objectUrl("albums/Live Set #1/Track & Field?.mp3")).toBe(
      `https://storage.googleapis.com/${RECORDINGS_BUCKET}/albums/Live%20Set%20%231/Track%20%26%20Field%3F.mp3`
    )
  })
})

describe("decodePeaks", () => {
  it("maps the quietest and loudest characters to 0 and 1", () => {
    expect(decodePeaks("A/", 2)).toEqual([0, 1])
  })

  it("keeps every peak when at least as many bars are wanted", () => {
    expect(decodePeaks("A/A/", 10)).toHaveLength(4)
  })

  it("takes the loudest peak in each bar when drawing fewer bars", () => {
    expect(decodePeaks("A/AAA/AA", 2)).toEqual([1, 1])
    expect(decodePeaks("AAAA//AA", 4)).toEqual([0, 0, 1, 0])
  })

  it("returns no bars for a track without peaks", () => {
    expect(decodePeaks("", 40)).toEqual([])
  })
})

describe("sectionAnchors", () => {
  const section = (id: string): Section => ({ id, title: id, layout: "list", groups: [] })

  it("keeps simple folder names", () => {
    expect(sectionAnchors([section("albums"), section("one-shots")])).toEqual(["albums", "one-shots"])
  })

  it("replaces whitespace and punctuation", () => {
    expect(sectionAnchors([section("Field Recordings (2026)")])).toEqual(["field-recordings-2026"])
  })

  it("numbers repeated names and names with no usable characters", () => {
    expect(sectionAnchors([section("live set"), section("Live-Set"), section("???")])).toEqual([
      "live-set",
      "live-set-2",
      "section-3",
    ])
  })

  it("never repeats an anchor, even when a fallback matches a real name", () => {
    const anchors = sectionAnchors([section("section-2"), section("???"), section("section-2-2")])

    expect(anchors).toEqual(["section-2", "section-2-2", "section-2-2-2"])
    expect(new Set(anchors).size).toBe(anchors.length)
  })
})

describe("formatDuration", () => {
  it("formats seconds as minutes and seconds", () => {
    expect(formatDuration(0.4)).toBe("0:00")
    expect(formatDuration(65)).toBe("1:05")
  })

  it("adds hours for long recordings", () => {
    expect(formatDuration(3725)).toBe("1:02:05")
  })
})

describe("formatDate", () => {
  it("formats a full date without shifting it across time zones", () => {
    expect(formatDate("2026-10-06")).toBe("Oct 6, 2026")
    expect(formatDate("2026-01-01")).toBe("Jan 1, 2026")
  })

  it("leaves a bare year alone", () => {
    expect(formatDate("2026")).toBe("2026")
  })
})

describe("fetchSections", () => {
  const respond = (body: unknown, status = 200) =>
    Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => body })

  it("returns the published sections", async () => {
    const sections = [{ id: "tracks", title: "Tracks", layout: "list", groups: [] }]
    const fetchMock = jest.fn<Promise<unknown>, [string]>().mockReturnValue(respond({ version: 1, sections }))
    global.fetch = fetchMock as unknown as typeof fetch

    await expect(fetchSections()).resolves.toEqual(sections)
    expect(fetchMock.mock.calls[0][0]).toContain(`/b/${RECORDINGS_BUCKET}/o/index.json?alt=media`)
  })

  it("returns no sections before anything has been published", async () => {
    global.fetch = jest.fn().mockReturnValue(respond({}, 404)) as unknown as typeof fetch

    await expect(fetchSections()).resolves.toEqual([])
  })

  it("throws when the index cannot be loaded", async () => {
    global.fetch = jest.fn().mockReturnValue(respond({}, 500)) as unknown as typeof fetch

    await expect(fetchSections()).rejects.toThrow("500")
  })
})
