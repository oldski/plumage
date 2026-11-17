// The typography reference: each font role and the type scale, resolved for
// the chosen brand, mode, and density, rendered with Plumage's own classes.
import { cssVars, values, type TokenName } from "@plumage/tokens";
import { formatNumber } from "@plumage/ui";
import { TokenScope } from "./token-reference";

const ROLES = [
  { token: "font.family.body", className: "font-sans", sample: "Every spare dollar, on purpose." },
  {
    token: "font.family.display",
    className: "font-display",
    sample: "Watch closely. Decide yourself.",
  },
  {
    token: "font.family.numeric",
    className: "font-numeric tabular-nums",
    sample: `${formatNumber(12480.55, { format: "currency" })}  ${formatNumber(-318.2, { format: "currency" })}  ${formatNumber(7.5, { format: "currency" })}`,
  },
  { token: "font.family.mono", className: "font-mono", sample: "--pl-color-accent-default" },
] as const satisfies readonly { token: TokenName; className: string; sample: string }[];

const SCALE = [
  { step: "display", className: "display-figure" },
  { step: "heading", className: "display-heading" },
  { step: "title", className: "text-title font-heading" },
  { step: "body", className: "text-body" },
  { step: "label", className: "text-label font-label" },
  { step: "caption", className: "text-caption" },
] as const;

/** Each font role with its stack and a sample. */
export function FontRoles() {
  return (
    <TokenScope>
      {({ brand, mode, density }) => {
        const tokens = values[`${brand}/${mode}/${density}`];
        return (
          <ul className="flex flex-col gap-md">
            {ROLES.map((role) => (
              <li key={role.token} className="flex flex-col gap-2xs">
                <span className="font-mono text-caption text-subtle">
                  {role.token} ({cssVars[role.token]})
                </span>
                <span className={`text-title text-default ${role.className}`}>{role.sample}</span>
                <span className="font-mono text-caption text-muted">{tokens[role.token]}</span>
              </li>
            ))}
          </ul>
        );
      }}
    </TokenScope>
  );
}

/** The type scale: each step's size and line height at the chosen density. */
export function TypeScale() {
  return (
    <TokenScope>
      {({ brand, mode, density }) => {
        const tokens = values[`${brand}/${mode}/${density}`];
        return (
          <ul className="flex flex-col gap-md">
            {SCALE.map(({ step, className }) => {
              const size = tokens[`font.size.${step}` as TokenName];
              const line = tokens[`font.line-height.${step}` as TokenName];
              return (
                <li key={step} className="flex flex-col gap-2xs">
                  <span className="font-mono text-caption text-subtle">
                    text-{step}: {size} on {line}
                  </span>
                  <span className={`text-default ${className}`}>
                    Holdings across every connected source
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }}
    </TokenScope>
  );
}
