import React, { useEffect } from "react"
import { Box } from "theme-ui"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  zIndex?: number
}

/**
 * Base Modal component with overlay and content wrapper
 *
 * Provides consistent modal behavior across the application:
 * - Fixed overlay with semi-transparent background
 * - Click outside to close
 * - ESC key to close
 * - Prevents body scroll when open
 * - Configurable size and z-index
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={onClose} size="md">
 *   <ModalHeader title="My Modal" onClose={onClose} />
 *   <ModalBody>Content here</ModalBody>
 *   <ModalFooter primaryAction={{ label: "Save", onClick: handleSave }} />
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = "md", zIndex = 1000 }) => {
  const maxWidths = {
    sm: "500px",
    md: "600px",
    lg: "800px",
    xl: "900px",
    full: "1200px",
  }

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

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
        bg: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex,
        p: 3,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Box
        sx={{
          bg: "background",
          borderRadius: "md",
          maxWidth: maxWidths[size],
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Box>
    </Box>
  )
}
