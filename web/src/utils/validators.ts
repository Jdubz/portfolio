/**
 * Form Validation Utilities
 *
 * Provides reusable validation rules and a validator factory for type-safe form validation.
 */

/**
 * Validation rule for a specific field
 */
export interface ValidationRule<T> {
  field: keyof T
  validator: (value: unknown) => string | null
}

/**
 * Common validation rules
 */
export const validators = {
  /**
   * Validates that a value is not empty
   */
  required:
    (fieldName: string) =>
    (value: unknown): string | null => {
      if (value === null || value === undefined) {
        return `${fieldName} is required`
      }
      if (typeof value === "string" && !value.trim()) {
        return `${fieldName} is required`
      }
      return null
    },

  /**
   * Validates email format
   */
  email: (value: unknown): string | null => {
    if (typeof value !== "string") {
      return "Email must be a string"
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address"
    }
    return null
  },

  /**
   * Validates minimum string length
   */
  minLength:
    (min: number) =>
    (value: unknown): string | null => {
      if (typeof value !== "string") {
        return "Value must be a string"
      }
      if (value.length < min) {
        return `Must be at least ${min} characters`
      }
      return null
    },

  /**
   * Validates maximum string length
   */
  maxLength:
    (max: number) =>
    (value: unknown): string | null => {
      if (typeof value !== "string") {
        return "Value must be a string"
      }
      if (value.length > max) {
        return `Must be no more than ${max} characters`
      }
      return null
    },

  /**
   * Validates URL format
   */
  url: (value: unknown): string | null => {
    if (typeof value !== "string") {
      return "URL must be a string"
    }
    try {
      new URL(value)
      return null
    } catch {
      return "Please enter a valid URL"
    }
  },

  /**
   * Validates date format (YYYY-MM)
   */
  dateFormat: (value: unknown): string | null => {
    if (typeof value !== "string") {
      return "Date must be a string"
    }
    if (!/^\d{4}-\d{2}$/.test(value)) {
      return "Date must be in YYYY-MM format"
    }
    const [year, month] = value.split("-").map(Number)
    if (month < 1 || month > 12) {
      return "Month must be between 01 and 12"
    }
    if (year < 1900 || year > 2100) {
      return "Year must be between 1900 and 2100"
    }
    return null
  },

  /**
   * Validates that a value matches a regex pattern
   */
  pattern:
    (pattern: RegExp, message: string) =>
    (value: unknown): string | null => {
      if (typeof value !== "string") {
        return "Value must be a string"
      }
      if (!pattern.test(value)) {
        return message
      }
      return null
    },

  /**
   * Creates a custom validator
   */
  custom:
    (fn: (value: unknown) => boolean, message: string) =>
    (value: unknown): string | null => {
      if (!fn(value)) {
        return message
      }
      return null
    },
}

/**
 * Creates a validator function from a set of validation rules
 *
 * @example
 * ```typescript
 * interface ContactFormData {
 *   name: string
 *   email: string
 *   message: string
 * }
 *
 * const validateContactForm = createValidator<ContactFormData>([
 *   { field: "name", validator: validators.required("Name") },
 *   { field: "email", validator: validators.required("Email") },
 *   { field: "email", validator: validators.email },
 *   { field: "message", validator: validators.required("Message") },
 *   { field: "message", validator: validators.minLength(10) },
 * ])
 *
 * const errors = validateContactForm(formData)
 * if (Object.keys(errors).length > 0) {
 *   // Handle validation errors
 * }
 * ```
 */
export const createValidator = <T extends Record<string, unknown>>(
  rules: ValidationRule<T>[]
): ((data: T) => Partial<Record<keyof T, string>>) => {
  return (data: T): Partial<Record<keyof T, string>> => {
    const errors: Partial<Record<keyof T, string>> = {}

    for (const rule of rules) {
      // Skip if field already has an error
      if (errors[rule.field]) {
        continue
      }

      const error = rule.validator(data[rule.field])
      if (error) {
        errors[rule.field] = error
      }
    }

    return errors
  }
}

/**
 * Helper to check if validation errors object is empty
 */
export const hasErrors = (errors: Record<string, unknown>): boolean => {
  return Object.keys(errors).length > 0
}

/**
 * Helper to get the first error message from an errors object
 */
export const getFirstError = (errors: Record<string, unknown>): string | null => {
  const keys = Object.keys(errors)
  if (keys.length === 0) {
    return null
  }
  return errors[keys[0]] as string
}
