import React from "react"
import { Box, Text, Flex } from "theme-ui"
import type { BlurbEntry } from "../../types/experience"

interface CategorizedListViewProps {
  blurb: BlurbEntry
}

export const CategorizedListView: React.FC<CategorizedListViewProps> = ({ blurb }) => {
  const data = blurb.structuredData

  if (!data?.categories) {
    return null
  }

  return (
    <Box>
      {data.categories.map((category, idx) => (
        <Flex
          key={idx}
          sx={{
            mb: 3,
            flexDirection: ["column", "row"],
            gap: [1, 3],
          }}
        >
          <Text
            sx={{
              fontSize: 2,
              fontWeight: "bold",
              color: "text",
              minWidth: ["auto", "200px"],
              flexShrink: 0,
            }}
          >
            {category.category}
          </Text>
          <Text
            sx={{
              fontSize: 2,
              color: "textMuted",
              lineHeight: 1.6,
            }}
          >
            {category.skills?.join(", ")}
          </Text>
        </Flex>
      ))}
    </Box>
  )
}
