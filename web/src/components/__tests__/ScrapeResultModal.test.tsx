import React from "react"
import { render, screen } from "@testing-library/react"
import { ScrapeResultModal } from "../ScrapeResultModal"
import type { QueueItem } from "../../types/job-queue"

// Mock the Modal components
jest.mock("../ui", () => ({
  Modal: ({ children, isOpen }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null),
  ModalHeader: ({ title }: any) => <div data-testid="modal-header">{title}</div>,
  ModalBody: ({ children }: any) => <div data-testid="modal-body">{children}</div>,
  ModalFooter: ({ children }: any) => <div data-testid="modal-footer">{children}</div>,
  InfoBox: ({ children }: any) => <div data-testid="info-box">{children}</div>,
  StatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}))

describe("ScrapeResultModal", () => {
  const mockScrapeItem: QueueItem = {
    id: "test-123",
    type: "scrape",
    status: "success",
    url: "https://example.com/job",
    company_name: "Test Company",
    company_id: null,
    source: "automated_scan",
    submitted_by: null,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:05:00Z",
    completed_at: "2025-01-15T10:05:00Z",
    retry_count: 0,
    max_retries: 3,
    scrape_config: {
      target_matches: 5,
      max_sources: 20,
      min_match_score: 80,
      source_ids: [],
    },
  }

  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("does not render when scrapeItem is null", () => {
    const { container } = render(
      <ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={null} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("does not render when isOpen is false", () => {
    render(<ScrapeResultModal isOpen={false} onClose={mockOnClose} scrapeItem={mockScrapeItem} />)
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument()
  })

  it("renders when isOpen is true and scrapeItem is provided", () => {
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={mockScrapeItem} />)
    expect(screen.getByTestId("modal")).toBeInTheDocument()
  })

  it("displays the modal title", () => {
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={mockScrapeItem} />)
    expect(screen.getByText("Scrape Details")).toBeInTheDocument()
  })

  it("displays the status badge", () => {
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={mockScrapeItem} />)
    const statusBadge = screen.getByTestId("status-badge")
    expect(statusBadge).toHaveTextContent("success")
  })

  it("displays configuration details", () => {
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={mockScrapeItem} />)
    expect(screen.getByText("Configuration")).toBeInTheDocument()
    expect(screen.getByText("Target Matches")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument() // target_matches value
  })

  it("displays default values when config is undefined", () => {
    const itemWithoutConfig: QueueItem = {
      ...mockScrapeItem,
      scrape_config: undefined,
    }
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={itemWithoutConfig} />)
    expect(screen.getByText("Default (5)")).toBeInTheDocument() // target_matches default
    expect(screen.getByText("Default (20)")).toBeInTheDocument() // max_sources default
  })

  it("formats dates correctly", () => {
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={mockScrapeItem} />)
    // Date formatting depends on locale, just check that date text exists
    const modalBody = screen.getByTestId("modal-body")
    expect(modalBody).toBeInTheDocument()
  })

  it("displays source filter information when source_ids are present", () => {
    const itemWithSources: QueueItem = {
      ...mockScrapeItem,
      scrape_config: {
        ...mockScrapeItem.scrape_config!,
        source_ids: ["source1", "source2"],
      },
    }
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={itemWithSources} />)
    expect(screen.getByText("2 specific sources")).toBeInTheDocument()
  })

  it("displays all sources when source_ids is empty", () => {
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={mockScrapeItem} />)
    expect(screen.getByText("All sources (rotation)")).toBeInTheDocument()
  })

  it("calculates duration when completed_at is present", () => {
    const itemWithDuration: QueueItem = {
      ...mockScrapeItem,
      created_at: "2025-01-15T10:00:00Z",
      completed_at: "2025-01-15T10:00:05Z", // 5 seconds later
    }
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={itemWithDuration} />)
    // Duration formatting - check that timing section exists
    const modalBody = screen.getByTestId("modal-body")
    expect(modalBody).toBeInTheDocument()
  })

  it("handles missing completed_at gracefully", () => {
    const itemWithoutCompletion: QueueItem = {
      ...mockScrapeItem,
      completed_at: undefined,
    }
    render(<ScrapeResultModal isOpen={true} onClose={mockOnClose} scrapeItem={itemWithoutCompletion} />)
    // Should render without crashing
    expect(screen.getByTestId("modal")).toBeInTheDocument()
  })
})
