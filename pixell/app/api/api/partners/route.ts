import { NextResponse } from "next/server";
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

export const dynamic = "force-static";
export const revalidate = 0;

type PartnersCacheKey = "hidden" | "visible";
type PartnerApiItem = {
  id: number;
  name: string;
  logoUrl: string;
  type: "sponsor" | "media_partner";
  websiteUrl?: string;
  isVisible?: boolean;
};

type PartnersApiResponse = {
  all: PartnerApiItem[];
  sponsors: PartnerApiItem[];
  mediaPartners: PartnerApiItem[];
  source: "mysql" | "file";
};

const partnersCache = new Map<PartnersCacheKey, { data: PartnersApiResponse; timestamp: number }>();
const CACHE_TTL_MS = 10000; // 10 seconds in-memory TTL

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

  try {
    const dbSponsors = await fetchSponsorsFromDB();
    const dbMedia = await fetchMediaPartnersFromDB();

    if ((dbSponsors && dbSponsors.length > 0) || (dbMedia && dbMedia.length > 0)) {
      const sponsors = (dbSponsors || []).map((p) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logo_url,
        type: "sponsor" as const,
        websiteUrl: normalizePartnerWebsiteUrl(p.website_url),
        isVisible: p.is_visible !== 0,
      }));

      const mediaPartners = (dbMedia || []).map((p) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logo_url,
        type: "media_partner" as const,
        websiteUrl: normalizePartnerWebsiteUrl(p.website_url),
        isVisible: p.is_visible !== 0,
      }));

      resultData = {
        all: includeHidden ? [...sponsors, ...mediaPartners] : [...sponsors, ...mediaPartners].filter((item) => item.isVisible !== false),
        sponsors: includeHidden ? sponsors : sponsors.filter((item) => item.isVisible !== false),
        mediaPartners: includeHidden ? mediaPartners : mediaPartners.filter((item) => item.isVisible !== false),
        source: "mysql",
      };
    }
  } catch (error) {
    console.error("API partners route DB read warning:", error);
  }

  if (!resultData) {
    // Fallback to local JSON file stores
    const fileSponsors = await getSponsorsStore();
    const fileMedia = await getMediaPartnersStore();

    const sponsors = fileSponsors.map((s) => ({
      ...s,
      type: "sponsor" as const,
      websiteUrl: normalizePartnerWebsiteUrl(s.websiteUrl),
      isVisible: s.isVisible ?? true,
    }));
    const mediaPartners = fileMedia.map((m) => ({
      ...m,
      type: "media_partner" as const,
      websiteUrl: normalizePartnerWebsiteUrl(m.websiteUrl),
      isVisible: m.isVisible ?? true,
    }));

    const combined = [...sponsors, ...mediaPartners];

    resultData = {
      all: includeHidden ? combined : combined.filter((item) => item.isVisible !== false),
      sponsors: includeHidden ? sponsors : sponsors.filter((item) => item.isVisible !== false),
      mediaPartners: includeHidden ? mediaPartners : mediaPartners.filter((item) => item.isVisible !== false),
      source: "file",
    };
  }

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
    const { name, logoUrl, type, websiteUrl, isVisible } = body;
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

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
      const newSponsor = await addSponsorStore({
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        isVisible: isVisible ?? true,
      });
      await insertSponsorToDB({
        name,
        logo_url: logoUrl,
        website_url: normalizedWebsiteUrl,
        is_visible: isVisible === false ? 0 : 1,
      });
      return NextResponse.json({ success: true, partner: { ...newSponsor, type: "sponsor" } }, { status: 201 });
    } else {
      const newMedia = await addMediaPartnerStore({
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        isVisible: isVisible ?? true,
      });
      await insertMediaPartnerToDB({
        name,
        logo_url: logoUrl,
        website_url: normalizedWebsiteUrl,
        is_visible: isVisible === false ? 0 : 1,
      });
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
      // Try both if type not explicitly specified
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
