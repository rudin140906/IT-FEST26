import { NextResponse } from "next/server";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ITFest2026!Admin";
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || ADMIN_PASSWORD;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan Password wajib diisi" },
        { status: 400 }
      );
    }

    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true, message: "Login berhasil" });
      const token = createHmac("sha256", ADMIN_TOKEN_SECRET)
        .update(`${ADMIN_USER.toLowerCase()}|admin`)
        .digest("hex");

      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return NextResponse.json(
      { error: "Username atau Password salah!" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
