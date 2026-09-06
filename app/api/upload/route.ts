import { NextResponse } from "next/server";
import path from "path";
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
          { error: "File harus berupa gambar (PNG, SVG, JPG, WEBP)" },
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

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || (isGuidebook ? "application/pdf" : "image/png"),
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase storage upload error:", uploadError.message);
      // If bucket doesn't exist yet, return helpful error
      return NextResponse.json(
        {
          error: `Gagal upload ke Supabase Storage (${uploadError.message}). Pastikan bucket '${STORAGE_BUCKET}' sudah dibuat dan di-set Public di Supabase Storage Dashboard.`,
        },
        { status: 500 }
      );
    }

    // Get public URL from Supabase Storage
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
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}
