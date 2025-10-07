import type { Request, Response, NextFunction } from "express"
import { auth } from "firebase-admin"

// Simple logger type
type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

// Error codes for authentication
export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: {
    code: "EXP_AUTH_001",
    status: 401,
    message: "Authentication required",
  },
  INVALID_TOKEN: {
    code: "EXP_AUTH_002",
    status: 401,
    message: "Invalid authentication token",
  },
  TOKEN_EXPIRED: {
    code: "EXP_AUTH_003",
    status: 401,
    message: "Authentication token expired",
  },
  FORBIDDEN: {
    code: "EXP_AUTH_004",
    status: 403,
    message: "Access denied - editor role required",
  },
  EMAIL_NOT_VERIFIED: {
    code: "EXP_AUTH_005",
    status: 403,
    message: "Email address not verified",
  },
} as const

/**
 * Check if user has editor role via custom claims
 *
 * Custom claims are set in Firebase Auth using:
 * - Firebase Console: Authentication > Users > Edit user > Custom claims
 * - Admin SDK: admin.auth().setCustomUserClaims(uid, { role: 'editor' })
 * - Auth emulator: Can set via UI or REST API
 *
 * Example custom claim:
 *   { role: 'editor' }
 */
function hasEditorRole(decodedToken: auth.DecodedIdToken): boolean {
  return decodedToken.role === "editor"
}

// Extend Express Request to include user info
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    email: string
    email_verified: boolean
  }
}

/**
 * Middleware to verify Firebase Auth token and check authorization
 *
 * Usage:
 *   app.post('/protected-route', verifyAuthenticatedEditor, handler)
 *
 * Sets req.user with { uid, email, email_verified } if authenticated
 */
export function verifyAuthenticatedEditor(logger?: SimpleLogger) {
  // Create logger if not provided
  const log = logger || {
    info: (message: string, data?: unknown) => console.log(`[INFO] ${message}`, data || ""),
    warning: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data || ""),
    error: (message: string, data?: unknown) => console.error(`[ERROR] ${message}`, data || ""),
  }

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const requestId = (req as Request & { requestId?: string }).requestId || "unknown"

    try {
      // Extract Authorization header
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        log.warning("Missing or invalid Authorization header", {
          requestId,
          headers: req.headers,
        })

        const err = AUTH_ERROR_CODES.UNAUTHORIZED
        res.status(err.status).json({
          success: false,
          error: "UNAUTHORIZED",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      // Extract token
      const idToken = authHeader.split("Bearer ")[1]

      if (!idToken) {
        log.warning("Empty bearer token", { requestId })

        const err = AUTH_ERROR_CODES.UNAUTHORIZED
        res.status(err.status).json({
          success: false,
          error: "UNAUTHORIZED",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      // Verify token with Firebase Admin SDK
      let decodedToken: auth.DecodedIdToken
      try {
        decodedToken = await auth().verifyIdToken(idToken)
      } catch (tokenError) {
        const errorMessage = tokenError instanceof Error ? tokenError.message : String(tokenError)

        // Check if token is expired
        const isExpired = errorMessage.includes("expired")

        log.warning("Token verification failed", {
          requestId,
          error: errorMessage,
          isExpired,
        })

        const err = isExpired ? AUTH_ERROR_CODES.TOKEN_EXPIRED : AUTH_ERROR_CODES.INVALID_TOKEN
        res.status(err.status).json({
          success: false,
          error: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      // Extract user info
      const { uid, email, email_verified } = decodedToken

      if (!email) {
        log.warning("Token missing email claim", {
          requestId,
          uid,
        })

        const err = AUTH_ERROR_CODES.INVALID_TOKEN
        res.status(err.status).json({
          success: false,
          error: "INVALID_TOKEN",
          errorCode: err.code,
          message: "Token missing email claim",
          requestId,
        })
        return
      }

      // Check if email is verified
      if (!email_verified) {
        log.warning("Email not verified", {
          requestId,
          email,
          uid,
        })

        const err = AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
        res.status(err.status).json({
          success: false,
          error: "EMAIL_NOT_VERIFIED",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      // Check if user has editor role via custom claims
      if (!hasEditorRole(decodedToken)) {
        log.warning("User without editor role attempted access", {
          requestId,
          email,
          uid,
          role: decodedToken.role || "none",
        })

        const err = AUTH_ERROR_CODES.FORBIDDEN
        res.status(err.status).json({
          success: false,
          error: "FORBIDDEN",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      // Attach user info to request
      req.user = {
        uid,
        email,
        email_verified,
      }

      log.info("User authenticated successfully", {
        requestId,
        email,
        uid,
      })

      // Continue to next middleware/handler
      next()
    } catch (error) {
      log.error("Unexpected error in auth middleware", {
        error,
        requestId,
      })

      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        errorCode: "EXP_SYS_001",
        message: "An unexpected error occurred",
        requestId,
      })
    }
  }
}
