import fs from "fs/promises";
import path from "path";
import { registerEventsData, RegisterEventItem } from "@/data/register-events";
import { fetchEventsFromDB, updateEventInDB, EventDBItem } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

export interface EventStoreItem {
  id: string;
  title: string;
  category: "kompetisi" | "pelatihan" | "seminar";
  categoryLabel: string;
  description: string;
  iconType: string;
  badgeColor: "pink" | "cyan" | "yellow";
  gformUrl: string;
  guidebookUrl: string;
  mascotUrl?: string;
}

// Convert register-events fallback data to EventStoreItem
function toStoreItems(data: RegisterEventItem[]): EventStoreItem[] {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    categoryLabel: item.categoryLabel,
    description: item.description,
    iconType: item.iconType,
    badgeColor: item.badgeColor,
    gformUrl: item.gformUrl,
    guidebookUrl: "",
    mascotUrl: undefined,
  }));
}

async function readEventsFile(): Promise<EventStoreItem[] | null> {
  try {
    const fileData = await fs.readFile(EVENTS_FILE, "utf-8");
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as EventStoreItem[];
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return null;
}

async function writeEventsFile(data: EventStoreItem[]): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(EVENTS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing events.json:", error);
    return false;
  }
}

// Get all events (try MySQL first, fallback to JSON store)
export async function getEventsStore(): Promise<EventStoreItem[]> {
  // 1. Try MySQL Database
  const dbEvents = await fetchEventsFromDB();
  if (dbEvents && dbEvents.length > 0) {
    return dbEvents.map((e: EventDBItem) => ({
      id: e.id,
      title: e.title,
      category: e.category as "kompetisi" | "pelatihan" | "seminar",
      categoryLabel: e.category_label,
      description: e.description,
      iconType: e.icon_type,
      badgeColor: e.badge_color as "pink" | "cyan" | "yellow",
      gformUrl: e.gform_url,
      guidebookUrl: e.guidebook_url,
      mascotUrl: e.mascot_url || undefined,
    }));
  }

  // 2. Fallback to Local JSON file store
  const stored = await readEventsFile();
  if (stored) {
    const fallback = toStoreItems(registerEventsData);
    const storedIds = new Set(stored.map((e) => e.id));
    const missing = fallback.filter((e) => !storedIds.has(e.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      await writeEventsFile(merged);
      return merged;
    }
    return stored;
  }

  // First time: create from fallback
  const initial = toStoreItems(registerEventsData);
  await writeEventsFile(initial);
  return initial;
}

// Update a single event by ID (syncs to MySQL & JSON store)
export async function updateEventStore(
  id: string,
  updates: Partial<Pick<EventStoreItem, "gformUrl" | "guidebookUrl" | "mascotUrl" | "title" | "description">>
): Promise<EventStoreItem | null> {
  // Try MySQL update
  await updateEventInDB(id, {
    gform_url: updates.gformUrl,
    guidebook_url: updates.guidebookUrl,
    mascot_url: updates.mascotUrl,
    title: updates.title,
    description: updates.description,
  });

  // Always update JSON store as fallback
  const events = await getEventsStore();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = {
    ...events[index],
    ...updates,
  };

  await writeEventsFile(events);
  return events[index];
}

// Get a single event by ID
export async function getEventById(id: string): Promise<EventStoreItem | null> {
  const events = await getEventsStore();
  return events.find((e) => e.id === id) || null;
}
