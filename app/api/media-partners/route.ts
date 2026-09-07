import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import {
  getMediaPartnersStore,
  addMediaPartnerStore,
  updateMediaPartnerStore,
  deleteMediaPartnerStore,
} from "@/lib/partners-store";
import { normalizePartnerWebsiteUrl } from "@/lib/partner-url";

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
  source: "supabase" | "file";
};

let cachedMediaPartnersData: { data: MediaPartnersApiResponse; timestamp: number } | null = null;
const CACHE_TTL_MS = 5000;

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

  try {
    // getMediaPartnersStore handles DB-first fetching internally
    const mediaPartners = await getMediaPartnersStore();
    const mediaPartnersList = mediaPartners
      .filter((m) => m.isVisible !== false)
      .map((m) => ({
        id: m.id,
        name: m.name,
        logoUrl: m.logoUrl,
        websiteUrl: normalizePartnerWebsiteUrl(m.websiteUrl),
        createdAt: m.createdAt,
        isVisible: m.isVisible ?? true,
      }));

    const result: MediaPartnersApiResponse = { mediaPartners: mediaPartnersList, source: "supabase" };
    cachedMediaPartnersData = { data: result, timestamp: now };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("GET media-partners error:", error);
    return NextResponse.json({ error: "Gagal mengambil data media partner" }, { status: 500 });
  }
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

    // addMediaPartnerStore handles DB insert internally
    const newMediaPartner = await addMediaPartnerStore({
      name,
      logoUrl,
      websiteUrl: normalizedWebsiteUrl,
      isVisible: isVisible ?? true,
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

    // updateMediaPartnerStore handles DB update internally
    const updatedMediaPartner = await updateMediaPartnerStore(Number(id), {
      ...(name && { name }),
      ...(logoUrl && { logoUrl }),
      ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
      ...(isVisible !== undefined && { isVisible }),
    });

    if (!updatedMediaPartner) {
      return NextResponse.json({ error: "Media partner tidak ditemukan" }, { status: 404 });
    }

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

    // deleteMediaPartnerStore handles DB delete internally
    const deleted = await deleteMediaPartnerStore(Number(idParam));

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
