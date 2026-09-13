import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const featureIsolationMessage =
  "A feature never imports another feature. Share types through @shared/contracts, or let app/_composition wire ports and domain events.";
const featurePublicEntryMessage =
  "Import a feature only through its public entry: @features/<name>, @features/<name>/server, @features/<name>/actions or @features/<name>/admin.";
const lowerLayerMessage =
  "core, shared and config sit below features and must not depend on features, routes or UI.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["@features/**"], message: featureIsolationMessage },
          { group: ["@/app/**"], message: "Features do not depend on routes or on the composition root." },
          { group: ["../../*"], message: "Leave a feature through an alias, not a deep relative path." },
        ],
      }],
    },
  },
  {
    files: ["core/**/*.ts", "shared/**/*.ts", "config/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@features/**", "@/app/**", "@/components/**"], message: lowerLayerMessage }],
      }],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
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
