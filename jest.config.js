module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  silent: true, // Suppress console.log/warn/error during tests unless they fail
  verbose: false, // Less verbose test output
  moduleNameMapper: {
    "^@lekoarts/gatsby-theme-cara/(.*)$": "<rootDir>/node_modules/@lekoarts/gatsby-theme-cara/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
        },
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.(test|spec).(ts|tsx|js)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/**/*.stories.tsx"],
}
