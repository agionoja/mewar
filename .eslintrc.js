module.exports = {
  // Specify the environments your code runs in
  env: {
    browser: true, // Enables browser globals (window, document, etc.)
    es2021: true, // Enables modern JavaScript features (ES12)
    node: true, // Enables Node.js globals (if using server-side code)
  },

  // Extend recommended configurations
  extends: [
    "eslint:recommended", // Base ESLint recommended rules
    "plugin:react/recommended", // React-specific recommended rules
    "plugin:react-hooks/recommended", // React Hooks rules
    "plugin:jsx-a11y/recommended", // Accessibility rules
    "plugin:import/recommended", // Import rules
    "plugin:prettier/recommended", // Integrates Prettier with ESLint
    "plugin:@typescript-eslint/recommended", // TypeScript recommended rules (omit if not using TS)
  ],

  // Use TypeScript parser (comment out if not using TypeScript)
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021, // Matches es2021 env
    sourceType: "module", // ESM support
    ecmaFeatures: {
      jsx: true, // Enables JSX parsing
    },
  },

  // Specify plugins
  plugins: [
    "react",
    "react-hooks",
    "jsx-a11y",
    "import",
    "prettier",
    "@typescript-eslint", // Omit if not using TypeScript
  ],

  // Project-specific settings
  settings: {
    react: {
      version: "19.0", // Explicitly set React version for eslint-plugin-react
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"], // File extensions to resolve
      },
    },
  },

  // Custom rules
  rules: {
    // General JavaScript/TypeScript rules
    "no-unused-vars": "off", // Disable base rule, use TypeScript version
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // TS-specific, ignore vars starting with _
    "no-console": ["warn", { allow: ["error"] }], // Warn on console.log, allow console.error
    eqeqeq: ["error", "always"], // Enforce === over ==

    // React-specific rules
    "react/prop-types": "off", // Disable prop-types (unnecessary with TypeScript or modern React)
    "react/react-in-jsx-scope": "off", // Not needed in React 18+ (no need to import React for JSX)
    "react/jsx-uses-react": "off", // Also not needed in React 18+
    "react-hooks/rules-of-hooks": "error", // Enforce proper hook usage
    "react-hooks/exhaustive-deps": "warn", // Warn on missing hook dependencies

    // Import rules
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/no-unresolved": "error", // Ensure imports resolve correctly

    // Accessibility rules
    "jsx-a11y/alt-text": "error", // Enforce alt text on images
    "jsx-a11y/anchor-is-valid": "error", // Ensure <a> tags are valid

    // Prettier integration
    "prettier/prettier": "error", // Treat Prettier issues as ESLint errors

    // TypeScript-specific (omit if not using TS)
    "@typescript-eslint/explicit-module-boundary-types": "off", // Allow inferred return types
    "@typescript-eslint/no-explicit-any": "warn", // Warn on 'any' usage
  },

  // Ignore certain files/patterns
  ignorePatterns: ["node_modules/", "dist/", "build/", "*.min.js"],
};
