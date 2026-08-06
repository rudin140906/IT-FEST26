import { NextResponse } from "next/server";
import { fetchPartnersFromDB } from "@/lib/db";
import { fallbackSponsors, fallbackMediaPartners, Partner } from "@/data/sponsors";

export async function GET() {
  try {
    const dbPartners = await fetchPartnersFromDB();

    if (dbPartners && dbPartners.length > 0) {
      const sponsors: Partner[] = dbPartners
        .filter((p) => p.type === "sponsor")
        .map((p) => ({
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url,
          type: "sponsor",
        }));

      const mediaPartners: Partner[] = dbPartners
        .filter((p) => p.type === "media_partner")
        .map((p) => ({
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url,
          type: "media_partner",
        }));

      return NextResponse.json({
        sponsors: sponsors.length > 0 ? sponsors : fallbackSponsors,
        mediaPartners: mediaPartners.length > 0 ? mediaPartners : fallbackMediaPartners,
        source: "mysql",
      });
    }
  } catch (error) {
    console.error("API partners route fallback:", error);
  }

  // Fallback if MySQL is unreachable
  return NextResponse.json({
    sponsors: fallbackSponsors,
    mediaPartners: fallbackMediaPartners,
    source: "fallback",
  });
}
