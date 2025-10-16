import React from "react"
import { Box, Heading, Text, Link } from "theme-ui"
import type { CompanyItem } from "../../types/content-item"
import { formatMonthYear } from "../../utils/dateFormat"

interface CompanyViewProps {
  item: CompanyItem
}

export const CompanyView: React.FC<CompanyViewProps> = ({ item }) => {
  return (
    <Box>
      {/* Date Range */}
      <Text
        sx={{
          fontSize: 1,
          fontWeight: "bold",
          color: "primary",
          mb: 2,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {formatMonthYear(item.startDate)} – {formatMonthYear(item.endDate)}
      </Text>

      {/* Company Name */}
      <Heading
        as="h2"
        sx={{
          fontSize: [3, 4],
          mb: 2,
          color: "text",
        }}
      >
        {item.company}
      </Heading>

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

      {/* Role */}
      {item.role && (
        <Text
          sx={{
            display: "block",
            fontSize: 2,
            color: "textMuted",
            fontStyle: "italic",
            mb: 3,
          }}
        >
          {item.role}
        </Text>
      )}

      {/* Summary */}
      {item.summary && (
        <Text
          sx={{
            fontSize: 2,
            mb: 3,
            color: "text",
            lineHeight: 1.6,
          }}
        >
          {item.summary}
        </Text>
      )}

      {/* Accomplishments */}
      {item.accomplishments && item.accomplishments.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {item.accomplishments.map((accomplishment, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "12px",
                  lineHeight: "1.6",
                }}
              >
                <Text sx={{ fontSize: 2, color: "text" }}>{accomplishment}</Text>
              </li>
            ))}
          </ul>
        </Box>
      )}

      {/* Technologies */}
      {item.technologies && item.technologies.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: "bold",
              color: "textMuted",
              mr: 2,
            }}
          >
            Skills:
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

      {/* Website */}
      {item.website && (
        <Box sx={{ mb: 2 }}>
          <Link
            href={item.website}
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
            {item.website}
          </Link>
        </Box>
      )}
    </Box>
  )
}
