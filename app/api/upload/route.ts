import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"];
const ALLOWED_PDF_TYPE = "application/pdf";
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

function isPdfFile(file: File) {
  const fileName = file.name.toLowerCase();
  const fileType = (file.type || "").toLowerCase();
  return fileType === ALLOWED_PDF_TYPE || fileType.includes("pdf") || fileName.endsWith(".pdf");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = (formData.get("type") as string) || "image";

    if (!file) {
      return NextResponse.json({ error: "File belum dipilih" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 30MB" }, { status: 400 });
    }

    const isGuidebook = fileType === "guidebook";

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
          { error: "File harus berupa gambar (PNG, SVG, JPG, WEBP, GIF)" },
          { status: 400 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = path.extname(file.name) || (isGuidebook ? ".pdf" : ".png");
    const safeBaseName = path
      .basename(file.name, fileExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const filename = `${safeBaseName}_${Date.now()}${fileExt}`;
    const storagePath = isGuidebook ? `guidebooks/${filename}` : `uploads/${filename}`;

    // 1. Try uploading to Supabase Storage first
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || (isGuidebook ? "application/pdf" : "image/png"),
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;

        return NextResponse.json({
          success: true,
          url: publicUrl,
          publicUrl: publicUrl,
          apiServedUrl: publicUrl,
          filename,
          isGuidebook,
          storage: "supabase",
        });
      }

      console.warn("Supabase storage upload error, using local fallback:", uploadError.message);
    } catch (sbErr: any) {
      console.warn("Supabase storage exception, using local fallback:", sbErr?.message);
    }

    // 2. Fallback: Save file to local public/uploads directory
    const targetDir = path.join(process.cwd(), "public", isGuidebook ? "uploads/guidebooks" : "uploads");
    await fs.mkdir(targetDir, { recursive: true });
    const localFilePath = path.join(targetDir, filename);
    await fs.writeFile(localFilePath, buffer);

    const localUrl = `/uploads/${isGuidebook ? "guidebooks/" : ""}${filename}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      publicUrl: localUrl,
      apiServedUrl: localUrl,
      filename,
      isGuidebook,
      storage: "local",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}
