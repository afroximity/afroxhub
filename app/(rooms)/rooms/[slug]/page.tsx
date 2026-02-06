import { notFound } from "next/navigation";
import { getRoomManifest } from "@/lib/rooms";
import RoomRenderer from "./RoomRenderer";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolved = await params;
  const slug = decodeURIComponent(resolved.slug);
  const manifest = await getRoomManifest(slug);
  if (!manifest) notFound();

  return <RoomRenderer slug={slug} />;
}
