import fs from "fs/promises";
import path from "path";
import { fallbackSponsors, fallbackMediaPartners } from "@/data/sponsors";

const DATA_DIR = path.join(process.cwd(), "data");
const SPONSORS_FILE = path.join(DATA_DIR, "sponsors.json");
const MEDIA_PARTNERS_FILE = path.join(DATA_DIR, "media_partners.json");

export interface BaseItem {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  createdAt?: string;
  isVisible?: boolean;
  logoScale?: number;
  logoPositionX?: number;
  logoPositionY?: number;
}

export interface PartnerItem extends BaseItem {
  type: "sponsor" | "media_partner";
}

// Helper to read JSON file with fallback
async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as T;
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return fallback;
}

function normalizeVisibility<T extends { isVisible?: boolean }>(item: T): T {
  return {
    ...item,
    isVisible: item.isVisible ?? true,
  };
}

// Helper to write JSON file
async function writeJsonFile(filePath: string, data: unknown): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
}

// ===================================================
// SPONSORS LOCAL FILE STORE
// ===================================================
export async function getSponsorsStore(): Promise<BaseItem[]> {
  const defaultSponsors: BaseItem[] = fallbackSponsors.map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: s.logoUrl,
    isVisible: s.isVisible ?? true,
    logoScale: s.logoScale ?? 100,
    logoPositionX: s.logoPositionX ?? 50,
    logoPositionY: s.logoPositionY ?? 50,
  }));

  const data = await readJsonFile<BaseItem[]>(SPONSORS_FILE, defaultSponsors);
  if (data === defaultSponsors) {
    await writeJsonFile(SPONSORS_FILE, defaultSponsors);
  }
  return data.map((item) => normalizeVisibility(item));
}

export async function addSponsorStore(sponsor: Omit<BaseItem, "id">, explicitId?: number): Promise<BaseItem> {
  const current = await getSponsorsStore();
  const maxId = current.reduce((max, item) => (item.id > max ? item.id : max), 0);
  const newSponsor: BaseItem = {
    ...sponsor,
    id: explicitId || maxId + 1,
    createdAt: new Date().toISOString(),
    isVisible: sponsor.isVisible ?? true,
  };

  const updated = [newSponsor, ...current];
  await writeJsonFile(SPONSORS_FILE, updated);
  return newSponsor;
}

export async function updateSponsorStore(id: number, data: Partial<BaseItem>): Promise<BaseItem | null> {
  const current = await getSponsorsStore();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) {
    const fallbackItem: BaseItem = {
      id,
      name: data.name || "Sponsor",
      logoUrl: data.logoUrl || "",
      websiteUrl: data.websiteUrl || "",
      isVisible: data.isVisible ?? true,
      logoScale: data.logoScale ?? 100,
      logoPositionX: data.logoPositionX ?? 50,
      logoPositionY: data.logoPositionY ?? 50,
      createdAt: new Date().toISOString(),
      ...data,
    };
    await writeJsonFile(SPONSORS_FILE, [fallbackItem, ...current]);
    return fallbackItem;
  }

  const updatedItem: BaseItem = {
    ...current[index],
    ...data,
    id,
    isVisible: data.isVisible ?? current[index].isVisible ?? true,
  };

  current[index] = updatedItem;
  await writeJsonFile(SPONSORS_FILE, current);
  return updatedItem;
}

export async function deleteSponsorStore(id: number, name?: string): Promise<boolean> {
  const current = await getSponsorsStore();
  const filtered = current.filter((item) => {
    if (item.id === id) return false;
    if (name && item.name && item.name.toLowerCase() === name.toLowerCase()) return false;
    return true;
  });

  if (filtered.length === current.length) return false;

  await writeJsonFile(SPONSORS_FILE, filtered);
  return true;
}

// ===================================================
// MEDIA PARTNERS LOCAL FILE STORE
// ===================================================
export async function getMediaPartnersStore(): Promise<BaseItem[]> {
  const defaultMediaPartners: BaseItem[] = fallbackMediaPartners.map((m) => ({
    id: m.id,
    name: m.name,
    logoUrl: m.logoUrl,
    isVisible: m.isVisible ?? true,
    logoScale: m.logoScale ?? 100,
    logoPositionX: m.logoPositionX ?? 50,
    logoPositionY: m.logoPositionY ?? 50,
  }));

  const data = await readJsonFile<BaseItem[]>(MEDIA_PARTNERS_FILE, defaultMediaPartners);
  if (data === defaultMediaPartners) {
    await writeJsonFile(MEDIA_PARTNERS_FILE, defaultMediaPartners);
  }
  return data.map((item) => normalizeVisibility(item));
}

