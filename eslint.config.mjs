import js from "@eslint/js"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import prettierPlugin from "eslint-plugin-prettier"
import prettierConfig from "eslint-config-prettier"

export default [
  // Base configuration for all files
  {
    ignores: [
      "node_modules/**",
      "public/**",
      ".cache/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
    ],
  },

  // JavaScript/JSX files
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        __PATH_PREFIX__: "readonly",
        __BASE_PATH__: "readonly",
        __ASSET_PREFIX__: "readonly",
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly",
        global: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["sx", "css"],
        },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-props": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      eqeqeq: ["warn", "always"],
      curly: ["warn", "all"],
      "no-else-return": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // TypeScript/TSX files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
      globals: {
        __PATH_PREFIX__: "readonly",
        __BASE_PATH__: "readonly",
        __ASSET_PREFIX__: "readonly",
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "readonly",
        global: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs["recommended-requiring-type-checking"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_|^jsx$",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["sx", "css"],
        },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-props": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "no-unused-vars": "off",
      "prefer-const": "warn",
      "no-var": "error",
      eqeqeq: ["warn", "always"],
      curly: ["warn", "all"],
      "no-else-return": "warn",
      "no-return-await": "warn",
      "require-await": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Shadowed theme files - more permissive for third-party theme customizations
  {
    files: ["src/@lekoarts/**/*"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },

  // Test files - more permissive rules
  {
    files: ["**/__tests__/**/*", "**/*.test.*", "**/*.spec.*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },

  // Gatsby config files
  {
    files: ["gatsby-*.ts", "gatsby-*.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
]
