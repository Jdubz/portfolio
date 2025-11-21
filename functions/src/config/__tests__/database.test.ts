/**
 * Database configuration tests
 */

describe("Database Configuration", () => {
  let originalEnv: typeof process.env

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }

    // Clear module cache to allow re-import with different env vars
    jest.resetModules()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe("DATABASE_ID selection", () => {
    it("should use FIRESTORE_DATABASE_ID when explicitly set", async () => {
      process.env.FIRESTORE_DATABASE_ID = "custom-database"
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("custom-database")
    })

    it("should use (default) when FIRESTORE_EMULATOR_HOST is set", async () => {
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("(default)")
    })

    it("should use (default) when FUNCTIONS_EMULATOR is true", async () => {
      process.env.FUNCTIONS_EMULATOR = "true"
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("(default)")
    })

    it("should use portfolio for production", async () => {
      delete process.env.FIRESTORE_DATABASE_ID
      delete process.env.FIRESTORE_EMULATOR_HOST
      delete process.env.FUNCTIONS_EMULATOR
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("portfolio")
    })

    it("should always use portfolio database (no staging)", async () => {
      process.env.ENVIRONMENT = "production"
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("portfolio")
    })

    it("should default to portfolio when no special conditions are met", async () => {
      delete process.env.ENVIRONMENT
      delete process.env.NODE_ENV
      delete process.env.FIRESTORE_DATABASE_ID
      delete process.env.FIRESTORE_EMULATOR_HOST
      delete process.env.FUNCTIONS_EMULATOR

      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("portfolio")
    })
  })

  describe("Environment variable priority", () => {
    it("should prioritize FIRESTORE_DATABASE_ID over emulator detection", async () => {
      process.env.FIRESTORE_DATABASE_ID = "override-db"
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("override-db")
    })

    it("should prioritize emulator detection over production", async () => {
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      process.env.ENVIRONMENT = "production"
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("(default)")
    })
  })

  describe("Safety checks", () => {
    it("should have DATABASE_ID defined", async () => {
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBeDefined()
      expect(typeof DATABASE_ID).toBe("string")
      expect(DATABASE_ID.length).toBeGreaterThan(0)
    })

    it("should use emulator database in test environment", async () => {
      process.env.FUNCTIONS_EMULATOR = "true"
      delete process.env.ENVIRONMENT
      const { DATABASE_ID } = await import("../database")
      expect(DATABASE_ID).toBe("(default)")
    })
  })

  describe("CONTACT_SUBMISSIONS_COLLECTION", () => {
    it("should export CONTACT_SUBMISSIONS_COLLECTION constant", async () => {
      const { CONTACT_SUBMISSIONS_COLLECTION } = await import("../database")
      expect(CONTACT_SUBMISSIONS_COLLECTION).toBe("contact-submissions")
    })
  })
})
