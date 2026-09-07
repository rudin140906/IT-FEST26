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

// In-memory cache for extra fields (logoScale, logoPositionX, logoPositionY)
// that don't exist in the Supabase schema. This works on Vercel where filesystem is read-only.
const sponsorExtraFieldsCache = new Map<string, { logoScale?: number; logoPositionX?: number; logoPositionY?: number }>();
const mediaPartnerExtraFieldsCache = new Map<string, { logoScale?: number; logoPositionX?: number; logoPositionY?: number }>();

// Helper to try reading JSON file (best-effort, works locally, may fail on Vercel)
async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(fileData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as T;
    }
  } catch {
    // File doesn't exist or is invalid (e.g., Vercel read-only fs)
  }
  return null;
}

// Helper to try writing JSON file (best-effort, silently fails on Vercel)
async function writeJsonFile(filePath: string, data: unknown): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    // Silently fail on Vercel where filesystem is read-only
    return false;
  }
}

// Load extra fields from JSON file into in-memory cache (one-time bootstrap)
async function loadExtraFieldsToCache(filePath: string, cache: Map<string, { logoScale?: number; logoPositionX?: number; logoPositionY?: number }>) {
  if (cache.size > 0) return; // Already loaded
  const items = await readJsonFile<BaseItem[]>(filePath);
  if (items) {
    for (const item of items) {
      const key = `id:${item.id}`;
      cache.set(key, {
        logoScale: item.logoScale ?? 100,
        logoPositionX: item.logoPositionX ?? 50,
        logoPositionY: item.logoPositionY ?? 50,
      });
      if (item.name) {
        cache.set(`name:${item.name.toLowerCase()}`, {
          logoScale: item.logoScale ?? 100,
          logoPositionX: item.logoPositionX ?? 50,
          logoPositionY: item.logoPositionY ?? 50,
        });
      }
    }
  }
}

function getExtraFields(cache: Map<string, { logoScale?: number; logoPositionX?: number; logoPositionY?: number }>, id: number, name: string) {
  const byId = cache.get(`id:${id}`);
  const byName = cache.get(`name:${name.toLowerCase()}`);
  return byId || byName || { logoScale: 100, logoPositionX: 50, logoPositionY: 50 };
}

function setExtraFields(cache: Map<string, { logoScale?: number; logoPositionX?: number; logoPositionY?: number }>, id: number, name: string, data: { logoScale?: number; logoPositionX?: number; logoPositionY?: number }) {
  cache.set(`id:${id}`, data);
  if (name) cache.set(`name:${name.toLowerCase()}`, data);
}

