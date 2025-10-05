/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"

export function SearchBar() {
  const [query, setQuery] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [message, setMessage] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      setMessage("Please enter a search query")
      return
    }

    // TODO: Implement search functionality when backend is ready
    // For now, show a helpful message
    setMessage(`Search functionality coming soon! You searched for: "${query}"`)

    // Clear message after 5 seconds
    window.setTimeout(() => setMessage(""), 5000)
  }

  return (
    <form sx={{ variant: "cards.form", display: "grid", gap: 3, maxWidth: 640 }} onSubmit={handleSubmit}>
      <label htmlFor="search-query" sx={{ variant: "forms.label" }}>
        Search
      </label>
      <div
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Search icon - 20px foreground UI icon */}
        <svg
          sx={{
            position: "absolute",
            left: 3,
            width: 20,
            height: 20,
            color: isFocused ? "primary" : "textMuted",
            pointerEvents: "none",
            transition: "color 200ms cubic-bezier(.22,.61,.36,1)",
          }}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="search-query"
          name="q"
          type="search"
          placeholder="Search projects and notes…"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          sx={{
            variant: "forms.input",
            pl: "44px", // 12px base + 20px icon + 12px gap
            width: "100%",
            transition: "border-color 200ms cubic-bezier(.22,.61,.36,1), box-shadow 200ms cubic-bezier(.22,.61,.36,1)",
            "&:focus": {
              outline: "none",
              borderColor: "primary",
              boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
            },
          }}
        />
      </div>
      <button
        type="submit"
        sx={{
          variant: "buttons.primary",
          height: 48,
          minHeight: 48,
          transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
          "&:hover": {
            bg: "primaryHover",
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.4)",
          },
          "&:active": {
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
        Search
      </button>
      {message && (
        <div
          sx={{
            mt: 3,
            p: 3,
            bg: "divider",
            color: "text",
            borderRadius: "8px",
            fontSize: 2,
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}
    </form>
  )
}
