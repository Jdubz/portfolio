import React from "react"
import { Box, Heading, Text, Link } from "theme-ui"
import type { ProjectItem } from "../../types/content-item"

interface ProjectViewProps {
  item: ProjectItem
}

export const ProjectView: React.FC<ProjectViewProps> = ({ item }) => {
  return (
    <Box>
      {/* Project Name */}
      <Heading
        as="h3"
        sx={{
          fontSize: [2, 3],
          mb: 2,
          color: "text",
        }}
      >
        {item.name}
      </Heading>

      {/* Role */}
      {item.role && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            fontStyle: "italic",
            mb: 2,
          }}
        >
          {item.role}
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

      {/* Description */}
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

      {/* Accomplishments */}
      {item.accomplishments && item.accomplishments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: "bold",
              color: "textMuted",
              mb: 1,
            }}
          >
            Key Achievements:
          </Text>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {item.accomplishments.map((accomplishment, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "8px",
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
        <Box sx={{ mb: 3 }}>
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

      {/* Challenges */}
      {item.challenges && item.challenges.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: "bold",
              color: "textMuted",
              mb: 1,
            }}
          >
            Challenges:
          </Text>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {item.challenges.map((challenge, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "6px",
                  lineHeight: "1.6",
                }}
              >
                <Text sx={{ fontSize: 1, color: "textMuted" }}>{challenge}</Text>
              </li>
            ))}
          </ul>
        </Box>
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

      {/* Context */}
      {item.context && (
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "muted",
          }}
        >
          <Text sx={{ fontSize: 1, fontStyle: "italic", color: "textMuted" }}>
            {item.context}
          </Text>
        </Box>
      )}
    </Box>
  )
}
