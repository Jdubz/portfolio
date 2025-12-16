/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Theme UI jsx pragma causes TypeScript errors with classic JSX runtime
/** @jsx jsx */
/** @jsxFrag React.Fragment */
import React, { useState } from "react"
import { Box, Button, Flex, useColorMode, jsx } from "theme-ui"
import { Link } from "gatsby"

/**
 * Navigation Section Component
 */
interface NavSectionProps {
  title?: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

const NavSection: React.FC<NavSectionProps> = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (!title) {
    // No title = just render children without collapsible wrapper
    return <>{children}</>
  }

  return (
    <Box>
      {/* Section Header (collapsible) */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          py: 2,
          px: 4,
          bg: "backgroundSecondary",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.2s ease",
          "&:hover": {
            bg: "divider",
          },
        }}
      >
        <span
          sx={{
            color: "textMuted",
            fontSize: 1,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </span>
        <span
          sx={{
            color: "textMuted",
            fontSize: 2,
            transition: "transform 0.2s ease",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </Box>

      {/* Section Content */}
      {isExpanded && children}
    </Box>
  )
}

/**
 * Navigation Link Component
 */
interface NavLinkProps {
  to: string
  onClick: () => void
  children: React.ReactNode
  icon?: string
}

const NavLink: React.FC<NavLinkProps> = ({ to, onClick, children, icon }) => {
  return (
    <Box
      sx={{
        width: "100%",
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          bg: "divider",
          "& a": {
            color: "primary",
          },
        },
      }}
    >
      <Link
        to={to}
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 3,
          px: 4,
          color: "text",
          fontSize: 2,
          fontWeight: "body",
          textDecoration: "none",
          transition: "color 0.2s ease",
        }}
      >
        {icon && <span sx={{ fontSize: 3 }}>{icon}</span>}
        {children}
      </Link>
    </Box>
  )
}

/**
 * Section Divider Component
 */
const NavDivider: React.FC = () => (
  <Box
    sx={{
      height: "1px",
      bg: "divider",
      my: 1,
    }}
  />
)

/**
 * Hamburger Menu Component
 *
 * Scalable navigation menu with:
 * - Logical grouping of pages
 * - Collapsible sections
 * - Role-based visibility (Job Finder for editors only)
 * - Dark mode toggle
 */
const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`

  // Determine Job Finder URL based on environment
  const isProduction = (process.env.GATSBY_ACTIVE_ENV ?? process.env.NODE_ENV) === "production"
  const jobFinderUrl = isProduction
    ? "https://job-finder.joshwentworth.com"
    : "https://job-finder-staging.joshwentworth.com"

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const toggleColorMode = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = isDark ? `light` : `dark`
    setColorMode(next)
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 3,
        right: 4,
        zIndex: 1000,
      }}
    >
      {/* Hamburger Button */}
      <Button
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        sx={{
          width: "48px",
          height: "48px",
          padding: 0,
          border: "1px solid",
          borderColor: "divider",
          bg: "background",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "all 0.3s ease",
          boxShadow: "lg",
          "&:hover": {
            borderColor: "primary",
            bg: "background",
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary",
            outlineOffset: "2px",
          },
        }}
      >
        {/* Hamburger Icon Lines */}
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "primary",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(45deg) translateY(8px)" : "none",
          }}
        />
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "primary",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            opacity: isOpen ? 0 : 1,
          }}
        />
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "primary",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(-45deg) translateY(-8px)" : "none",
          }}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close menu when clicking outside */}
          <Box
            onClick={closeMenu}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bg: "transparent",
              zIndex: 998,
            }}
          />

          {/* Menu Content */}
          <Flex
            sx={{
              position: "absolute",
              top: "56px",
              right: 0,
              minWidth: "280px",
              maxWidth: "320px",
              bg: "background",
              backdropFilter: "blur(20px)",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "xl",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 999,
              animation: "slideIn 0.2s ease-out",
              maxHeight: "80vh",
              overflowY: "auto",
              "@keyframes slideIn": {
                from: {
                  opacity: 0,
                  transform: "translateY(-10px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {/* Main Pages */}
            <NavSection>
              <NavLink to="/" onClick={closeMenu} icon="🏠">
                Home
              </NavLink>
              <NavLink to="/projects/full-stack" onClick={closeMenu} icon="🛠️">
                Full-Stack Project
              </NavLink>
              <NavLink to="/contact" onClick={closeMenu} icon="✉️">
                Contact
              </NavLink>
            </NavSection>

            <NavDivider />

            {/* Job Finder - External Link */}
            <NavSection>
              <Box
                sx={{
                  width: "100%",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bg: "divider",
                    "& a": {
                      color: "primary",
                    },
                  },
                }}
              >
                <a
                  href={jobFinderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 3,
                    px: 4,
                    color: "text",
                    fontSize: 2,
                    fontWeight: "body",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  <span sx={{ fontSize: 3 }}>🔍</span>
                  Job Finder
                  <span sx={{ fontSize: 1, ml: "auto" }}>↗</span>
                </a>
              </Box>
            </NavSection>

            <NavDivider />

            {/* Dark Mode Toggle */}
            <Button
              onClick={toggleColorMode}
              role="switch"
              aria-checked={isDark}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              sx={{
                width: "100%",
                py: 3,
                px: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: "none",
                bg: "transparent",
                "&:hover": {
                  bg: "divider",
                },
              }}
            >
              <span
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "text",
                  fontSize: 2,
                  fontWeight: "body",
                }}
              >
                <span sx={{ fontSize: 3 }}>{isDark ? "☀️" : "🌙"}</span>
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  width: "48px",
                  height: "24px",
                  bg: isDark ? "primary" : "divider",
                  borderRadius: "24px",
                  transition: "background-color 0.3s ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    height: "18px",
                    width: "18px",
                    left: isDark ? "26px" : "3px",
                    bottom: "3px",
                    bg: "white",
                    borderRadius: "50%",
                    transition: "left 0.3s ease",
                  },
                }}
              />
            </Button>
          </Flex>
        </>
      )}
    </Box>
  )
}

export default HamburgerMenu
