import { cache } from "react";
import type { LoadedComponent, RoomManifest } from "@/types/content";
import { roomManifestRegistry } from "@/content/rooms/manifestRegistry";

type ManifestModule = {
  default?: RoomManifest;
};

async function importManifest(
  loader: () => Promise<ManifestModule | RoomManifest>,
): Promise<RoomManifest | null> {
  try {
    const mod = await loader();
    return (mod as ManifestModule).default ?? (mod as RoomManifest);
  } catch (error) {
    console.error("Failed to import room manifest", error);
    return null;
  }
}

export const listRooms = cache(async (): Promise<RoomManifest[]> => {
  const manifests: RoomManifest[] = [];
  for (const loader of Object.values(roomManifestRegistry)) {
    const manifest = await importManifest(loader);
    if (manifest) manifests.push(manifest);
  }

  return manifests.sort((a, b) => a.title.localeCompare(b.title));
});

export const getRoomManifest = cache(
  async (slug: string): Promise<RoomManifest | null> => {
    const loader =
      roomManifestRegistry[slug as keyof typeof roomManifestRegistry];
    if (!loader) return null;
    return importManifest(loader);
  },
);

function extractComponent(
  imported: { default?: LoadedComponent } | LoadedComponent,
): LoadedComponent {
  if (typeof imported === "function") {
    return imported as LoadedComponent;
  }
  return imported.default ?? (imported as LoadedComponent);
}

export async function loadRoomComponent(
  manifest: RoomManifest,
): Promise<LoadedComponent> {
  const imported = await manifest.component();
  return extractComponent(imported as ManifestModule | LoadedComponent);
}
