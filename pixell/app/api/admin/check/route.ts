import { NextResponse } from "next/server";

export const dynamic = "force-static";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ITFest2026!Admin";
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || ADMIN_PASSWORD;

function isValidAdminToken(token?: string) {
  if (!token) return false;
  const expected = createHmac("sha256", ADMIN_TOKEN_SECRET)
    .update(`${ADMIN_USER.toLowerCase()}|admin`)
    .digest("hex");
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return tokenBuffer.length === expectedBuffer.length && timingSafeEqual(tokenBuffer, expectedBuffer);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (isValidAdminToken(session?.value)) {
      return NextResponse.json({ authenticated: true }, { headers: { "Cache-Control": "no-store" } });
    }
  } catch (err) {
    console.error("Check route error:", err);
  }

  return NextResponse.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
}
