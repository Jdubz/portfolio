import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SignInModal } from "../SignInModal"

// Mock the logger
jest.mock("../../utils/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}))

describe("SignInModal", () => {
  const mockOnClose = jest.fn()
  const mockOnSignIn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("does not render when isOpen is false", () => {
    const { container } = render(<SignInModal isOpen={false} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders when isOpen is true", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    expect(screen.getByText("Sign In Required")).toBeInTheDocument()
  })

  it("displays custom title when provided", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} title="Editor Access Required" />)
    expect(screen.getByText("Editor Access Required")).toBeInTheDocument()
  })

  it("displays default title when not provided", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    expect(screen.getByText("Sign In Required")).toBeInTheDocument()
  })

  it("displays custom message when provided", () => {
    const customMessage = "Sign in to manage content items."
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} message={customMessage} />)
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it("displays default message when not provided", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    expect(screen.getByText("You need to sign in to perform this action.")).toBeInTheDocument()
  })

  it("calls onClose when Cancel button is clicked", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    const cancelButton = screen.getByText("Cancel")
    fireEvent.click(cancelButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when clicking backdrop", () => {
    const { container } = render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    const backdrop = container.firstChild as HTMLElement
    fireEvent.click(backdrop)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it("does not call onClose when clicking modal content", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    const modalContent = screen.getByText("Sign In Required").parentElement as HTMLElement
    fireEvent.click(modalContent)
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it("calls onSignIn when Sign In button is clicked", async () => {
    mockOnSignIn.mockResolvedValue(undefined)
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    const signInButton = screen.getByText("Sign In with Google")
    fireEvent.click(signInButton)
    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledTimes(1)
    })
  })

  it("shows loading state when signingIn is true", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} signingIn={true} />)
    expect(screen.getByText("Signing in...")).toBeInTheDocument()
    expect(screen.queryByText("Sign In with Google")).not.toBeInTheDocument()
  })

  it("disables buttons when signingIn is true", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} signingIn={true} />)
    const cancelButton = screen.getByText("Cancel")
    const signInButton = screen.getByText("Signing in...").closest("button") as HTMLButtonElement
    expect(cancelButton).toBeDisabled()
    expect(signInButton).toBeDisabled()
  })

  it("handles sign-in errors gracefully", async () => {
    const error = new Error("Sign-in failed")
    mockOnSignIn.mockRejectedValue(error)

    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    const signInButton = screen.getByText("Sign In with Google")
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledTimes(1)
    })

    // Modal should still be open (doesn't auto-close on error)
    expect(screen.getByText("Sign In Required")).toBeInTheDocument()
  })

  it("renders spinner when signing in", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} signingIn={true} />)
    // Check that signing in text is present (spinner is rendered alongside it)
    expect(screen.getByText("Signing in...")).toBeInTheDocument()
  })

  it("has correct accessibility structure", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} />)
    // Check for heading
    const heading = screen.getByText("Sign In Required")
    expect(heading.tagName).toBe("H2")
  })

  it("prevents default behavior when signingIn and clicking disabled button", () => {
    render(<SignInModal isOpen={true} onClose={mockOnClose} onSignIn={mockOnSignIn} signingIn={true} />)
    const cancelButton = screen.getByText("Cancel")
    fireEvent.click(cancelButton)
    // onClose should not be called when button is disabled
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
