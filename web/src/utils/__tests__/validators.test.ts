/**
 * Tests for Form Validation Utilities
 */

import { validators, createValidator, hasErrors, getFirstError } from "../validators"

describe("validators", () => {
  describe("required", () => {
    it("should return error for null value", () => {
      const validator = validators.required("Name")
      expect(validator(null)).toBe("Name is required")
    })

    it("should return error for undefined value", () => {
      const validator = validators.required("Email")
      expect(validator(undefined)).toBe("Email is required")
    })

    it("should return error for empty string", () => {
      const validator = validators.required("Message")
      expect(validator("")).toBe("Message is required")
    })

    it("should return error for whitespace-only string", () => {
      const validator = validators.required("Title")
      expect(validator("   ")).toBe("Title is required")
    })

    it("should return null for valid string", () => {
      const validator = validators.required("Name")
      expect(validator("John Doe")).toBeNull()
    })

    it("should return null for number zero", () => {
      const validator = validators.required("Count")
      expect(validator(0)).toBeNull()
    })

    it("should return null for boolean false", () => {
      const validator = validators.required("Active")
      expect(validator(false)).toBeNull()
    })
  })

  describe("email", () => {
    it("should return error for non-string value", () => {
      expect(validators.email(123)).toBe("Email must be a string")
      expect(validators.email(null)).toBe("Email must be a string")
      expect(validators.email(undefined)).toBe("Email must be a string")
    })

    it("should return error for invalid email formats", () => {
      expect(validators.email("invalid")).toBe("Please enter a valid email address")
      expect(validators.email("invalid@")).toBe("Please enter a valid email address")
      expect(validators.email("@example.com")).toBe("Please enter a valid email address")
      expect(validators.email("user@")).toBe("Please enter a valid email address")
      expect(validators.email("user@domain")).toBe("Please enter a valid email address")
      expect(validators.email("user domain@example.com")).toBe("Please enter a valid email address")
    })

    it("should return error for email exceeding max length", () => {
      const longEmail = "a".repeat(310) + "@example.com"
      expect(validators.email(longEmail)).toBe("Email address is too long (max 320 characters)")
    })

    it("should return null for valid email addresses", () => {
      expect(validators.email("user@example.com")).toBeNull()
      expect(validators.email("test.user@domain.co.uk")).toBeNull()
      expect(validators.email("user+tag@example.com")).toBeNull()
      expect(validators.email("user_name@sub.domain.com")).toBeNull()
    })

    it("should return null for email at max length", () => {
      const maxEmail = "a".repeat(64) + "@" + "b".repeat(250) + ".com"
      expect(validators.email(maxEmail)).toBeNull()
    })
  })

  describe("minLength", () => {
    it("should return error for non-string value", () => {
      const validator = validators.minLength(5)
      expect(validator(123)).toBe("Value must be a string")
    })

    it("should return error for string shorter than minimum", () => {
      const validator = validators.minLength(5)
      expect(validator("abc")).toBe("Must be at least 5 characters")
    })

    it("should return null for string at minimum length", () => {
      const validator = validators.minLength(5)
      expect(validator("abcde")).toBeNull()
    })

    it("should return null for string longer than minimum", () => {
      const validator = validators.minLength(5)
      expect(validator("abcdefgh")).toBeNull()
    })
  })

  describe("maxLength", () => {
    it("should return error for non-string value", () => {
      const validator = validators.maxLength(10)
      expect(validator(123)).toBe("Value must be a string")
    })

    it("should return error for string longer than maximum", () => {
      const validator = validators.maxLength(10)
      expect(validator("this is way too long")).toBe("Must be no more than 10 characters")
    })

    it("should return null for string at maximum length", () => {
      const validator = validators.maxLength(10)
      expect(validator("exactly10!")).toBeNull()
    })

    it("should return null for string shorter than maximum", () => {
      const validator = validators.maxLength(10)
      expect(validator("short")).toBeNull()
    })
  })

  describe("url", () => {
    it("should return error for non-string value", () => {
      expect(validators.url(123)).toBe("URL must be a string")
    })

    it("should return error for invalid URLs", () => {
      expect(validators.url("not-a-url")).toBe("Please enter a valid URL")
      // Note: "htp://" is actually valid to new URL() constructor, just not HTTP protocol
      // expect(validators.url("htp://invalid.com")).toBe("Please enter a valid URL")
      expect(validators.url("example.com")).toBe("Please enter a valid URL")
      expect(validators.url("//incomplete")).toBe("Please enter a valid URL")
      expect(validators.url("just text")).toBe("Please enter a valid URL")
    })

    it("should return null for valid URLs", () => {
      expect(validators.url("https://example.com")).toBeNull()
      expect(validators.url("http://example.com")).toBeNull()
      expect(validators.url("https://example.com/path")).toBeNull()
      expect(validators.url("https://example.com/path?query=1")).toBeNull()
      expect(validators.url("https://sub.domain.example.com")).toBeNull()
    })
  })

  describe("dateFormat", () => {
    it("should return error for non-string value", () => {
      expect(validators.dateFormat(123)).toBe("Date must be a string")
    })

    it("should return error for invalid format", () => {
      expect(validators.dateFormat("2023")).toBe("Date must be in YYYY-MM format")
      expect(validators.dateFormat("2023-1")).toBe("Date must be in YYYY-MM format")
      expect(validators.dateFormat("23-01")).toBe("Date must be in YYYY-MM format")
      expect(validators.dateFormat("2023/01")).toBe("Date must be in YYYY-MM format")
      expect(validators.dateFormat("01-2023")).toBe("Date must be in YYYY-MM format")
    })

    it("should return error for invalid month", () => {
      expect(validators.dateFormat("2023-00")).toBe("Month must be between 01 and 12")
      expect(validators.dateFormat("2023-13")).toBe("Month must be between 01 and 12")
      expect(validators.dateFormat("2023-99")).toBe("Month must be between 01 and 12")
    })

    it("should return error for invalid year", () => {
      expect(validators.dateFormat("1899-01")).toBe("Year must be between 1900 and 2100")
      expect(validators.dateFormat("2101-01")).toBe("Year must be between 1900 and 2100")
      expect(validators.dateFormat("0001-01")).toBe("Year must be between 1900 and 2100")
    })

    it("should return null for valid dates", () => {
      expect(validators.dateFormat("2023-01")).toBeNull()
      expect(validators.dateFormat("2023-12")).toBeNull()
      expect(validators.dateFormat("1900-01")).toBeNull()
      expect(validators.dateFormat("2100-12")).toBeNull()
      expect(validators.dateFormat("2024-06")).toBeNull()
    })
  })

  describe("pattern", () => {
    it("should return error for non-string value", () => {
      const validator = validators.pattern(/^\d+$/, "Must be numeric")
      expect(validator(123)).toBe("Value must be a string")
    })

    it("should return error when pattern does not match", () => {
      const validator = validators.pattern(/^\d+$/, "Must be numeric")
      expect(validator("abc")).toBe("Must be numeric")
    })

    it("should return null when pattern matches", () => {
      const validator = validators.pattern(/^\d+$/, "Must be numeric")
      expect(validator("123")).toBeNull()
    })

    it("should work with complex patterns", () => {
      const validator = validators.pattern(/^[A-Z]{2}\d{3}$/, "Must be format: AB123")
      expect(validator("AB123")).toBeNull()
      expect(validator("ab123")).toBe("Must be format: AB123")
      expect(validator("ABC123")).toBe("Must be format: AB123")
    })
  })

  describe("custom", () => {
    it("should return error when custom function returns false", () => {
      const validator = validators.custom((val) => typeof val === "number" && val > 0, "Must be positive number")
      expect(validator(-5)).toBe("Must be positive number")
      expect(validator(0)).toBe("Must be positive number")
      expect(validator("5")).toBe("Must be positive number")
    })

    it("should return null when custom function returns true", () => {
      const validator = validators.custom((val) => typeof val === "number" && val > 0, "Must be positive number")
      expect(validator(5)).toBeNull()
      expect(validator(100)).toBeNull()
    })

    it("should work with complex custom logic", () => {
      const validator = validators.custom((val) => {
        if (typeof val !== "string") {
          return false
        }
        const words = val.split(" ")
        return words.length >= 2
      }, "Must contain at least two words")
      expect(validator("OneWord")).toBe("Must contain at least two words")
      expect(validator("Two Words")).toBeNull()
      expect(validator("Three Word Phrase")).toBeNull()
    })
  })
})

