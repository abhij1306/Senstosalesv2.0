import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      ".next/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "**/*.config.ts",
      "**/*.config.mjs"
    ]
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}", "!**/_*.{js,ts}"],
    plugins: {
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // ENFORCEMENT: Block manual Tailwind font/color overrides
      "no-restricted-syntax": ["error", {
        selector: "JSXAttribute[name.name='className'][value.value=/text-\\[|font-\\[/]",
        message: "VIOLATION: Use Typography atoms (H1, H2, Accounting) instead of manual font classes."
      }],
      // ARCHITECTURE: Prevent Pages from importing Atoms directly
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/components/design-system/atoms"],
          message: "Pages must import Organisms or Templates only to maintain Atomic hierarchy."
        }]
      }],
      // Project overrides
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off" // Use TypeScript's unused vars instead
    }
  }
);
