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
          border: "none",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.2)",
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
            bg: "white",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            transform: isOpen ? "rotate(45deg) translateY(8px)" : "none",
          }}
        />
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "white",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            opacity: isOpen ? 0 : 1,
          }}
        />
        <Box
          sx={{
            width: "24px",
            height: "2px",
            bg: "white",
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
              bg: "rgba(0, 0, 0, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
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
                color: "white",
                fontSize: 2,
                fontWeight: "body",
                textAlign: "left",
                border: "none",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  bg: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Home
            </Button>

            {/* Experience Page */}
            <Box
              sx={{
                width: "100%",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bg: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Link
                to="/experience"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 400,
                  textDecoration: "none",
                }}
              >
                Experience
              </Link>
            </Box>

            {/* Resume Builder */}
            <Box
              sx={{
                width: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  bg: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Link
                to="/resume-builder"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "1rem 1.5rem",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 400,
                  textDecoration: "none",
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
