import React from "react"
import { Box, Heading, Text } from "theme-ui"
import type { SkillGroupItem } from "../../types/content-item"

interface SkillGroupViewProps {
  item: SkillGroupItem
}

export const SkillGroupView: React.FC<SkillGroupViewProps> = ({ item }) => {
  return (
    <Box>
      {/* Category */}
      <Heading
        as="h3"
        sx={{
          fontSize: [2, 3],
          mb: 3,
          color: "text",
        }}
      >
        {item.category}
      </Heading>

      {/* Subcategories */}
      {item.subcategories && item.subcategories.length > 0 ? (
        <Box>
          {item.subcategories.map((subcategory, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              <Text
                sx={{
                  fontSize: 1,
                  fontWeight: "bold",
                  color: "textMuted",
                  mb: 1,
                }}
              >
                {subcategory.name}
              </Text>
              <Text
                sx={{
                  fontSize: 2,
                  color: "text",
                  lineHeight: 1.6,
                }}
              >
                {subcategory.skills.join(", ")}
              </Text>
            </Box>
          ))}
        </Box>
      ) : (
        /* Skills (flat list) */
        <Text
          sx={{
            fontSize: 2,
            color: "text",
            lineHeight: 1.6,
          }}
        >
          {item.skills.join(", ")}
        </Text>
      )}
    </Box>
  )
}
