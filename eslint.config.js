// Shared ESLint flat config for every workspace. ESLint resolves the nearest
// config upward from each linted file, so packages inherit this by default.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Workspaces that may import only @plumage/* and third-party packages. */
const PLUMAGE_WORKSPACES = ["packages/tokens", "packages/ui", "apps/docs"];
/** Deepest folder nesting the boundary rule covers inside a workspace. */
const MAX_DEPTH = 12;

/**
 * A file `depth` folders below its workspace root leaves the workspace with
 * `depth + 1` steps up, so a relative import that climbs that far reaches into
 * a sibling workspace. Import it by its @plumage/* name instead.
 */
const workspaceBoundaries = PLUMAGE_WORKSPACES.flatMap((root) =>
  Array.from({ length: MAX_DEPTH + 1 }, (_, depth) => ({
    files: [`${root}/${"*/".repeat(depth)}*`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: `^(\\./)*(\\.\\./){${String(depth + 1)},}`,
              message:
                "A workspace imports other workspaces by their @plumage/* name, never by a relative path.",
            },
          ],
        },
      ],
    },
  })),
);

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/storybook-static/**",
      "**/coverage/**",
      // The shadcn registry, generated from @plumage/ui's linted source.
      "apps/docs/.registry/**",
      "apps/docs/public/r/**",
      // Playwright's temporary files, traces, and reports.
      "tests/*/.tmp/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.{tsx,jsx}"],
    extends: [reactHooks.configs.flat["recommended-latest"]],
  },
  ...storybook.configs["flat/recommended"],
  {
    // Build scripts and tests index fixed tables under noUncheckedIndexedAccess;
    // non-null assertions are the honest way to say "this key exists".
    // Shipped library code keeps the rule.
    files: [
      "**/scripts/**",
      "**/build/**",
      "**/test/**",
      "**/*.test.{ts,tsx}",
      "**/*.stories.{ts,tsx}",
      "**/src/stories/**",
    ],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  ...workspaceBoundaries,
);
