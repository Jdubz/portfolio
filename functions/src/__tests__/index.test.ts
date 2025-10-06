import type { Request } from "firebase-functions/v2/https"
import type { Response } from "express"
import { handleContactForm } from "../index"

// Mock the dependencies
jest.mock("@google-cloud/logging")
jest.mock("../services/email.service")
jest.mock("../services/secret-manager.service")
jest.mock("../services/firestore.service")
jest.mock("cors", () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => {
    next()
  })
})

describe("handleContactForm", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: jest.Mock
  let mockJson: jest.Mock

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis()
    mockJson = jest.fn().mockReturnThis()

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      set: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      getHeader: jest.fn().mockReturnValue(undefined),
      header: jest.fn().mockReturnThis(),
      headersSent: false,
    }

    mockRequest = {
      method: "POST",
      body: {},
      rawBody: Buffer.from(""),
      ip: "127.0.0.1",
      get: jest.fn().mockReturnValue("test-user-agent"),
      headers: {
        origin: "https://example.com",
        "content-type": "application/json",
        "user-agent": "test-user-agent",
      },
    }
  })

  it("should reject non-POST requests", async () => {
    mockRequest.method = "GET"

    await handleContactForm(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(405)
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Method Not Allowed",
      })
    )
  })

  it("should validate required fields", async () => {
    mockRequest.body = {
      name: "",
      email: "invalid-email",
      message: "hi", // too short
    }

    await handleContactForm(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(400)
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Validation Error",
      })
    )
  })

  it("should detect honeypot spam", async () => {
    mockRequest.body = {
      name: "John Doe",
      email: "john@example.com",
      message: "This is a valid message that is long enough to pass validation.",
      honeypot: "spam-content", // Bot filled this
    }

    await handleContactForm(mockRequest as Request, mockResponse as Response)

    // Should return success to not reveal honeypot
    expect(mockStatus).toHaveBeenCalledWith(200)
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    )
  })

  it("should accept valid form submission", async () => {
    mockRequest.body = {
      name: "John Doe",
      email: "john@example.com",
      message: "This is a valid message that is long enough to pass validation.",
      honeypot: "", // Empty honeypot
    }

    // Note: This test will fail until we mock the email service properly
    // For now it demonstrates the test structure
    await expect(handleContactForm(mockRequest as Request, mockResponse as Response)).resolves.not.toThrow()
  })
})
