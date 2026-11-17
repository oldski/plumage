import axe from "axe-core";
import { expect } from "vitest";

/**
 * Run axe's WCAG 2.x A and AA rules. Color contrast is off here because jsdom
 * does no layout or CSS cascade; contrast is checked on the tokens themselves
 * (packages/tokens `pnpm check`) and live in Storybook's a11y panel.
 */
export async function expectNoA11yViolations(root: Element = document.body) {
  const results = await axe.run(root, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    rules: { "color-contrast": { enabled: false } },
    resultTypes: ["violations"],
  });
  const report = results.violations
    .map(
      (v) =>
        `${v.id} (${v.impact ?? "n/a"}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`,
    )
    .join("\n");
  expect(results.violations, report).toEqual([]);
}
