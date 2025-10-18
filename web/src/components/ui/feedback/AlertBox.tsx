import React from "react"
import { Box, Flex, Text, Button, Alert } from "theme-ui"

interface AlertBoxProps {
  type: "error" | "success" | "warning" | "info"
  message: string | null | undefined
  dismissible?: boolean
  onDismiss?: () => void
}

/**
 * Alert Box component
 *
 * Displays alert messages that can be dismissed
 *
 * @example
 * ```tsx
 * {error && (
 *   <AlertBox
 *     type="error"
 *     message={error}
 *     dismissible
 *     onDismiss={() => setError(null)}
 *   />
 * )}
 * ```
 */
export const AlertBox: React.FC<AlertBoxProps> = ({ type, message, dismissible = false, onDismiss }) => {
  if (!message) {
    return null
  }

  return (
    <Alert variant={type} sx={{ mb: 3 }}>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Text>{message}</Text>
        {dismissible && onDismiss && (
          <Button variant="ghost" onClick={onDismiss} aria-label="Dismiss alert" sx={{ ml: 2, fontSize: 2 }}>
            ×
          </Button>
        )}
      </Flex>
    </Alert>
  )
}
