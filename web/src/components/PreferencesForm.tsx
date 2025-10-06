/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"

export function PreferencesForm() {
  const [emailUpdates, setEmailUpdates] = React.useState(true)
  const [notificationMethod, setNotificationMethod] = React.useState("email")

  return (
    <div sx={{ variant: "cards.form", maxWidth: 640 }}>
      <label sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <input
          type="checkbox"
          checked={emailUpdates}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailUpdates(e.target.checked)}
          sx={{ variant: "forms.checkbox" }}
        />
        Receive updates about new projects
      </label>

      <div sx={{ display: "grid", gap: 2 }}>
        <label sx={{ display: "flex", alignItems: "center" }}>
          <input
            type="radio"
            name="notification"
            value="email"
            checked={notificationMethod === "email"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationMethod(e.target.value)}
            sx={{ variant: "forms.radio" }}
          />
          Email notifications
        </label>
        <label sx={{ display: "flex", alignItems: "center" }}>
          <input
            type="radio"
            name="notification"
            value="sms"
            checked={notificationMethod === "sms"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotificationMethod(e.target.value)}
            sx={{ variant: "forms.radio" }}
          />
          SMS notifications
        </label>
      </div>
    </div>
  )
}