// ===================================================
// SPONSORS STORE — Supabase as source of truth
// ===================================================
export async function getSponsorsStore(): Promise<BaseItem[]> {
  // Load extra fields from JSON into memory cache (one-time)
  await loadExtraFieldsToCache(SPONSORS_FILE, sponsorExtraFieldsCache);

  // 1. Try Supabase Database first (source of truth)
  try {
    const dbSponsors = await fetchSponsorsFromDB();
    if (dbSponsors !== null) {
      const items: BaseItem[] = dbSponsors.map((s) => {
        const extra = getExtraFields(sponsorExtraFieldsCache, s.id, s.name);
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

      // Best-effort: sync JSON cache (works locally, silently fails on Vercel)
      writeJsonFile(SPONSORS_FILE, items);
      return items;
    }
  } catch (err) {
    console.warn("Error fetching sponsors from DB, using fallback:", err);
  }

  // 2. Fallback to file JSON store (local dev only, if Supabase is offline)
  const fileData = await readJsonFile<BaseItem[]>(SPONSORS_FILE);
  if (fileData) {
    return fileData.map((item) => ({
      ...item,
      isVisible: item.isVisible ?? true,
    }));
  }

  // 3. If DB connection failed and no file exists, return empty array
  return [];
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

  // Save extra fields to in-memory cache
  setExtraFields(sponsorExtraFieldsCache, finalId, sponsor.name, {
    logoScale: sponsor.logoScale ?? 100,
    logoPositionX: sponsor.logoPositionX ?? 50,
    logoPositionY: sponsor.logoPositionY ?? 50,
  });

  // Best-effort: update file cache
  try {
    const current = await getSponsorsStore();
    const updated = [newSponsor, ...current.filter((s) => s.id !== finalId)];
    writeJsonFile(SPONSORS_FILE, updated);
  } catch { /* Silently fail on Vercel */ }

  return newSponsor;
}

export async function updateSponsorStore(id: number, data: Partial<BaseItem>): Promise<BaseItem | null> {
  // 1. Update Supabase first
  let dbSuccess = false;
  try {
    dbSuccess = await updateSponsorInDB(id, {
      name: data.name,
      logo_url: data.logoUrl,
      website_url: data.websiteUrl,
      is_visible: data.isVisible !== undefined ? (data.isVisible ? 1 : 0) : undefined,
    });
  } catch (err) {
    console.warn("Failed to update sponsor in DB:", err);
  }

  // Update in-memory extra fields cache
  if (data.logoScale !== undefined || data.logoPositionX !== undefined || data.logoPositionY !== undefined) {
    const existing = getExtraFields(sponsorExtraFieldsCache, id, data.name || "");
    setExtraFields(sponsorExtraFieldsCache, id, data.name || "", {
      logoScale: data.logoScale ?? existing.logoScale ?? 100,
      logoPositionX: data.logoPositionX ?? existing.logoPositionX ?? 50,
      logoPositionY: data.logoPositionY ?? existing.logoPositionY ?? 50,
    });
  }

  // 2. Re-fetch to get updated data
  const current = await getSponsorsStore();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) {
    if (!dbSuccess) return null;
    // Item might have been created in DB but not in local cache
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
    return fallbackItem;
  }

  const updatedItem: BaseItem = {
    ...current[index],
    ...data,
    id,
    isVisible: data.isVisible ?? current[index].isVisible ?? true,
  };

  // Best-effort: update file cache
  try {
    current[index] = updatedItem;
    writeJsonFile(SPONSORS_FILE, current);
  } catch { /* Silently fail on Vercel */ }

  return updatedItem;
}

export async function deleteSponsorStore(id: number, name?: string): Promise<boolean> {
  // 1. Delete from Supabase FIRST (this is the authoritative action)
  let dbDeleted = false;
  try {
    dbDeleted = await deleteSponsorFromDB(id, name);
  } catch (err) {
    console.warn("Failed to delete sponsor from DB:", err);
  }

  // 2. Remove from in-memory extra fields cache
  sponsorExtraFieldsCache.delete(`id:${id}`);
  if (name) sponsorExtraFieldsCache.delete(`name:${name.toLowerCase()}`);

  // 3. Best-effort: delete from local JSON cache
  try {
    const fileData = await readJsonFile<BaseItem[]>(SPONSORS_FILE);
    if (fileData) {
      const filtered = fileData.filter((item) => {
        if (item.id === id) return false;
        if (name && item.name && item.name.toLowerCase() === name.toLowerCase()) return false;
        return true;
      });
      if (filtered.length !== fileData.length) {
        writeJsonFile(SPONSORS_FILE, filtered);
      }
    }
  } catch { /* Silently fail */ }

  return dbDeleted;
}

// ===================================================
// MEDIA PARTNERS STORE — Supabase as source of truth
// ===================================================
export async function getMediaPartnersStore(): Promise<BaseItem[]> {
  // Load extra fields from JSON into memory cache (one-time)
  await loadExtraFieldsToCache(MEDIA_PARTNERS_FILE, mediaPartnerExtraFieldsCache);

  // 1. Try Supabase Database first (source of truth)
  try {
    const dbMedia = await fetchMediaPartnersFromDB();
    if (dbMedia !== null) {
      const items: BaseItem[] = dbMedia.map((m) => {
        const extra = getExtraFields(mediaPartnerExtraFieldsCache, m.id, m.name);
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

      // Best-effort: sync JSON cache
      writeJsonFile(MEDIA_PARTNERS_FILE, items);
      return items;
    }
  } catch (err) {
    console.warn("Error fetching media partners from DB, using fallback:", err);
  }

  // 2. Fallback to file JSON store (local dev only, if Supabase is offline)
  const fileData = await readJsonFile<BaseItem[]>(MEDIA_PARTNERS_FILE);
  if (fileData) {
    return fileData.map((item) => ({
      ...item,
      isVisible: item.isVisible ?? true,
    }));
  }

  // 3. If DB connection failed and no file exists, return empty array
  return [];
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

  // Save extra fields to in-memory cache
  setExtraFields(mediaPartnerExtraFieldsCache, finalId, partner.name, {
    logoScale: partner.logoScale ?? 100,
    logoPositionX: partner.logoPositionX ?? 50,
    logoPositionY: partner.logoPositionY ?? 50,
  });

  // Best-effort: update file cache
  try {
    const current = await getMediaPartnersStore();
    const updated = [newMediaPartner, ...current.filter((m) => m.id !== finalId)];
    writeJsonFile(MEDIA_PARTNERS_FILE, updated);
  } catch { /* Silently fail */ }

  return newMediaPartner;
}

export async function updateMediaPartnerStore(id: number, data: Partial<BaseItem>): Promise<BaseItem | null> {
  // 1. Update Supabase first
  let dbSuccess = false;
  try {
    dbSuccess = await updateMediaPartnerInDB(id, {
      name: data.name,
      logo_url: data.logoUrl,
      website_url: data.websiteUrl,
      is_visible: data.isVisible !== undefined ? (data.isVisible ? 1 : 0) : undefined,
    });
  } catch (err) {
    console.warn("Failed to update media partner in DB:", err);
  }

  // Update in-memory extra fields cache
  if (data.logoScale !== undefined || data.logoPositionX !== undefined || data.logoPositionY !== undefined) {
    const existing = getExtraFields(mediaPartnerExtraFieldsCache, id, data.name || "");
    setExtraFields(mediaPartnerExtraFieldsCache, id, data.name || "", {
      logoScale: data.logoScale ?? existing.logoScale ?? 100,
      logoPositionX: data.logoPositionX ?? existing.logoPositionX ?? 50,
      logoPositionY: data.logoPositionY ?? existing.logoPositionY ?? 50,
    });
  }

  // 2. Re-fetch to get updated data
  const current = await getMediaPartnersStore();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) {
    if (!dbSuccess) return null;
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
    return fallbackItem;
  }

  const updatedItem: BaseItem = {
    ...current[index],
    ...data,
    id,
    isVisible: data.isVisible ?? current[index].isVisible ?? true,
  };

  // Best-effort: update file cache
  try {
    current[index] = updatedItem;
    writeJsonFile(MEDIA_PARTNERS_FILE, current);
  } catch { /* Silently fail */ }

  return updatedItem;
}

export async function deleteMediaPartnerStore(id: number, name?: string): Promise<boolean> {
  // 1. Delete from Supabase FIRST (authoritative action)
  let dbDeleted = false;
  try {
    dbDeleted = await deleteMediaPartnerFromDB(id, name);
  } catch (err) {
    console.warn("Failed to delete media partner from DB:", err);
  }

  // 2. Remove from in-memory extra fields cache
  mediaPartnerExtraFieldsCache.delete(`id:${id}`);
  if (name) mediaPartnerExtraFieldsCache.delete(`name:${name.toLowerCase()}`);

  // 3. Best-effort: delete from local JSON cache
  try {
    const fileData = await readJsonFile<BaseItem[]>(MEDIA_PARTNERS_FILE);
    if (fileData) {
      const filtered = fileData.filter((item) => {
        if (item.id === id) return false;
        if (name && item.name && item.name.toLowerCase() === name.toLowerCase()) return false;
        return true;
      });
      if (filtered.length !== fileData.length) {
        writeJsonFile(MEDIA_PARTNERS_FILE, filtered);
      }
    }
  } catch { /* Silently fail */ }

  return dbDeleted;
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
