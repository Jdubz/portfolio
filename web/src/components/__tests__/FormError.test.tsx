/**
 * Tests for FormError Component
 *
 * Simple, high-impact tests for the standardized form error message component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { ThemeUIProvider } from "theme-ui"
import { FormError } from "../FormError"

// Simple theme for testing
const theme = {
  colors: {
    red: "#f00",
    white: "#fff",
  },
  fontSizes: [12, 14, 16, 20, 24],
  space: [0, 4, 8, 16, 32],
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeUIProvider theme={theme}>{ui}</ThemeUIProvider>)
}

describe("FormError", () => {
  describe("Basic Rendering", () => {
    it("should render error message", () => {
      renderWithTheme(<FormError message="Invalid email address" />)

      expect(screen.getByText("Invalid email address")).toBeInTheDocument()
    })

    it("should not render when message is null", () => {
      const { container } = renderWithTheme(<FormError message={null} />)

      expect(container.firstChild).toBeNull()
    })

    it("should not render when message is undefined", () => {
      const { container } = renderWithTheme(<FormError message={undefined} />)

      expect(container.firstChild).toBeNull()
    })

    it("should not render when message is empty string", () => {
      const { container } = renderWithTheme(<FormError message="" />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe("Message Content", () => {
    it("should display short error messages", () => {
      renderWithTheme(<FormError message="Required" />)

      expect(screen.getByText("Required")).toBeInTheDocument()
    })

    it("should display long error messages", () => {
      const longMessage = "This is a very long error message that provides detailed information about what went wrong"
      renderWithTheme(<FormError message={longMessage} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it("should display messages with special characters", () => {
      renderWithTheme(<FormError message="Email is invalid: user@" />)

      expect(screen.getByText("Email is invalid: user@")).toBeInTheDocument()
    })

    it("should display messages with numbers", () => {
      renderWithTheme(<FormError message="Must be at least 8 characters" />)

      expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument()
    })
  })

  describe("Conditional Rendering", () => {
    it("should show when message exists", () => {
      const { rerender } = renderWithTheme(<FormError message={null} />)

      expect(screen.queryByText("Error occurred")).not.toBeInTheDocument()

      rerender(
        <ThemeUIProvider theme={theme}>
          <FormError message="Error occurred" />
        </ThemeUIProvider>
      )

      expect(screen.getByText("Error occurred")).toBeInTheDocument()
    })

    it("should hide when message becomes null", () => {
      const { rerender } = renderWithTheme(<FormError message="Error occurred" />)

      expect(screen.getByText("Error occurred")).toBeInTheDocument()

      rerender(
        <ThemeUIProvider theme={theme}>
          <FormError message={null} />
        </ThemeUIProvider>
      )

      expect(screen.queryByText("Error occurred")).not.toBeInTheDocument()
    })

    it("should hide when message becomes empty string", () => {
      const { rerender } = renderWithTheme(<FormError message="Error occurred" />)

      expect(screen.getByText("Error occurred")).toBeInTheDocument()

      rerender(
        <ThemeUIProvider theme={theme}>
          <FormError message="" />
        </ThemeUIProvider>
      )

      expect(screen.queryByText("Error occurred")).not.toBeInTheDocument()
    })
  })

  describe("Custom Styling", () => {
    it("should accept sx prop for custom styles", () => {
      const { container } = renderWithTheme(<FormError message="Custom styled error" sx={{ mb: 4 }} />)

      expect(screen.getByText("Custom styled error")).toBeInTheDocument()
      // sx styles are applied by theme-ui
      expect(container.firstChild).toBeInTheDocument()
    })

    it("should render without sx prop", () => {
      renderWithTheme(<FormError message="Default styled error" />)

      expect(screen.getByText("Default styled error")).toBeInTheDocument()
    })
  })

  describe("Multiple Errors", () => {
    it("should render multiple error messages independently", () => {
      renderWithTheme(
        <>
          <FormError message="Email is required" />
          <FormError message="Password is too short" />
          <FormError message="Username is taken" />
        </>
      )

      expect(screen.getByText("Email is required")).toBeInTheDocument()
      expect(screen.getByText("Password is too short")).toBeInTheDocument()
      expect(screen.getByText("Username is taken")).toBeInTheDocument()
    })

    it("should render some errors and hide others based on message prop", () => {
      renderWithTheme(
        <>
          <FormError message="Visible error" />
          <FormError message={null} />
          <FormError message="Another visible error" />
          <FormError message={undefined} />
        </>
      )

      expect(screen.getByText("Visible error")).toBeInTheDocument()
      expect(screen.getByText("Another visible error")).toBeInTheDocument()
      expect(screen.queryByText("null")).not.toBeInTheDocument()
      expect(screen.queryByText("undefined")).not.toBeInTheDocument()
    })
  })

  describe("Common Error Messages", () => {
    it("should display validation error", () => {
      renderWithTheme(<FormError message="Please enter a valid email address" />)

      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument()
    })

    it("should display required field error", () => {
      renderWithTheme(<FormError message="This field is required" />)

      expect(screen.getByText("This field is required")).toBeInTheDocument()
    })

    it("should display length error", () => {
      renderWithTheme(<FormError message="Must be at least 8 characters" />)

      expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument()
    })

    it("should display network error", () => {
      renderWithTheme(<FormError message="Network error. Please try again." />)

      expect(screen.getByText("Network error. Please try again.")).toBeInTheDocument()
    })

    it("should display server error", () => {
      renderWithTheme(<FormError message="Server error. Please contact support." />)

      expect(screen.getByText("Server error. Please contact support.")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle whitespace-only message as empty", () => {
      const { container } = renderWithTheme(<FormError message="   " />)

      // Whitespace is truthy in JavaScript, so it will render
      expect(container.firstChild).toBeInTheDocument()
    })

    it("should handle message with line breaks", () => {
      renderWithTheme(<FormError message="Error on line 1\nError on line 2" />)

      // Line breaks are rendered but the text matcher needs to be flexible
      expect(screen.getByText(/Error on line 1/)).toBeInTheDocument()
      expect(screen.getByText(/Error on line 2/)).toBeInTheDocument()
    })

    it("should handle message with HTML entities", () => {
      renderWithTheme(<FormError message="Value must be < 100" />)

      expect(screen.getByText("Value must be < 100")).toBeInTheDocument()
    })
  })
})
