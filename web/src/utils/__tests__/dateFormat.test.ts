/**
 * Tests for Date Formatting Utilities
 */

import { formatMonthYear, getCurrentMonthYear, isValidMonthYear } from "../dateFormat"

describe("formatMonthYear", () => {
  describe("valid dates", () => {
    it("should format January dates correctly", () => {
      expect(formatMonthYear("2023-01")).toBe("Jan 2023")
      expect(formatMonthYear("2020-01")).toBe("Jan 2020")
    })

    it("should format December dates correctly", () => {
      expect(formatMonthYear("2023-12")).toBe("Dec 2023")
      expect(formatMonthYear("2020-12")).toBe("Dec 2020")
    })

    it("should format all months correctly", () => {
      const months = [
        { input: "2023-01", output: "Jan 2023" },
        { input: "2023-02", output: "Feb 2023" },
        { input: "2023-03", output: "Mar 2023" },
        { input: "2023-04", output: "Apr 2023" },
        { input: "2023-05", output: "May 2023" },
        { input: "2023-06", output: "Jun 2023" },
        { input: "2023-07", output: "Jul 2023" },
        { input: "2023-08", output: "Aug 2023" },
        { input: "2023-09", output: "Sep 2023" },
        { input: "2023-10", output: "Oct 2023" },
        { input: "2023-11", output: "Nov 2023" },
        { input: "2023-12", output: "Dec 2023" },
      ]

      months.forEach(({ input, output }) => {
        expect(formatMonthYear(input)).toBe(output)
      })
    })

    it("should handle different years", () => {
      expect(formatMonthYear("1990-06")).toBe("Jun 1990")
      expect(formatMonthYear("2000-06")).toBe("Jun 2000")
      expect(formatMonthYear("2024-06")).toBe("Jun 2024")
      expect(formatMonthYear("2100-06")).toBe("Jun 2100")
    })
  })

  describe("null/undefined handling", () => {
    it("should return 'Present' for null", () => {
      expect(formatMonthYear(null)).toBe("Present")
    })

    it("should return 'Present' for undefined", () => {
      expect(formatMonthYear(undefined)).toBe("Present")
    })

    it("should return 'Present' for empty string", () => {
      expect(formatMonthYear("")).toBe("Present")
    })
  })

  describe("invalid input handling", () => {
    it("should return 'Present' for invalid month numbers", () => {
      expect(formatMonthYear("2023-00")).toBe("Present")
      expect(formatMonthYear("2023-13")).toBe("Present")
      expect(formatMonthYear("2023-99")).toBe("Present")
    })

    it("should return 'Present' for malformed dates", () => {
      expect(formatMonthYear("2023")).toBe("Present")
      expect(formatMonthYear("invalid")).toBe("Present")
      expect(formatMonthYear("2023/06")).toBe("Present")
      expect(formatMonthYear("just-text")).toBe("Present")
    })

    it("should return 'Present' for dates with non-numeric month", () => {
      expect(formatMonthYear("2023-XX")).toBe("Present")
      expect(formatMonthYear("2023-abc")).toBe("Present")
    })
  })

  describe("edge cases", () => {
    it("should handle leading zeros in month", () => {
      expect(formatMonthYear("2023-01")).toBe("Jan 2023")
      expect(formatMonthYear("2023-09")).toBe("Sep 2023")
    })

    it("should handle dates without leading zeros (lenient parsing)", () => {
      // The function is lenient and will parse single-digit months
      expect(formatMonthYear("2023-1")).toBe("Jan 2023")
      expect(formatMonthYear("2023-9")).toBe("Sep 2023")
    })

    it("should handle very old dates", () => {
      expect(formatMonthYear("1900-01")).toBe("Jan 1900")
    })

    it("should handle future dates", () => {
      expect(formatMonthYear("2100-12")).toBe("Dec 2100")
    })
  })
})

