import { NextRequest, NextResponse } from "next/server";

// Edge-compatible SHA-256 helper.
async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const COOKIE = "jp26_auth";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isRoom = path.startsWith("/rooms/japan2026");
  const isDoc  = path.startsWith("/docs/japan2026") || path.startsWith("/japan2026/source");
  const isApi  = path.startsWith("/api/japan2026");

  // Auth route is always reachable.
  if (path.startsWith("/api/japan2026/auth")) return NextResponse.next();

  // Ingestion via x-jp26-pin header (server-to-server / scripts).
  const pin = process.env.JP26_PIN;
  if (!pin) {
    // Misconfigured. Fail closed on protected routes.
    if (isRoom || isDoc || isApi) {
      return new NextResponse("Room locked: JP26_PIN not configured", { status: 503 });
    }
    return NextResponse.next();
  }

  const expected = await sha256Hex(pin);

  if (isApi) {
    const headerPin = req.headers.get("x-jp26-pin");
    if (headerPin && headerPin === pin) return NextResponse.next();
    const cookieVal = req.cookies.get(COOKIE)?.value;
    if (cookieVal === expected) return NextResponse.next();
    return new NextResponse(JSON.stringify({ locked: true }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (isDoc) {
    const cookieVal = req.cookies.get(COOKIE)?.value;
    if (cookieVal === expected) return NextResponse.next();
    return new NextResponse("Not found", { status: 404 });
  }

  // For the room page itself, let it through. The client renders the pin gate.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/rooms/japan2026/:path*",
    "/docs/japan2026/:path*",
    "/japan2026/source/:path*",
    "/api/japan2026/:path*",
  ],
};
