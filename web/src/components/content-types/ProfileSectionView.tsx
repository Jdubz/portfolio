import React from "react"
import { Box, Heading, Text, Link } from "theme-ui"
import type { ProfileSectionItem } from "../../types/content-item"
import { MarkdownContent } from "../MarkdownContent"

interface ProfileSectionViewProps {
  item: ProfileSectionItem
}

export const ProfileSectionView: React.FC<ProfileSectionViewProps> = ({ item }) => {
  const data = item.structuredData

  return (
    <Box>
      {/* Heading */}
      <Heading
        as="h2"
        sx={{
          fontSize: [3, 4],
          mb: 3,
          color: "text",
        }}
      >
        {item.heading}
      </Heading>

      {/* Structured Data (if present) */}
      {data && (
        <Box sx={{ mb: 3 }}>
          {/* Name */}
          {data.name && (
            <Heading
              as="h3"
              sx={{
                fontSize: [3, 4],
                mb: 2,
                color: "text",
              }}
            >
              {data.name}
            </Heading>
          )}

          {/* Tagline */}
          {data.tagline && (
            <Text
              sx={{
                display: "block",
                fontSize: 2,
                color: "primary",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              {data.tagline}
            </Text>
          )}

          {/* Role */}
          {data.role && (
            <Text
              sx={{
                display: "block",
                fontSize: 2,
                color: "text",
                fontStyle: "italic",
                mb: 3,
              }}
            >
              {data.role}
            </Text>
          )}

          {/* Summary */}
          {data.summary && (
            <Text
              sx={{
                fontSize: 2,
                mb: 3,
                color: "text",
                lineHeight: 1.6,
              }}
            >
              {data.summary}
            </Text>
          )}

          {/* Primary Stack */}
          {data.primaryStack && data.primaryStack.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Text
                sx={{
                  fontSize: 1,
                  fontWeight: "bold",
                  color: "textMuted",
                  mr: 2,
                }}
              >
                Primary Stack:
              </Text>
              <Text
                sx={{
                  fontSize: 1,
                  color: "textMuted",
                }}
              >
                {data.primaryStack.join(", ")}
              </Text>
            </Box>
          )}

          {/* Links */}
          {data.links && data.links.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {data.links.map((link, idx) => (
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
      )}

      {/* Markdown Content */}
      {item.content && <MarkdownContent>{item.content}</MarkdownContent>}
    </Box>
  )
}
