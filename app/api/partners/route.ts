import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
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
import {
  getSponsorsStore,
  getMediaPartnersStore,
  addSponsorStore,
  addMediaPartnerStore,
  updateSponsorStore,
  updateMediaPartnerStore,
  deleteSponsorStore,
  deleteMediaPartnerStore,
} from "@/lib/partners-store";
import { normalizePartnerWebsiteUrl } from "@/lib/partner-url";

type PartnersCacheKey = "hidden" | "visible";
type PartnerApiItem = {
  id: number;
  name: string;
  logoUrl: string;
  type: "sponsor" | "media_partner";
  websiteUrl?: string;
  isVisible?: boolean;
  logoScale?: number;
  logoPositionX?: number;
  logoPositionY?: number;
};

type PartnersApiResponse = {
  all: PartnerApiItem[];
  sponsors: PartnerApiItem[];
  mediaPartners: PartnerApiItem[];
  source: "mysql" | "file";
};

const partnersCache = new Map<PartnersCacheKey, { data: PartnersApiResponse; timestamp: number }>();
const CACHE_TTL_MS = 5000; // 5 seconds in-memory TTL

export function invalidatePartnersCache() {
  partnersCache.clear();
}

export async function GET(request: Request) {
  const now = Date.now();
  const { searchParams } = new URL(request.url);
  const includeHidden = searchParams.get("includeHidden") === "true";
  const cacheKey: PartnersCacheKey = includeHidden ? "hidden" : "visible";
  const cachedPartnersData = partnersCache.get(cacheKey);

  if (cachedPartnersData && now - cachedPartnersData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedPartnersData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
      },
    });
  }

  let resultData: PartnersApiResponse | null = null;

  const fileSponsors = await getSponsorsStore();
  const fileMedia = await getMediaPartnersStore();

  let sponsors: PartnerApiItem[] = [];
  let mediaPartners: PartnerApiItem[] = [];
  let usedDb = false;

  try {
    const dbSponsors = await fetchSponsorsFromDB();
    if (dbSponsors && dbSponsors.length > 0) {
      usedDb = true;
      sponsors = dbSponsors.map((p) => {
        const match = fileSponsors.find((fs) => fs.id === p.id || fs.name.toLowerCase() === p.name.toLowerCase());
        return {
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url,
          type: "sponsor" as const,
          websiteUrl: normalizePartnerWebsiteUrl(p.website_url),
          isVisible: p.is_visible !== 0,
          logoScale: match?.logoScale ?? 100,
          logoPositionX: match?.logoPositionX ?? 50,
          logoPositionY: match?.logoPositionY ?? 50,
        };
      });
    }
  } catch (error) {
    console.error("API partners route DB sponsors read warning:", error);
  }

  if (sponsors.length === 0) {
    sponsors = fileSponsors.map((s) => ({
      ...s,
      type: "sponsor" as const,
      websiteUrl: normalizePartnerWebsiteUrl(s.websiteUrl),
      isVisible: s.isVisible ?? true,
    }));
  }

  try {
    const dbMedia = await fetchMediaPartnersFromDB();
    if (dbMedia && dbMedia.length > 0) {
      usedDb = true;
      mediaPartners = dbMedia.map((p) => {
        const match = fileMedia.find((fm) => fm.id === p.id || fm.name.toLowerCase() === p.name.toLowerCase());
        return {
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url,
          type: "media_partner" as const,
          websiteUrl: normalizePartnerWebsiteUrl(p.website_url),
          isVisible: p.is_visible !== 0,
          logoScale: match?.logoScale ?? 100,
          logoPositionX: match?.logoPositionX ?? 50,
          logoPositionY: match?.logoPositionY ?? 50,
        };
      });
    }
  } catch (error) {
    console.error("API partners route DB media read warning:", error);
  }

  if (mediaPartners.length === 0) {
    mediaPartners = fileMedia.map((m) => ({
      ...m,
      type: "media_partner" as const,
      websiteUrl: normalizePartnerWebsiteUrl(m.websiteUrl),
      isVisible: m.isVisible ?? true,
    }));
  }

  const combined = [...sponsors, ...mediaPartners];

  resultData = {
    all: includeHidden ? combined : combined.filter((item) => item.isVisible !== false),
    sponsors: includeHidden ? sponsors : sponsors.filter((item) => item.isVisible !== false),
    mediaPartners: includeHidden ? mediaPartners : mediaPartners.filter((item) => item.isVisible !== false),
    source: usedDb ? "mysql" : "file",
  };

  partnersCache.set(cacheKey, { data: resultData, timestamp: now });

  return NextResponse.json(resultData, {
    headers: {
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
    },
  });
}

