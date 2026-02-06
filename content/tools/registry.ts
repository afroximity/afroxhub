export const toolRegistry = {
  "water-tracker": () => import("./water-tracker/Tool"),
  "autophagy-tracker": () => import("./autophagy-tracker/Tool"),
};

export type ToolSlug = keyof typeof toolRegistry;
