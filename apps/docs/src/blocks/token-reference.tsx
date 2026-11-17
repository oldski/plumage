// The token reference: every semantic and component token, resolved for a
// chosen brand, mode, and density from @plumage/tokens' build, with color
// swatches and their contrast ratios. The block sits in its own Plumage scope,
// so switching the pickers restyles the block itself too.
import {
  brandNames,
  brands,
  cssVars,
  densities,
  modes,
  values,
  type Brand,
  type Density,
  type Mode,
  type TokenName,
} from "@plumage/tokens";
import {
  Badge,
  PlumageProvider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@plumage/ui";
import { useState, type ReactNode } from "react";
import { contrast } from "./contrast";

export interface TokenContext {
  brand: Brand;
  mode: Mode;
  density: Density;
}

const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Brand, mode, and density pickers, and the content in that Plumage scope. */
export function TokenScope({ children }: { children: (context: TokenContext) => ReactNode }) {
  const [context, setContext] = useState<TokenContext>({
    brand: "finch",
    mode: "light",
    density: "compact",
  });
  const picker = <K extends keyof TokenContext>(
    key: K,
    options: readonly TokenContext[K][],
    label: (value: TokenContext[K]) => string,
  ) => (
    <Tabs
      value={context[key]}
      onValueChange={(value) => {
        setContext((current) => ({ ...current, [key]: value as TokenContext[K] }));
      }}
    >
      <TabsList aria-label={title(key)}>
        {options.map((option) => (
          <TabsTrigger key={option} value={option}>
            {label(option)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
  return (
    <PlumageProvider
      brand={context.brand}
      mode={context.mode}
      density={context.density}
      scope="local"
      className="sb-unstyled flex flex-col gap-md rounded-card border border-default bg-canvas p-inset-lg"
    >
      <div className="flex flex-wrap gap-sm">
        {picker("brand", brands, (brand) => brandNames[brand])}
        {picker("mode", modes, title)}
        {picker("density", densities, title)}
      </div>
      {children(context)}
    </PlumageProvider>
  );
}

const resolved = ({ brand, mode, density }: TokenContext) => values[`${brand}/${mode}/${density}`];

const names = (prefix: string) =>
  (Object.keys(values["finch/light/compact"]) as TokenName[]).filter((name) =>
    name.startsWith(prefix),
  );

/** Colors with no text contrast requirement, and why. */
const EXEMPT: Partial<Record<TokenName, string>> = {
  "color.bg.overlay": "The scrim behind dialogs; text never sits on it",
  "color.bg.disabled": "Disabled controls are exempt (WCAG 1.4.3)",
  "color.text.disabled": "Disabled text is exempt (WCAG 1.4.3)",
};

/**
 * What a color is measured against. Backgrounds and fills carry text, so the
 * text meant for them is measured on them; everything else is a foreground,
 * measured on the surface.
 */
function pairing(name: TokenName): { against: TokenName; isBackground: boolean; min: number } {
  const background =
    name.startsWith("color.bg.") ||
    name.endsWith("-subtle") ||
    name.endsWith(".subtle") ||
    name.endsWith("-solid") ||
    /^color\.accent\.(default|hover|active)$/.test(name);
  if (background) {
    const text: TokenName = name.endsWith("-solid")
      ? "color.text.on-solid"
      : name.startsWith("color.accent.") && !name.endsWith("subtle")
        ? "color.text.on-accent"
        : name === "color.bg.inverse"
          ? "color.text.inverse"
          : "color.text.default";
    return { against: text, isBackground: true, min: 4.5 };
  }
  const isText =
    name.startsWith("color.text.") || /\.(text|positive|negative|warning|info)$/.test(name);
  return { against: "color.bg.surface", isBackground: false, min: isText ? 4.5 : 3 };
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-icon-lg rounded-control border border-default"
      style={{ background: color }}
    />
  );
}

function Ratio({ value, min }: { value: number | null; min: number }) {
  if (value === null) return <span className="text-subtle">n/a</span>;
  const passes = value >= min;
  return (
    <span className="flex items-center gap-xs">
      <span className="tabular-nums">{value.toFixed(2)}:1</span>
      <Badge tone={passes ? "positive" : "neutral"}>
        {passes ? `meets ${String(min)}:1` : `under ${String(min)}:1`}
      </Badge>
    </span>
  );
}

/** Semantic colors in a group, with swatches and contrast. */
export function ColorTokens({ prefix }: { prefix: string }) {
  return (
    <TokenScope>
      {(context) => {
        const tokens = resolved(context);
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Token</TableHead>
                <TableHead scope="col">Value</TableHead>
                <TableHead scope="col">Contrast</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {names(prefix).map((name) => {
                const value = tokens[name];
                const { against, isBackground, min } = pairing(name);
                // Translucent backgrounds (hover, scrim) sit on the surface.
                const ratio = isBackground
                  ? contrast(tokens[against], value, tokens["color.bg.surface"])
                  : contrast(value, tokens[against]);
                return (
                  <TableRow key={name}>
                    <TableCell>
                      <span className="flex items-center gap-sm">
                        <Swatch color={value} />
                        <span className="flex flex-col">
                          <span className="font-mono text-caption text-default">{name}</span>
                          <span className="font-mono text-caption text-subtle">
                            {cssVars[name]}
                          </span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-caption">{value}</TableCell>
                    <TableCell className="whitespace-normal">
                      {EXEMPT[name] ? (
                        <span className="text-caption text-subtle">{EXEMPT[name]}</span>
                      ) : (
                        <span className="flex flex-col gap-2xs">
                          <Ratio value={ratio} min={min} />
                          <span className="text-caption text-subtle">
                            {isBackground ? `${against} on it` : `on ${against}`}
                          </span>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      }}
    </TokenScope>
  );
}

/** The chart palette as swatches, each with its contrast on the chart surface. */
export function ChartPalette() {
  return (
    <TokenScope>
      {(context) => {
        const tokens = resolved(context);
        const slots = names("color.chart.");
        return (
          <ul className="grid gap-sm sm:grid-cols-2">
            {slots.map((name) => (
              <li key={name} className="flex items-center gap-sm">
                <Swatch color={tokens[name]} />
                <span className="flex flex-col">
                  <span className="font-mono text-caption text-default">{name}</span>
                  <Ratio value={contrast(tokens[name], tokens["color.bg.surface"])} min={3} />
                </span>
              </li>
            ))}
          </ul>
        );
      }}
    </TokenScope>
  );
}

/** Any other group (spacing, sizes, radii, motion, component tokens) as name and value. */
export function ValueTokens({ prefixes, bar = false }: { prefixes: string[]; bar?: boolean }) {
  return (
    <TokenScope>
      {(context) => {
        const tokens = resolved(context);
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Token</TableHead>
                <TableHead scope="col">Value</TableHead>
                {bar && <TableHead scope="col">Size</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {prefixes.flatMap(names).map((name) => (
                <TableRow key={name}>
                  <TableCell>
                    <span className="flex flex-col">
                      <span className="font-mono text-caption text-default">{name}</span>
                      <span className="font-mono text-caption text-subtle">{cssVars[name]}</span>
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-caption whitespace-normal">
                    {tokens[name]}
                  </TableCell>
                  {bar && (
                    <TableCell>
                      <span
                        aria-hidden
                        className="block h-(--pl-size-icon-sm) rounded-indicator bg-accent"
                        style={{ width: `var(${cssVars[name]})` }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }}
    </TokenScope>
  );
}
