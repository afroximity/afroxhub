import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { createHash } from "crypto";
import { cache } from "react";
import ts from "typescript";
import type { LoadedComponent, RoomManifest } from "@/types/content";

const ROOMS_DIR = path.join(process.cwd(), "content/rooms");
const MANIFEST_FILENAMES = ["index.ts", "index.tsx", "index.js"];
const ROOM_ENTRY_FILENAMES = ["Room.tsx", "Room.ts", "Room.jsx", "Room.js"];
const CACHE_DIR = path.join(process.cwd(), ".next", "cache", "afroxhub", "rooms");

async function findManifestPath(slug: string) {
  for (const filename of MANIFEST_FILENAMES) {
    const candidate = path.join(ROOMS_DIR, slug, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function transpileIfNeeded(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  if (ext !== ".ts" && ext !== ".tsx") return filePath;

  const source = await fs.promises.readFile(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filePath,
  });

  const hash = createHash("sha1").update(filePath + source).digest("hex");
  await fs.promises.mkdir(CACHE_DIR, { recursive: true });
  const compiledPath = path.join(
    CACHE_DIR,
    `${path.basename(filePath, ext)}-${hash}.mjs`,
  );
  await fs.promises.writeFile(compiledPath, outputText, "utf8");
  return compiledPath;
}

async function dynamicImport(modulePath: string) {
  const compiledPath = await transpileIfNeeded(modulePath);
  try {
    return import(/* webpackIgnore: true */ pathToFileURL(compiledPath).href);
  } catch (error) {
    console.error(`Failed to import module at ${modulePath}`, error);
    throw error;
  }
}

async function findEntryComponent(baseDir: string) {
  for (const filename of ROOM_ENTRY_FILENAMES) {
    const candidate = path.join(baseDir, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function importManifest(filePath: string): Promise<RoomManifest | null> {
  try {
    const mod = await dynamicImport(filePath);
    const manifest = mod.default as RoomManifest;
    const baseDir = path.dirname(filePath);
    const entryPath = await findEntryComponent(baseDir);
    if (entryPath) {
      manifest.component = () => dynamicImport(entryPath);
    }
    return manifest;
  } catch (error) {
    console.error(`Failed to import room manifest at ${filePath}`, error);
    return null;
  }
}

export const listRooms = cache(async (): Promise<RoomManifest[]> => {
  const entries = await fs.promises
    .readdir(ROOMS_DIR, { withFileTypes: true })
    .catch(() => []);

  const manifests: RoomManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = await findManifestPath(entry.name);
    if (!manifestPath) continue;
    const manifest = await importManifest(manifestPath);
    if (manifest) manifests.push(manifest);
  }

  return manifests.sort((a, b) => a.title.localeCompare(b.title));
});

export const getRoomManifest = cache(
  async (slug: string): Promise<RoomManifest | null> => {
    const manifestPath = await findManifestPath(slug);
    if (!manifestPath) return null;
    return importManifest(manifestPath);
  },
);

type ManifestModule = {
  default?: LoadedComponent;
};

function extractComponent(
  imported: ManifestModule | LoadedComponent,
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
