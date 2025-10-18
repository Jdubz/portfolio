/**
 * Grouped Tabs Component
 *
 * An elegant, mobile-friendly tab navigation system with:
 * - Grouped tabs by category
 * - Mobile slide-out drawer menu for smaller screens
 * - Desktop sidebar navigation for larger screens
 * - Icons for visual clarity
 * - Smooth animations
 */

import React, { useState, useEffect } from "react"
import { Box, Flex, Button, Text } from "theme-ui"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId)
    setMobileMenuOpen(false) // Close menu on mobile when tab is selected
  }

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [mobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const activeTabObj = tabs.find((t) => t.id === activeTab)

  return (
    <Box>
      {/* Mobile: Hamburger Menu Button */}
      <Box
        sx={{
          display: ["block", "block", "none"],
          mb: 4,
        }}
      >
        <Button
          onClick={() => setMobileMenuOpen(true)}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 3,
            px: 3,
            bg: "muted",
            color: "text",
            border: "1px solid",
            borderColor: "muted",
            borderRadius: "md",
            cursor: "pointer",
            fontSize: 2,
            fontWeight: "normal",
            "&:hover": {
              bg: "highlight",
            },
          }}
        >
          <Flex sx={{ alignItems: "center", gap: 2 }}>
            <Text sx={{ fontSize: 3 }}>☰</Text>
            <Text>
              {activeTabObj?.icon} {activeTabObj?.label || "Select Tab"}
            </Text>
          </Flex>
          <Text sx={{ fontSize: 2, color: "textMuted" }}>▼</Text>
        </Button>
      </Box>

      {/* Mobile: Slide-out Drawer Overlay */}
      {mobileMenuOpen && (
        <Box
          onClick={() => setMobileMenuOpen(false)}
          sx={{
            display: ["block", "block", "none"],
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            animation: "fadeIn 0.2s ease",
            "@keyframes fadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        />
      )}

      {/* Mobile: Slide-out Drawer Menu */}
      <Box
        sx={{
          display: ["block", "block", "none"],
          position: "fixed",
          top: 0,
          left: mobileMenuOpen ? 0 : "-100%",
          bottom: 0,
          width: ["85%", "400px"],
          maxWidth: "400px",
          bg: "background",
          zIndex: 1000,
          overflowY: "auto",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
          transition: "left 0.3s ease",
          py: 4,
          px: 3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "muted",
          }}
        >
          <Text sx={{ fontSize: 3, fontWeight: "bold" }}>Navigation</Text>
          <Button
            onClick={() => setMobileMenuOpen(false)}
            sx={{
              bg: "transparent",
              color: "text",
              fontSize: 4,
              p: 2,
              cursor: "pointer",
              "&:hover": {
                bg: "highlight",
              },
            }}
            aria-label="Close menu"
          >
            ×
          </Button>
        </Flex>

        {/* Drawer Groups */}
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
                      onClick={() => handleTabChange(tab.id)}
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
                        onClick={() => handleTabChange(tab.id)}
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
