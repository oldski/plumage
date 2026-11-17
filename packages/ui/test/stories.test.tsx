// Runs every story the way Storybook does: render, then the play function
// (the interaction test), then axe. Storybook shows the same play functions
// in its Interactions panel, so there is one source of truth for behavior.
// Testing Library does the rendering so its cleanup unmounts each story;
// stray roots would otherwise commit into later tests.
import { composeStories, setProjectAnnotations, type Decorator } from "@storybook/react-vite";
import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { clearAllMocks } from "storybook/test";
import { beforeEach, describe, it } from "vitest";
import { PlumageProvider } from "../src/provider/plumage-provider";
import { expectNoA11yViolations } from "./a11y";

const withPlumage: Decorator = (Story) => (
  <PlumageProvider brand="finch" mode="light">
    <Story />
  </PlumageProvider>
);
setProjectAnnotations({ decorators: [withPlumage] });
// fn() spies in args are shared module state; Storybook resets them per story.
beforeEach(() => {
  clearAllMocks();
});

type StoryModule = Parameters<typeof composeStories>[0];
type RunnableStory = ComponentType & {
  play?: (context: { canvasElement: HTMLElement }) => Promise<void>;
};
const modules = import.meta.glob<StoryModule>("../src/**/*.stories.tsx", { eager: true });

for (const [path, module] of Object.entries(modules)) {
  describe(path.replace(/^\.\.\/src\//, ""), () => {
    const stories = Object.entries(composeStories(module) as Record<string, RunnableStory>);
    for (const [name, Story] of stories) {
      it(`${name}: plays and passes axe`, async () => {
        const { container } = render(<Story />);
        await Story.play?.({ canvasElement: container });
        await expectNoA11yViolations(document.body);
      });
    }
  });
}
