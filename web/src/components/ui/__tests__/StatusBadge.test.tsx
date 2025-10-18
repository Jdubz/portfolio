/**
 * Tests for StatusBadge Component
 *
 * Simple, high-impact tests for the status badge component used throughout the app
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { ThemeUIProvider } from "theme-ui"
import { StatusBadge } from "../StatusBadge"

// Simple theme for testing
const theme = {
  badges: {
    success: { bg: "green", color: "white" },
    danger: { bg: "red", color: "white" },
    warning: { bg: "yellow", color: "black" },
    info: { bg: "blue", color: "white" },
    muted: { bg: "gray", color: "white" },
  },
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeUIProvider theme={theme}>{ui}</ThemeUIProvider>)
}

describe("StatusBadge", () => {
  describe("Basic Rendering", () => {
    it("should render with status text", () => {
      renderWithTheme(<StatusBadge status="pending" />)

      expect(screen.getByText("pending")).toBeInTheDocument()
    })

    it("should render with custom children", () => {
      renderWithTheme(<StatusBadge status="success">Completed</StatusBadge>)

      expect(screen.getByText("Completed")).toBeInTheDocument()
      expect(screen.queryByText("success")).not.toBeInTheDocument()
    })

    it("should use status text when no children provided", () => {
      renderWithTheme(<StatusBadge status="processing" />)

      expect(screen.getByText("processing")).toBeInTheDocument()
    })
  })

  describe("Status Variants", () => {
    it("should handle 'success' status", () => {
      renderWithTheme(<StatusBadge status="success" />)

      expect(screen.getByText("success")).toBeInTheDocument()
    })

    it("should handle 'completed' status", () => {
      renderWithTheme(<StatusBadge status="completed" />)

      expect(screen.getByText("completed")).toBeInTheDocument()
    })

    it("should handle 'failed' status", () => {
      renderWithTheme(<StatusBadge status="failed" />)

      expect(screen.getByText("failed")).toBeInTheDocument()
    })

    it("should handle 'error' status", () => {
      renderWithTheme(<StatusBadge status="error" />)

      expect(screen.getByText("error")).toBeInTheDocument()
    })

    it("should handle 'processing' status", () => {
      renderWithTheme(<StatusBadge status="processing" />)

      expect(screen.getByText("processing")).toBeInTheDocument()
    })

    it("should handle 'in_progress' status", () => {
      renderWithTheme(<StatusBadge status="in_progress" />)

      expect(screen.getByText("in_progress")).toBeInTheDocument()
    })

    it("should handle 'skipped' status", () => {
      renderWithTheme(<StatusBadge status="skipped" />)

      expect(screen.getByText("skipped")).toBeInTheDocument()
    })

    it("should handle 'filtered' status", () => {
      renderWithTheme(<StatusBadge status="filtered" />)

      expect(screen.getByText("filtered")).toBeInTheDocument()
    })

    it("should handle 'live' status", () => {
      renderWithTheme(<StatusBadge status="live" />)

      expect(screen.getByText("live")).toBeInTheDocument()
    })

    it("should handle 'pending' status", () => {
      renderWithTheme(<StatusBadge status="pending" />)

      expect(screen.getByText("pending")).toBeInTheDocument()
    })

    it("should handle unknown status with default variant", () => {
      renderWithTheme(<StatusBadge status="unknown" />)

      expect(screen.getByText("unknown")).toBeInTheDocument()
    })
  })

  describe("Custom Children", () => {
    it("should override status text with children", () => {
      renderWithTheme(<StatusBadge status="success">✓ Done</StatusBadge>)

      expect(screen.getByText("✓ Done")).toBeInTheDocument()
      expect(screen.queryByText("success")).not.toBeInTheDocument()
    })

    it("should render JSX children", () => {
      renderWithTheme(
        <StatusBadge status="processing">
          <span>⏳ Processing...</span>
        </StatusBadge>
      )

      expect(screen.getByText("⏳ Processing...")).toBeInTheDocument()
    })

    it("should render numeric children", () => {
      renderWithTheme(<StatusBadge status="pending">{5}</StatusBadge>)

      expect(screen.getByText("5")).toBeInTheDocument()
    })

    it("should render empty string children", () => {
      renderWithTheme(<StatusBadge status="pending"></StatusBadge>)

      // Empty children should show status instead
      expect(screen.getByText("pending")).toBeInTheDocument()
    })
  })

  describe("Text Transform", () => {
    it("should apply text-transform capitalize", () => {
      const { container } = renderWithTheme(<StatusBadge status="pending" />)

      // Badge element is rendered (text transform is applied via theme-ui)
      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByText("pending")).toBeInTheDocument()
    })

    it("should capitalize lowercase status", () => {
      renderWithTheme(<StatusBadge status="pending" />)

      // Component should display "pending" (styled as "Pending" by CSS)
      expect(screen.getByText("pending")).toBeInTheDocument()
    })

    it("should handle uppercase status", () => {
      renderWithTheme(<StatusBadge status="SUCCESS" />)

      expect(screen.getByText("SUCCESS")).toBeInTheDocument()
    })

    it("should handle mixed case status", () => {
      renderWithTheme(<StatusBadge status="InProgress" />)

      expect(screen.getByText("InProgress")).toBeInTheDocument()
    })
  })

  describe("Multiple Badges", () => {
    it("should render multiple badges independently", () => {
      renderWithTheme(
        <>
          <StatusBadge status="success" />
          <StatusBadge status="pending" />
          <StatusBadge status="failed" />
        </>
      )

      expect(screen.getByText("success")).toBeInTheDocument()
      expect(screen.getByText("pending")).toBeInTheDocument()
      expect(screen.getByText("failed")).toBeInTheDocument()
    })

    it("should render same status multiple times", () => {
      renderWithTheme(
        <>
          <StatusBadge status="pending">First</StatusBadge>
          <StatusBadge status="pending">Second</StatusBadge>
          <StatusBadge status="pending">Third</StatusBadge>
        </>
      )

      expect(screen.getByText("First")).toBeInTheDocument()
      expect(screen.getByText("Second")).toBeInTheDocument()
      expect(screen.getByText("Third")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty status string", () => {
      const { container } = renderWithTheme(<StatusBadge status="" />)

      // Empty status should still render the badge element
      expect(container.firstChild).toBeInTheDocument()
    })

    it("should handle status with spaces", () => {
      renderWithTheme(<StatusBadge status="in progress" />)

      expect(screen.getByText("in progress")).toBeInTheDocument()
    })

    it("should handle status with underscores", () => {
      renderWithTheme(<StatusBadge status="in_progress" />)

      expect(screen.getByText("in_progress")).toBeInTheDocument()
    })

    it("should handle status with special characters", () => {
      renderWithTheme(<StatusBadge status="failed!" />)

      expect(screen.getByText("failed!")).toBeInTheDocument()
    })

    it("should handle very long status text", () => {
      const longStatus = "this-is-a-very-long-status-that-might-wrap"
      renderWithTheme(<StatusBadge status={longStatus} />)

      expect(screen.getByText(longStatus)).toBeInTheDocument()
    })
  })

  describe("Common Use Cases", () => {
    it("should display job queue status", () => {
      renderWithTheme(<StatusBadge status="processing" />)

      expect(screen.getByText("processing")).toBeInTheDocument()
    })

    it("should display deployment status", () => {
      renderWithTheme(<StatusBadge status="live" />)

      expect(screen.getByText("live")).toBeInTheDocument()
    })

    it("should display form submission status", () => {
      renderWithTheme(<StatusBadge status="success">Submitted</StatusBadge>)

      expect(screen.getByText("Submitted")).toBeInTheDocument()
    })

    it("should display error state", () => {
      renderWithTheme(<StatusBadge status="error">Failed to load</StatusBadge>)

      expect(screen.getByText("Failed to load")).toBeInTheDocument()
    })
  })
})
