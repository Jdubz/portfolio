import React from "react"
import { Box, Text } from "theme-ui"
import type { ExperienceEntry } from "../../types/experience"

interface SimpleEntryViewProps {
  entry: ExperienceEntry
}

export const SimpleEntryView: React.FC<SimpleEntryViewProps> = ({ entry }) => {
  return (
    <Box>
      {/* Summary or accomplishments */}
      {entry.summary && (
        <Text
          sx={{
            fontSize: 2,
            mb: 3,
            color: "text",
            lineHeight: 1.6,
          }}
        >
          {entry.summary}
        </Text>
      )}

      {!entry.summary && entry.accomplishments && entry.accomplishments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {entry.accomplishments.map((item, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "12px",
                  lineHeight: "1.6",
                }}
              >
                <Text sx={{ fontSize: 2, color: "text" }}>{item}</Text>
              </li>
            ))}
          </ul>
        </Box>
      )}

      {/* Technologies */}
      {entry.technologies && entry.technologies.length > 0 && (
        <Box>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: "bold",
              color: "textMuted",
              mr: 2,
            }}
          >
            Stack:
          </Text>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
            }}
          >
            {entry.technologies.join(", ")}
          </Text>
        </Box>
      )}
    </Box>
  )
}
