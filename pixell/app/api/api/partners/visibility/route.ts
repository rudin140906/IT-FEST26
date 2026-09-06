import { NextResponse } from "next/server";
import { invalidatePartnersCache } from "../route";
import { invalidateSponsorsCache } from "@/app/api/sponsors/route";
import { invalidateMediaPartnersCache } from "@/app/api/media-partners/route";
import {
  fetchSponsorsFromDB,
  fetchMediaPartnersFromDB,
  updateSponsorInDB,
  updateMediaPartnerInDB,
} from "@/lib/db";
import {
  getSponsorsStore,
  getMediaPartnersStore,
  updateSponsorStore,
  updateMediaPartnerStore,
} from "@/lib/partners-store";
import { normalizePartnerWebsiteUrl } from "@/lib/partner-url";

type PartnerType = "sponsor" | "media_partner";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const type = body.type as PartnerType | undefined;
    const isVisible = typeof body.isVisible === "boolean" ? body.isVisible : undefined;

    if (!id || !type) {
      return NextResponse.json({ error: "ID dan tipe partner wajib disertakan" }, { status: 400 });
    }

    if (type !== "sponsor" && type !== "media_partner") {
      return NextResponse.json({ error: "Tipe partner tidak valid" }, { status: 400 });
    }

    invalidatePartnersCache();
    invalidateSponsorsCache();
    invalidateMediaPartnersCache();

    if (type === "sponsor") {
      const dbSponsors = await fetchSponsorsFromDB();
      const dbItem = dbSponsors?.find((item) => item.id === id);
      const fileItem = (await getSponsorsStore()).find((item) => item.id === id);
      const currentVisible = dbItem ? dbItem.is_visible !== 0 : fileItem ? fileItem.isVisible ?? true : true;
      const nextVisible = isVisible ?? !currentVisible;

      const dbUpdated = await updateSponsorInDB(id, { is_visible: nextVisible ? 1 : 0 });
      const fileUpdated = await updateSponsorStore(id, { isVisible: nextVisible });

      if (!dbItem && !fileItem) {
        return NextResponse.json({ error: "Sponsor tidak ditemukan" }, { status: 404 });
      }

      const partner = dbItem
        ? { id: dbItem.id, name: dbItem.name, logoUrl: dbItem.logo_url, type: "sponsor" as const, websiteUrl: normalizePartnerWebsiteUrl(dbItem.website_url), isVisible: nextVisible }
        : fileUpdated
          ? { ...fileUpdated, type: "sponsor" as const }
          : { id, type: "sponsor" as const, isVisible: nextVisible };

      return NextResponse.json({ success: true, partner, dbUpdated, fileUpdated: Boolean(fileUpdated) });
    }

    const dbMediaPartners = await fetchMediaPartnersFromDB();
    const dbItem = dbMediaPartners?.find((item) => item.id === id);
    const fileItem = (await getMediaPartnersStore()).find((item) => item.id === id);
    const currentVisible = dbItem ? dbItem.is_visible !== 0 : fileItem ? fileItem.isVisible ?? true : true;
    const nextVisible = isVisible ?? !currentVisible;

    const dbUpdated = await updateMediaPartnerInDB(id, { is_visible: nextVisible ? 1 : 0 });
    const fileUpdated = await updateMediaPartnerStore(id, { isVisible: nextVisible });

    if (!dbItem && !fileItem) {
      return NextResponse.json({ error: "Media partner tidak ditemukan" }, { status: 404 });
    }

    const partner = dbItem
      ? { id: dbItem.id, name: dbItem.name, logoUrl: dbItem.logo_url, type: "media_partner" as const, websiteUrl: normalizePartnerWebsiteUrl(dbItem.website_url), isVisible: nextVisible }
      : fileUpdated
        ? { ...fileUpdated, type: "media_partner" as const }
        : { id, type: "media_partner" as const, isVisible: nextVisible };

    return NextResponse.json({ success: true, partner, dbUpdated, fileUpdated: Boolean(fileUpdated) });
  } catch (error) {
    console.error("PATCH partner visibility error:", error);
    return NextResponse.json({ error: "Gagal memperbarui visibilitas partner" }, { status: 500 });
  }
}
