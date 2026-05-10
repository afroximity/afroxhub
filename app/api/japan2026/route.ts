import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS room_checklist (
      room       TEXT        NOT NULL,
      key        TEXT        NOT NULL,
      checked    BOOLEAN     NOT NULL DEFAULT false,
      user_name  TEXT,
      checked_at TIMESTAMPTZ,
      PRIMARY KEY (room, key)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS room_checklist_users (
      room       TEXT        NOT NULL,
      key        TEXT        NOT NULL,
      user_name  TEXT        NOT NULL,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (room, key, user_name)
    )
  `;
  // One-shot idempotent backfill so existing single-user checks survive the
  // move to the per-user table. ON CONFLICT DO NOTHING means re-runs are no-ops.
  await sql`
    INSERT INTO room_checklist_users (room, key, user_name, checked_at)
    SELECT room, key, user_name, COALESCE(checked_at, now())
    FROM room_checklist
    WHERE checked = true AND user_name IS NOT NULL AND user_name <> '?'
    ON CONFLICT DO NOTHING
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS room_activity (
      id         SERIAL PRIMARY KEY,
      room       TEXT        NOT NULL,
      user_name  TEXT        NOT NULL,
      action     TEXT        NOT NULL,
      label      TEXT        NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS room_notes (
      room      TEXT NOT NULL,
      day_index INT  NOT NULL,
      text      TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (room, day_index)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS room_checklist_schema (
      room   TEXT PRIMARY KEY,
      schema JSONB NOT NULL DEFAULT '[]'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS room_itinerary (
      room TEXT PRIMARY KEY,
      days JSONB NOT NULL DEFAULT '[]'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS room_documents (
      room          TEXT NOT NULL,
      id            TEXT NOT NULL,
      slug          TEXT NOT NULL,
      owner         TEXT NOT NULL,
      category      TEXT NOT NULL,
      doc_type      TEXT NOT NULL,
      lang          TEXT,
      title         TEXT NOT NULL,
      original_name TEXT NOT NULL,
      public_path   TEXT NOT NULL,
      size_bytes    INT  NOT NULL,
      mime          TEXT NOT NULL,
      meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
      ingested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (room, id)
    )
  `;
}

const ROOM = "japan2026";

export async function GET(req: NextRequest) {
  await ensureTables();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "checklist") {
    const rows = await sql`
      SELECT key, user_name, checked_at
      FROM room_checklist_users WHERE room = ${ROOM}
      ORDER BY key, checked_at
    `;
    const data: Record<string, { v: boolean; checks: Array<{ u: string; t: string; d: string }> }> = {};
    for (const r of rows) {
      const at = new Date(r.checked_at);
      const entry = {
        u: r.user_name as string,
        t: at.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        d: at.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      };
      const bucket = data[r.key] ?? { v: true, checks: [] };
      bucket.checks.push(entry);
      data[r.key] = bucket;
    }
    return NextResponse.json(data);
  }

  if (type === "activity") {
    const rows = await sql`
      SELECT user_name, action, label, created_at
      FROM room_activity WHERE room = ${ROOM}
      ORDER BY created_at DESC LIMIT 60
    `;
    return NextResponse.json(rows.map(r => ({
      user: r.user_name,
      action: r.action,
      label: r.label,
      time: new Date(r.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      date: new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
    })));
  }

  if (type === "notes") {
    const day = searchParams.get("day");
    if (!day) return NextResponse.json({ error: "missing day" }, { status: 400 });
    const rows = await sql`
      SELECT text FROM room_notes WHERE room = ${ROOM} AND day_index = ${parseInt(day)}
    `;
    return NextResponse.json({ text: rows[0]?.text ?? "" });
  }

  if (type === "checklist_schema") {
    const rows = await sql`SELECT schema FROM room_checklist_schema WHERE room = ${ROOM}`;
    return NextResponse.json(rows[0]?.schema ?? null);
  }

  if (type === "itinerary") {
    const rows = await sql`SELECT days FROM room_itinerary WHERE room = ${ROOM}`;
    return NextResponse.json(rows[0]?.days ?? null);
  }

  if (type === "documents") {
    const rows = await sql`
      SELECT id, slug, owner, category, doc_type, lang, title, original_name,
             public_path, size_bytes, mime, meta, ingested_at
      FROM room_documents WHERE room = ${ROOM}
      ORDER BY category, owner, title
    `;
    return NextResponse.json(rows);
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  await ensureTables();
  const body = await req.json();
  const { type } = body;

  if (type === "checklist_reset") {
    await sql`DELETE FROM room_checklist WHERE room = ${ROOM}`;
    return NextResponse.json({ ok: true });
  }

  if (type === "full_reset") {
    await sql`DELETE FROM room_checklist        WHERE room = ${ROOM}`;
    await sql`DELETE FROM room_activity         WHERE room = ${ROOM}`;
    await sql`DELETE FROM room_notes            WHERE room = ${ROOM}`;
    await sql`DELETE FROM room_checklist_schema WHERE room = ${ROOM}`;
    await sql`DELETE FROM room_itinerary        WHERE room = ${ROOM}`;
    await sql`DELETE FROM room_documents        WHERE room = ${ROOM}`;
    return NextResponse.json({ ok: true });
  }

  if (type === "documents_reset") {
    await sql`DELETE FROM room_documents WHERE room = ${ROOM}`;
    return NextResponse.json({ ok: true });
  }

  if (type === "document_delete") {
    const { id } = body;
    await sql`DELETE FROM room_documents WHERE room = ${ROOM} AND id = ${id}`;
    return NextResponse.json({ ok: true });
  }

  if (type === "documents") {
    const { docs } = body as { docs: Array<{
      id: string; slug: string; owner: string; category: string;
      doc_type: string; lang: string | null; title: string;
      original_name: string; public_path: string; size_bytes: number;
      mime: string; meta: Record<string, unknown>;
    }> };
    for (const d of docs) {
      const meta = JSON.stringify(d.meta ?? {});
      await sql`
        INSERT INTO room_documents (room, id, slug, owner, category, doc_type, lang, title,
                                    original_name, public_path, size_bytes, mime, meta)
        VALUES (${ROOM}, ${d.id}, ${d.slug}, ${d.owner}, ${d.category}, ${d.doc_type},
                ${d.lang}, ${d.title}, ${d.original_name}, ${d.public_path},
                ${d.size_bytes}, ${d.mime}, ${meta}::jsonb)
        ON CONFLICT (room, id) DO UPDATE SET
          slug = ${d.slug}, owner = ${d.owner}, category = ${d.category},
          doc_type = ${d.doc_type}, lang = ${d.lang}, title = ${d.title},
          original_name = ${d.original_name}, public_path = ${d.public_path},
          size_bytes = ${d.size_bytes}, mime = ${d.mime}, meta = ${meta}::jsonb,
          ingested_at = now()
      `;
    }
    return NextResponse.json({ ok: true, count: docs.length });
  }

  if (type === "checklist") {
    const { key, checked, user } = body as { key: string; checked: boolean; user: string };
    if (!user || user === "?") return NextResponse.json({ error: "missing user" }, { status: 400 });
    if (checked) {
      await sql`
        INSERT INTO room_checklist_users (room, key, user_name, checked_at)
        VALUES (${ROOM}, ${key}, ${user}, now())
        ON CONFLICT (room, key, user_name) DO UPDATE SET checked_at = now()
      `;
    } else {
      await sql`
        DELETE FROM room_checklist_users
        WHERE room = ${ROOM} AND key = ${key} AND user_name = ${user}
      `;
    }
    return NextResponse.json({ ok: true });
  }

  if (type === "activity") {
    const { user, action, label } = body;
    await sql`
      INSERT INTO room_activity (room, user_name, action, label)
      VALUES (${ROOM}, ${user}, ${action}, ${label})
    `;
    return NextResponse.json({ ok: true });
  }

  if (type === "notes") {
    await sql`
      INSERT INTO room_notes (room, day_index, text)
      VALUES (${ROOM}, ${body.day}, ${body.text})
      ON CONFLICT (room, day_index) DO UPDATE SET text = ${body.text}
    `;
    return NextResponse.json({ ok: true });
  }

  if (type === "checklist_schema") {
    const schema = JSON.stringify(body.schema);
    await sql`
      INSERT INTO room_checklist_schema (room, schema)
      VALUES (${ROOM}, ${schema}::jsonb)
      ON CONFLICT (room) DO UPDATE SET schema = ${schema}::jsonb
    `;
    return NextResponse.json({ ok: true });
  }

  if (type === "itinerary") {
    const days = JSON.stringify(body.days);
    await sql`
      INSERT INTO room_itinerary (room, days)
      VALUES (${ROOM}, ${days}::jsonb)
      ON CONFLICT (room) DO UPDATE SET days = ${days}::jsonb
    `;
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}
