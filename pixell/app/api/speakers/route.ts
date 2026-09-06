import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import {
  getSpeakersStore,
  addSpeakerStore,
  updateSpeakerStore,
  deleteSpeakerStore,
} from "@/lib/speakers-store";

let cachedSpeakersData: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 5000; // 5s TTL

function invalidateSpeakersCache() {
  cachedSpeakersData = null;
}

export async function GET() {
  if (cachedSpeakersData && Date.now() - cachedSpeakersData.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedSpeakersData.data, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20" },
    });
  }

  try {
    const speakers = await getSpeakersStore();
    const result = { success: true, speakers };
    cachedSpeakersData = { data: result, timestamp: Date.now() };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20" },
    });
  } catch (error) {
    console.error("Speakers API error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pemateri" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    invalidateSpeakersCache();
    const body = await request.json();
    const { name, role, category, photo, cv, color } = body;

    if (!name || !role) {
      return NextResponse.json(
        { error: "Nama dan Peran/Jabatan pemateri wajib diisi" },
        { status: 400 }
      );
    }

    const newSpeaker = await addSpeakerStore({
      name: name.trim(),
      role: role.trim(),
      category: category || "speaker",
      photo: photo || undefined,
      cv: cv || undefined,
      color: color || "pink",
    });

    return NextResponse.json({ success: true, speaker: newSpeaker }, { status: 201 });
  } catch (error) {
    console.error("POST speaker error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data pemateri" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    invalidateSpeakersCache();
    const body = await request.json();
    const { id, name, role, category, photo, cv, color } = body;

    if (!id) {
      return NextResponse.json({ error: "ID pemateri wajib disertakan" }, { status: 400 });
    }

    const updated = await updateSpeakerStore(id, {
      ...(name && { name: name.trim() }),
      ...(role && { role: role.trim() }),
      ...(category && { category }),
      ...(photo !== undefined && { photo }),
      ...(cv !== undefined && { cv }),
      ...(color && { color }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Pemateri tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, speaker: updated });
  } catch (error) {
    console.error("PUT speaker error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data pemateri" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    invalidateSpeakersCache();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID pemateri wajib disertakan" }, { status: 400 });
    }

    const deleted = await deleteSpeakerStore(id);
    if (!deleted) {
      return NextResponse.json({ error: "Pemateri tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Pemateri berhasil dihapus" });
  } catch (error) {
    console.error("DELETE speaker error:", error);
    return NextResponse.json({ error: "Gagal menghapus data pemateri" }, { status: 500 });
  }
}
