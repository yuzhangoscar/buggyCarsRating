import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
    },
  },
  {
    files: ["tests/fixtures/**/*.ts"],
    rules: {
      "no-empty-pattern": "off",
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "allure-results/",
      "allure-report/",
      "test-results/",
      ".features-gen/",
      "commitlint.config.ts",
    ],
  }
);
