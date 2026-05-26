import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const abbreviationPattern = "^(?!.*(?:Api|Html|Id|Jpg|Url)(?:[A-Z0-9]|$)).*$";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts",
    "**/node_modules/**",
    "**/.turbo/**",
    "**/.cache/**",
    "**/.vercel/**",
    "**/generated/**",
  ]),

  {
    files: ["**/*.{js,cjs,mjs,ts,tsx,cts,mts}"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx,cts,mts}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: null,
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
          custom: {
            regex: abbreviationPattern,
            match: true,
          },
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          custom: {
            regex: abbreviationPattern,
            match: true,
          },
        },
        {
          selector: "variable",
          modifiers: ["destructured"],
          format: null,
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          custom: {
            regex: abbreviationPattern,
            match: true,
          },
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          custom: {
            regex: abbreviationPattern,
            match: true,
          },
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  eslintConfigPrettier,
]);

export default eslintConfig;
