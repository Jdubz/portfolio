import React from "react"
import { Box, Flex, Heading, Text } from "theme-ui"

interface TabHeaderProps {
  title: string
  actions?: React.ReactNode
  description?: string
}

/**
 * Tab Header component
 *
 * Provides consistent header layout for tabs with title, optional description, and action buttons
 *
 * @example
 * ```tsx
 * <TabHeader
 *   title="Job Sources"
 *   description="Manage company career pages tracked by the job-finder"
 *   actions={
 *     <>
 *       <Button onClick={handleAdd}>Add Source</Button>
 *       <Button onClick={handleRefresh} variant="secondary.sm">Refresh</Button>
 *     </>
 *   }
 * />
 * ```
 */
export const TabHeader: React.FC<TabHeaderProps> = ({ title, actions, description }) => (
  <Box sx={{ mb: 4 }}>
    <Flex
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: description ? 2 : 0,
        flexWrap: "wrap",
        gap: 3,
      }}
    >
      <Heading as="h2" sx={{ fontSize: 4 }}>
        {title}
      </Heading>
      {actions && <Flex sx={{ gap: 2, alignItems: "center" }}>{actions}</Flex>}
    </Flex>
    {description && <Text sx={{ color: "textMuted", fontSize: 2, mt: 2 }}>{description}</Text>}
  </Box>
)
