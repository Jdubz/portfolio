import * as React from "react"
import { Button } from "./ui/button"

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
      await new Promise((r) => globalThis.setTimeout(r, 600))
      setStatus("success")
      setForm({ name: "", email: "", message: "" })
    } catch (_err) {
      setStatus("error")
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e)
      }}
      className="mt-8 space-y-4"
      aria-label="Contact form"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          aria-label="Name"
          required
          autoComplete="name"
          className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-slate-900 shadow-[0_2px_12px_rgba(2,6,23,.06)] focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:ring-offset-2"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          aria-label="Email"
          required
          autoComplete="email"
          className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-slate-900 shadow-[0_2px_12px_rgba(2,6,23,.06)] focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:ring-offset-2"
        />
      </div>
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Message"
        aria-label="Message"
        required
        rows={6}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-[0_2px_12px_rgba(2,6,23,.06)] focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:ring-offset-2 resize-vertical"
      />
      <div className="flex gap-2 items-center">
        <Button type="submit" size="md" disabled={status === "submitting"} className="min-h-10">
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
        {status === "success" && (
          <span className="text-green-600" role="status" aria-live="polite">
            Thanks! I&apos;ll get back to you shortly.
          </span>
        )}
        {status === "error" && (
          <span className="text-red-600" role="alert" aria-live="assertive">
            Something went wrong. Please try again.
          </span>
        )}
      </div>
    </form>
  )
}
