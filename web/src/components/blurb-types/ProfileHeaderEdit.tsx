import React from "react"
import { Box, Text, Button, Flex } from "theme-ui"
import { FormField } from "../FormField"
import type { BlurbEntry } from "../../types/experience"

interface ProfileHeaderEditProps {
  data: BlurbEntry["structuredData"]
  onChange: (data: BlurbEntry["structuredData"]) => void
}

export const ProfileHeaderEdit: React.FC<ProfileHeaderEditProps> = ({ data, onChange }) => {
  const headerData = data || {}

  const handleAddLink = () => {
    const links = headerData.links || []
    onChange({
      ...headerData,
      links: [...links, { label: "", url: "" }],
    })
  }

  const handleRemoveLink = (index: number) => {
    const links = [...(headerData.links || [])]
    links.splice(index, 1)
    onChange({
      ...headerData,
      links,
    })
  }

  const handleUpdateLink = (index: number, field: "label" | "url", value: string) => {
    const links = [...(headerData.links || [])]
    links[index] = { ...links[index], [field]: value }
    onChange({
      ...headerData,
      links,
    })
  }

  const handleAddTech = () => {
    const stack = headerData.primaryStack || []
    onChange({
      ...headerData,
      primaryStack: [...stack, ""],
    })
  }

  const handleRemoveTech = (index: number) => {
    const stack = [...(headerData.primaryStack || [])]
    stack.splice(index, 1)
    onChange({
      ...headerData,
      primaryStack: stack,
    })
  }

  const handleUpdateTech = (index: number, value: string) => {
    const stack = [...(headerData.primaryStack || [])]
    stack[index] = value
    onChange({
      ...headerData,
      primaryStack: stack,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FormField
        label="Role"
        name="role"
        value={headerData.role || ""}
        onChange={(value) => onChange({ ...headerData, role: value })}
      />

      <FormField
        label="Summary"
        name="summary"
        value={headerData.summary || ""}
        onChange={(value) => onChange({ ...headerData, summary: value })}
        type="textarea"
        rows={4}
      />

      <Box>
        <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Primary Stack</Text>
        {(headerData.primaryStack || []).map((tech, idx) => (
          <Flex key={idx} sx={{ gap: 2, mb: 2, alignItems: "center" }}>
            <Box sx={{ flex: 1 }}>
              <FormField
                label=""
                name={`tech-${idx}`}
                value={tech}
                onChange={(value) => handleUpdateTech(idx, value)}
                placeholder="Technology name"
              />
            </Box>
            <Button
              type="button"
              variant="danger.sm"
              onClick={() => handleRemoveTech(idx)}
              sx={{ flexShrink: 0 }}
            >
              Remove
            </Button>
          </Flex>
        ))}
        <Button type="button" variant="secondary.sm" onClick={handleAddTech}>
          + Add Technology
        </Button>
      </Box>

      <Box>
        <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Quick Links</Text>
        {(headerData.links || []).map((link, idx) => (
          <Flex key={idx} sx={{ gap: 2, mb: 2, alignItems: "flex-start" }}>
            <Box sx={{ flex: 1 }}>
              <FormField
                label=""
                name={`link-label-${idx}`}
                value={link.label}
                onChange={(value) => handleUpdateLink(idx, "label", value)}
                placeholder="Label (e.g., GitHub)"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormField
                label=""
                name={`link-url-${idx}`}
                value={link.url}
                onChange={(value) => handleUpdateLink(idx, "url", value)}
                placeholder="URL"
              />
            </Box>
            <Button
              type="button"
              variant="danger.sm"
              onClick={() => handleRemoveLink(idx)}
              sx={{ flexShrink: 0, mt: 2 }}
            >
              Remove
            </Button>
          </Flex>
        ))}
        <Button type="button" variant="secondary.sm" onClick={handleAddLink}>
          + Add Link
        </Button>
      </Box>

      <FormField
        label="Tagline"
        name="tagline"
        value={headerData.tagline || ""}
        onChange={(value) => onChange({ ...headerData, tagline: value })}
        type="textarea"
        rows={2}
      />
    </Box>
  )
}
