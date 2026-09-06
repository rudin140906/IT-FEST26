import { NextResponse } from "next/server";

export const dynamic = "force-static";
import {
  fetchSponsorsFromDB,
  insertSponsorToDB,
  updateSponsorInDB,
  deleteSponsorFromDB,
} from "@/lib/db";
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
  source: "mysql" | "file";
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

  let sponsorsList = null;
  let source: "mysql" | "file" = "file";

  try {
    const dbSponsors = await fetchSponsorsFromDB();
    if (dbSponsors && dbSponsors.length > 0) {
      sponsorsList = dbSponsors.map((s) => ({
        id: s.id,
        name: s.name,
        logoUrl: s.logo_url,
        websiteUrl: normalizePartnerWebsiteUrl(s.website_url),
        createdAt: s.created_at,
        isVisible: s.is_visible !== 0,
      })).filter((s) => s.isVisible !== false);
      source = "mysql";
    }
  } catch (error) {
    console.error("API sponsors route DB read warning:", error);
  }

  if (!sponsorsList) {
    sponsorsList = await getSponsorsStore();
  }

  const result = { sponsors: sponsorsList, source };
  cachedSponsorsData = { data: result, timestamp: now };

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=20",
    },
  });
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

    const updatedSponsor = await updateSponsorStore(Number(id), {
      ...(name && { name }),
      ...(logoUrl && { logoUrl }),
      ...(websiteUrl !== undefined && { websiteUrl: normalizedWebsiteUrl }),
      ...(isVisible !== undefined && { isVisible }),
    });

    if (!updatedSponsor) {
      return NextResponse.json({ error: "Sponsor tidak ditemukan" }, { status: 404 });
    }

    await updateSponsorInDB(Number(id), {
      name,
      logo_url: logoUrl,
      website_url: normalizedWebsiteUrl,
      is_visible: isVisible !== undefined ? (isVisible ? 1 : 0) : undefined,
    });

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

    const id = Number(idParam);
    const deleted = await deleteSponsorStore(id);
    await deleteSponsorFromDB(id);

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
