/**
 * Grouped Tabs Component
 *
 * An elegant, mobile-friendly tab navigation system with:
 * - Grouped tabs by category
 * - Mobile dropdown for smaller screens
 * - Desktop sidebar navigation for larger screens
 * - Icons for visual clarity
 * - Smooth animations
 */

import React, { useState } from "react"
import { Box, Flex, Select, Text } from "theme-ui"

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
  icon?: string
  group: string
}

export interface TabGroup {
  id: string
  label: string
  icon?: string
  collapsed?: boolean
}

interface TabsGroupedProps {
  tabs: Tab[]
  groups: TabGroup[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const TabsGrouped: React.FC<TabsGroupedProps> = ({ tabs, groups, activeTab, onTabChange }) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const activeTabObj = tabs.find((t) => t.id === activeTab)

  return (
    <Box>
      {/* Mobile: Dropdown Select */}
      <Box
        sx={{
          display: ["block", "block", "none"],
          mb: 4,
        }}
      >
        <Select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          sx={{
            variant: "forms.select",
            fontSize: 2,
            py: 3,
            px: 3,
            bg: "background",
            border: "1px solid",
            borderColor: "muted",
            borderRadius: "md",
            cursor: "pointer",
            "&:focus": {
              outline: "none",
              borderColor: "primary",
            },
          }}
        >
          {groups.map((group) => {
            const groupTabs = tabs.filter((t) => t.group === group.id)
            return (
              <optgroup key={group.id} label={`${group.icon || ""} ${group.label}`.trim()}>
                {groupTabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.icon ? `${tab.icon} ${tab.label}` : tab.label}
                  </option>
                ))}
              </optgroup>
            )
          })}
        </Select>
      </Box>

      {/* Desktop: Sidebar + Content Layout */}
      <Flex
        sx={{
          display: ["none", "none", "flex"],
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        {/* Sidebar Navigation */}
        <Box
          sx={{
            width: "280px",
            flexShrink: 0,
            position: "sticky",
            top: "20px",
          }}
        >
          {groups.map((group) => {
            const groupTabs = tabs.filter((t) => t.group === group.id)
            const isCollapsed = collapsedGroups.has(group.id)

            return (
              <Box key={group.id} sx={{ mb: 3 }}>
                {/* Group Header */}
                <Box
                  onClick={() => toggleGroup(group.id)}
                  sx={{
                    py: 2,
                    px: 3,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bg: "muted",
                    borderRadius: "md",
                    mb: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bg: "highlight",
                    },
                  }}
                >
                  <Flex sx={{ alignItems: "center", gap: 2 }}>
                    {group.icon && <Text sx={{ fontSize: 3 }}>{group.icon}</Text>}
                    <Text
                      sx={{
                        fontSize: 1,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "textMuted",
                      }}
                    >
                      {group.label}
                    </Text>
                  </Flex>
                  <Text
                    sx={{
                      fontSize: 2,
                      color: "textMuted",
                      transition: "transform 0.2s ease",
                      transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </Text>
                </Box>

                {/* Group Tabs */}
                {!isCollapsed && (
                  <Box sx={{ pl: 2 }}>
                    {groupTabs.map((tab) => (
                      <Box
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        sx={{
                          py: 2,
                          px: 3,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          borderLeft: "3px solid",
                          borderColor: activeTab === tab.id ? "primary" : "transparent",
                          bg: activeTab === tab.id ? "highlight" : "transparent",
                          borderRadius: "0 4px 4px 0",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bg: "highlight",
                            borderColor: activeTab === tab.id ? "primary" : "muted",
                          },
                        }}
                      >
                        {tab.icon && <Text sx={{ fontSize: 3, flexShrink: 0 }}>{tab.icon}</Text>}
                        <Text
                          sx={{
                            fontSize: 2,
                            fontWeight: activeTab === tab.id ? "bold" : "normal",
                            color: activeTab === tab.id ? "primary" : "text",
                          }}
                        >
                          {tab.label}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0, // Prevents flex item from overflowing
          }}
        >
          {activeTabObj && (
            <Box
              sx={{
                animation: "fadeIn 0.3s ease",
                "@keyframes fadeIn": {
                  from: { opacity: 0, transform: "translateY(10px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              {activeTabObj.content}
            </Box>
          )}
        </Box>
      </Flex>

      {/* Mobile: Content Area */}
      <Box
        sx={{
          display: ["block", "block", "none"],
        }}
      >
        {activeTabObj && (
          <Box
            sx={{
              animation: "fadeIn 0.3s ease",
              "@keyframes fadeIn": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            {activeTabObj.content}
          </Box>
        )}
      </Box>
    </Box>
  )
}
