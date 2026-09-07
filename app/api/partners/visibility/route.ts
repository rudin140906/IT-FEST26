import { NextResponse } from "next/server";
import { invalidatePartnersCache } from "@/app/api/partners/route";
import { invalidateSponsorsCache } from "@/app/api/sponsors/route";
import { invalidateMediaPartnersCache } from "@/app/api/media-partners/route";
import {
  getSponsorsStore,
  getMediaPartnersStore,
  updateSponsorStore,
  updateMediaPartnerStore,
} from "@/lib/partners-store";

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
      const sponsors = await getSponsorsStore();
      const item = sponsors.find((s) => s.id === id);

      if (!item) {
        return NextResponse.json({ error: "Sponsor tidak ditemukan" }, { status: 404 });
      }

      const currentVisible = item.isVisible ?? true;
      const nextVisible = isVisible ?? !currentVisible;

      // updateSponsorStore handles DB update internally
      const updated = await updateSponsorStore(id, { isVisible: nextVisible });

      return NextResponse.json({
        success: true,
        partner: updated
          ? { ...updated, type: "sponsor" as const }
          : { id, type: "sponsor" as const, isVisible: nextVisible },
      });
    }

    // Media partner
    const mediaPartners = await getMediaPartnersStore();
    const item = mediaPartners.find((m) => m.id === id);

    if (!item) {
      return NextResponse.json({ error: "Media partner tidak ditemukan" }, { status: 404 });
    }

    const currentVisible = item.isVisible ?? true;
    const nextVisible = isVisible ?? !currentVisible;

    // updateMediaPartnerStore handles DB update internally
    const updated = await updateMediaPartnerStore(id, { isVisible: nextVisible });

    return NextResponse.json({
      success: true,
      partner: updated
        ? { ...updated, type: "media_partner" as const }
        : { id, type: "media_partner" as const, isVisible: nextVisible },
    });
  } catch (error) {
    console.error("PATCH partner visibility error:", error);
    return NextResponse.json({ error: "Gagal memperbarui visibilitas partner" }, { status: 500 });
  }
}
