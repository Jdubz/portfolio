/**
 * Tests for date formatting utilities
 */

import { formatMonthYear } from "../date-format"

describe("formatMonthYear", () => {
  describe("valid dates", () => {
    it("should format January correctly", () => {
      expect(formatMonthYear("2020-01")).toBe("Jan 2020")
    })

    it("should format December correctly", () => {
      expect(formatMonthYear("2023-12")).toBe("Dec 2023")
    })

    it("should format mid-year months correctly", () => {
      expect(formatMonthYear("2021-06")).toBe("Jun 2021")
      expect(formatMonthYear("2022-07")).toBe("Jul 2022")
    })

    it("should handle all 12 months", () => {
      const months = [
        { input: "2020-01", expected: "Jan 2020" },
        { input: "2020-02", expected: "Feb 2020" },
        { input: "2020-03", expected: "Mar 2020" },
        { input: "2020-04", expected: "Apr 2020" },
        { input: "2020-05", expected: "May 2020" },
        { input: "2020-06", expected: "Jun 2020" },
        { input: "2020-07", expected: "Jul 2020" },
        { input: "2020-08", expected: "Aug 2020" },
        { input: "2020-09", expected: "Sep 2020" },
        { input: "2020-10", expected: "Oct 2020" },
        { input: "2020-11", expected: "Nov 2020" },
        { input: "2020-12", expected: "Dec 2020" },
      ]

      months.forEach(({ input, expected }) => {
        expect(formatMonthYear(input)).toBe(expected)
      })
    })

    it("should handle different years", () => {
      expect(formatMonthYear("1990-05")).toBe("May 1990")
      expect(formatMonthYear("2000-01")).toBe("Jan 2000")
      expect(formatMonthYear("2025-12")).toBe("Dec 2025")
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
    it("should return 'Present' for invalid month (0)", () => {
      expect(formatMonthYear("2020-00")).toBe("Present")
    })

    it("should return 'Present' for invalid month (13)", () => {
      expect(formatMonthYear("2020-13")).toBe("Present")
    })

    it("should return 'Present' for invalid month (negative)", () => {
      expect(formatMonthYear("2020--1")).toBe("Present")
    })

    it("should return 'Present' for malformed date", () => {
      expect(formatMonthYear("2020")).toBe("Present")
      expect(formatMonthYear("not-a-date")).toBe("Present")
      expect(formatMonthYear("2020-AB")).toBe("Present")
    })

    it("should return 'Present' for date without hyphen", () => {
      expect(formatMonthYear("202001")).toBe("Present")
    })

    it("should handle dates with extra parts by using first two", () => {
      // The function splits on "-" and takes year and month, ignoring extra parts
      expect(formatMonthYear("2020-01-15")).toBe("Jan 2020")
    })
  })

  describe("edge cases", () => {
    it("should handle leading zeros in month", () => {
      expect(formatMonthYear("2020-01")).toBe("Jan 2020")
      expect(formatMonthYear("2020-09")).toBe("Sep 2020")
    })

    it("should handle months without leading zeros", () => {
      // This might fail depending on implementation, but it's good to test
      // In our case, parseInt handles this gracefully
      expect(formatMonthYear("2020-1")).toBe("Jan 2020")
      expect(formatMonthYear("2020-9")).toBe("Sep 2020")
    })
  })
})
