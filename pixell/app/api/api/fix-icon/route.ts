import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-static";
export const revalidate = 0;

export async function GET() {
  try {
    const logoPath = path.join(process.cwd(), "public", "logos", "logo_navbar.png");
    const appFaviconPath = path.join(process.cwd(), "app", "favicon.ico");
    const appIconPath = path.join(process.cwd(), "app", "icon.png");

    const logoBuffer = await fs.readFile(logoPath);
    await fs.writeFile(appFaviconPath, logoBuffer);
    await fs.writeFile(appIconPath, logoBuffer);

    return NextResponse.json({
      success: true,
      message: "app/favicon.ico & app/icon.png successfully replaced with logo_navbar.png Hexagon Logo!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
