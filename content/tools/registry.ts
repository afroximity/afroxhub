export const toolRegistry = {
  "water-tracker": () => import("./water-tracker/Tool"),
  "autophagy-tracker": () => import("./autophagy-tracker/Tool"),
  "discord-delay-calculator": () => import("./discord-delay-calculator/Tool"),
};

export type ToolSlug = keyof typeof toolRegistry;
