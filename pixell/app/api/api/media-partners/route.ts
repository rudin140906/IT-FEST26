import { NextResponse } from "next/server";
import {
  fetchMediaPartnersFromDB,
  insertMediaPartnerToDB,
  updateMediaPartnerInDB,
  deleteMediaPartnerFromDB,
} from "@/lib/db";
import {
  getMediaPartnersStore,
  addMediaPartnerStore,
  updateMediaPartnerStore,
  deleteMediaPartnerStore,
} from "@/lib/partners-store";
import { normalizePartnerWebsiteUrl } from "@/lib/partner-url";

export const dynamic = "force-static";
export const revalidate = 0;

type MediaPartnerApiItem = {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  createdAt?: string;
  isVisible?: boolean;
};

type MediaPartnersApiResponse = {
  mediaPartners: MediaPartnerApiItem[];
  source: "mysql" | "file";
};

let cachedMediaPartnersData: { data: MediaPartnersApiResponse; timestamp: number } | null = null;
const CACHE_TTL_MS = 10000;

export function invalidateMediaPartnersCache() {
  cachedMediaPartnersData = null;
}

export async function GET() {
  const now = Date.now();
  if (cachedMediaPartnersData && now - cachedMediaPartnersData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedMediaPartnersData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
      },
    });
  }

  let mediaPartnersList = null;
  let source: "mysql" | "file" = "file";

  try {
    const dbMediaPartners = await fetchMediaPartnersFromDB();
    if (dbMediaPartners && dbMediaPartners.length > 0) {
      mediaPartnersList = dbMediaPartners.map((m) => ({
        id: m.id,
        name: m.name,
        logoUrl: m.logo_url,
        websiteUrl: normalizePartnerWebsiteUrl(m.website_url),
        createdAt: m.created_at,
        isVisible: m.is_visible !== 0,
      })).filter((m) => m.isVisible !== false);
      source = "mysql";
    }
  } catch (error) {
    console.error("API media-partners route DB read warning:", error);
  }

  if (!mediaPartnersList) {
    mediaPartnersList = await getMediaPartnersStore();
  }

  const result = { mediaPartners: mediaPartnersList, source };
  cachedMediaPartnersData = { data: result, timestamp: now };

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
    },
  });
}

export async function POST(request: Request) {
  try {
    invalidateMediaPartnersCache();
    const body = await request.json();
    const { name, logoUrl, websiteUrl, isVisible } = body;
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    if (!name || !logoUrl) {
      return NextResponse.json(
        { error: "Nama dan Logo URL wajib diisi" },
        { status: 400 }
      );
    }

    const newMediaPartner = await addMediaPartnerStore({
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

    return NextResponse.json({ success: true, mediaPartner: newMediaPartner }, { status: 201 });
  } catch (error) {
    console.error("POST media_partner error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data media partner" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    invalidateMediaPartnersCache();
    const body = await request.json();
    const { id, name, logoUrl, websiteUrl, isVisible } = body;
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    if (!id) {
      return NextResponse.json({ error: "ID media partner wajib disertakan" }, { status: 400 });
    }

    const updatedMediaPartner = await updateMediaPartnerStore(Number(id), {
      ...(name && { name }),
      ...(logoUrl && { logoUrl }),
      ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
      ...(isVisible !== undefined && { isVisible }),
    });

    if (!updatedMediaPartner) {
      return NextResponse.json({ error: "Media partner tidak ditemukan" }, { status: 404 });
    }

    await updateMediaPartnerInDB(Number(id), {
      name,
      logo_url: logoUrl,
      website_url: normalizedWebsiteUrl,
      is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
    });

    return NextResponse.json({ success: true, mediaPartner: updatedMediaPartner });
  } catch (error) {
    console.error("PUT media_partner error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data media partner" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    invalidateMediaPartnersCache();
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json({ error: "ID media partner wajib disertakan" }, { status: 400 });
    }

    const id = Number(idParam);
    const deleted = await deleteMediaPartnerStore(id);
    await deleteMediaPartnerFromDB(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Media partner tidak ditemukan atau sudah dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Media partner berhasil dihapus" });
  } catch (error) {
    console.error("DELETE media_partner error:", error);
    return NextResponse.json({ error: "Gagal menghapus media partner" }, { status: 500 });
  }
}
