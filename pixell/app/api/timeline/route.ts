import { NextResponse } from "next/server";
import {
  getTimelineStore,
  addTimelineStore,
  updateTimelineStore,
  deleteTimelineStore,
} from "@/lib/timeline-store";

export async function GET() {
  try {
    const items = await getTimelineStore();
    return NextResponse.json({ success: true, timeline: items });
  } catch (error) {
    console.error("GET timeline error:", error);
    return NextResponse.json({ error: "Gagal mengambil data timeline" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date, category, badgeColor } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Judul dan Tanggal agenda wajib diisi!" }, { status: 400 });
    }

    const newItem = await addTimelineStore({
      title: title.trim(),
      date: date.trim(),
      category: category?.trim() || "AGENDAR",
      badgeColor: badgeColor || "pink",
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("POST timeline error:", error);
    return NextResponse.json({ error: "Gagal menambah acara timeline" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, date, category, badgeColor } = body;

    if (!id) {
      return NextResponse.json({ error: "ID acara wajib disertakan" }, { status: 400 });
    }

    const updatedItem = await updateTimelineStore(Number(id), {
      ...(title && { title: title.trim() }),
      ...(date && { date: date.trim() }),
      ...(category && { category: category.trim() }),
      ...(badgeColor && { badgeColor }),
    });

    if (!updatedItem) {
      return NextResponse.json({ error: "Acara timeline tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("PUT timeline error:", error);
    return NextResponse.json({ error: "Gagal memperbarui acara timeline" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json({ error: "ID acara wajib disertakan" }, { status: 400 });
    }

    const deleted = await deleteTimelineStore(Number(idParam));

    if (!deleted) {
      return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Acara timeline berhasil dihapus" });
  } catch (error) {
    console.error("DELETE timeline error:", error);
    return NextResponse.json({ error: "Gagal menghapus acara timeline" }, { status: 500 });
  }
}
