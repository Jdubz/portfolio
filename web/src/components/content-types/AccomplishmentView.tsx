import React from "react"
import { Box, Text } from "theme-ui"
import type { AccomplishmentItem } from "../../types/content-item"

interface AccomplishmentViewProps {
  item: AccomplishmentItem
}

export const AccomplishmentView: React.FC<AccomplishmentViewProps> = ({ item }) => {
  return (
    <Box>
      {/* Date */}
      {item.date && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            mb: 2,
          }}
        >
          {item.date}
        </Text>
      )}

      {/* Description */}
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

      {/* Context */}
      {item.context && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            fontStyle: "italic",
            mb: 2,
          }}
        >
          {item.context}
        </Text>
      )}

      {/* Impact */}
      {item.impact && (
        <Box sx={{ mb: 2 }}>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: "bold",
              color: "textMuted",
              mr: 1,
            }}
          >
            Impact:
          </Text>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
            }}
          >
            {item.impact}
          </Text>
        </Box>
      )}

      {/* Technologies */}
      {item.technologies && item.technologies.length > 0 && (
        <Box>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: "bold",
              color: "textMuted",
              mr: 2,
            }}
          >
            Technologies:
          </Text>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
            }}
          >
            {item.technologies.join(", ")}
          </Text>
        </Box>
      )}
    </Box>
  )
}
