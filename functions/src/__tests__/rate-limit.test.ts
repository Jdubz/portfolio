import { getClientIp } from "../rate-limit"

describe("getClientIp", () => {
  it("uses the last X-Forwarded-For entry, which Google's front end appends", () => {
    expect(getClientIp({ headers: { "x-forwarded-for": "198.51.100.4" }, ip: undefined })).toBe("198.51.100.4")
  })

  it("ignores client-supplied entries placed before the real IP", () => {
    const headers = { "x-forwarded-for": "203.0.113.7, 203.0.113.8 , 198.51.100.4" }

    expect(getClientIp({ headers, ip: undefined })).toBe("198.51.100.4")
  })

  it("falls back to req.ip when the header is missing", () => {
    expect(getClientIp({ headers: {}, ip: "127.0.0.1" })).toBe("127.0.0.1")
    expect(getClientIp({ headers: {}, ip: undefined })).toBe("unknown")
  })
})
