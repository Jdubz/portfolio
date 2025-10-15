import React from "react"
import { Box, Text, Button, Flex } from "theme-ui"
import { FormField } from "../FormField"

interface SimpleEntryEditProps {
  data: {
    technologies?: string[]
  }
  onChange: (data: SimpleEntryEditProps["data"]) => void
}

export const SimpleEntryEdit: React.FC<SimpleEntryEditProps> = ({ data, onChange }) => {
  const structuredData = data || {}

  const handleAddTech = () => {
    const technologies = structuredData.technologies || []
    onChange({
      ...structuredData,
      technologies: [...technologies, ""],
    })
  }

  const handleRemoveTech = (index: number) => {
    const technologies = [...(structuredData.technologies || [])]
    technologies.splice(index, 1)
    onChange({
      ...structuredData,
      technologies,
    })
  }

  const handleUpdateTech = (index: number, value: string) => {
    const technologies = [...(structuredData.technologies || [])]
    technologies[index] = value
    onChange({
      ...structuredData,
      technologies,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Technologies Used</Text>
        {(structuredData.technologies || []).map((tech, idx) => (
          <Flex key={idx} sx={{ gap: 2, mb: 2, alignItems: "center" }}>
            <Box sx={{ flex: 1 }}>
              <FormField
                label=""
                name={`tech-${idx}`}
                value={tech}
                onChange={(value) => handleUpdateTech(idx, value)}
                placeholder="Technology, framework, or tool"
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
    </Box>
  )
}
