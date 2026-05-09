export const roomRegistry = {
  "kira-minimalist-murders": () => import("./kira-minimalist-murders/Room"),
  "japan2026": () => import("./japan2026/Room"),
};

export type RoomSlug = keyof typeof roomRegistry;