describe("getCurrentMonthYear", () => {
  it("should return date in YYYY-MM format", () => {
    const result = getCurrentMonthYear()
    expect(result).toMatch(/^\d{4}-\d{2}$/)
  })

  it("should return current year and month", () => {
    const now = new Date()
    const expectedYear = now.getFullYear()
    const expectedMonth = String(now.getMonth() + 1).padStart(2, "0")
    const expected = `${expectedYear}-${expectedMonth}`

    expect(getCurrentMonthYear()).toBe(expected)
  })

  it("should pad single-digit months with leading zero", () => {
    const result = getCurrentMonthYear()
    const month = result.split("-")[1]
    expect(month).toHaveLength(2)
    expect(month).toMatch(/^(0[1-9]|1[0-2])$/)
  })

  it("should return same value when called multiple times within same minute", () => {
    const first = getCurrentMonthYear()
    const second = getCurrentMonthYear()
    expect(first).toBe(second)
  })
})

describe("isValidMonthYear", () => {
  describe("valid formats", () => {
    it("should return true for valid YYYY-MM dates", () => {
      expect(isValidMonthYear("2023-01")).toBe(true)
      expect(isValidMonthYear("2023-12")).toBe(true)
      expect(isValidMonthYear("2024-06")).toBe(true)
    })

    it("should return true for all valid months", () => {
      for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, "0")
        expect(isValidMonthYear(`2023-${monthStr}`)).toBe(true)
      }
    })

    it("should return true for different valid years", () => {
      expect(isValidMonthYear("1900-01")).toBe(true)
      expect(isValidMonthYear("2000-12")).toBe(true)
      expect(isValidMonthYear("2024-06")).toBe(true)
      expect(isValidMonthYear("2100-12")).toBe(true)
      expect(isValidMonthYear("9999-12")).toBe(true)
    })
  })

  describe("invalid formats", () => {
    it("should return false for empty string", () => {
      expect(isValidMonthYear("")).toBe(false)
    })

    it("should return false for invalid month numbers", () => {
      expect(isValidMonthYear("2023-00")).toBe(false)
      expect(isValidMonthYear("2023-13")).toBe(false)
      expect(isValidMonthYear("2023-99")).toBe(false)
    })

    it("should return false for months without leading zero", () => {
      expect(isValidMonthYear("2023-1")).toBe(false)
      expect(isValidMonthYear("2023-9")).toBe(false)
    })

    it("should return false for wrong separators", () => {
      expect(isValidMonthYear("2023/01")).toBe(false)
      expect(isValidMonthYear("2023.01")).toBe(false)
      expect(isValidMonthYear("2023 01")).toBe(false)
    })

    it("should return false for wrong format", () => {
      expect(isValidMonthYear("2023")).toBe(false)
      expect(isValidMonthYear("01-2023")).toBe(false)
      expect(isValidMonthYear("23-01")).toBe(false)
    })

    it("should return false for non-numeric values", () => {
      expect(isValidMonthYear("YYYY-MM")).toBe(false)
      expect(isValidMonthYear("2023-XX")).toBe(false)
      expect(isValidMonthYear("invalid")).toBe(false)
    })

    it("should return false for dates with extra characters", () => {
      expect(isValidMonthYear("2023-01-15")).toBe(false)
      expect(isValidMonthYear(" 2023-01")).toBe(false)
      expect(isValidMonthYear("2023-01 ")).toBe(false)
    })
  })

  describe("edge cases", () => {
    it("should return true for boundary valid months", () => {
      expect(isValidMonthYear("2023-01")).toBe(true) // Minimum month
      expect(isValidMonthYear("2023-12")).toBe(true) // Maximum month
    })

    it("should return false for boundary invalid months", () => {
      expect(isValidMonthYear("2023-00")).toBe(false) // Below minimum
      expect(isValidMonthYear("2023-13")).toBe(false) // Above maximum
    })

    it("should handle very long year values", () => {
      expect(isValidMonthYear("10000-01")).toBe(false) // 5-digit year
      expect(isValidMonthYear("999999-01")).toBe(false) // 6-digit year
    })

    it("should handle very short year values", () => {
      expect(isValidMonthYear("23-01")).toBe(false) // 2-digit year
      expect(isValidMonthYear("123-01")).toBe(false) // 3-digit year
    })
  })
})
