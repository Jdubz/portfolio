/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"

export function SearchBar() {
  const [query, setQuery] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    // eslint-disable-next-line no-console
    console.log("Search query:", query)
  }

  return (
    <form sx={{ variant: "cards.form", display: "grid", gap: 3, maxWidth: 640 }} onSubmit={handleSubmit}>
      <label htmlFor="search-query" sx={{ variant: "forms.label" }}>
        Search
      </label>
      <div sx={{ variant: "forms.inputWrap" }}>
        {/* You can add an icon here when you have an icon library */}
        <input
          id="search-query"
          name="q"
          placeholder="Search projects and notes…"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          sx={{ variant: "forms.input" }}
        />
      </div>
      <button type="submit" sx={{ variant: "buttons.primary" }}>
        Search
      </button>
    </form>
  )
}
