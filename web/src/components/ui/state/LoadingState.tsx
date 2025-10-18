import React from "react"
import { Flex, Spinner, Text } from "theme-ui"

interface LoadingStateProps {
  message?: string
  size?: number
}

/**
 * Loading State component
 *
 * Displays a centered loading spinner with optional message
 *
 * @example
 * ```tsx
 * {loading && <LoadingState message="Loading data..." />}
 * ```
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading...", size = 48 }) => (
  <Flex
    sx={{
      justifyContent: "center",
      alignItems: "center",
      py: 6,
      flexDirection: "column",
      gap: 3,
    }}
  >
    <Spinner size={size} />
    {message && <Text sx={{ color: "textMuted", fontSize: 2 }}>{message}</Text>}
  </Flex>
)
