import { within } from "storybook/test";

/**
 * Queries scoped to a story's own content. Storybook's "All brands and
 * modes" view renders a story once per brand and mode, each copy marked with
 * data-story-copy; play functions act on the first copy. In the normal view
 * this is just the canvas.
 */
export function storyCanvas(canvasElement: HTMLElement) {
  return within(canvasElement.querySelector<HTMLElement>("[data-story-copy]") ?? canvasElement);
}

/**
 * Wait for an overlay to finish its exit animation and unmount. Exits take
 * 100 to 250ms, but a busy or backgrounded browser throttles animation
 * frames, so allow well beyond the default 1s.
 */
export const EXIT_TIMEOUT = { timeout: 5000 };
