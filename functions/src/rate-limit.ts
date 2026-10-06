import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import type { Request } from "express"
import { logger } from "./logger"

/**
 * Client IP as seen by Google's front end.
 *
 * Google appends the connecting IP to X-Forwarded-For, so the LAST entry is
 * the trustworthy one. Earlier entries are whatever the client sent and must
 * not be used: keying on them lets a caller reset its own limit.
 */
export function getClientIp(req: Pick<Request, "headers" | "ip">): string {
  const header = req.headers["x-forwarded-for"]
  const forwarded = (Array.isArray(header) ? header.join(",") : (header ?? ""))
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean)

  return forwarded[forwarded.length - 1] ?? req.ip ?? "unknown"
}

/**
 * 5 requests per 15 minutes per IP.
 *
 * Counts are held in memory per instance, so the effective limit is
 * 5 x max-instances (see deploy-cloud-functions.yml).
 */
export const contactFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(getClientIp(req)),
  handler: (req, res) => {
    logger.warning("Rate limit exceeded", { path: req.path })

    res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again in 15 minutes.",
    })
  },
})
