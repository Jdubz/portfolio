import type { Response, NextFunction } from "express"
import {
  verifyAuthenticatedEditor,
  AUTHORIZED_EDITORS,
  AUTH_ERROR_CODES,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware"

// Mock firebase-admin
const mockVerifyIdToken = jest.fn()

jest.mock("firebase-admin", () => ({
  auth: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}))

describe("Auth Middleware", () => {
  let mockRequest: Partial<AuthenticatedRequest> & { requestId?: string }
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    // Reset mocks
    mockRequest = {
      headers: {},
      requestId: "test-request-id",
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }

    mockNext = jest.fn()

    // Reset mock function
    mockVerifyIdToken.mockReset()
  })

  describe("Missing Authorization Header", () => {
    it("should return 401 if Authorization header is missing", async () => {
      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "UNAUTHORIZED",
          errorCode: AUTH_ERROR_CODES.UNAUTHORIZED.code,
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should return 401 if Authorization header does not start with Bearer", async () => {
      mockRequest.headers = {
        authorization: "Basic abc123",
      }

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "UNAUTHORIZED",
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should return 401 if Bearer token is empty", async () => {
      mockRequest.headers = {
        authorization: "Bearer ",
      }

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe("Invalid Token", () => {
    it("should return 401 if token verification fails", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      }

      mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"))

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "INVALID_TOKEN",
          errorCode: AUTH_ERROR_CODES.INVALID_TOKEN.code,
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should return 401 with TOKEN_EXPIRED if token is expired", async () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
      }

      mockVerifyIdToken.mockRejectedValue(new Error("Token expired"))

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "TOKEN_EXPIRED",
          errorCode: AUTH_ERROR_CODES.TOKEN_EXPIRED.code,
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it("should return 401 if token is missing email claim", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      }

      mockVerifyIdToken.mockResolvedValue({
        uid: "user123",
        email_verified: true,
        // email missing
      })

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "INVALID_TOKEN",
          message: "Token missing email claim",
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe("Email Not Verified", () => {
    it("should return 403 if email is not verified", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      }

      mockVerifyIdToken.mockResolvedValue({
        uid: "user123",
        email: AUTHORIZED_EDITORS[0],
        email_verified: false,
      })

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "EMAIL_NOT_VERIFIED",
          errorCode: AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED.code,
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe("Unauthorized Email", () => {
    it("should return 403 if email is not in authorized list", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      }

      mockVerifyIdToken.mockResolvedValue({
        uid: "user123",
        email: "unauthorized@example.com",
        email_verified: true,
      })

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "FORBIDDEN",
          errorCode: AUTH_ERROR_CODES.FORBIDDEN.code,
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe("Successful Authentication", () => {
    it("should call next() and attach user to request for authorized editor", async () => {
      const authorizedEmail = AUTHORIZED_EDITORS[0]
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      }

      mockVerifyIdToken.mockResolvedValue({
        uid: "user123",
        email: authorizedEmail,
        email_verified: true,
      })

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRequest.user).toEqual({
        uid: "user123",
        email: authorizedEmail,
        email_verified: true,
      })
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockResponse.json).not.toHaveBeenCalled()
    })

    it("should work for second authorized email", async () => {
      const authorizedEmail = AUTHORIZED_EDITORS[1]
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      }

      mockVerifyIdToken.mockResolvedValue({
        uid: "user456",
        email: authorizedEmail,
        email_verified: true,
      })

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRequest.user).toEqual({
        uid: "user456",
        email: authorizedEmail,
        email_verified: true,
      })
    })
  })

  describe("Error Handling", () => {
    it("should return 500 for unexpected errors", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      }

      // Mock successful token verification
      mockVerifyIdToken.mockResolvedValue({
        uid: "user123",
        email: AUTHORIZED_EDITORS[0],
        email_verified: true,
      })

      // Make mockNext throw to trigger outer catch block
      ;(mockNext as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected error in next()")
      })

      const middleware = verifyAuthenticatedEditor()

      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "INTERNAL_ERROR",
          errorCode: "EXP_SYS_001",
        })
      )
    })
  })
})
