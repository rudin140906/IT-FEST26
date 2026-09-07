import fs from "fs/promises";
import path from "path";
import { Speaker } from "@/types/speaker";
import { speakers as fallbackSpeakers } from "@/data/speakers";
import {
  fetchSpeakersFromDB,
  insertSpeakerToDB,
  updateSpeakerInDB,
  deleteSpeakerFromDB,
  SpeakerDBItem,
} from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const SPEAKERS_FILE = path.join(DATA_DIR, "speakers.json");

async function readSpeakersFile(): Promise<Speaker[] | null> {
  try {
    const fileData = await fs.readFile(SPEAKERS_FILE, "utf-8");
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Speaker[];
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return null;
}

async function writeSpeakersFile(data: Speaker[]): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SPEAKERS_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing speakers.json:", error);
    return false;
  }
}

// Get all speakers (try MySQL first, fallback to JSON file store)
export async function getSpeakersStore(): Promise<Speaker[]> {
  // 1. Try MySQL Database
  const dbSpeakers = await fetchSpeakersFromDB();
  if (dbSpeakers && dbSpeakers.length > 0) {
    return dbSpeakers.map((s: SpeakerDBItem) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      category: s.category as "guest-star" | "speaker",
      photo: s.photo || undefined,
      photoPosition: s.photo_position || "center",
      cv: s.cv || undefined,
      color: (s.color || "pink") as "yellow" | "pink" | "cyan",
    }));
  }

  // 2. Fallback to Local JSON file store
  const stored = await readSpeakersFile();
  if (stored) {
    return stored;
  }

  // First time: save default speakers
  await writeSpeakersFile(fallbackSpeakers);
  return fallbackSpeakers;
}

// Add new speaker
export async function addSpeakerStore(
  speaker: Omit<Speaker, "id"> & { id?: string }
): Promise<Speaker> {
  const current = await getSpeakersStore();
  const slugId =
    speaker.id ||
    speaker.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

  const newSpeaker: Speaker = {
    id: slugId,
    name: speaker.name,
    role: speaker.role,
    category: speaker.category || "speaker",
    photo: speaker.photo,
    photoPosition: speaker.photoPosition || "center",
    cv: speaker.cv,
    color: speaker.color || "pink",
  };

  // Sync to MySQL
  await insertSpeakerToDB({
    id: newSpeaker.id,
    name: newSpeaker.name,
    role: newSpeaker.role,
    category: newSpeaker.category,
    photo: newSpeaker.photo,
    photo_position: newSpeaker.photoPosition,
    cv: newSpeaker.cv,
    color: newSpeaker.color,
  });

  const updated = [...current, newSpeaker];
  await writeSpeakersFile(updated);
  return newSpeaker;
}

// Update speaker
export async function updateSpeakerStore(
  id: string,
  updates: Partial<Omit<Speaker, "id">>
): Promise<Speaker | null> {
  // Sync to MySQL
  await updateSpeakerInDB(id, {
    name: updates.name,
    role: updates.role,
    category: updates.category,
    photo: updates.photo,
    photo_position: updates.photoPosition,
    cv: updates.cv,
    color: updates.color,
  });

  const current = await getSpeakersStore();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedSpeaker: Speaker = {
    ...current[index],
    ...updates,
  };

  current[index] = updatedSpeaker;
  await writeSpeakersFile(current);
  return updatedSpeaker;
}

// Delete speaker
export async function deleteSpeakerStore(id: string): Promise<boolean> {
  const dbDeleted = await deleteSpeakerFromDB(id);

  let fileDeleted = false;
  try {
    const fileData = await fs.readFile(SPEAKERS_FILE, "utf-8");
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter((s: Speaker) => s.id !== id);
      if (filtered.length !== parsed.length) {
        await writeSpeakersFile(filtered);
        fileDeleted = true;
      }
    }
  } catch (err) {
    console.error("Error updating local speakers file after delete:", err);
  }

  return dbDeleted || fileDeleted;
}
