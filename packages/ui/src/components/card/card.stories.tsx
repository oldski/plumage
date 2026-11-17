import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A surface that groups related content.

**Do**
- Use one card per idea: a holding, a chart, a note.
- Render the title as a heading with \`<CardTitle asChild><h2>\` when the card is a page section.

**Don't**
- Nest cards. Use \`Separator\` or spacing inside one card instead.
- Add padding by hand; \`card.padding\` already follows density.

**Accessibility**
- A plain \`div\` by default; give it a heading (or \`aria-labelledby\`) when it acts as a region.
- The outline is decorative (\`color.border.default\`), so the card relies on spacing and elevation too.
`,
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-overlay-md">
      <CardHeader>
        <CardTitle asChild>
          <h2>Total value</h2>
        </CardTitle>
        <CardDescription>Agentic account, as of the last snapshot</CardDescription>
        <CardAction>
          <Badge tone="positive">Up 1.2%</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="display-figure">$48,210.55</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="secondary">
          Snapshot now
        </Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      storyCanvas(canvasElement).getByRole("heading", { name: "Total value" }),
    ).toBeVisible();
  },
};
