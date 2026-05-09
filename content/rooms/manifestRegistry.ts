export const roomManifestRegistry = {
  "kira-minimalist-murders": () => import("./kira-minimalist-murders/index"),
  "japan2026": () => import("./japan2026/index"),
};

export type RoomManifestSlug = keyof typeof roomManifestRegistry;
