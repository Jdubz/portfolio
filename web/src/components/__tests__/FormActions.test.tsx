/**
 * Tests for FormActions Component
 *
 * High-impact tests for the standardized form action buttons component
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeUIProvider } from "theme-ui"
import { FormActions } from "../FormActions"

// Simple theme for testing
const theme = {
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#07c",
    secondary: "#888",
    red: "#f00",
    darkred: "#c00",
    white: "#fff",
  },
  buttons: {
    primary: {
      sm: {},
    },
    secondary: {
      sm: {},
    },
  },
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeUIProvider theme={theme}>{ui}</ThemeUIProvider>)
}

describe("FormActions", () => {
  describe("Basic Rendering", () => {
    it("should render Cancel and Save buttons", () => {
      renderWithTheme(<FormActions onCancel={jest.fn()} onSave={jest.fn()} />)

      expect(screen.getByText("Cancel")).toBeInTheDocument()
      expect(screen.getByText("Save")).toBeInTheDocument()
    })

    it("should render Delete button when onDelete is provided", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} />
      )

      expect(screen.getByText("Delete")).toBeInTheDocument()
      expect(screen.getByText("Cancel")).toBeInTheDocument()
      expect(screen.getByText("Save")).toBeInTheDocument()
    })

    it("should not render Delete button when onDelete is not provided", () => {
      renderWithTheme(<FormActions onCancel={jest.fn()} onSave={jest.fn()} />)

      expect(screen.queryByText("Delete")).not.toBeInTheDocument()
    })
  })

  describe("Button Click Handlers", () => {
    it("should call onCancel when Cancel button is clicked", async () => {
      const user = userEvent.setup()
      const onCancel = jest.fn()

      renderWithTheme(<FormActions onCancel={onCancel} onSave={jest.fn()} />)

      await user.click(screen.getByText("Cancel"))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it("should call onSave when Save button is clicked", async () => {
      const user = userEvent.setup()
      const onSave = jest.fn()

      renderWithTheme(<FormActions onCancel={jest.fn()} onSave={onSave} />)

      await user.click(screen.getByText("Save"))

      expect(onSave).toHaveBeenCalledTimes(1)
    })

    it("should call onDelete when Delete button is clicked", async () => {
      const user = userEvent.setup()
      const onDelete = jest.fn()

      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={onDelete} />
      )

      await user.click(screen.getByText("Delete"))

      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe("Custom Button Text", () => {
    it("should display custom save text", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} saveText="Submit" />
      )

      expect(screen.getByText("Submit")).toBeInTheDocument()
      expect(screen.queryByText("Save")).not.toBeInTheDocument()
    })

    it("should display custom cancel text", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} cancelText="Close" />
      )

      expect(screen.getByText("Close")).toBeInTheDocument()
      expect(screen.queryByText("Cancel")).not.toBeInTheDocument()
    })

    it("should display custom delete text", () => {
      renderWithTheme(
        <FormActions
          onCancel={jest.fn()}
          onSave={jest.fn()}
          onDelete={jest.fn()}
          deleteText="Remove"
        />
      )

      expect(screen.getByText("Remove")).toBeInTheDocument()
      expect(screen.queryByText("Delete")).not.toBeInTheDocument()
    })
  })

  describe("Submitting State", () => {
    it("should show 'Saving...' when isSubmitting is true", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} isSubmitting />
      )

      expect(screen.getByText("Saving...")).toBeInTheDocument()
    })

    it("should disable Save button when isSubmitting is true", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} isSubmitting />
      )

      const saveButton = screen.getByText("Saving...")
      expect(saveButton).toBeDisabled()
    })

    it("should disable Cancel button when isSubmitting is true", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} isSubmitting />
      )

      const cancelButton = screen.getByText("Cancel")
      expect(cancelButton).toBeDisabled()
    })

    it("should disable Delete button when isSubmitting is true", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} isSubmitting />
      )

      const deleteButton = screen.getByText("Delete")
      expect(deleteButton).toBeDisabled()
    })

    it("should show custom save text with -ing suffix when submitting", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} saveText="Submit" isSubmitting />
      )

      // Note: The implementation strips 'e' before adding 'ing', so 'Submit' becomes 'Submiting'
      expect(screen.getByText("Submiting...")).toBeInTheDocument()
    })

    it("should handle save text ending with 'e' when submitting", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} saveText="Create" isSubmitting />
      )

      expect(screen.getByText("Creating...")).toBeInTheDocument()
    })
  })

  describe("Deleting State", () => {
    it("should show 'Deleting...' when isDeleting is true", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} isDeleting />
      )

      expect(screen.getByText("Deleting...")).toBeInTheDocument()
    })

    it("should disable Delete and Save buttons when isDeleting is true", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} isDeleting />
      )

      expect(screen.getByText("Deleting...")).toBeDisabled()
      expect(screen.getByText("Save")).toBeDisabled()
      // Note: Cancel is not disabled during deletion, only during submission
      expect(screen.getByText("Cancel")).not.toBeDisabled()
    })

    it("should show custom delete text with -ing suffix when deleting", () => {
      renderWithTheme(
        <FormActions
          onCancel={jest.fn()}
          onSave={jest.fn()}
          onDelete={jest.fn()}
          deleteText="Remove"
          isDeleting
        />
      )

      expect(screen.getByText("Removing...")).toBeInTheDocument()
    })
  })

  describe("Combined States", () => {
    it("should disable all buttons when both isSubmitting and isDeleting are true", () => {
      renderWithTheme(
        <FormActions
          onCancel={jest.fn()}
          onSave={jest.fn()}
          onDelete={jest.fn()}
          isSubmitting
          isDeleting
        />
      )

      const buttons = screen.getAllByRole("button")
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe("Button Types", () => {
    it("should render all buttons with type='button'", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} />
      )

      const buttons = screen.getAllByRole("button")
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button")
      })
    })
  })

  describe("Button Order", () => {
    it("should render buttons in correct order: Delete, Cancel, Save", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={jest.fn()} />
      )

      const buttons = screen.getAllByRole("button")
      expect(buttons[0]).toHaveTextContent("Delete")
      expect(buttons[1]).toHaveTextContent("Cancel")
      expect(buttons[2]).toHaveTextContent("Save")
    })

    it("should render buttons in correct order without delete: Cancel, Save", () => {
      renderWithTheme(<FormActions onCancel={jest.fn()} onSave={jest.fn()} />)

      const buttons = screen.getAllByRole("button")
      expect(buttons[0]).toHaveTextContent("Cancel")
      expect(buttons[1]).toHaveTextContent("Save")
    })
  })

  describe("Interaction Prevention", () => {
    it("should not call onSave when Save button is disabled and clicked", async () => {
      const user = userEvent.setup()
      const onSave = jest.fn()

      renderWithTheme(<FormActions onCancel={jest.fn()} onSave={onSave} isSubmitting />)

      const saveButton = screen.getByText("Saving...")
      await user.click(saveButton)

      expect(onSave).not.toHaveBeenCalled()
    })

    it("should not call onCancel when Cancel button is disabled and clicked", async () => {
      const user = userEvent.setup()
      const onCancel = jest.fn()

      renderWithTheme(<FormActions onCancel={onCancel} onSave={jest.fn()} isSubmitting />)

      const cancelButton = screen.getByText("Cancel")
      await user.click(cancelButton)

      expect(onCancel).not.toHaveBeenCalled()
    })

    it("should not call onDelete when Delete button is disabled and clicked", async () => {
      const user = userEvent.setup()
      const onDelete = jest.fn()

      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} onDelete={onDelete} isDeleting />
      )

      const deleteButton = screen.getByText("Deleting...")
      await user.click(deleteButton)

      expect(onDelete).not.toHaveBeenCalled()
    })
  })

  describe("Edge Cases", () => {
    it("should handle saveText without ending 'e' when adding -ing", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} saveText="Add" isSubmitting />
      )

      expect(screen.getByText("Adding...")).toBeInTheDocument()
    })

    it("should handle empty custom text gracefully", () => {
      renderWithTheme(
        <FormActions onCancel={jest.fn()} onSave={jest.fn()} saveText="" />
      )

      // Button should still render, just with empty text
      const buttons = screen.getAllByRole("button")
      expect(buttons).toHaveLength(2)
    })
  })
})
