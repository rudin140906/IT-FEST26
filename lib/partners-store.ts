import fs from "fs/promises";
import path from "path";
import { fallbackSponsors, fallbackMediaPartners } from "@/data/sponsors";
import {
  fetchSponsorsFromDB,
  fetchMediaPartnersFromDB,
  insertSponsorToDB,
  insertMediaPartnerToDB,
  updateSponsorInDB,
  updateMediaPartnerInDB,
  deleteSponsorFromDB,
  deleteMediaPartnerFromDB,
} from "@/lib/db";

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

// Helper to read JSON file
async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as T;
    }
  } catch {
    // File doesn't exist or is invalid
  }
  return null;
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

// Read extra fields (logoScale, logoPositionX, logoPositionY) from JSON cache
// These fields don't exist in the Supabase schema
async function readExtraFieldsMap(filePath: string): Promise<Map<string, { logoScale?: number; logoPositionX?: number; logoPositionY?: number }>> {
  const map = new Map<string, { logoScale?: number; logoPositionX?: number; logoPositionY?: number }>();
  const items = await readJsonFile<BaseItem[]>(filePath);
  if (items) {
    for (const item of items) {
      // Key by both ID and name (lowercased) for flexible matching
      map.set(`id:${item.id}`, {
        logoScale: item.logoScale ?? 100,
        logoPositionX: item.logoPositionX ?? 50,
        logoPositionY: item.logoPositionY ?? 50,
      });
      if (item.name) {
        map.set(`name:${item.name.toLowerCase()}`, {
          logoScale: item.logoScale ?? 100,
          logoPositionX: item.logoPositionX ?? 50,
          logoPositionY: item.logoPositionY ?? 50,
        });
      }
    }
  }
  return map;
}

// ===================================================
// SPONSORS STORE
// ===================================================
export async function getSponsorsStore(): Promise<BaseItem[]> {
  // 1. Try Supabase Database first (source of truth)
  try {
    const dbSponsors = await fetchSponsorsFromDB();
    if (dbSponsors && dbSponsors.length > 0) {
      const extraFields = await readExtraFieldsMap(SPONSORS_FILE);

      const items: BaseItem[] = dbSponsors.map((s) => {
        const byId = extraFields.get(`id:${s.id}`);
        const byName = extraFields.get(`name:${s.name.toLowerCase()}`);
        const extra = byId || byName || { logoScale: 100, logoPositionX: 50, logoPositionY: 50 };

        return {
          id: s.id,
          name: s.name,
          logoUrl: s.logo_url,
          websiteUrl: s.website_url || "",
          isVisible: s.is_visible !== 0,
          createdAt: s.created_at,
          logoScale: extra.logoScale ?? 100,
          logoPositionX: extra.logoPositionX ?? 50,
          logoPositionY: extra.logoPositionY ?? 50,
        };
      });

      // Sync JSON cache with DB data (so IDs stay consistent)
      await writeJsonFile(SPONSORS_FILE, items);
      return items;
    }
  } catch (err) {
    console.warn("Error fetching sponsors from DB, using fallback:", err);
  }

  // 2. Fallback to file JSON store
  const fileData = await readJsonFile<BaseItem[]>(SPONSORS_FILE);
  if (fileData) {
    return fileData.map((item) => ({
      ...item,
      isVisible: item.isVisible ?? true,
    }));
  }

  // 3. First time: create from hardcoded defaults
  const defaultSponsors: BaseItem[] = fallbackSponsors.map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: s.logoUrl,
    isVisible: s.isVisible ?? true,
    logoScale: s.logoScale ?? 100,
    logoPositionX: s.logoPositionX ?? 50,
    logoPositionY: s.logoPositionY ?? 50,
  }));
  await writeJsonFile(SPONSORS_FILE, defaultSponsors);
  return defaultSponsors;
}

export async function addSponsorStore(sponsor: Omit<BaseItem, "id">, explicitId?: number): Promise<BaseItem> {
  // 1. Insert to Supabase first to get the real DB ID
  let dbId: number | null = null;
  try {
    dbId = await insertSponsorToDB({
      name: sponsor.name,
      logo_url: sponsor.logoUrl,
      website_url: sponsor.websiteUrl || undefined,
      is_visible: sponsor.isVisible === false ? 0 : 1,
    });
  } catch (err) {
    console.warn("Failed to insert sponsor to DB:", err);
  }

  const finalId = dbId || explicitId || Date.now();

  const newSponsor: BaseItem = {
    ...sponsor,
    id: finalId,
    createdAt: new Date().toISOString(),
    isVisible: sponsor.isVisible ?? true,
  };

  // 2. Update local JSON cache
  const current = await getSponsorsStore();
  const updated = [newSponsor, ...current.filter((s) => s.id !== finalId)];
  await writeJsonFile(SPONSORS_FILE, updated);

  return newSponsor;
}

