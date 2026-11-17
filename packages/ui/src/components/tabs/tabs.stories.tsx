import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: { defaultValue: "holding" },
  parameters: {
    docs: {
      description: {
        component: `
Switches between views of related content in the same place.

**Do**
- Keep labels short and parallel ("By holding", "By sector").
- Use the \`line\` variant at the top of a page and \`default\` inside cards.

**Don't**
- Use tabs for sequential steps, or for navigation between pages.

**Accessibility**
- Arrow keys move between tabs (automatic activation); Tab moves into the panel.
- The selected tab is marked with \`aria-selected\`, plus a surface (default) or an underline in the text-safe accent (line), which meets 3:1.
`,
      },
    },
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Allocation view">
        <TabsTrigger value="holding">By holding</TabsTrigger>
        <TabsTrigger value="sector">By sector</TabsTrigger>
        <TabsTrigger value="type">By asset type</TabsTrigger>
      </TabsList>
      <TabsContent value="holding">Allocation grouped by holding.</TabsContent>
      <TabsContent value="sector">Allocation grouped by sector.</TabsContent>
      <TabsContent value="type">Allocation grouped by asset type.</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "By holding" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "By sector" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Allocation grouped by sector.");
  },
};

export const Line: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="line" aria-label="Allocation view">
        <TabsTrigger value="holding">By holding</TabsTrigger>
        <TabsTrigger value="sector">By sector</TabsTrigger>
        <TabsTrigger value="type">By asset type</TabsTrigger>
      </TabsList>
      <TabsContent value="holding">Allocation grouped by holding.</TabsContent>
      <TabsContent value="sector">Allocation grouped by sector.</TabsContent>
      <TabsContent value="type">Allocation grouped by asset type.</TabsContent>
    </Tabs>
  ),
};
