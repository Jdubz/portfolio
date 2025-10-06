import { Request, Response, NextFunction } from "express"
import * as admin from "firebase-admin"

/**
 * Firebase App Check middleware for Cloud Functions
 *
 * Verifies that requests come from legitimate app instances, not bots or scripts.
 *
 * In production: Strictly enforces App Check tokens
 * In development/emulator: Allows requests without tokens for easier testing
 */

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp()
}

const isProduction = process.env.NODE_ENV === "production"
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined
const isEmulator = process.env.FUNCTIONS_EMULATOR === "true"

/**
 * App Check verification middleware
 *
 * Extracts and verifies Firebase App Check token from request headers.
 * Token must be in the X-Firebase-AppCheck header.
 */
export const verifyAppCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip verification in test environment
  if (isTestEnvironment) {
    return next()
  }

  // In development/emulator, allow requests without App Check for testing
  if (!isProduction || isEmulator) {
    const appCheckToken = req.header("X-Firebase-AppCheck")
    if (!appCheckToken) {
      console.log("[AppCheck] Development mode: Allowing request without App Check token")
      return next()
    }
  }

  try {
    const appCheckToken = req.header("X-Firebase-AppCheck")

    if (!appCheckToken) {
      console.warn("[AppCheck] Missing App Check token")
      res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        errorCode: "CF_SEC_001",
        message: "Unauthorized: App verification failed",
      })
      return
    }

    // Verify the App Check token
    const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken)

    // Token is valid - attach app ID to request for logging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).appCheckAppId = appCheckClaims.appId

    console.log("[AppCheck] Token verified successfully", {
      appId: appCheckClaims.appId,
    })

    next()
  } catch (error) {
    console.error("[AppCheck] Token verification failed", {
      error: error instanceof Error ? error.message : error,
    })

    res.status(401).json({
      success: false,
      error: "UNAUTHORIZED",
      errorCode: "CF_SEC_002",
      message: "Unauthorized: Invalid app verification",
    })
  }
}
