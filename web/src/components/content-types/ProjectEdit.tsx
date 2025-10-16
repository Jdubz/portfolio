import React from "react"
import { Box, Flex, Heading, Button, Text } from "theme-ui"
import type { UpdateContentItemData, UpdateProjectData } from "../../types/content-item"
import { FormField } from "../FormField"

interface ProjectEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const ProjectEdit: React.FC<ProjectEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const projectData = data as UpdateProjectData

  const handleAddLink = () => {
    const currentLinks = projectData.links ?? []
    onChange({
      ...data,
      links: [...currentLinks, { label: "", url: "" }],
    })
  }

  const handleRemoveLink = (index: number) => {
    const currentLinks = projectData.links ?? []
    onChange({
      ...data,
      links: currentLinks.filter((_, i) => i !== index),
    })
  }

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const currentLinks = projectData.links ?? []
    const updatedLinks = [...currentLinks]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    onChange({ ...data, links: updatedLinks })
  }

  return (
    <Flex sx={{ flexDirection: "column", gap: 3, mb: 3 }}>
      <FormField
        label="Project Name"
        name="name"
        value={projectData.name ?? ""}
        onChange={(value) => onChange({ ...data, name: value })}
        required
      />

      <FormField
        label="Role"
        name="role"
        value={projectData.role ?? ""}
        onChange={(value) => onChange({ ...data, role: value })}
        placeholder="Lead Developer, Architect, etc."
      />

      <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
        <Box sx={{ flex: 1 }}>
          <FormField
            label="Start Date"
            name="startDate"
            value={projectData.startDate ?? ""}
            onChange={(value) => onChange({ ...data, startDate: value })}
            placeholder="2023-01"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormField
            label="End Date"
            name="endDate"
            value={projectData.endDate ?? ""}
            onChange={(value) => onChange({ ...data, endDate: value || null })}
            placeholder="2024-06"
          />
        </Box>
      </Flex>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={projectData.description ?? ""}
        onChange={(value) => onChange({ ...data, description: value })}
        rows={4}
        required
        placeholder="Project overview and your contributions..."
      />

      <FormField
        label="Accomplishments (one per line)"
        name="accomplishments"
        type="textarea"
        value={projectData.accomplishments?.join("\n") ?? ""}
        onChange={(value) =>
          onChange({
            ...data,
            accomplishments: value ? value.split("\n").filter((line) => line.trim()) : [],
          })
        }
        rows={4}
        placeholder="Delivered feature ahead of schedule&#10;Improved test coverage to 95%"
      />

      <FormField
        label="Technologies (comma-separated)"
        name="technologies"
        value={projectData.technologies?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...data,
            technologies: value ? value.split(",").map((t) => t.trim()).filter(Boolean) : [],
          })
        }
        placeholder="React, TypeScript, GraphQL"
      />

      <FormField
        label="Challenges (one per line)"
        name="challenges"
        type="textarea"
        value={projectData.challenges?.join("\n") ?? ""}
        onChange={(value) =>
          onChange({
            ...data,
            challenges: value ? value.split("\n").filter((line) => line.trim()) : [],
          })
        }
        rows={3}
        placeholder="Migrated legacy codebase to modern stack&#10;Optimized database queries"
      />

      {/* Links */}
      <Box>
        <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Heading as="h4" sx={{ fontSize: 2 }}>
            Links
          </Heading>
          <Button type="button" onClick={handleAddLink} variant="secondary.sm">
            Add Link
          </Button>
        </Flex>

        {projectData.links && projectData.links.length > 0 ? (
          <Flex sx={{ flexDirection: "column", gap: 2 }}>
            {projectData.links.map((link, idx) => (
              <Flex key={idx} sx={{ gap: 2, alignItems: "flex-end" }}>
                <Box sx={{ flex: 1 }}>
                  <FormField
                    label={idx === 0 ? "Label" : ""}
                    name={`link-label-${idx}`}
                    value={link.label}
                    onChange={(value) => handleLinkChange(idx, "label", value)}
                    placeholder="GitHub"
                  />
                </Box>
                <Box sx={{ flex: 2 }}>
                  <FormField
                    label={idx === 0 ? "URL" : ""}
                    name={`link-url-${idx}`}
                    value={link.url}
                    onChange={(value) => handleLinkChange(idx, "url", value)}
                    placeholder="https://github.com/..."
                  />
                </Box>
                <Button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  variant="secondary.sm"
                  sx={{ mb: 1 }}
                >
                  Remove
                </Button>
              </Flex>
            ))}
          </Flex>
        ) : (
          <Text sx={{ fontSize: 1, color: "textMuted", fontStyle: "italic" }}>
            No links added yet
          </Text>
        )}
      </Box>

      <FormField
        label="Context (internal)"
        name="context"
        type="textarea"
        value={projectData.context ?? ""}
        onChange={(value) => onChange({ ...data, context: value })}
        rows={2}
        placeholder="Additional context about the project..."
        sx={{ fontSize: 1 }}
      />
    </Flex>
  )
}
