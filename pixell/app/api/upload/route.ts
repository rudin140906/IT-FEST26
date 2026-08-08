import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File gambar belum dipilih" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar (PNG, SVG, JPG, WEBP)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExt = path.extname(file.name) || ".png";
    const safeBaseName = path
      .basename(file.name, fileExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const filename = `${safeBaseName}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    // Return served API URL (/api/uploads/filename.ext) which is lightweight and reliable
    const apiServedUrl = `/api/uploads/${filename}`;
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: apiServedUrl,
      publicUrl,
      apiServedUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file gambar" }, { status: 500 });
  }
}
