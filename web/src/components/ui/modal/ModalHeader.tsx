import React from "react"
import { Flex, Heading, Button } from "theme-ui"

interface ModalHeaderProps {
  title: string | React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
  disableClose?: boolean
  noBorder?: boolean
}

/**
 * Modal Header component
 *
 * Provides consistent modal header with title, optional actions, and close button
 *
 * @example
 * ```tsx
 * <ModalHeader
 *   title="Edit Item"
 *   onClose={handleClose}
 *   actions={<Button onClick={handleDownload}>Download</Button>}
 * />
 * ```
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  actions,
  disableClose = false,
  noBorder = false,
}) => (
  <Flex
    sx={{
      justifyContent: "space-between",
      alignItems: "center",
      p: 4,
      ...(!noBorder && {
        borderBottom: "1px solid",
        borderColor: "muted",
      }),
    }}
  >
    {typeof title === "string" ? (
      <Heading as="h2" sx={{ fontSize: 4 }}>
        {title}
      </Heading>
    ) : (
      title
    )}
    <Flex sx={{ gap: 2, alignItems: "center" }}>
      {actions}
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={disableClose}
        sx={{ fontSize: 2 }}
        aria-label="Close modal"
      >
        ✕
      </Button>
    </Flex>
  </Flex>
)
