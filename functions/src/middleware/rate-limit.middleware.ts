import rateLimit from "express-rate-limit"

/**
 * Rate limiting middleware for contact form
 *
 * Prevents abuse by limiting the number of requests from a single IP address.
 *
 * Limits:
 * - 5 requests per 15 minutes per IP (production)
 * - 10 requests per 15 minutes per IP (staging/development)
 *
 * This is intentionally conservative to prevent spam while allowing legitimate users
 * who might need to resubmit if they make a typo.
 */

const isProduction = process.env.NODE_ENV === "production"
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

/**
 * Rate limiter configuration
 */
export const contactFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 10, // Limit each IP to 5 (prod) or 10 (dev) requests per windowMs
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "CF_SEC_003",
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => isTestEnvironment, // Skip rate limiting in tests
  handler: (req, res) => {
    console.warn("[RateLimit] Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    })

    res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      errorCode: "CF_SEC_003",
      message: "Too many requests from this IP. Please try again in 15 minutes.",
    })
  },
  // Use a function to get the client IP (handles proxies)
  keyGenerator: (req) => {
    // Try to get real IP from various headers (Cloud Functions behind proxy)
    const forwarded = req.headers["x-forwarded-for"]
    const realIp = req.headers["x-real-ip"]

    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim()
    }

    if (typeof realIp === "string") {
      return realIp
    }

    return req.ip || "unknown"
  },
})

/**
 * More restrictive rate limiter for detected suspicious activity
 * Can be applied conditionally based on honeypot triggers or other signals
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Only 1 request per hour
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "CF_SEC_004",
    message: "Access temporarily restricted. Please contact support if you believe this is an error.",
  },
  skip: () => isTestEnvironment,
  handler: (req, res) => {
    console.warn("[RateLimit] Strict rate limit applied", {
      ip: req.ip,
      path: req.path,
      reason: "suspicious_activity",
    })

    res.status(429).json({
      success: false,
      error: "ACCESS_RESTRICTED",
      errorCode: "CF_SEC_004",
      message: "Access temporarily restricted due to suspicious activity.",
    })
  },
  keyGenerator: (req) => {
    const forwarded = req.headers["x-forwarded-for"]
    const realIp = req.headers["x-real-ip"]

    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim()
    }

    if (typeof realIp === "string") {
      return realIp
    }

    return req.ip || "unknown"
  },
})
