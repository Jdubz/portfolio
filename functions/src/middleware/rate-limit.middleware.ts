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
  standardHeaders: "draft-7", // Return rate limit info in the `RateLimit-*` headers
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
  // Note: No custom keyGenerator - uses default IP-based limiting that handles IPv6 properly
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
  // Note: No custom keyGenerator - uses default IP-based limiting that handles IPv6 properly
})

/**
 * Rate limiter for Experience API (public reads)
 *
 * Generous limits to allow legitimate browsing while preventing abuse.
 *
 * Limits:
 * - 100 requests per minute per IP (public viewers)
 * - Editors are exempt (checked before applying this middleware)
 */
export const experienceRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "EXP_SEC_001",
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnvironment,
  handler: (req, res) => {
    console.warn("[RateLimit] Experience API rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    })

    res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      errorCode: "EXP_SEC_001",
      message: "Too many requests from this IP. Please try again in a minute.",
    })
  },
})

/**
 * Rate limiter for Generator API (public viewers)
 *
 * Conservative limits for AI generation to prevent abuse and control costs.
 *
 * Limits:
 * - 10 requests per 15 minutes per IP (public viewers)
 * - Editors get higher limits (20 per 15 minutes)
 */
export const generatorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes for viewers
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "GEN_SEC_001",
    message: "Too many generation requests. Please try again later.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnvironment,
  handler: (req, res) => {
    console.warn("[RateLimit] Generator API rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    })

    res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      errorCode: "GEN_SEC_001",
      message: "Generation rate limit exceeded. Please try again in 15 minutes.",
    })
  },
})

/**
 * Rate limiter for authenticated editors (generator API)
 *
 * Higher limits for authenticated editors.
 *
 * Limits:
 * - 20 requests per 15 minutes per authenticated user
 */
export const generatorEditorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes for editors
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "GEN_SEC_002",
    message: "Editor rate limit exceeded. Please try again later.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnvironment,
  handler: (req, res) => {
    console.warn("[RateLimit] Generator editor rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    })

    res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      errorCode: "GEN_SEC_002",
      message: "Editor generation rate limit exceeded. Please try again in 15 minutes.",
    })
  },
})
