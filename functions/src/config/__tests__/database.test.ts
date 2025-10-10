/**
 * Database Configuration Tests
 *
 * These tests validate that the database configuration correctly
 * selects the appropriate database based on environment variables.
 */

describe("Database Configuration", () => {
  // Store original environment
  const originalEnv = process.env

  beforeEach(() => {
    // Reset modules and environment before each test
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe("DATABASE_ID selection", () => {
    it("should use explicit FIRESTORE_DATABASE_ID when set", () => {
      process.env.FIRESTORE_DATABASE_ID = "custom-database"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("custom-database")
    })

    it("should use (default) when FIRESTORE_EMULATOR_HOST is set", () => {
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("(default)")
    })

    it("should use (default) when FUNCTIONS_EMULATOR is true", () => {
      process.env.FUNCTIONS_EMULATOR = "true"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("(default)")
    })

    it("should use portfolio-staging when ENVIRONMENT=staging", () => {
      process.env.ENVIRONMENT = "staging"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("portfolio-staging")
    })

    it("should use portfolio when ENVIRONMENT=production", () => {
      process.env.ENVIRONMENT = "production"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("portfolio")
    })

    it("should use (default) when ENVIRONMENT=development", () => {
      process.env.ENVIRONMENT = "development"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("(default)")
    })

    it("should use (default) when ENVIRONMENT=test", () => {
      process.env.ENVIRONMENT = "test"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("(default)")
    })

    it("should fall back to NODE_ENV when ENVIRONMENT is not set", () => {
      process.env.NODE_ENV = "staging"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("portfolio-staging")
    })

    it("should default to portfolio (production) when no env vars are set", () => {
      delete process.env.ENVIRONMENT
      delete process.env.NODE_ENV
      delete process.env.FIRESTORE_DATABASE_ID
      delete process.env.FIRESTORE_EMULATOR_HOST
      delete process.env.FUNCTIONS_EMULATOR

      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("portfolio")
    })

    it("should prioritize FIRESTORE_DATABASE_ID over emulator detection", () => {
      process.env.FIRESTORE_DATABASE_ID = "override-database"
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("override-database")
    })

    it("should prioritize emulator detection over ENVIRONMENT", () => {
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      process.env.ENVIRONMENT = "production"
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).toBe("(default)")
    })
  })

  describe("Environment-specific behavior", () => {
    it("should not throw error when DATABASE_ID is properly set", () => {
      process.env.ENVIRONMENT = "production"
      expect(() => {
        require("../database")
      }).not.toThrow()
    })

    it("should export collection names", () => {
      process.env.ENVIRONMENT = "production"
      const config = require("../database")
      expect(config.EXPERIENCE_COLLECTION).toBe("experience-entries")
      expect(config.BLURBS_COLLECTION).toBe("experience-blurbs")
      expect(config.GENERATOR_COLLECTION).toBe("generator")
    })
  })

  describe("Safety checks", () => {
    it("should prevent accidental production database use in test environment", () => {
      process.env.NODE_ENV = "test"
      delete process.env.ENVIRONMENT
      const { DATABASE_ID } = require("../database")
      expect(DATABASE_ID).not.toBe("portfolio")
      expect(DATABASE_ID).toBe("(default)")
    })

    it("should ensure staging uses separate database from production", () => {
      // Staging
      process.env.ENVIRONMENT = "staging"
      const { DATABASE_ID: stagingDb } = require("../database")

      // Reset and check production
      jest.resetModules()
      process.env = { ...originalEnv }
      process.env.ENVIRONMENT = "production"
      const { DATABASE_ID: prodDb } = require("../database")

      expect(stagingDb).not.toBe(prodDb)
      expect(stagingDb).toBe("portfolio-staging")
      expect(prodDb).toBe("portfolio")
    })
  })

  describe("Logging behavior", () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation()
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it("should log database configuration in non-production environments", () => {
      process.env.ENVIRONMENT = "development"
      require("../database")
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Database Config] Using database:")
      )
    })

    it("should NOT log database configuration in production", () => {
      process.env.ENVIRONMENT = "production"
      require("../database")
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })
})
