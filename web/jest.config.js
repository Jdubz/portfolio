module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  silent: true, // Suppress console.log/warn/error during tests unless they fail
  verbose: false, // Less verbose test output
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
  testPathIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/**/*.stories.tsx"],
}
