import "./src/styles/tailwind.css"

// Log app version to console
export const onClientEntry = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version, name } = require("./package.json")

  console.log(
    `%c${name} v${version}`,
    "background: linear-gradient(120deg, #7C3AED, #06B6D4); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;"
  )

  // Make version available globally
  if (typeof window !== "undefined") {
    window.__APP_VERSION__ = version
    window.__APP_NAME__ = name
  }
}
