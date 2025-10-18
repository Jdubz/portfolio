import React from "react"
import { Flex, Button } from "theme-ui"

interface Action {
  label: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  variant?: string
}

interface ModalFooterProps {
  primaryAction: Action
  secondaryAction?: Action
  tertiaryAction?: Action
}

/**
 * Modal Footer component
 *
 * Provides consistent action button layout for modals
 *
 * @example
 * ```tsx
 * <ModalFooter
 *   primaryAction={{ label: "Save", onClick: handleSave, loading: isSaving }}
 *   secondaryAction={{ label: "Cancel", onClick: handleClose }}
 * />
 * ```
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({ primaryAction, secondaryAction, tertiaryAction }) => (
  <Flex
    sx={{
      justifyContent: "flex-end",
      p: 4,
      borderTop: "1px solid",
      borderColor: "muted",
      gap: 2,
    }}
  >
    {tertiaryAction && (
      <Button
        variant={tertiaryAction.variant || "secondary"}
        onClick={tertiaryAction.onClick}
        disabled={tertiaryAction.disabled}
        sx={{ mr: "auto" }}
      >
        {tertiaryAction.label}
      </Button>
    )}
    {secondaryAction && (
      <Button
        variant={secondaryAction.variant || "secondary"}
        onClick={secondaryAction.onClick}
        disabled={secondaryAction.disabled}
      >
        {secondaryAction.label}
      </Button>
    )}
    <Button
      variant={primaryAction.variant || "primary"}
      onClick={primaryAction.onClick}
      disabled={primaryAction.disabled || primaryAction.loading}
    >
      {primaryAction.loading ? `${primaryAction.label}...` : primaryAction.label}
    </Button>
  </Flex>
)
