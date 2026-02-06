import { notFound } from "next/navigation";
import { getToolManifest } from "@/lib/tools";
import ToolRenderer from "./ToolRenderer";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolved = await params;
  const slug = decodeURIComponent(resolved.slug);
  const manifest = await getToolManifest(slug);
  if (!manifest) notFound();

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
          Tool
        </p>
        <h1 className="text-3xl font-semibold text-white">{manifest.title}</h1>
        {manifest.description && (
          <p className="text-slate-200">{manifest.description}</p>
        )}
      </header>
      <ToolRenderer slug={slug} />
    </div>
  );
}
