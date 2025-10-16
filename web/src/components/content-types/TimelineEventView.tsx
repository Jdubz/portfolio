import React from "react"
import { Box, Heading, Text, Link } from "theme-ui"
import type { TimelineEventItem } from "../../types/content-item"

interface TimelineEventViewProps {
  item: TimelineEventItem
}

export const TimelineEventView: React.FC<TimelineEventViewProps> = ({ item }) => {
  return (
    <Box>
      {/* Date or Date Range */}
      {(item.date || item.dateRange) && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            fontWeight: "bold",
            mb: 2,
          }}
        >
          {item.date || item.dateRange}
        </Text>
      )}

      {/* Title */}
      <Heading
        as="h3"
        sx={{
          fontSize: [2, 3],
          mb: 2,
          color: "text",
        }}
      >
        {item.title}
      </Heading>

      {/* Description */}
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

      {/* Details */}
      {item.details && (
        <Text
          sx={{
            fontSize: 1,
            mb: 2,
            color: "textMuted",
            lineHeight: 1.6,
          }}
        >
          {item.details}
        </Text>
      )}

      {/* Links */}
      {item.links && item.links.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {item.links.map((link, idx) => (
            <Link
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-block",
                fontSize: 1,
                color: "primary",
                mr: 3,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {link.label}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  )
}
