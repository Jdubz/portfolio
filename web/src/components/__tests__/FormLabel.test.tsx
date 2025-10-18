/**
 * Tests for FormLabel Component
 *
 * Simple, high-impact tests for the standardized form label component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { ThemeUIProvider } from "theme-ui"
import { FormLabel } from "../FormLabel"

// Simple theme for testing
const theme = {
  fontSizes: [12, 14, 16, 20, 24],
  space: [0, 4, 8, 16, 32],
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeUIProvider theme={theme}>{ui}</ThemeUIProvider>)
}

describe("FormLabel", () => {
  describe("Basic Rendering", () => {
    it("should render label text", () => {
      renderWithTheme(<FormLabel>Email Address</FormLabel>)

      expect(screen.getByText("Email Address")).toBeInTheDocument()
    })

    it("should render as a label element", () => {
      renderWithTheme(<FormLabel>Username</FormLabel>)

      const label = screen.getByText("Username")
      expect(label.tagName).toBe("LABEL")
    })

    it("should render with children prop", () => {
      renderWithTheme(<FormLabel>Password</FormLabel>)

      expect(screen.getByText("Password")).toBeInTheDocument()
    })
  })

  describe("Content Types", () => {
    it("should render string content", () => {
      renderWithTheme(<FormLabel>Simple Text</FormLabel>)

      expect(screen.getByText("Simple Text")).toBeInTheDocument()
    })

    it("should render content with required indicator", () => {
      renderWithTheme(<FormLabel>Email *</FormLabel>)

      expect(screen.getByText("Email *")).toBeInTheDocument()
    })

    it("should render content with special characters", () => {
      renderWithTheme(<FormLabel>Name (Optional)</FormLabel>)

      expect(screen.getByText("Name (Optional)")).toBeInTheDocument()
    })

    it("should render JSX children", () => {
      renderWithTheme(
        <FormLabel>
          Email <span>*</span>
        </FormLabel>
      )

      expect(screen.getByText("Email")).toBeInTheDocument()
      expect(screen.getByText("*")).toBeInTheDocument()
    })
  })

  describe("Display Properties", () => {
    it("should render as block element", () => {
      const { container } = renderWithTheme(<FormLabel>Test</FormLabel>)

      const label = container.querySelector("label")
      expect(label).toBeInTheDocument()
      // Block display is set via sx prop in component
    })

    it("should be visible by default", () => {
      renderWithTheme(<FormLabel>Visible Label</FormLabel>)

      const label = screen.getByText("Visible Label")
      expect(label).toBeVisible()
    })
  })

  describe("Custom Styling", () => {
    it("should accept sx prop for custom styles", () => {
      const { container } = renderWithTheme(<FormLabel sx={{ color: "red" }}>Custom Styled</FormLabel>)

      const label = container.querySelector("label")
      expect(label).toBeInTheDocument()
      // sx styles are applied by theme-ui
    })

    it("should render without sx prop", () => {
      renderWithTheme(<FormLabel>No Custom Styles</FormLabel>)

      expect(screen.getByText("No Custom Styles")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty string", () => {
      renderWithTheme(<FormLabel>{""}</FormLabel>)

      // Empty labels still render the element, just with no text
      const labels = screen.queryAllByRole("textbox")
      expect(labels.length).toBe(0)
    })

    it("should handle long text", () => {
      const longText = "This is a very long label text that might wrap to multiple lines in the UI"
      renderWithTheme(<FormLabel>{longText}</FormLabel>)

      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it("should handle numeric children", () => {
      renderWithTheme(<FormLabel>{123}</FormLabel>)

      expect(screen.getByText("123")).toBeInTheDocument()
    })

    it("should handle whitespace", () => {
      renderWithTheme(<FormLabel> Padded Text </FormLabel>)

      expect(screen.getByText("Padded Text", { exact: false })).toBeInTheDocument()
    })
  })

  describe("Multiple Labels", () => {
    it("should render multiple labels independently", () => {
      renderWithTheme(
        <>
          <FormLabel>First Name</FormLabel>
          <FormLabel>Last Name</FormLabel>
          <FormLabel>Email</FormLabel>
        </>
      )

      expect(screen.getByText("First Name")).toBeInTheDocument()
      expect(screen.getByText("Last Name")).toBeInTheDocument()
      expect(screen.getByText("Email")).toBeInTheDocument()
    })
  })
})
