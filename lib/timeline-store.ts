import fs from "fs/promises";
import path from "path";
import { timelineData, TimelineItem } from "@/data/timeline";
import {
  fetchTimelineFromDB,
  insertTimelineToDB,
  updateTimelineInDB,
  deleteTimelineFromDB,
  TimelineDBItem,
} from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "timeline.json");

export async function getTimelineStore(): Promise<TimelineItem[]> {
  // 1. Try Supabase Database first
  const dbTimeline = await fetchTimelineFromDB();
  if (dbTimeline !== null) {
    return dbTimeline.map((item: TimelineDBItem) => ({
      id: item.id,
      title: item.title,
      date: item.date_string,
      category: item.category || "AGENDA",
      badgeColor: (item.badge_color as "pink" | "cyan" | "yellow") || "pink",
      imageUrl: item.image_url || undefined,
    }));
  }

  // 2. Fallback to Local JSON file store
  try {
    try {
      const fileData = await fs.readFile(FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // File doesn't exist yet
    }

    return [];
  } catch (error) {
    console.error("Error reading timeline store:", error);
    return [];
  }
}

export async function saveTimelineStore(data: TimelineItem[]): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving timeline store:", error);
    return false;
  }
}

export async function addTimelineStore(item: Omit<TimelineItem, "id">): Promise<TimelineItem> {
  // Insert to MySQL
  const insertedId = await insertTimelineToDB({
    title: item.title,
    date_string: item.date,
    category: item.category,
    badge_color: item.badgeColor,
    image_url: item.imageUrl,
  });

  const current = await getTimelineStore();
  const maxId = current.reduce((max, i) => (i.id > max ? i.id : max), 0);
  const newItem: TimelineItem = {
    ...item,
    id: insertedId || maxId + 1,
  };

  const updated = [...current, newItem];
  await saveTimelineStore(updated);
  return newItem;
}

export async function updateTimelineStore(id: number, itemData: Partial<TimelineItem>): Promise<TimelineItem | null> {
  // Update MySQL
  await updateTimelineInDB(id, {
    title: itemData.title,
    date_string: itemData.date,
    category: itemData.category,
    badge_color: itemData.badgeColor,
    image_url: itemData.imageUrl,
  });

  const current = await getTimelineStore();
  const index = current.findIndex((i) => i.id === id);

  if (index === -1) return null;

  const updatedItem: TimelineItem = {
    ...current[index],
    ...itemData,
    id,
  };

  current[index] = updatedItem;
  await saveTimelineStore(current);
  return updatedItem;
}

export async function deleteTimelineStore(id: number): Promise<boolean> {
  const dbDeleted = await deleteTimelineFromDB(id);

  let fileDeleted = false;
  try {
    const fileData = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter((i) => i.id !== id);
      if (filtered.length !== parsed.length) {
        await saveTimelineStore(filtered);
        fileDeleted = true;
      }
    }
  } catch (err) {
    console.error("Error updating local timeline file after delete:", err);
  }

  return dbDeleted || fileDeleted;
}
