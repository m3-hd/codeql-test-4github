import eslintConfigPrettier from "eslint-config-prettier";
import eslint from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import jestPlugin from "eslint-plugin-jest";
import storybook from "eslint-plugin-storybook";
import globals from "globals";

export default [
  {
    files: ["**/*.spec.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}"],
    plugins: {
      "@typescript-eslint": tsEslint,
      next: nextPlugin,
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: "module",
    },
    rules: {},
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}", "*.{ts,mjs}"],
    ignores: [".next/**/*", "node_modules/**/*"],
    plugins: {
      "@typescript-eslint": tsEslint,
      next: nextPlugin,
    },
    languageOptions: {
      globals: {
        React: "true",
        ...globals.browser,
        ...globals.es2023,
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: "module",
    },
    rules: {
      "no-const-assign": "error", // constへの再代入を禁止
      "@typescript-eslint/explicit-function-return-type": "error", // 関数の戻り値の型を必須にする
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          ignoreRestArgs: true,
        },
      ], // any型の使用を禁止
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ], // _で始まる変数は未使用でも例外的に許可
    },
  },
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...storybook.configs["flat/recommended"],
];
