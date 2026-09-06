import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"];
const ALLOWED_PDF_TYPE = "application/pdf";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function isPdfFile(file: File) {
  const fileName = file.name.toLowerCase();
  const fileType = (file.type || "").toLowerCase();
  return fileType === ALLOWED_PDF_TYPE || fileType.includes("pdf") || fileName.endsWith(".pdf");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = (formData.get("type") as string) || "image"; // "image" or "guidebook"

    if (!file) {
      return NextResponse.json({ error: "File belum dipilih" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    const isGuidebook = fileType === "guidebook";

    // Validate file type
    if (isGuidebook) {
      if (!isPdfFile(file)) {
        return NextResponse.json(
          { error: "File guidebook harus berupa PDF (.pdf)" },
          { status: 400 }
        );
      }
    } else {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "File harus berupa gambar (PNG, SVG, JPG, WEBP)" },
          { status: 400 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload directory
    const subDir = isGuidebook ? "guidebooks" : "";
    const uploadsDir = path.join(process.cwd(), "public", "uploads", subDir);
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExt = path.extname(file.name) || (isGuidebook ? ".pdf" : ".png");
    const safeBaseName = path
      .basename(file.name, fileExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const filename = `${safeBaseName}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    // Return served URL
    const urlPath = isGuidebook ? `/uploads/guidebooks/${filename}` : `/uploads/${filename}`;
    const apiServedUrl = isGuidebook ? `/api/uploads/guidebooks/${filename}` : `/api/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: apiServedUrl,
      publicUrl: urlPath,
      apiServedUrl,
      filename,
      isGuidebook,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
