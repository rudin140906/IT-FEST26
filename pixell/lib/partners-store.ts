import fs from "fs/promises";
import path from "path";
import { fallbackSponsors, fallbackMediaPartners, Partner } from "@/data/sponsors";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "partners.json");

export interface PartnerItem {
  id: number;
  name: string;
  logoUrl: string;
  type: "sponsor" | "media_partner";
  websiteUrl?: string;
  createdAt?: string;
}

export async function getPartnersStore(): Promise<PartnerItem[]> {
  try {
    // Check if partners.json exists
    try {
      const fileData = await fs.readFile(FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // File doesn't exist or is invalid, create initial file with fallbacks
    }

    const initialData: PartnerItem[] = [
      ...fallbackSponsors.map((s) => ({ ...s })),
      ...fallbackMediaPartners.map((m) => ({ ...m })),
    ];

    await savePartnersStore(initialData);
    return initialData;
  } catch (error) {
    console.error("Error reading partners store:", error);
    return [
      ...fallbackSponsors.map((s) => ({ ...s })),
      ...fallbackMediaPartners.map((m) => ({ ...m })),
    ];
  }
}

export async function savePartnersStore(data: PartnerItem[]): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving partners store:", error);
    return false;
  }
}

export async function addPartnerStore(partner: Omit<PartnerItem, "id">): Promise<PartnerItem> {
  const current = await getPartnersStore();
  const maxId = current.reduce((max, item) => (item.id > max ? item.id : max), 0);
  const newPartner: PartnerItem = {
    ...partner,
    id: maxId + 1,
    createdAt: new Date().toISOString(),
  };

  const updated = [newPartner, ...current];
  await savePartnersStore(updated);
  return newPartner;
}

export async function updatePartnerStore(id: number, partnerData: Partial<PartnerItem>): Promise<PartnerItem | null> {
  const current = await getPartnersStore();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) return null;

  const updatedItem: PartnerItem = {
    ...current[index],
    ...partnerData,
    id, // ensure ID is preserved
  };

  current[index] = updatedItem;
  await savePartnersStore(current);
  return updatedItem;
}

export async function deletePartnerStore(id: number): Promise<boolean> {
  const current = await getPartnersStore();
  const filtered = current.filter((item) => item.id !== id);

  if (filtered.length === current.length) return false;

  await savePartnersStore(filtered);
  return true;
}
