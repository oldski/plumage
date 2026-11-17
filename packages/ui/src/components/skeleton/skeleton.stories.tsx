import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Card, CardContent, CardHeader } from "../card/card";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A placeholder in the shape of content that is still loading.

**Do**
- Match the shape and size of what will replace it, so the layout does not jump.
- Mark the loading region with \`aria-busy="true"\` and a label.

**Don't**
- Show skeletons for less than about 300ms; a quick swap flickers.

**Accessibility**
- Skeletons are \`aria-hidden\`; the region's \`aria-busy\` and label tell assistive tech what is happening.
- The pulse stops under \`prefers-reduced-motion\`, because its duration derives from the brand's motion tokens.
`,
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingCard: Story = {
  render: () => (
    <section aria-label="Total value" aria-busy="true">
      <Card className="max-w-overlay-md">
        <CardHeader>
          <Skeleton className="h-row-sm w-1/3" />
          <Skeleton className="h-control-sm w-2/3" />
        </CardHeader>
        <CardContent className="flex flex-col gap-sm">
          <Skeleton className="h-row-lg w-1/2" />
          <Skeleton className="h-control-md w-full" />
        </CardContent>
      </Card>
    </section>
  ),
  play: async ({ canvasElement }) => {
    await expect(storyCanvas(canvasElement).getByRole("region")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  },
};
