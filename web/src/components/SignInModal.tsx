import React from "react"
import { Box, Heading, Text, Button, Flex, Spinner } from "theme-ui"
import { logger } from "../utils/logger"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSignIn: () => Promise<void>
  title?: string
  message?: string
  signingIn?: boolean
}

/**
 * Modal that prompts users to sign in before performing authenticated actions
 *
 * Features:
 * - Consistent UX for all auth-required actions
 * - Clear explanation of what action requires auth
 * - Centralized sign-in flow
 * - Loading state during sign-in
 * - Modal backdrop with click-to-close
 */
export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  title = "Sign In Required",
  message = "You need to sign in to perform this action.",
  signingIn = false,
}) => {
  if (!isOpen) {
    return null
  }

  const handleSignIn = async () => {
    try {
      await onSignIn()
      // Don't auto-close - let the calling component handle that
      // after the action completes successfully
    } catch (error) {
      logger.error("Sign-in failed", error as Error, {
        component: "SignInModal",
        action: "handleSignIn",
      })
      // Error handling is done in the calling component
    }
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          bg: "background",
          borderRadius: "md",
          maxWidth: "500px",
          width: "90%",
          p: 4,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Heading as="h2" sx={{ mb: 3, fontSize: 4, color: "primary" }}>
          {title}
        </Heading>

        <Text sx={{ mb: 4, fontSize: 2, lineHeight: 1.6 }}>{message}</Text>

        <Flex sx={{ gap: 3, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} disabled={signingIn}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              void handleSignIn()
            }}
            disabled={signingIn}
            sx={{ minWidth: "120px" }}
          >
            {signingIn ? (
              <Flex sx={{ alignItems: "center", justifyContent: "center", gap: 2 }}>
                <Spinner size={16} />
                <Text>Signing in...</Text>
              </Flex>
            ) : (
              "Sign In with Google"
            )}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
