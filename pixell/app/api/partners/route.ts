import { NextResponse } from "next/server";
import {
  fetchPartnersFromDB,
  insertPartnerToDB,
  updatePartnerInDB,
  deletePartnerFromDB,
} from "@/lib/db";
import {
  getPartnersStore,
  addPartnerStore,
  updatePartnerStore,
  deletePartnerStore,
  PartnerItem,
} from "@/lib/partners-store";

export async function GET() {
  try {
    // 1. Try fetching from MySQL database first if configured
    const dbPartners = await fetchPartnersFromDB();

    if (dbPartners && dbPartners.length > 0) {
      const sponsors = dbPartners
        .filter((p) => p.type === "sponsor")
        .map((p) => ({
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url,
          type: "sponsor" as const,
          websiteUrl: p.website_url,
        }));

      const mediaPartners = dbPartners
        .filter((p) => p.type === "media_partner")
        .map((p) => ({
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url,
          type: "media_partner" as const,
          websiteUrl: p.website_url,
        }));

      return NextResponse.json({
        all: [...sponsors, ...mediaPartners],
        sponsors,
        mediaPartners,
        source: "mysql",
      });
    }
  } catch (error) {
    console.error("API partners route DB read warning:", error);
  }

  // 2. Fallback to local JSON file store (data/partners.json)
  const localPartners = await getPartnersStore();
  const sponsors = localPartners.filter((p) => p.type === "sponsor");
  const mediaPartners = localPartners.filter((p) => p.type === "media_partner");

  return NextResponse.json({
    all: localPartners,
    sponsors,
    mediaPartners,
    source: "file",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, logoUrl, type, websiteUrl } = body;

    if (!name || !logoUrl || !type) {
      return NextResponse.json(
        { error: "Nama, Logo URL, dan Tipe wajib diisi" },
        { status: 400 }
      );
    }

    if (type !== "sponsor" && type !== "media_partner") {
      return NextResponse.json({ error: "Tipe partner tidak valid" }, { status: 400 });
    }

    // Save to local JSON store first for instant guarantee
    const newPartner = await addPartnerStore({
      name,
      logoUrl,
      type,
      websiteUrl: websiteUrl || "",
    });

    // Also attempt DB insert if MySQL is active
    await insertPartnerToDB({
      name,
      logo_url: logoUrl,
      type,
      website_url: websiteUrl,
    });

    return NextResponse.json({ success: true, partner: newPartner }, { status: 201 });
  } catch (error) {
    console.error("POST partner error:", error);
    return NextResponse.json({ error: "Gagal menyimpann data partner" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, logoUrl, type, websiteUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "ID partner wajib disertakan" }, { status: 400 });
    }

    const updatedPartner = await updatePartnerStore(Number(id), {
      ...(name && { name }),
      ...(logoUrl && { logoUrl }),
      ...(type && { type }),
      ...(websiteUrl !== undefined && { websiteUrl }),
    });

    if (!updatedPartner) {
      return NextResponse.json({ error: "Partner tidak ditemukan" }, { status: 404 });
    }

    // Also attempt DB update if MySQL is active
    await updatePartnerInDB(Number(id), {
      name,
      logo_url: logoUrl,
      type,
      website_url: websiteUrl,
    });

    return NextResponse.json({ success: true, partner: updatedPartner });
  } catch (error) {
    console.error("PUT partner error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data partner" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json({ error: "ID partner wajib disertakan" }, { status: 400 });
    }

    const id = Number(idParam);
    const deleted = await deletePartnerStore(id);

    // Also attempt DB delete
    await deletePartnerFromDB(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Partner tidak ditemukan atau sudah dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Partner berhasil dihapus" });
  } catch (error) {
    console.error("DELETE partner error:", error);
    return NextResponse.json({ error: "Gagal menghapus partner" }, { status: 500 });
  }
}
