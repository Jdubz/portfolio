module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "off",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "off",
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  ignorePatterns: ["dist/", "node_modules/", "*.js"],
}
