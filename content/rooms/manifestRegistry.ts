export const roomManifestRegistry = {
  "kira-minimalist-murders": () => import("./kira-minimalist-murders/index"),
  "allocation-review": () => import("./allocation-review/index"),
};

export type RoomManifestSlug = keyof typeof roomManifestRegistry;
