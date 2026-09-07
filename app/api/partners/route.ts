import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
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
  source: "supabase" | "file";
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

  try {
    // partners-store now handles DB-first fetching internally
    const fileSponsors = await getSponsorsStore();
    const fileMedia = await getMediaPartnersStore();

    const sponsors: PartnerApiItem[] = fileSponsors.map((s) => ({
      id: s.id,
      name: s.name,
      logoUrl: s.logoUrl,
      type: "sponsor" as const,
      websiteUrl: normalizePartnerWebsiteUrl(s.websiteUrl),
      isVisible: s.isVisible ?? true,
      logoScale: s.logoScale ?? 100,
      logoPositionX: s.logoPositionX ?? 50,
      logoPositionY: s.logoPositionY ?? 50,
    }));

    const mediaPartners: PartnerApiItem[] = fileMedia.map((m) => ({
      id: m.id,
      name: m.name,
      logoUrl: m.logoUrl,
      type: "media_partner" as const,
      websiteUrl: normalizePartnerWebsiteUrl(m.websiteUrl),
      isVisible: m.isVisible ?? true,
      logoScale: m.logoScale ?? 100,
      logoPositionX: m.logoPositionX ?? 50,
      logoPositionY: m.logoPositionY ?? 50,
    }));

    const combined = [...sponsors, ...mediaPartners];

    const resultData: PartnersApiResponse = {
      all: includeHidden ? combined : combined.filter((item) => item.isVisible !== false),
      sponsors: includeHidden ? sponsors : sponsors.filter((item) => item.isVisible !== false),
      mediaPartners: includeHidden ? mediaPartners : mediaPartners.filter((item) => item.isVisible !== false),
      source: "supabase",
    };

    partnersCache.set(cacheKey, { data: resultData, timestamp: now });

    return NextResponse.json(resultData, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("GET partners error:", error);
    return NextResponse.json({ error: "Gagal mengambil data partner" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    invalidatePartnersCache();
    const body = await request.json();
    const { id, name, logoUrl, type, previousType, websiteUrl, isVisible, logoScale, logoPositionX, logoPositionY } = body;
    const action = String(body.action || "create").toLowerCase();
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    // === DELETE ACTION ===
    if (action === "delete") {
      const numId = Number(id);
      if (!numId) {
        return NextResponse.json({ error: "ID partner wajib disertakan" }, { status: 400 });
      }

      if (type === "sponsor") {
        const deleted = await deleteSponsorStore(numId, name);
        if (deleted) {
          return NextResponse.json({ success: true, message: "Sponsor berhasil dihapus" });
        } else {
          return NextResponse.json({ error: "Gagal menghapus sponsor. Data mungkin sudah dihapus sebelumnya." }, { status: 404 });
        }
      }

      if (type === "media_partner") {
        const deleted = await deleteMediaPartnerStore(numId, name);
        if (deleted) {
          return NextResponse.json({ success: true, message: "Media partner berhasil dihapus" });
        } else {
          return NextResponse.json({ error: "Gagal menghapus media partner. Data mungkin sudah dihapus sebelumnya." }, { status: 404 });
        }
      }

      return NextResponse.json({ error: "Tipe partner tidak valid" }, { status: 400 });
    }

    // === UPDATE ACTION ===
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

      // Handle type change (e.g., sponsor → media_partner)
      if (previousType && previousType !== type) {
        const source =
          previousType === "sponsor"
            ? (await getSponsorsStore()).find((item) => item.id === numId) ?? null
            : (await getMediaPartnersStore()).find((item) => item.id === numId) ?? null;

        if (!source) {
          return NextResponse.json({ error: "Partner asal tidak ditemukan" }, { status: 404 });
        }

        // Delete from old type
        if (previousType === "sponsor") {
          await deleteSponsorStore(numId);
        } else {
          await deleteMediaPartnerStore(numId);
        }

        // Add to new type
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

      // Normal update (same type)
      if (type === "sponsor") {
        const updated = await updateSponsorStore(numId, updatePayload);
        return NextResponse.json({
          success: true,
          partner: updated ? { ...updated, type: "sponsor" } : null,
        });
      }

      const updated = await updateMediaPartnerStore(numId, updatePayload);
      return NextResponse.json({
        success: true,
        partner: updated ? { ...updated, type: "media_partner" } : null,
      });
    }

    // === CREATE ACTION ===
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
        logoScale: logoScale ?? 100,
        logoPositionX: logoPositionX ?? 50,
        logoPositionY: logoPositionY ?? 50,
      });
      return NextResponse.json({ success: true, partner: { ...newSponsor, type: "sponsor" } }, { status: 201 });
    } else {
      const newMedia = await addMediaPartnerStore({
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        isVisible: isVisible ?? true,
        logoScale: logoScale ?? 100,
        logoPositionX: logoPositionX ?? 50,
        logoPositionY: logoPositionY ?? 50,
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
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    if (type === "sponsor") {
      const updated = await updateSponsorStore(numId, {
        ...(name && { name }),
        ...(logoUrl && { logoUrl }),
        ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
        ...(isVisible !== undefined && { isVisible }),
      });
      return NextResponse.json({ success: true, partner: updated ? { ...updated, type: "sponsor" } : null });
    } else if (type === "media_partner") {
      const updated = await updateMediaPartnerStore(numId, {
        ...(name && { name }),
        ...(logoUrl && { logoUrl }),
        ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
        ...(isVisible !== undefined && { isVisible }),
      });
      return NextResponse.json({ success: true, partner: updated ? { ...updated, type: "media_partner" } : null });
    } else {
      // Try both
      let updated = await updateSponsorStore(numId, {
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        ...(isVisible !== undefined && { isVisible }),
      });
      if (updated) {
        return NextResponse.json({ success: true, partner: { ...updated, type: "sponsor" } });
      }

      updated = await updateMediaPartnerStore(numId, {
        name,
        logoUrl,
        websiteUrl: normalizedWebsiteUrl,
        ...(isVisible !== undefined && { isVisible }),
      });
      if (updated) {
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
      const deleted = await deleteSponsorStore(id);
      if (deleted) {
        return NextResponse.json({ success: true, message: "Sponsor berhasil dihapus" });
      }
      return NextResponse.json({ error: "Sponsor tidak ditemukan atau sudah dihapus" }, { status: 404 });
    } else if (typeParam === "media_partner") {
      const deleted = await deleteMediaPartnerStore(id);
      if (deleted) {
        return NextResponse.json({ success: true, message: "Media partner berhasil dihapus" });
      }
      return NextResponse.json({ error: "Media partner tidak ditemukan atau sudah dihapus" }, { status: 404 });
    } else {
      const deletedSponsor = await deleteSponsorStore(id);
      const deletedMedia = await deleteMediaPartnerStore(id);

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