export async function addMediaPartnerStore(partner: Omit<BaseItem, "id">, explicitId?: number): Promise<BaseItem> {
  const current = await getMediaPartnersStore();
  const maxId = current.reduce((max, item) => (item.id > max ? item.id : max), 0);
  const newMediaPartner: BaseItem = {
    ...partner,
    id: explicitId || maxId + 1,
    createdAt: new Date().toISOString(),
    isVisible: partner.isVisible ?? true,
  };

  const updated = [newMediaPartner, ...current];
  await writeJsonFile(MEDIA_PARTNERS_FILE, updated);
  return newMediaPartner;
}

export async function updateMediaPartnerStore(id: number, data: Partial<BaseItem>): Promise<BaseItem | null> {
  const current = await getMediaPartnersStore();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) {
    const fallbackItem: BaseItem = {
      id,
      name: data.name || "Media Partner",
      logoUrl: data.logoUrl || "",
      websiteUrl: data.websiteUrl || "",
      isVisible: data.isVisible ?? true,
      logoScale: data.logoScale ?? 100,
      logoPositionX: data.logoPositionX ?? 50,
      logoPositionY: data.logoPositionY ?? 50,
      createdAt: new Date().toISOString(),
      ...data,
    };
    await writeJsonFile(MEDIA_PARTNERS_FILE, [fallbackItem, ...current]);
    return fallbackItem;
  }

  const updatedItem: BaseItem = {
    ...current[index],
    ...data,
    id,
    isVisible: data.isVisible ?? current[index].isVisible ?? true,
  };

  current[index] = updatedItem;
  await writeJsonFile(MEDIA_PARTNERS_FILE, current);
  return updatedItem;
}

export async function deleteMediaPartnerStore(id: number, name?: string): Promise<boolean> {
  const current = await getMediaPartnersStore();
  const filtered = current.filter((item) => {
    if (item.id === id) return false;
    if (name && item.name && item.name.toLowerCase() === name.toLowerCase()) return false;
    return true;
  });

  if (filtered.length === current.length) return false;

  await writeJsonFile(MEDIA_PARTNERS_FILE, filtered);
  return true;
}

// ===================================================
// COMBINED LOCAL STORE FOR BACKWARD COMPATIBILITY
// ===================================================
export async function getPartnersStore(): Promise<PartnerItem[]> {
  const sponsors = await getSponsorsStore();
  const mediaPartners = await getMediaPartnersStore();

  const formattedSponsors: PartnerItem[] = sponsors.map((s) => ({
    ...s,
    type: "sponsor" as const,
  }));

  const formattedMedia: PartnerItem[] = mediaPartners.map((m) => ({
    ...m,
    type: "media_partner" as const,
  }));

  return [...formattedSponsors, ...formattedMedia];
}

export async function addPartnerStore(partner: Omit<PartnerItem, "id">): Promise<PartnerItem> {
  if (partner.type === "media_partner") {
    const created = await addMediaPartnerStore({
      name: partner.name,
      logoUrl: partner.logoUrl,
      websiteUrl: partner.websiteUrl,
      isVisible: partner.isVisible,
      logoScale: partner.logoScale,
      logoPositionX: partner.logoPositionX,
      logoPositionY: partner.logoPositionY,
    });
    return { ...created, type: "media_partner" };
  } else {
    const created = await addSponsorStore({
      name: partner.name,
      logoUrl: partner.logoUrl,
      websiteUrl: partner.websiteUrl,
      isVisible: partner.isVisible,
      logoScale: partner.logoScale,
      logoPositionX: partner.logoPositionX,
      logoPositionY: partner.logoPositionY,
    });
    return { ...created, type: "sponsor" };
  }
}

export async function updatePartnerStore(id: number, partnerData: Partial<PartnerItem>): Promise<PartnerItem | null> {
  if (partnerData.type === "media_partner") {
    const updated = await updateMediaPartnerStore(id, partnerData);
    if (updated) return { ...updated, type: "media_partner" };
  } else if (partnerData.type === "sponsor") {
    const updated = await updateSponsorStore(id, partnerData);
    if (updated) return { ...updated, type: "sponsor" };
  }

  // Fallback try both
  const updatedSponsor = await updateSponsorStore(id, partnerData);
  if (updatedSponsor) return { ...updatedSponsor, type: "sponsor" };

  const updatedMedia = await updateMediaPartnerStore(id, partnerData);
  if (updatedMedia) return { ...updatedMedia, type: "media_partner" };

  return null;
}

export async function deletePartnerStore(id: number): Promise<boolean> {
  const deletedSponsor = await deleteSponsorStore(id);
  const deletedMedia = await deleteMediaPartnerStore(id);
  return deletedSponsor || deletedMedia;
}
