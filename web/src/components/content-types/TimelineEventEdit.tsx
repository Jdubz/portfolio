import React from "react"
import { Box, Flex, Heading, Button, Text } from "theme-ui"
import type { UpdateContentItemData, UpdateTimelineEventData } from "../../types/content-item"
import { FormField } from "../FormField"

interface TimelineEventEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const TimelineEventEdit: React.FC<TimelineEventEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const timelineData = data as UpdateTimelineEventData

  const handleAddLink = () => {
    const currentLinks = timelineData.links ?? []
    onChange({
      ...data,
      links: [...currentLinks, { label: "", url: "" }],
    })
  }

  const handleRemoveLink = (index: number) => {
    const currentLinks = timelineData.links ?? []
    onChange({
      ...data,
      links: currentLinks.filter((_, i) => i !== index),
    })
  }

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const currentLinks = timelineData.links ?? []
    const updatedLinks = [...currentLinks]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    onChange({ ...data, links: updatedLinks })
  }

  return (
    <Flex sx={{ flexDirection: "column", gap: 3, mb: 3 }}>
      <FormField
        label="Title"
        name="title"
        value={timelineData.title ?? ""}
        onChange={(value) => onChange({ ...data, title: value })}
        required
        placeholder="Event Title"
      />

      <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
        <Box sx={{ flex: 1 }}>
          <FormField
            label="Date"
            name="date"
            value={timelineData.date ?? ""}
            onChange={(value) => onChange({ ...data, date: value })}
            placeholder="2024-03-15"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormField
            label="Date Range"
            name="dateRange"
            value={timelineData.dateRange ?? ""}
            onChange={(value) => onChange({ ...data, dateRange: value })}
            placeholder="March 2024"
          />
        </Box>
      </Flex>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={timelineData.description ?? ""}
        onChange={(value) => onChange({ ...data, description: value })}
        rows={3}
        placeholder="Brief description of the event..."
      />

      <FormField
        label="Details"
        name="details"
        type="textarea"
        value={timelineData.details ?? ""}
        onChange={(value) => onChange({ ...data, details: value })}
        rows={4}
        placeholder="Additional details..."
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

        {timelineData.links && timelineData.links.length > 0 ? (
          <Flex sx={{ flexDirection: "column", gap: 2 }}>
            {timelineData.links.map((link, idx) => (
              <Flex key={idx} sx={{ gap: 2, alignItems: "flex-end" }}>
                <Box sx={{ flex: 1 }}>
                  <FormField
                    label={idx === 0 ? "Label" : ""}
                    name={`link-label-${idx}`}
                    value={link.label}
                    onChange={(value) => handleLinkChange(idx, "label", value)}
                    placeholder="Documentation"
                  />
                </Box>
                <Box sx={{ flex: 2 }}>
                  <FormField
                    label={idx === 0 ? "URL" : ""}
                    name={`link-url-${idx}`}
                    value={link.url}
                    onChange={(value) => handleLinkChange(idx, "url", value)}
                    placeholder="https://..."
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
    </Flex>
  )
}
