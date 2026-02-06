export const roomRegistry = {
  "kira-minimalist-murders": () => import("./kira-minimalist-murders/Room"),
  "allocation-review": () => import("./allocation-review/Room"),
};

export type RoomSlug = keyof typeof roomRegistry;
