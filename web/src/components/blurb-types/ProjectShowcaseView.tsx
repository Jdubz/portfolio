import React from "react"
import { Box, Heading, Text, Flex } from "theme-ui"
import type { BlurbEntry } from "../../types/experience"

interface ProjectShowcaseViewProps {
  blurb: BlurbEntry
}

export const ProjectShowcaseView: React.FC<ProjectShowcaseViewProps> = ({ blurb }) => {
  const data = blurb.structuredData

  if (!data?.projects) {
    return null
  }

  return (
    <Box>
      {data.projects.map((project, idx) => (
        <Box
          key={idx}
          sx={{
            mb: 4,
            pb: 4,
            borderBottom: idx < data.projects!.length - 1 ? "1px solid" : "none",
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
            {project.name}
          </Heading>

          <Text
            sx={{
              fontSize: 2,
              mb: 3,
              color: "text",
              lineHeight: 1.6,
            }}
          >
            {project.description}
          </Text>

          {project.technologies && project.technologies.length > 0 && (
            <Box sx={{ mb: 2 }}>
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
                {project.technologies.join(" • ")}
              </Text>
            </Box>
          )}

          {project.links && project.links.length > 0 && (
            <Flex
              sx={{
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              {project.links.map((link, linkIdx) => (
                <a
                  key={linkIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "14px",
                    color: "inherit",
                    textDecoration: "underline",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </Flex>
          )}
        </Box>
      ))}
    </Box>
  )
}
