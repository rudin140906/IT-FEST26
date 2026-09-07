import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getEventsStore, updateEventStore } from "@/lib/events-store";

let cachedEventsData: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 5000;

function invalidateEventsCache() {
  cachedEventsData = null;
}

export async function GET() {
  if (cachedEventsData && Date.now() - cachedEventsData.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedEventsData.data, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20" },
    });
  }

  try {
    const events = await getEventsStore();
    cachedEventsData = { data: events, timestamp: Date.now() };

    return NextResponse.json(events, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20" },
    });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

async function handleEventUpdate(body: any) {
  const { id, gformUrl, guidebookUrl, mascotUrl, title, description } = body;

  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (gformUrl !== undefined) updates.gformUrl = gformUrl;
  if (guidebookUrl !== undefined) updates.guidebookUrl = guidebookUrl;
  if (mascotUrl !== undefined) updates.mascotUrl = mascotUrl;
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;

  const updated = await updateEventStore(id, updates);

  if (!updated) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  invalidateEventsCache();

  return NextResponse.json({
    success: true,
    message: "Event berhasil diperbarui",
    event: updated,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return await handleEventUpdate(body);
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    return await handleEventUpdate(body);
  } catch (error) {
    console.error("Events PUT error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
