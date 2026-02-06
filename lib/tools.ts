import { cache } from "react";
import type { LoadedComponent, ToolManifest } from "@/types/content";
import { toolManifestRegistry } from "@/content/tools/manifestRegistry";

type ManifestModule = {
  default?: ToolManifest;
};

async function importManifest(
  loader: () => Promise<ManifestModule | ToolManifest>,
): Promise<ToolManifest | null> {
  try {
    const mod = await loader();
    return (mod as ManifestModule).default ?? (mod as ToolManifest);
  } catch (error) {
    console.error("Failed to import tool manifest", error);
    return null;
  }
}

export const listTools = cache(async (): Promise<ToolManifest[]> => {
  const manifests: ToolManifest[] = [];
  for (const loader of Object.values(toolManifestRegistry)) {
    const manifest = await importManifest(loader);
    if (manifest) manifests.push(manifest);
  }

  return manifests.sort((a, b) => a.title.localeCompare(b.title));
});

export const getToolManifest = cache(
  async (slug: string): Promise<ToolManifest | null> => {
    const loader =
      toolManifestRegistry[slug as keyof typeof toolManifestRegistry];
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

export async function loadToolComponent(
  manifest: ToolManifest,
): Promise<LoadedComponent> {
  const imported = await manifest.component();
  return extractComponent(imported as ManifestModule | LoadedComponent);
}
