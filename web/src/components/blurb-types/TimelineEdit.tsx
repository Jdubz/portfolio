import React from "react"
import { Box, Text, Button, Flex, Heading } from "theme-ui"
import { FormField } from "../FormField"
import type { BlurbEntry } from "../../types/experience"

interface TimelineEditProps {
  data: BlurbEntry["structuredData"]
  onChange: (data: BlurbEntry["structuredData"]) => void
}

export const TimelineEdit: React.FC<TimelineEditProps> = ({ data, onChange }) => {
  const timelineData = data || {}
  const items = timelineData.items || []

  const handleAddItem = () => {
    onChange({
      ...timelineData,
      items: [
        ...items,
        {
          title: "",
          date: "",
          dateRange: "",
          description: "",
          details: "",
          honors: "",
          type: "",
        },
      ],
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange({
      ...timelineData,
      items: newItems,
    })
  }

  const handleUpdateItem = (
    index: number,
    field: "title" | "date" | "dateRange" | "description" | "details" | "honors" | "type",
    value: string
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange({
      ...timelineData,
      items: newItems,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "muted",
            borderRadius: "4px",
          }}
        >
          <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Heading as="h4" sx={{ fontSize: 3 }}>
              Item {idx + 1}
            </Heading>
            <Button type="button" variant="danger.sm" onClick={() => handleRemoveItem(idx)}>
              Remove Item
            </Button>
          </Flex>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormField
              label="Title"
              name={`item-title-${idx}`}
              value={item.title}
              onChange={(value) => handleUpdateItem(idx, "title", value)}
              required
            />

            <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
              <Box sx={{ flex: 1 }}>
                <FormField
                  label="Date (single date)"
                  name={`item-date-${idx}`}
                  value={item.date || ""}
                  onChange={(value) => handleUpdateItem(idx, "date", value)}
                  placeholder="e.g., May 2016"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormField
                  label="Date Range (alternative to date)"
                  name={`item-dateRange-${idx}`}
                  value={item.dateRange || ""}
                  onChange={(value) => handleUpdateItem(idx, "dateRange", value)}
                  placeholder="e.g., 2019–2021"
                />
              </Box>
            </Flex>

            <FormField
              label="Type"
              name={`item-type-${idx}`}
              value={item.type || ""}
              onChange={(value) => handleUpdateItem(idx, "type", value)}
              placeholder="e.g., certification, degree, bootcamp"
            />

            <FormField
              label="Description"
              name={`item-description-${idx}`}
              value={item.description || ""}
              onChange={(value) => handleUpdateItem(idx, "description", value)}
              type="textarea"
              rows={2}
            />

            <FormField
              label="Details"
              name={`item-details-${idx}`}
              value={item.details || ""}
              onChange={(value) => handleUpdateItem(idx, "details", value)}
              type="textarea"
              rows={2}
            />

            <FormField
              label="Honors / Awards"
              name={`item-honors-${idx}`}
              value={item.honors || ""}
              onChange={(value) => handleUpdateItem(idx, "honors", value)}
              type="textarea"
              rows={2}
            />
          </Box>
        </Box>
      ))}

      <Button type="button" variant="primary.sm" onClick={handleAddItem}>
        + Add Item
      </Button>
    </Box>
  )
}
