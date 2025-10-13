/**
 * Storage Service
 *
 * Handles GCS uploads and signed URL generation for generated documents.
 *
 * Environment-aware bucket selection:
 * - Local/Development: Uses mock mode, skips actual GCS uploads
 * - Staging: joshwentworth-resumes-staging
 * - Production: joshwentworth-resumes
 */

import { Storage } from "@google-cloud/storage"
import type { SimpleLogger } from "../types/generator.types"

export interface UploadResult {
  gcsPath: string
  filename: string
  size: number
  storageClass: "STANDARD" | "COLDLINE"
}

export interface SignedUrlOptions {
  expiresInHours: number
}

/**
 * Get environment-aware bucket name
 */
function getEnvironmentBucketName(): string {
  const functionsEmulator = process.env.FUNCTIONS_EMULATOR
  const nodeEnv = process.env.NODE_ENV
  const environment = process.env.ENVIRONMENT

  // Only use local bucket if explicitly running in emulator
  const isLocal = functionsEmulator === "true"
  const isStaging = environment === "staging"

  console.log("[StorageService] Environment detection:", {
    functionsEmulator,
    nodeEnv,
    environment,
    isLocal,
    isStaging,
  })

  if (isLocal) {
    return "joshwentworth-resumes-local" // Mock bucket for local dev
  } else if (isStaging) {
    return "joshwentworth-resumes-staging"
  } else {
    return "joshwentworth-resumes" // Production
  }
}

export class StorageService {
  private storage: Storage
  private bucketName: string
  private logger: SimpleLogger
  private useEmulator: boolean

  constructor(bucketName?: string, logger?: SimpleLogger) {
    this.bucketName = bucketName || getEnvironmentBucketName()
    // Only use emulator if FUNCTIONS_EMULATOR is explicitly set to "true"
    this.useEmulator = process.env.FUNCTIONS_EMULATOR === "true"

    this.logger = logger || {
      info: (message: string, data?: unknown) => console.log(`[INFO] ${message}`, data || ""),
      warning: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data || ""),
      error: (message: string, data?: unknown) => console.error(`[ERROR] ${message}`, data || ""),
    }

    // Initialize Storage with emulator support
    if (this.useEmulator) {
      const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199"
      this.storage = new Storage({
        projectId: "static-sites-257923",
        apiEndpoint: `http://${emulatorHost}`,
      })
      this.logger.info("StorageService using Firebase Storage Emulator", {
        bucket: this.bucketName,
        emulatorHost,
        note: "PDFs will be stored in emulator (temporary, cleared on restart)",
      })
    } else {
      // Explicitly set project ID for Cloud Functions
      this.storage = new Storage({
        projectId: "static-sites-257923",
      })
      this.logger.info("StorageService initialized for Cloud Functions", {
        bucket: this.bucketName,
        environment: process.env.ENVIRONMENT || "production",
        projectId: "static-sites-257923",
      })
    }
  }

  /**
   * Upload a PDF buffer to GCS
   */
  async uploadPDF(
    buffer: Buffer,
    filename: string,
    documentType: "resume" | "cover-letter"
  ): Promise<UploadResult> {
    try {
      const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
      const gcsPath = `${documentType}s/${timestamp}/${filename}`

      const logContext = {
        gcsPath,
        size: buffer.length,
        bucket: this.bucketName,
        emulator: this.useEmulator,
      }

      this.logger.info("Uploading PDF", logContext)

      const bucket = this.storage.bucket(this.bucketName)
      const file = bucket.file(gcsPath)

      await file.save(buffer, {
        metadata: {
          contentType: "application/pdf",
          cacheControl: "public, max-age=31536000", // 1 year cache
        },
      })

      this.logger.info("PDF uploaded successfully", logContext)

      return {
        gcsPath,
        filename,
        size: buffer.length,
        storageClass: "STANDARD", // All new uploads start as STANDARD (lifecycle moves to COLDLINE after 90 days)
      }
    } catch (error) {
      this.logger.error("Failed to upload PDF", { error })
      throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate a signed URL for downloading a PDF
   * @param gcsPath - Full GCS path (e.g., "resumes/YYYY-MM-DD/filename.pdf")
   * @param options - Expiration options (1 hour for viewers, 7 days for editors)
   */
  async generateSignedUrl(gcsPath: string, options: SignedUrlOptions): Promise<string> {
    try {
      this.logger.info("Generating download URL", {
        gcsPath,
        expiresInHours: options.expiresInHours,
        emulator: this.useEmulator,
      })

      const bucket = this.storage.bucket(this.bucketName)
      const file = bucket.file(gcsPath)

      // Emulator doesn't support signed URLs, return direct URL
      if (this.useEmulator) {
        const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199"
        const directUrl = `http://${emulatorHost}/v0/b/${this.bucketName}/o/${encodeURIComponent(gcsPath)}?alt=media`
        this.logger.info("Generated emulator direct URL", { directUrl })
        return directUrl
      }

      // Production: use signed URLs
      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + options.expiresInHours * 60 * 60 * 1000,
      })

      this.logger.info("Signed URL generated successfully")

      return signedUrl
    } catch (error) {
      this.logger.error("Failed to generate download URL", { error })
      throw new Error(`URL generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate signed URLs for both resume and cover letter
   */
  async generateSignedUrls(
    resumePath: string | null,
    coverLetterPath: string | null,
    options: SignedUrlOptions
  ): Promise<{
    resumeUrl?: string
    coverLetterUrl?: string
  }> {
    const result: { resumeUrl?: string; coverLetterUrl?: string } = {}

    if (resumePath) {
      result.resumeUrl = await this.generateSignedUrl(resumePath, options)
    }

    if (coverLetterPath) {
      result.coverLetterUrl = await this.generateSignedUrl(coverLetterPath, options)
    }

    return result
  }

  /**
   * Check if a file exists in GCS
   */
  async fileExists(gcsPath: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName)
      const file = bucket.file(gcsPath)
      const [exists] = await file.exists()
      return exists
    } catch (error) {
      this.logger.error("Failed to check file existence", { error, gcsPath })
      return false
    }
  }
}
