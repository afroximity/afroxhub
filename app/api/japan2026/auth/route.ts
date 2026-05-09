import { NextRequest, NextResponse } from "next/server";

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const COOKIE = "jp26_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  const pin = process.env.JP26_PIN;
  if (!pin) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }
  let body: { pin?: string } = {};
  try { body = await req.json(); } catch {}
  if (!body.pin || body.pin !== pin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const tok = await sha256Hex(pin);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${COOKIE}=${tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`,
    },
  });
}

export async function DELETE() {
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
