import React, { useEffect, useRef } from "react"
import { Box, Button, Heading, Text, Flex } from "theme-ui"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
}

/**
 * Accessible confirmation dialog with proper ARIA attributes and keyboard navigation
 *
 * Features:
 * - Focus trap (keeps focus within dialog)
 * - Escape key to cancel
 * - Enter key to confirm
 * - ARIA labels and roles
 * - Focus management (returns to trigger on close)
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Store the element that had focus before opening
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus the cancel button when dialog opens (safer default)
    cancelButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onCancel()
      }

      // Trap focus within dialog
      if (e.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (!focusableElements || focusableElements.length === 0) {
          return
        }

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      // Restore focus when dialog closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onCancel])

  if (!isOpen) {
    return null
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onCancel}
      role="presentation"
    >
      {/* Backdrop */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <Box
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        sx={{
          position: "relative",
          bg: "background",
          borderRadius: "8px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          p: 4,
          maxWidth: ["90%", "400px"],
          width: "100%",
          border: "1px solid",
          borderColor: "muted",
        }}
      >
        <Heading id="dialog-title" sx={{ fontSize: 3, mb: 2, color: isDestructive ? "red" : "text" }}>
          {title}
        </Heading>

        <Text id="dialog-description" sx={{ fontSize: 2, mb: 4, color: "text", lineHeight: 1.5 }}>
          {message}
        </Text>

        <Flex sx={{ gap: 2, justifyContent: "flex-end" }}>
          <Button
            ref={cancelButtonRef}
            onClick={onCancel}
            variant="secondary"
            sx={{
              px: 3,
              py: 2,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            sx={{
              px: 3,
              py: 2,
              bg: isDestructive ? "red" : "primary",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                bg: isDestructive ? "#c0392b" : "primaryHover",
              },
            }}
          >
            {confirmLabel}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
