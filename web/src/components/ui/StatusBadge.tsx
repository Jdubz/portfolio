/**
 * StatusBadge Component
 *
 * Reusable badge component for displaying status indicators with consistent styling
 * Uses theme variants for colors and supports different status types
 */

import React from "react"
import { Badge } from "theme-ui"
import type { QueueStatus } from "../../types/job-queue"

interface StatusBadgeProps {
  status: string
  children?: React.ReactNode
}

/**
 * Maps status values to theme badge variants
 */
const getStatusVariant = (status: string): string => {
  switch (status) {
    case "success":
    case "completed":
      return "success"
    case "failed":
    case "error":
      return "danger"
    case "processing":
    case "in_progress":
      return "warning"
    case "skipped":
    case "filtered":
      return "muted"
    case "live":
      return "success"
    case "pending":
    default:
      return "info"
  }
}

/**
 * StatusBadge - Displays a status indicator with theme-based styling
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const variant = getStatusVariant(status)

  return (
    <Badge variant={variant} sx={{ textTransform: "capitalize" }}>
      {children ?? status}
    </Badge>
  )
}
