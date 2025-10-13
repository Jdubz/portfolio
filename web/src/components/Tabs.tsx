import React from "react"
import { Box, Flex } from "theme-ui"

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Tab navigation */}
      <Flex
        sx={{
          borderBottom: "2px solid",
          borderColor: "muted",
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => (
          <Box
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            sx={{
              px: 3,
              py: 2,
              cursor: "pointer",
              borderBottom: "2px solid",
              borderColor: activeTab === tab.id ? "primary" : "transparent",
              color: activeTab === tab.id ? "primary" : "text",
              fontWeight: activeTab === tab.id ? "bold" : "normal",
              mb: "-2px", // Overlap with parent border
              transition: "all 0.2s ease",
              "&:hover": {
                color: "primary",
                borderColor: activeTab === tab.id ? "primary" : "muted",
              },
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Flex>

      {/* Tab content */}
      <Box>
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <Box key={tab.id} sx={{ animation: "fadeIn 0.3s ease" }}>
                {tab.content}
              </Box>
            )
        )}
      </Box>
    </Box>
  )
}
