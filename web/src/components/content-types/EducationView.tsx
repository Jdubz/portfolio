import React from "react"
import { Box, Heading, Text, Link } from "theme-ui"
import type { EducationItem } from "../../types/content-item"

interface EducationViewProps {
  item: EducationItem
}

export const EducationView: React.FC<EducationViewProps> = ({ item }) => {
  return (
    <Box>
      {/* Institution */}
      <Heading
        as="h3"
        sx={{
          fontSize: [2, 3],
          mb: 2,
          color: "text",
        }}
      >
        {item.institution}
      </Heading>

      {/* Degree & Field */}
      {(item.degree || item.field) && (
        <Text
          sx={{
            display: "block",
            fontSize: 2,
            color: "text",
            mb: 2,
          }}
        >
          {item.degree}
          {item.degree && item.field && " in "}
          {item.field}
        </Text>
      )}

      {/* Location */}
      {item.location && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            mb: 2,
          }}
        >
          {item.location}
        </Text>
      )}

      {/* Date Range */}
      {(item.startDate || item.endDate) && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            mb: 2,
          }}
        >
          {item.startDate} {item.endDate && `– ${item.endDate}`}
        </Text>
      )}

      {/* Honors */}
      {item.honors && (
        <Text
          sx={{
            display: "block",
            fontSize: 2,
            color: "primary",
            fontWeight: "bold",
            mb: 2,
          }}
        >
          {item.honors}
        </Text>
      )}

      {/* Description */}
      {item.description && (
        <Text
          sx={{
            fontSize: 2,
            mb: 3,
            color: "text",
            lineHeight: 1.6,
          }}
        >
          {item.description}
        </Text>
      )}

      {/* Relevant Courses */}
      {item.relevantCourses && item.relevantCourses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: "bold",
              color: "textMuted",
              mb: 1,
            }}
          >
            Relevant Courses:
          </Text>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
            }}
          >
            {item.relevantCourses.join(", ")}
          </Text>
        </Box>
      )}

      {/* Credential */}
      {(item.credentialId || item.credentialUrl) && (
        <Box sx={{ mt: 2 }}>
          {item.credentialUrl ? (
            <Link
              href={item.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontSize: 1,
                color: "primary",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              View Credential
              {item.credentialId && ` (${item.credentialId})`}
            </Link>
          ) : (
            item.credentialId && (
              <Text
                sx={{
                  fontSize: 1,
                  color: "textMuted",
                }}
              >
                Credential ID: {item.credentialId}
              </Text>
            )
          )}
        </Box>
      )}

      {/* Expires */}
      {item.expiresAt && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            mt: 2,
            fontStyle: "italic",
          }}
        >
          Expires: {item.expiresAt}
        </Text>
      )}
    </Box>
  )
}
