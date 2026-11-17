import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { FileDropzone } from "./file-dropzone";

const meta = {
  title: "Patterns/FileDropzone",
  component: FileDropzone,
  tags: ["autodocs"],
  args: {
    label: "Drop a CSV here, or choose a file",
    description: "Account activity report, CSV, up to 5 MB",
    accept: ".csv,text/csv",
    maxSize: 5_000_000,
    onFiles: fn(),
  },
  parameters: {
    docs: {
      description: {
        component: `
A drop target built around a real file input.

**Do**
- Say what to drop and the limits, in words, in \`label\` and \`description\`.
- Pass \`accept\` and \`maxSize\`; rejected files are explained instead of ignored.

**Don't**
- Make drag and drop the only way in. The zone is also a button for the file picker.

**Accessibility**
- The native input is visually hidden but focusable: Tab to the zone, then Enter or Space opens the picker, and the zone shows the focus ring.
- Rejection messages are announced through a polite live region and linked to the input.
`,
      },
    },
  },
  render: (args) => (
    <div className="max-w-overlay-md">
      <FileDropzone {...args} />
    </div>
  ),
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const input = canvas.getByLabelText(/Drop a CSV here/);
    await userEvent.upload(input, new File(["a,b"], "activity.csv", { type: "text/csv" }));
    await expect(args.onFiles).toHaveBeenCalledTimes(1);
  },
};

export const RejectsOtherTypes: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const input = canvas.getByLabelText(/Drop a CSV here/);
    await userEvent.upload(
      input,
      new File(["%PDF"], "statement.pdf", { type: "application/pdf" }),
      {
        applyAccept: false,
      },
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "statement.pdf is not an accepted file type.",
    );
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = { args: { disabled: true } };
