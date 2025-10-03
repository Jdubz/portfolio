/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"

type FormState = {
  name: string
  email: string
  message: string
}

export default function ContactForm() {
  const [form, setForm] = React.useState<FormState>({ name: "", email: "", message: "" })
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle")

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")

    try {
      // Determine function URL based on environment
      const isProduction =
        typeof window !== "undefined" &&
        (window.location.hostname === "joshwentworth.com" || window.location.hostname === "www.joshwentworth.com")

      const functionUrl = isProduction
        ? "https://us-central1-static-sites-257923.cloudfunctions.net/contact-form"
        : "https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging"

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          honeypot: "", // Empty honeypot field for spam detection
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({ message: undefined }))) as { message?: string }
        throw new Error(errorData.message ?? `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = (await response.json()) as { message?: string }
      // eslint-disable-next-line no-console
      console.log("Contact form submitted successfully:", result.message)

      setStatus("success")
      setForm({ name: "", email: "", message: "" })
    } catch (error) {
      console.error("Contact form submission failed:", error)
      setStatus("error")
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e)
      }}
      sx={{ mt: 4 }}
      aria-label="Contact form"
    >
      <div sx={{ display: "grid", gridTemplateColumns: ["1fr", "1fr 1fr"], gap: 3 }}>
        <label sx={{ display: "grid", gap: 2 }}>
          <span sx={{ fontWeight: 600 }}>Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
            aria-required="true"
            sx={{
              border: "1px solid",
              borderColor: "rgba(15,23,42,.18)",
              borderRadius: "10px",
              px: 3,
              py: 2,
              bg: "#fff",
              color: "text",
              fontSize: 2,
              "&:hover": { borderColor: "rgba(15,23,42,.28)" },
              "&:focus-visible": { outline: "none", boxShadow: "ring", borderColor: "primary" },
            }}
          />
        </label>
        <label sx={{ display: "grid", gap: 2 }}>
          <span sx={{ fontWeight: 600 }}>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            aria-required="true"
            sx={{
              border: "1px solid",
              borderColor: "rgba(15,23,42,.18)",
              borderRadius: "10px",
              px: 3,
              py: 2,
              bg: "#fff",
              color: "text",
              fontSize: 2,
              "&:hover": { borderColor: "rgba(15,23,42,.28)" },
              "&:focus-visible": { outline: "none", boxShadow: "ring", borderColor: "primary" },
            }}
          />
        </label>
      </div>
      <label sx={{ display: "grid", gap: 2, mt: 3 }}>
        <span sx={{ fontWeight: 600 }}>Message</span>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={6}
          aria-required="true"
          sx={{
            border: "1px solid",
            borderColor: "rgba(15,23,42,.18)",
            borderRadius: "12px",
            px: 3,
            py: 2,
            bg: "#fff",
            color: "text",
            fontSize: 2,
            resize: "vertical",
            "&:hover": { borderColor: "rgba(15,23,42,.28)" },
            "&:focus-visible": { outline: "none", boxShadow: "ring", borderColor: "primary" },
          }}
        />
      </label>
      <div sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <button
          type="submit"
          disabled={status === "submitting"}
          aria-busy={status === "submitting" ? "true" : "false"}
          sx={{
            variant: "buttons.primary",
            px: 12,
            py: 8,
            fontSize: 14,
            borderRadius: 8,
          }}
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        {status === "success" && (
          <span sx={{ color: "icon_green" }} role="status" aria-live="polite">
            Thanks! I&apos;ll get back to you shortly.
          </span>
        )}
        {status === "error" && (
          <span sx={{ color: "icon_red" }} role="alert" aria-live="assertive">
            Something went wrong. Please try again.
          </span>
        )}
      </div>
    </form>
  )
}
