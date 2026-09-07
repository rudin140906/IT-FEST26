import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import {
  getSponsorsStore,
  addSponsorStore,
  updateSponsorStore,
  deleteSponsorStore,
} from "@/lib/partners-store";
import { normalizePartnerWebsiteUrl } from "@/lib/partner-url";

type SponsorApiItem = {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  createdAt?: string;
  isVisible?: boolean;
};

type SponsorsApiResponse = {
  sponsors: SponsorApiItem[];
  source: "supabase" | "file";
};

let cachedSponsorsData: { data: SponsorsApiResponse; timestamp: number } | null = null;
const CACHE_TTL_MS = 5000;

export function invalidateSponsorsCache() {
  cachedSponsorsData = null;
}

export async function GET() {
  const now = Date.now();
  if (cachedSponsorsData && now - cachedSponsorsData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedSponsorsData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
      },
    });
  }

  try {
    // getSponsorsStore handles DB-first fetching internally
    const sponsors = await getSponsorsStore();
    const sponsorsList = sponsors
      .filter((s) => s.isVisible !== false)
      .map((s) => ({
        id: s.id,
        name: s.name,
        logoUrl: s.logoUrl,
        websiteUrl: normalizePartnerWebsiteUrl(s.websiteUrl),
        createdAt: s.createdAt,
        isVisible: s.isVisible ?? true,
      }));

    const result: SponsorsApiResponse = { sponsors: sponsorsList, source: "supabase" };
    cachedSponsorsData = { data: result, timestamp: now };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("GET sponsors error:", error);
    return NextResponse.json({ error: "Gagal mengambil data sponsor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    invalidateSponsorsCache();
    const body = await request.json();
    const { name, logoUrl, websiteUrl, isVisible } = body;
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    if (!name || !logoUrl) {
      return NextResponse.json(
        { error: "Nama dan Logo URL wajib diisi" },
        { status: 400 }
      );
    }

    // addSponsorStore handles DB insert internally
    const newSponsor = await addSponsorStore({
      name,
      logoUrl,
      websiteUrl: normalizedWebsiteUrl,
      isVisible: isVisible ?? true,
    });

    return NextResponse.json({ success: true, sponsor: newSponsor }, { status: 201 });
  } catch (error) {
    console.error("POST sponsor error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data sponsor" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    invalidateSponsorsCache();
    const body = await request.json();
    const { id, name, logoUrl, websiteUrl, isVisible } = body;
    const normalizedWebsiteUrl = normalizePartnerWebsiteUrl(websiteUrl);

    if (!id) {
      return NextResponse.json({ error: "ID sponsor wajib disertakan" }, { status: 400 });
    }

    // updateSponsorStore handles DB update internally
    const updatedSponsor = await updateSponsorStore(Number(id), {
      ...(name && { name }),
      ...(logoUrl && { logoUrl }),
      ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
      ...(isVisible !== undefined && { isVisible }),
    });

    if (!updatedSponsor) {
      return NextResponse.json({ error: "Sponsor tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sponsor: updatedSponsor });
  } catch (error) {
    console.error("PUT sponsor error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data sponsor" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    invalidateSponsorsCache();
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json({ error: "ID sponsor wajib disertakan" }, { status: 400 });
    }

    // deleteSponsorStore handles DB delete internally
    const deleted = await deleteSponsorStore(Number(idParam));

    if (!deleted) {
      return NextResponse.json(
        { error: "Sponsor tidak ditemukan atau sudah dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Sponsor berhasil dihapus" });
  } catch (error) {
    console.error("DELETE sponsor error:", error);
    return NextResponse.json({ error: "Gagal menghapus sponsor" }, { status: 500 });
  }
}
