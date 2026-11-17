import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../stories/story-canvas";
import { Badge } from "../components/badge/badge";
import { Button } from "../components/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card/card";
import { PlumageProvider } from "./plumage-provider";

const meta = {
  title: "Foundations/PlumageProvider",
  component: PlumageProvider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Sets brand, mode, and density for everything inside it.

- **Root scope** (default) writes \`data-brand\`, \`data-theme\`, and \`data-density\` on \`<html>\`, so overlays that portal to \`<body>\` are themed too. Use one at the top of an app.
- **Local scope** renders a \`<div>\` with those attributes and portals overlays into it. Use for previews, embeds, or an inverse section.
- Nested providers inherit brand and mode from their parent. Density defaults to the brand's own (Finch compact, the others comfortable).
- \`mode="system"\` follows \`prefers-color-scheme\` and updates live.

\`usePlumage()\` returns the active brand, mode, resolved mode, and density.
`,
      },
    },
  },
} satisfies Meta<typeof PlumageProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Sample({ label }: { label: string }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Same components, different scope.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-sm">
        <Button size="sm">Analyze</Button>
        <Button size="sm" variant="secondary">
          Snapshot now
        </Button>
        <Badge tone="positive">Up 1.2%</Badge>
      </CardContent>
    </Card>
  );
}

/** Local scopes nested inside the toolbar's scope: each re-themes only its subtree. */
export const NestedScopes: Story = {
  render: () => (
    <div className="grid gap-md md:grid-cols-3">
      <Sample label="Inherits the toolbar" />
      <PlumageProvider scope="local" mode="dark" className="rounded-container p-inset-md">
        <Sample label="Dark section" />
      </PlumageProvider>
      <PlumageProvider
        scope="local"
        brand="sparrow"
        mode="light"
        className="rounded-container p-inset-md"
      >
        <Sample label="Sparrow embed" />
      </PlumageProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const embed = canvas.getByText("Sparrow embed").closest("[data-brand]");
    await expect(embed).toHaveAttribute("data-brand", "sparrow");
    await expect(embed).toHaveAttribute("data-density", "comfortable");
  },
};
