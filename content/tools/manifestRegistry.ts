export const toolManifestRegistry = {
  "water-tracker": () => import("./water-tracker/index"),
  "autophagy-tracker": () => import("./autophagy-tracker/index"),
  "discord-delay-calculator": () =>
    import("./discord-delay-calculator/index"),
};

export type ToolManifestSlug = keyof typeof toolManifestRegistry;
