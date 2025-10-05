/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState } from "react"

interface FormData {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

interface FormStatus {
  submitting: boolean
  submitted: boolean
  error: string | null
}

const ContactForm = (): React.JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>({
    submitting: false,
    submitted: false,
    error: null,
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setStatus({ submitting: true, submitted: false, error: null })

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1000))
      setStatus({ submitting: false, submitted: true, error: null })
      setFormData({ name: "", email: "", message: "" })
    } catch (_error) {
      setStatus({
        submitting: false,
        submitted: false,
        error: "Something went wrong. Please try again.",
      })
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e)
      }}
      sx={{
        bg: "background",
        color: "text",
        p: [4, 5],
        borderRadius: "lg",
        boxShadow: "0 10px 30px rgba(16,23,42,0.12)",
        border: "1px solid",
        borderColor: "divider",
        maxWidth: 640,
        mx: "auto",
      }}
      aria-label="Contact form"
    >
      <div
        sx={{
          display: "grid",
          gridTemplateColumns: ["1fr", "1fr 1fr"],
          gap: 3,
          mb: 4,
        }}
      >
        <div>
          <label
            htmlFor="name"
            sx={{
              fontSize: 2,
              fontWeight: "bold",
              color: "heading",
              mb: 2,
              display: "block",
            }}
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{
              bg: "background",
              color: "text",
              border: "1px solid",
              borderColor: errors.name ? "danger" : "divider",
              borderRadius: "4px",
              px: 3,
              py: 3,
              fontSize: 2,
              width: "100%",
              fontFamily: "body",
              transition:
                "border-color 200ms cubic-bezier(.22,.61,.36,1), box-shadow 200ms cubic-bezier(.22,.61,.36,1)",
              "&:focus": {
                outline: "none",
                borderColor: "primary",
                boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
              },
            }}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <div
              id="name-error"
              sx={{
                color: "danger",
                fontSize: 1,
                mt: 1,
                fontWeight: "medium",
              }}
            >
              {errors.name}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            sx={{
              fontSize: 2,
              fontWeight: "bold",
              color: "heading",
              mb: 2,
              display: "block",
            }}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{
              bg: "background",
              color: "text",
              border: "1px solid",
              borderColor: errors.email ? "danger" : "divider",
              borderRadius: "4px",
              px: 3,
              py: 3,
              fontSize: 2,
              width: "100%",
              fontFamily: "body",
              transition:
                "border-color 200ms cubic-bezier(.22,.61,.36,1), box-shadow 200ms cubic-bezier(.22,.61,.36,1)",
              "&:focus": {
                outline: "none",
                borderColor: "primary",
                boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
              },
            }}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <div
              id="email-error"
              sx={{
                color: "danger",
                fontSize: 1,
                mt: 1,
                fontWeight: "medium",
              }}
            >
              {errors.email}
            </div>
          )}
        </div>
      </div>

      <div sx={{ mb: 4 }}>
        <label
          htmlFor="message"
          sx={{
            fontSize: 2,
            fontWeight: "bold",
            color: "heading",
            mb: 2,
            display: "block",
          }}
        >
          Message *
        </label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          sx={{
            bg: "background",
            color: "text",
            border: "1px solid",
            borderColor: errors.message ? "danger" : "divider",
            borderRadius: "4px",
            px: 3,
            py: 3,
            fontSize: 2,
            width: "100%",
            fontFamily: "body",
            resize: "vertical",
            minHeight: 120,
            transition: "border-color 200ms cubic-bezier(.22,.61,.36,1), box-shadow 200ms cubic-bezier(.22,.61,.36,1)",
            "&:focus": {
              outline: "none",
              borderColor: "primary",
              boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
            },
          }}
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <div
            id="message-error"
            sx={{
              color: "danger",
              fontSize: 1,
              mt: 1,
              fontWeight: "medium",
            }}
          >
            {errors.message}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={status.submitting}
        sx={{
          bg: status.submitting ? "textMuted" : "primary",
          color: "background",
          border: "none",
          borderRadius: "pill",
          px: 6,
          py: 3,
          height: 48,
          minHeight: 48,
          fontSize: 2,
          fontWeight: "bold",
          cursor: status.submitting ? "not-allowed" : "pointer",
          transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
          "&:hover": status.submitting
            ? {}
            : {
                bg: "primaryHover",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.4)",
              },
          "&:active": status.submitting
            ? {}
            : {
                transform: "translateY(0)",
                transition: "all 160ms cubic-bezier(.22,.61,.36,1)",
              },
          "&:focus-visible": {
            outline: "3px solid",
            outlineColor: "primary",
            outlineOffset: "2px",
          },
        }}
      >
        {status.submitting ? "Sending..." : "Send Message"}
      </button>

      {status.submitted && (
        <div
          sx={{
            mt: 4,
            p: 3,
            bg: "success",
            color: "background",
            borderRadius: "md",
            textAlign: "center",
            fontWeight: "medium",
          }}
        >
          Thank you! Your message has been sent successfully.
        </div>
      )}

      {status.error && (
        <div
          sx={{
            mt: 4,
            p: 3,
            bg: "danger",
            color: "background",
            borderRadius: "md",
            textAlign: "center",
            fontWeight: "medium",
          }}
        >
          {status.error}
        </div>
      )}

      <div
        sx={{
          mt: 4,
          fontSize: 1,
          color: "textMuted",
          textAlign: "center",
        }}
      >
        * Required fields
      </div>
    </form>
  )
}

export default ContactForm