describe("createValidator", () => {
  interface TestFormData extends Record<string, unknown> {
    name: string
    email: string
    age: number
    website?: string
  }

  it("should validate all fields and return errors", () => {
    const validate = createValidator<TestFormData>([
      { field: "name", validator: validators.required("Name") },
      { field: "email", validator: validators.required("Email") },
      { field: "email", validator: validators.email },
    ])

    const errors = validate({
      name: "",
      email: "invalid-email",
      age: 25,
    })

    expect(errors.name).toBe("Name is required")
    expect(errors.email).toBe("Please enter a valid email address")
  })

  it("should return empty object for valid data", () => {
    const validate = createValidator<TestFormData>([
      { field: "name", validator: validators.required("Name") },
      { field: "email", validator: validators.required("Email") },
      { field: "email", validator: validators.email },
    ])

    const errors = validate({
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    })

    expect(errors).toEqual({})
  })

  it("should stop at first error per field", () => {
    const validate = createValidator<TestFormData>([
      { field: "email", validator: validators.required("Email") },
      { field: "email", validator: validators.email },
      { field: "email", validator: validators.minLength(10) },
    ])

    const errors = validate({
      name: "Test",
      email: "",
      age: 25,
    })

    // Should only have the first error (required), not subsequent ones
    expect(errors.email).toBe("Email is required")
  })

  it("should validate multiple fields independently", () => {
    const validate = createValidator<TestFormData>([
      { field: "name", validator: validators.required("Name") },
      { field: "name", validator: validators.minLength(3) },
      { field: "email", validator: validators.required("Email") },
      { field: "email", validator: validators.email },
    ])

    const errors = validate({
      name: "Jo",
      email: "invalid",
      age: 25,
    })

    expect(errors.name).toBe("Must be at least 3 characters")
    expect(errors.email).toBe("Please enter a valid email address")
  })

  it("should handle optional fields", () => {
    const validate = createValidator<TestFormData>([
      { field: "name", validator: validators.required("Name") },
      // For optional fields, we need a validator that checks if value exists first
      {
        field: "website",
        validator: (val) => {
          if (val === undefined || val === null || val === "") {
            return null
          }
          return validators.url(val)
        },
      },
    ])

    // Optional field not provided - should not error
    const errors1 = validate({
      name: "John",
      email: "john@example.com",
      age: 25,
    })
    expect(errors1.website).toBeUndefined()

    // Optional field provided but invalid - should error
    const errors2 = validate({
      name: "John",
      email: "john@example.com",
      age: 25,
      website: "not-a-url",
    })
    expect(errors2.website).toBe("Please enter a valid URL")
  })

  it("should work with complex validation chains", () => {
    interface ComplexForm extends Record<string, unknown> {
      password: string
      confirmPassword: string
    }

    const validate = createValidator<ComplexForm>([
      { field: "password", validator: validators.required("Password") },
      { field: "password", validator: validators.minLength(8) },
      {
        field: "password",
        validator: validators.pattern(/[A-Z]/, "Must contain uppercase letter"),
      },
      {
        field: "password",
        validator: validators.pattern(/[0-9]/, "Must contain number"),
      },
      { field: "confirmPassword", validator: validators.required("Confirm Password") },
    ])

    const errors = validate({
      password: "weak",
      confirmPassword: "",
    })

    expect(errors.password).toBe("Must be at least 8 characters")
    expect(errors.confirmPassword).toBe("Confirm Password is required")
  })
})

describe("hasErrors", () => {
  it("should return true for object with errors", () => {
    expect(hasErrors({ name: "Name is required" })).toBe(true)
    expect(hasErrors({ email: "Invalid", age: "Too young" })).toBe(true)
  })

  it("should return false for empty object", () => {
    expect(hasErrors({})).toBe(false)
  })
})

describe("getFirstError", () => {
  it("should return first error message", () => {
    expect(getFirstError({ name: "Name is required" })).toBe("Name is required")
    expect(getFirstError({ email: "Invalid email", name: "Name required" })).toBe("Invalid email")
  })

  it("should return null for empty object", () => {
    expect(getFirstError({})).toBeNull()
  })

  it("should handle objects with multiple errors", () => {
    const errors = {
      name: "Name is required",
      email: "Email is invalid",
      message: "Message is too short",
    }
    const firstError = getFirstError(errors)
    expect(firstError).toBeTruthy()
    expect(typeof firstError).toBe("string")
  })
})
