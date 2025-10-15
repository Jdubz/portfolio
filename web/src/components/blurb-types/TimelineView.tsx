import React from "react"
import { Box, Heading, Text } from "theme-ui"
import type { BlurbEntry } from "../../types/experience"

interface TimelineViewProps {
  blurb: BlurbEntry
}

export const TimelineView: React.FC<TimelineViewProps> = ({ blurb }) => {
  const data = blurb.structuredData

  if (!data?.items) {
    return null
  }

  return (
    <Box>
      {data.items.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            mb: 4,
            pb: 4,
            borderBottom: idx < data.items!.length - 1 ? "1px solid" : "none",
            borderColor: "muted",
          }}
        >
          <Heading
            as="h3"
            sx={{
              fontSize: [3, 4],
              mb: 2,
              color: "text",
            }}
          >
            {item.title}
          </Heading>

          {(item.date || item.dateRange) && (
            <Text
              sx={{
                fontSize: 1,
                fontWeight: "bold",
                color: "textMuted",
                mb: 2,
              }}
            >
              {item.dateRange || item.date}
            </Text>
          )}

          {item.description && (
            <Text
              sx={{
                fontSize: 2,
                mb: 2,
                color: "text",
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </Text>
          )}

          {item.details && (
            <Text
              sx={{
                fontSize: 2,
                mb: 2,
                color: "text",
                lineHeight: 1.6,
              }}
            >
              {item.details}
            </Text>
          )}

          {item.honors && (
            <Text
              sx={{
                fontSize: 2,
                fontWeight: "bold",
                color: "text",
                lineHeight: 1.6,
              }}
            >
              {item.honors}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  )
}
