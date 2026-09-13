import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const featureIsolationMessage =
  "A feature never imports another feature. Share types through @shared/contracts, or let app/_composition wire ports and domain events.";
const featurePublicEntryMessage =
  "Import a feature only through its public entry: @features/<name>, @features/<name>/admin, @features/<name>/server or @features/<name>/actions.";
const routesOnlyMessage = "Only app/ may depend on routes, the composition root and the app shell.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@features/**"], message: featureIsolationMessage },
          { group: ["@app/**"], message: routesOnlyMessage },
          { group: ["../../*"], message: "Leave a feature through an alias, not a deep relative path." },
        ],
      }],
    },
  },
  {
    files: ["shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@features/**"], message: "shared/ serves every feature and must not depend on one." },
          { group: ["@app/**"], message: routesOnlyMessage },
        ],
      }],
    },
  },
  {
    files: ["core/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@features/**", "@shared/**"], message: "core/ is domain-free infrastructure: it may only depend on @config." },
          { group: ["@app/**"], message: routesOnlyMessage },
        ],
      }],
    },
  },
  {
    files: ["config/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@features/**", "@shared/**", "@core/**", "@app/**"],
          message: "config/ only reads and validates environment variables; it depends on nothing in the project.",
        }],
      }],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "proxy.ts", "i18n/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@features/*/**", "!@features/*/server", "!@features/*/actions", "!@features/*/admin"],
          message: featurePublicEntryMessage,
        }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
