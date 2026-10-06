import type { Request, Response } from "@google-cloud/functions-framework"
import { handleRequest } from "../index"
import { sendContactNotification } from "../email"

jest.mock("../email")
jest.mock("../rate-limit", () => ({
  contactFormRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

const mockSend = jest.mocked(sendContactNotification)

const validBody = {
  name: "John Doe",
  email: "john@example.com",
  message: "This is a valid message that is long enough to pass validation.",
  honeypot: "",
}

describe("handleRequest", () => {
  let res: { status: jest.Mock; json: jest.Mock; [key: string]: unknown }

  const call = (req: Partial<Request>) =>
    handleRequest({ method: "POST", path: "/", headers: {}, body: {}, ...req } as Request, res as unknown as Response)

  beforeEach(() => {
    mockSend.mockReset().mockResolvedValue("mailgun-id")
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      once: jest.fn(),
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      headersSent: false,
    }
  })

  it("responds to GET /health with the package version", async () => {
    await call({ method: "GET", path: "/health" })

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "healthy", version: expect.stringMatching(/^\d+\.\d+\.\d+/) })
    )
  })

  it("rejects non-POST requests", async () => {
    await call({ method: "GET" })

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "METHOD_NOT_ALLOWED" }))
  })

  it("rejects invalid submissions without sending email", async () => {
    await call({ body: { name: "", email: "invalid-email", message: "hi" } })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "VALIDATION_FAILED" }))
    expect(mockSend).not.toHaveBeenCalled()
  })

  it("reports success to bots that fill the honeypot, without sending email", async () => {
    await call({ body: { ...validBody, honeypot: "spam-content" } })

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    expect(mockSend).not.toHaveBeenCalled()
  })

  it("emails valid submissions", async () => {
    await call({ body: validBody })

    expect(mockSend).toHaveBeenCalledWith({
      name: validBody.name,
      email: validBody.email,
      message: validBody.message,
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it("returns 500 when the email cannot be sent", async () => {
    mockSend.mockRejectedValue(new Error("mailgun 401"))

    await call({ body: validBody })

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: "INTERNAL_ERROR" }))
  })
})