export async function POST(request: Request) {
  try {
    invalidatePartnersCache();
    const body = await request.json();
    const { id, name, logoUrl, type, previousType, websiteUrl, isVisible, logoScale, logoPositionX, logoPositionY } = body;
    const action = String(body.action || "create").toLowerCase();
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    if (action === "delete") {
      const numId = Number(id);
      if (!numId) {
        return NextResponse.json({ error: "ID partner wajib disertakan" }, { status: 400 });
      }

      if (type === "sponsor") {
        await deleteSponsorStore(numId, name);
        await deleteSponsorFromDB(numId);
        return NextResponse.json({ success: true, message: "Sponsor berhasil dihapus" });
      }

      if (type === "media_partner") {
        await deleteMediaPartnerStore(numId, name);
        await deleteMediaPartnerFromDB(numId);
        return NextResponse.json({ success: true, message: "Media partner berhasil dihapus" });
      }

      return NextResponse.json({ error: "Tipe partner tidak valid" }, { status: 400 });
    }

    if (action === "update") {
      const numId = Number(id);
      if (!numId) {
        return NextResponse.json({ error: "ID partner wajib disertakan" }, { status: 400 });
      }
      if (type !== "sponsor" && type !== "media_partner") {
        return NextResponse.json({ error: "Tipe partner tidak valid" }, { status: 400 });
      }

      const updatePayload = {
        ...(name && { name }),
        ...(logoUrl && { logoUrl }),
        ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
        ...(isVisible !== undefined && { isVisible }),
        ...(logoScale !== undefined && { logoScale: Number(logoScale) }),
        ...(logoPositionX !== undefined && { logoPositionX: Number(logoPositionX) }),
        ...(logoPositionY !== undefined && { logoPositionY: Number(logoPositionY) }),
      };

      if (previousType && previousType !== type) {
        const source =
          previousType === "sponsor"
            ? (await getSponsorsStore()).find((item) => item.id === numId) ?? null
            : (await getMediaPartnersStore()).find((item) => item.id === numId) ?? null;

        if (!source) {
          return NextResponse.json({ error: "Partner asal tidak ditemukan" }, { status: 404 });
        }

        if (previousType === "sponsor") {
          await deleteSponsorStore(numId);
          await deleteSponsorFromDB(numId);
        } else {
          await deleteMediaPartnerStore(numId);
          await deleteMediaPartnerFromDB(numId);
        }

        const movedData = {
          ...source,
          ...updatePayload,
          isVisible: isVisible ?? source.isVisible ?? true,
        };
        const moved =
          type === "sponsor"
            ? await addSponsorStore(movedData)
            : await addMediaPartnerStore(movedData);

        return NextResponse.json({ success: true, partner: { ...moved, type } });
      }

      if (type === "sponsor") {
        const updated = await updateSponsorStore(numId, updatePayload);
        await updateSponsorInDB(numId, {
          name,
          logo_url: logoUrl,
          website_url: normalizedWebsiteUrl,
          is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
        });
        return NextResponse.json({ success: true, partner: updated ? { ...updated, type: "sponsor" } : null });
      }

      const updated = await updateMediaPartnerStore(numId, updatePayload);
      await updateMediaPartnerInDB(numId, {
        name,
        logo_url: logoUrl,
        website_url: normalizedWebsiteUrl,
        is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
      });
      return NextResponse.json({ success: true, partner: updated ? { ...updated, type: "media_partner" } : null });
    }

    if (!name || !logoUrl || !type) {
      return NextResponse.json(
        { error: "Nama, Logo URL, dan Tipe wajib diisi" },
        { status: 400 }
      );
    }

    if (type !== "sponsor" && type !== "media_partner") {
      return NextResponse.json({ error: "Tipe partner tidak valid" }, { status: 400 });
    }

    if (type === "sponsor") {
      const dbId = await insertSponsorToDB({
        name,
        logo_url: logoUrl,
        website_url: normalizedWebsiteUrl,
        is_visible: isVisible === false ? 0 : 1,
      });
      const newSponsor = await addSponsorStore({
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        isVisible: isVisible ?? true,
        logoScale: logoScale ?? 100,
        logoPositionX: logoPositionX ?? 50,
        logoPositionY: logoPositionY ?? 50,
      }, dbId || undefined);
      return NextResponse.json({ success: true, partner: { ...newSponsor, type: "sponsor" } }, { status: 201 });
    } else {
      const dbId = await insertMediaPartnerToDB({
        name,
        logo_url: logoUrl,
        website_url: normalizedWebsiteUrl,
        is_visible: isVisible === false ? 0 : 1,
      });
      const newMedia = await addMediaPartnerStore({
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        isVisible: isVisible ?? true,
        logoScale: logoScale ?? 100,
        logoPositionX: logoPositionX ?? 50,
        logoPositionY: logoPositionY ?? 50,
      }, dbId || undefined);
      return NextResponse.json({ success: true, partner: { ...newMedia, type: "media_partner" } }, { status: 201 });
    }
  } catch (error) {
    console.error("POST partner error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data partner" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    invalidatePartnersCache();
    const body = await request.json();
    const { id, name, logoUrl, type, websiteUrl, isVisible } = body;

    if (!id) {
      return NextResponse.json({ error: "ID partner wajib disertakan" }, { status: 400 });
    }

    const numId = Number(id);
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    if (type === "sponsor") {
      const updated = await updateSponsorStore(numId, {
        ...(name && { name }),
        ...(logoUrl && { logoUrl }),
        ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
        ...(isVisible !== undefined && { isVisible }),
      });
      await updateSponsorInDB(numId, {
        name,
        logo_url: logoUrl,
        website_url: normalizedWebsiteUrl,
        is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
      });
      return NextResponse.json({ success: true, partner: updated ? { ...updated, type: "sponsor" } : null });
    } else if (type === "media_partner") {
      const updated = await updateMediaPartnerStore(numId, {
        ...(name && { name }),
        ...(logoUrl && { logoUrl }),
        ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
        ...(isVisible !== undefined && { isVisible }),
      });
      await updateMediaPartnerInDB(numId, {
        name,
        logo_url: logoUrl,
        website_url: normalizedWebsiteUrl,
        is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
      });
      return NextResponse.json({ success: true, partner: updated ? { ...updated, type: "media_partner" } : null });
    } else {
      let updated = await updateSponsorStore(numId, {
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        ...(isVisible !== undefined && { isVisible }),
      });
      if (updated) {
        await updateSponsorInDB(numId, {
          name,
          logo_url: logoUrl,
          website_url: normalizedWebsiteUrl,
          is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
        });
        return NextResponse.json({ success: true, partner: { ...updated, type: "sponsor" } });
      }

      updated = await updateMediaPartnerStore(numId, {
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        ...(isVisible !== undefined && { isVisible }),
      });
      if (updated) {
        await updateMediaPartnerInDB(numId, {
          name,
          logo_url: logoUrl,
          website_url: normalizedWebsiteUrl,
          is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
        });
        return NextResponse.json({ success: true, partner: { ...updated, type: "media_partner" } });
      }

      return NextResponse.json({ error: "Partner tidak ditemukan" }, { status: 404 });
    }
  } catch (error) {
    console.error("PUT partner error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data partner" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    invalidatePartnersCache();
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const typeParam = searchParams.get("type"); // "sponsor" or "media_partner"

    if (!idParam) {
      return NextResponse.json({ error: "ID partner wajib disertakan" }, { status: 400 });
    }

    const id = Number(idParam);

    if (typeParam === "sponsor") {
      await deleteSponsorStore(id);
      await deleteSponsorFromDB(id);
      return NextResponse.json({ success: true, message: "Sponsor berhasil dihapus" });
    } else if (typeParam === "media_partner") {
      await deleteMediaPartnerStore(id);
      await deleteMediaPartnerFromDB(id);
      return NextResponse.json({ success: true, message: "Media partner berhasil dihapus" });
    } else {
      const deletedSponsor = await deleteSponsorStore(id);
      await deleteSponsorFromDB(id);
      const deletedMedia = await deleteMediaPartnerStore(id);
      await deleteMediaPartnerFromDB(id);

      if (!deletedSponsor && !deletedMedia) {
        return NextResponse.json(
          { error: "Partner tidak ditemukan atau sudah dihapus" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, message: "Partner berhasil dihapus" });
    }
  } catch (error) {
    console.error("DELETE partner error:", error);
    return NextResponse.json({ error: "Gagal menghapus partner" }, { status: 500 });
  }
}
