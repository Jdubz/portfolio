import React, { useState } from "react"
import { Box, Button, Flex } from "theme-ui"
import { Link } from "gatsby"

/**
 * Hamburger Menu Component
 *
 * Provides navigation to all pages in the portfolio
 */
const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 3,
        right: 3,
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
          borderColor: "rgba(56, 189, 248, 0.3)", // Sky blue border
          background: "rgba(15, 23, 42, 0.85)", // Dark slate background
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          "&:hover": {
            background: "rgba(30, 41, 59, 0.9)", // Lighter slate on hover
            borderColor: "rgba(56, 189, 248, 0.5)",
            boxShadow: "0 6px 16px rgba(56, 189, 248, 0.2)",
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "rgb(56, 189, 248)", // Sky blue focus
            outlineOffset: "2px",
          },
        }}
      >
        {/* Hamburger Icon Lines */}
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "rgb(56, 189, 248)", // Sky blue lines
            borderRadius: "2px",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(45deg) translateY(8px)" : "none",
          }}
        />
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "rgb(56, 189, 248)", // Sky blue lines
            borderRadius: "2px",
            transition: "all 0.3s ease",
            opacity: isOpen ? 0 : 1,
          }}
        />
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "rgb(56, 189, 248)", // Sky blue lines
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
              bg: "rgba(15, 23, 42, 0.95)", // Dark slate background
              backdropFilter: "blur(20px)",
              borderRadius: "12px",
              border: "1px solid rgba(56, 189, 248, 0.3)", // Sky blue border
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
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
            {/* Home - Scroll to top */}
            <Button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" })
                closeMenu()
              }}
              sx={{
                width: "100%",
                py: 3,
                px: 4,
                bg: "transparent",
                color: "rgb(226, 232, 240)", // Light slate text
                fontSize: 2,
                fontWeight: "body",
                textAlign: "left",
                border: "none",
                borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  bg: "rgba(56, 189, 248, 0.1)", // Sky blue hover
                  color: "rgb(56, 189, 248)",
                },
              }}
            >
              Home
            </Button>

            {/* Resume Builder */}
            <Box
              sx={{
                width: "100%",
                borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bg: "rgba(56, 189, 248, 0.1)", // Sky blue hover
                  "& a": {
                    color: "rgb(56, 189, 248)",
                  },
                },
              }}
            >
              <Link
                to="/resume-builder"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  color: "rgb(226, 232, 240)", // Light slate text
                  fontSize: "1rem",
                  fontWeight: 400,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                Resume Builder
              </Link>
            </Box>
          </Flex>
        </>
      )}
    </Box>
  )
}

export default HamburgerMenu
