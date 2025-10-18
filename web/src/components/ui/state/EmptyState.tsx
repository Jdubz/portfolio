import React from "react"
import { Box, Text, Button } from "theme-ui"

interface EmptyStateProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: string
}

/**
 * Empty State component
 *
 * Displays a message when no data is available, with optional call-to-action
 *
 * @example
 * ```tsx
 * {items.length === 0 && (
 *   <EmptyState
 *     message="No items found"
 *     icon="📭"
 *     action={{ label: "Add Item", onClick: handleAdd }}
 *   />
 * )}
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ message, action, icon }) => (
  <Box sx={{ variant: "cards.primary", p: 5, textAlign: "center" }}>
    {icon && <Text sx={{ fontSize: 6, mb: 3 }}>{icon}</Text>}
    <Text sx={{ color: "textMuted", fontSize: 2, mb: action ? 3 : 0 }}>{message}</Text>
    {action && (
      <Button onClick={action.onClick} variant="primary">
        {action.label}
      </Button>
    )}
  </Box>
)
