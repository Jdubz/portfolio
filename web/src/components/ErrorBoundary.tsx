/**
 * Error Boundary Component
 *
 * Catches runtime errors in component trees and displays fallback UI
 * instead of crashing the entire application.
 *
 * Usage:
 * <ErrorBoundary fallback={<CustomFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import React, { Component, type ReactNode } from "react"
import { Box, Heading, Text, Button } from "theme-ui"
import { logger } from "../utils/logger"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to monitoring service
    logger.error("Component error boundary caught error", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            bg: "background",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
            my: 4,
          }}
        >
          <Text sx={{ fontSize: 5, mb: 3 }}>⚠️</Text>
          <Heading as="h2" sx={{ fontSize: 4, mb: 3, color: "heading" }}>
            Something went wrong
          </Heading>
          <Text sx={{ fontSize: 2, mb: 3, color: "text" }}>
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>

          {process.env.NODE_ENV === "development" && this.state.errorInfo && (
            <Box
              sx={{
                mt: 3,
                p: 3,
                bg: "muted",
                borderRadius: "sm",
                textAlign: "left",
                overflow: "auto",
                maxHeight: "300px",
              }}
            >
              <Text sx={{ fontSize: 1, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                {this.state.error?.stack}
              </Text>
            </Box>
          )}

          <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Reload Page
            </Button>
          </Box>
        </Box>
      )
    }

    return this.props.children
  }
}
