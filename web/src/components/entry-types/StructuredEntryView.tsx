import React from "react"
import { Box, Heading, Text } from "theme-ui"
import type { ExperienceEntry } from "../../types/experience"

interface StructuredEntryViewProps {
  entry: ExperienceEntry
}

export const StructuredEntryView: React.FC<StructuredEntryViewProps> = ({ entry }) => {
  return (
    <Box>
      {/* Accomplishments */}
      {entry.accomplishments && entry.accomplishments.length > 0 && (
        <Box sx={{ mb: 4 }}>
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
            {entry.technologies.join(", ")}
          </Text>
        </Box>
      )}

      {/* Projects */}
      {entry.projects && entry.projects.length > 0 && (
        <Box>
          <Heading
            as="h3"
            sx={{
              fontSize: 3,
              mb: 3,
              color: "text",
            }}
          >
            Projects
          </Heading>

          {entry.projects.map((project, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 4,
                pb: idx < entry.projects!.length - 1 ? 3 : 0,
                borderBottom: idx < entry.projects!.length - 1 ? "1px solid" : "none",
                borderColor: "muted",
              }}
            >
              <Heading
                as="h4"
                sx={{
                  fontSize: 2,
                  mb: 2,
                  color: "text",
                }}
              >
                {project.name}
              </Heading>

              <Text
                sx={{
                  fontSize: 2,
                  mb: 2,
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
                    Skills:
                  </Text>
                  <Text
                    sx={{
                      fontSize: 1,
                      color: "textMuted",
                    }}
                  >
                    {project.technologies.join(", ")}
                  </Text>
                </Box>
              )}

              {project.challenges && project.challenges.length > 0 && (
                <Box>
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
                    {project.challenges.map((challenge, cIdx) => (
                      <li
                        key={cIdx}
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
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
