import React, { useState } from "react"
import { Box, Button, Flex, useColorMode } from "theme-ui"
import { Link } from "gatsby"

/**
 * Hamburger Menu Component
 *
 * Navigation menu with:
 * - Experience (Work Experience tab)
 * - Builder (Document Builder tab)
 * - Contact
 * - Dark mode toggle
 */
const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [colorMode, setColorMode] = useColorMode()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const toggleDarkMode = () => {
    const nextMode = colorMode === "dark" ? "light" : "dark"
    setColorMode(nextMode)
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
          borderColor: "primary",
          bg: "dark",
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
            borderColor: "primaryHover",
            bg: "wave",
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
              minWidth: "200px",
              bg: "dark",
              backdropFilter: "blur(20px)",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "primary",
              boxShadow: "xl",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 999,
              animation: "slideIn 0.2s ease-out",
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
            {/* Experience */}
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
                to="/resume-builder?tab=work-experience"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 400,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                Experience
              </Link>
            </Box>

            {/* Builder */}
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
                to="/resume-builder?tab=document-builder"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 400,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                Builder
              </Link>
            </Box>

            {/* Contact */}
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
                to="/contact"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 400,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                Contact
              </Link>
            </Box>

            {/* Dark Mode Toggle */}
            <Button
              onClick={toggleDarkMode}
              sx={{
                width: "100%",
                py: 3,
                px: 4,
                bg: "transparent",
                color: "text",
                fontSize: 2,
                fontWeight: "body",
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                  bg: "divider",
                  color: "primary",
                },
              }}
            >
              <span>{colorMode === "dark" ? "Light Mode" : "Dark Mode"}</span>
              <Box
                sx={{
                  width: "20px",
                  height: "20px",
                }}
              >
                {colorMode === "dark" ? "☀️" : "🌙"}
              </Box>
            </Button>
          </Flex>
        </>
      )}
    </Box>
  )
}

export default HamburgerMenu