export async function updateSponsorStore(id: number, data: Partial<BaseItem>): Promise<BaseItem | null> {
  // 1. Update Supabase first
  try {
    await updateSponsorInDB(id, {
      name: data.name,
      logo_url: data.logoUrl,
      website_url: data.websiteUrl,
      is_visible: data.isVisible !== undefined ? (data.isVisible ? 1 : 0) : undefined,
    });
  } catch (err) {
    console.warn("Failed to update sponsor in DB:", err);
  }

  // 2. Update local JSON cache
  const current = await getSponsorsStore();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) {
    // Item doesn't exist locally, create it
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
  // 1. Delete from Supabase first
  let dbDeleted = false;
  try {
    dbDeleted = await deleteSponsorFromDB(id, name);
  } catch (err) {
    console.warn("Failed to delete sponsor from DB:", err);
  }

  // 2. Delete from local JSON cache
  const current = await getSponsorsStore();
  const filtered = current.filter((item) => {
    if (item.id === id) return false;
    if (name && item.name && item.name.toLowerCase() === name.toLowerCase()) return false;
    return true;
  });

  const fileDeleted = filtered.length !== current.length;
  if (fileDeleted) {
    await writeJsonFile(SPONSORS_FILE, filtered);
  }

  return dbDeleted || fileDeleted;
}

// ===================================================
// MEDIA PARTNERS STORE
// ===================================================
export async function getMediaPartnersStore(): Promise<BaseItem[]> {
  // 1. Try Supabase Database first (source of truth)
  try {
    const dbMedia = await fetchMediaPartnersFromDB();
    if (dbMedia && dbMedia.length > 0) {
      const extraFields = await readExtraFieldsMap(MEDIA_PARTNERS_FILE);

      const items: BaseItem[] = dbMedia.map((m) => {
        const byId = extraFields.get(`id:${m.id}`);
        const byName = extraFields.get(`name:${m.name.toLowerCase()}`);
        const extra = byId || byName || { logoScale: 100, logoPositionX: 50, logoPositionY: 50 };

        return {
          id: m.id,
          name: m.name,
          logoUrl: m.logo_url,
          websiteUrl: m.website_url || "",
          isVisible: m.is_visible !== 0,
          createdAt: m.created_at,
          logoScale: extra.logoScale ?? 100,
          logoPositionX: extra.logoPositionX ?? 50,
          logoPositionY: extra.logoPositionY ?? 50,
        };
      });

      // Sync JSON cache with DB data
      await writeJsonFile(MEDIA_PARTNERS_FILE, items);
      return items;
    }
  } catch (err) {
    console.warn("Error fetching media partners from DB, using fallback:", err);
  }

  // 2. Fallback to file JSON store
  const fileData = await readJsonFile<BaseItem[]>(MEDIA_PARTNERS_FILE);
  if (fileData) {
    return fileData.map((item) => ({
      ...item,
      isVisible: item.isVisible ?? true,
    }));
  }

  // 3. First time: create from hardcoded defaults
  const defaultMediaPartners: BaseItem[] = fallbackMediaPartners.map((m) => ({
    id: m.id,
    name: m.name,
    logoUrl: m.logoUrl,
    isVisible: m.isVisible ?? true,
    logoScale: m.logoScale ?? 100,
    logoPositionX: m.logoPositionX ?? 50,
    logoPositionY: m.logoPositionY ?? 50,
  }));
  await writeJsonFile(MEDIA_PARTNERS_FILE, defaultMediaPartners);
  return defaultMediaPartners;
}

export async function addMediaPartnerStore(partner: Omit<BaseItem, "id">, explicitId?: number): Promise<BaseItem> {
  // 1. Insert to Supabase first
  let dbId: number | null = null;
  try {
    dbId = await insertMediaPartnerToDB({
      name: partner.name,
      logo_url: partner.logoUrl,
      website_url: partner.websiteUrl || undefined,
      is_visible: partner.isVisible === false ? 0 : 1,
    });
  } catch (err) {
    console.warn("Failed to insert media partner to DB:", err);
  }

  const finalId = dbId || explicitId || Date.now();

  const newMediaPartner: BaseItem = {
    ...partner,
    id: finalId,
    createdAt: new Date().toISOString(),
    isVisible: partner.isVisible ?? true,
  };

  // 2. Update local JSON cache
  const current = await getMediaPartnersStore();
  const updated = [newMediaPartner, ...current.filter((m) => m.id !== finalId)];
  await writeJsonFile(MEDIA_PARTNERS_FILE, updated);

  return newMediaPartner;
}

export async function updateMediaPartnerStore(id: number, data: Partial<BaseItem>): Promise<BaseItem | null> {
  // 1. Update Supabase first
  try {
    await updateMediaPartnerInDB(id, {
      name: data.name,
      logo_url: data.logoUrl,
      website_url: data.websiteUrl,
      is_visible: data.isVisible !== undefined ? (data.isVisible ? 1 : 0) : undefined,
    });
  } catch (err) {
    console.warn("Failed to update media partner in DB:", err);
  }

  // 2. Update local JSON cache
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
  // 1. Delete from Supabase first
  let dbDeleted = false;
  try {
    dbDeleted = await deleteMediaPartnerFromDB(id, name);
  } catch (err) {
    console.warn("Failed to delete media partner from DB:", err);
  }

  // 2. Delete from local JSON cache
  const current = await getMediaPartnersStore();
  const filtered = current.filter((item) => {
    if (item.id === id) return false;
    if (name && item.name && item.name.toLowerCase() === name.toLowerCase()) return false;
    return true;
  });

  const fileDeleted = filtered.length !== current.length;
  if (fileDeleted) {
    await writeJsonFile(MEDIA_PARTNERS_FILE, filtered);
  }

  return dbDeleted || fileDeleted;
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
