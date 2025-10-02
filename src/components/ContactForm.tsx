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
      // Stub: replace with real endpoint or form service
      await new Promise((r) => setTimeout(r, 600))
      setStatus("success")
      setForm({ name: "", email: "", message: "" })
    } catch (err) {
      setStatus("error")
    }
  }

  return (
    <form onSubmit={handleSubmit} sx={{ mt: 4 }} aria-label="Contact form">
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
              '&:hover': { borderColor: "rgba(15,23,42,.28)" },
              '&:focus-visible': { outline: "none", boxShadow: "ring", borderColor: "primary" },
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
              '&:hover': { borderColor: "rgba(15,23,42,.28)" },
              '&:focus-visible': { outline: "none", boxShadow: "ring", borderColor: "primary" },
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
            '&:hover': { borderColor: "rgba(15,23,42,.28)" },
            '&:focus-visible': { outline: "none", boxShadow: "ring", borderColor: "primary" },
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
        {status === "success" && <span sx={{ color: "icon_green" }} role="status" aria-live="polite">Thanks! I'll get back to you shortly.</span>}
        {status === "error" && <span sx={{ color: "icon_red" }} role="alert" aria-live="assertive">Something went wrong. Please try again.</span>}
      </div>
    </form>
  )
}
