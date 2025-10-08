// Minimal Theme UI test to verify variants work
export const testTheme = {
  colors: {
    primary: "#0EA5E9",
    background: "#FFFFFF",
    text: "#0F172A",
  },

  buttons: {
    primary: {
      bg: "primary",
      color: "background",
      px: 3,
      py: 2,
      borderRadius: 4,
      border: "none",
      cursor: "pointer",
    },
  },

  forms: {
    input: {
      bg: "background",
      color: "text",
      border: "1px solid #ccc",
      px: 2,
      py: 2,
      borderRadius: 4,
    },
  },
}

export default testTheme
