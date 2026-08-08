import fs from "fs/promises";
import path from "path";
import { timelineData, TimelineItem } from "@/data/timeline";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "timeline.json");

export async function getTimelineStore(): Promise<TimelineItem[]> {
  try {
    try {
      const fileData = await fs.readFile(FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // File doesn't exist yet, initialize from seed data
    }

    const initialData: TimelineItem[] = timelineData.map((t) => ({ ...t }));
    await saveTimelineStore(initialData);
    return initialData;
  } catch (error) {
    console.error("Error reading timeline store:", error);
    return timelineData.map((t) => ({ ...t }));
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
  const current = await getTimelineStore();
  const maxId = current.reduce((max, i) => (i.id > max ? i.id : max), 0);
  const newItem: TimelineItem = {
    ...item,
    id: maxId + 1,
  };

  const updated = [...current, newItem];
  await saveTimelineStore(updated);
  return newItem;
}

export async function updateTimelineStore(id: number, itemData: Partial<TimelineItem>): Promise<TimelineItem | null> {
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
  const current = await getTimelineStore();
  const filtered = current.filter((i) => i.id !== id);

  if (filtered.length === current.length) return false;

  await saveTimelineStore(filtered);
  return true;
}
