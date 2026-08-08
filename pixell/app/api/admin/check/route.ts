import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (session && session.value === "authenticated") {
      return NextResponse.json({ authenticated: true });
    }

    // Fallback: check raw request Cookie header
    const rawCookie = request.headers.get("cookie") || "";
    if (rawCookie.includes("admin_session=authenticated")) {
      return NextResponse.json({ authenticated: true });
    }
  } catch (err) {
    console.error("Check route error:", err);
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
