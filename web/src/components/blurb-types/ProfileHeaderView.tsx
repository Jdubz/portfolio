import React from "react"
import { Box, Heading, Text, Flex } from "theme-ui"
import type { BlurbEntry } from "../../types/experience"

interface ProfileHeaderViewProps {
  blurb: BlurbEntry
}

export const ProfileHeaderView: React.FC<ProfileHeaderViewProps> = ({ blurb }) => {
  const data = blurb.structuredData

  if (!data) {
    return null
  }

  return (
    <Box>
      {data.role && (
        <Heading
          as="h2"
          sx={{
            fontSize: [4, 5],
            mb: 3,
            color: "text",
          }}
        >
          {data.role}
        </Heading>
      )}

      {data.summary && (
        <Text
          sx={{
            fontSize: [2, 3],
            mb: 4,
            color: "text",
            lineHeight: 1.6,
          }}
        >
          {data.summary}
        </Text>
      )}

      {data.primaryStack && data.primaryStack.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Text
            sx={{
              fontSize: 2,
              fontWeight: "bold",
              mb: 2,
              color: "text",
            }}
          >
            Primary stack:
          </Text>
          <Text
            sx={{
              fontSize: 2,
              color: "textMuted",
            }}
          >
            {data.primaryStack.join(" • ")}
          </Text>
        </Box>
      )}

      {data.links && data.links.length > 0 && (
        <Flex
          sx={{
            gap: 3,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          <Text
            sx={{
              fontSize: 2,
              fontWeight: "bold",
              color: "text",
            }}
          >
            Quick links:
          </Text>
          {data.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "16px",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {link.label}
            </a>
          ))}
        </Flex>
      )}

      {data.tagline && (
        <Text
          sx={{
            fontSize: 2,
            fontStyle: "italic",
            color: "textMuted",
          }}
        >
          {data.tagline}
        </Text>
      )}
    </Box>
  )
}
