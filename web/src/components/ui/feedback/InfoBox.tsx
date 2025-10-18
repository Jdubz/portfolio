import React from "react"
import { Box, Text, Flex } from "theme-ui"

interface InfoBoxProps {
  children: React.ReactNode
  variant?: "info" | "success" | "warning" | "danger"
  icon?: string
}

/**
 * Info Box component
 *
 * Displays informational messages with different visual styles
 *
 * @example
 * ```tsx
 * <InfoBox variant="warning" icon="⚠️">
 *   This action cannot be undone
 * </InfoBox>
 * ```
 */
export const InfoBox: React.FC<InfoBoxProps> = ({ children, variant = "info", icon }) => {
  const variants = {
    info: {
      bg: "highlight",
      color: "text",
    },
    success: {
      bg: "background",
      color: "text",
      borderLeft: "4px solid",
      borderColor: "success",
    },
    warning: {
      bg: "warning",
      color: "background",
    },
    danger: {
      bg: "danger",
      color: "background",
    },
  }

  const styles = variants[variant]

  return (
    <Box sx={{ p: 3, borderRadius: "sm", ...styles }}>
      <Flex sx={{ gap: 2, alignItems: "flex-start" }}>
        {icon && <Text sx={{ fontSize: 2, flexShrink: 0 }}>{icon}</Text>}
        {typeof children === "string" ? <Text sx={{ fontSize: 1, flex: 1 }}>{children}</Text> : children}
      </Flex>
    </Box>
  )
}
