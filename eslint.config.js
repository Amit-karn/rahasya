import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // ESLint recommended rules
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"]
  },

  // Enable browser environment
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module"
    }
  },

  // React rules
  {
    ...pluginReact.configs.flat.recommended,
    files: ["**/*.{js,jsx}"],
    settings: {
      react: {
        version: "detect"
      }
    }
  },

  // Your custom rules
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      // Code style rules
      quotes: ["error", "double"],
      semi: ["error", "always"],
      indent: ["error", 2],
      "no-trailing-spaces": "error",
      "comma-dangle": ["error", "never"],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      curly: "error",
      "object-curly-spacing": ["error", "always"],
      "arrow-spacing": ["error", { before: true, after: true }],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "space-before-function-paren": ["error", "never"],

      // React specific override
      "react/react-in-jsx-scope": "off",

      // Unused variable rule
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  }
]);
