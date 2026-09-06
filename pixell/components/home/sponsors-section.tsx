"use client";

import { CSSProperties, useEffect, useState } from "react";
import { Partner } from "@/data/sponsors";
import { apiPath, withBasePath } from "@/lib/site-path";
import { normalizePartnerWebsiteUrl } from "@/lib/partner-url";

const MARQUEE_SLOT_COUNT = 16;
const MARQUEE_DURATION_SECONDS = 34;

function clampLogoNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function buildLoop(items: Partner[], slotCount = MARQUEE_SLOT_COUNT) {
  if (items.length === 0) return [];
  return Array.from({ length: slotCount * 2 }, (_, index) => items[index % items.length]);
}

function logoStyle(item: Partner): CSSProperties {
  const scale = clampLogoNumber(item.logoScale, 100, 55, 180);
  const x = clampLogoNumber(item.logoPositionX, 50, 0, 100);
  const y = clampLogoNumber(item.logoPositionY, 50, 0, 100);

  return {
    width: `${scale}%`,
    height: `${scale}%`,
    objectPosition: `${x}% ${y}%`,
  };
}

function PartnerLogoCard({ item, accent }: { item: Partner; accent: "yellow" | "cyan" }) {
  const accentClass = accent === "yellow" ? "hover:border-yellow" : "hover:border-cyan";
  const accentGlow = accent === "yellow" ? "from-yellow/35 via-pink/10" : "from-cyan/30 via-yellow/20";
  const websiteUrl = normalizePartnerWebsiteUrl(item.websiteUrl);
  const content = (
    <div
      className={`flex items-center justify-center w-full h-full border-2 border-ink shadow-hard-sm bg-gradient-to-br from-yellow via-yellow-dim to-pink/35 ${accentClass} hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
      title={websiteUrl ? `${item.name} - buka website` : item.name}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${accentGlow} to-cyan/20 opacity-80`} />
      <div className="absolute inset-x-2 top-1 h-1 bg-cream/60" />
      <div className="absolute -left-6 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-cream/35 blur-xl" />
      <div className="absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-ink/10 blur-xl" />
      <div className="relative w-full h-full p-3 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBasePath(item.logoUrl)}
          alt={item.name}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          style={logoStyle(item)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = withBasePath("/logos/logo_navbar.png");
          }}
        />
      </div>
    </div>
  );

  if (!websiteUrl) return content;

  return (
    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-pointer">
      {content}
    </a>
  );
}

function PartnerMarquee({ items, accent }: { items: Partner[]; accent: "yellow" | "cyan" }) {
  const loop = buildLoop(items);

  return (
    <div className="relative overflow-hidden w-full py-4 border-y-2 border-ink/40 bg-navy-800/40">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-navy-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-navy-900 to-transparent z-10 pointer-events-none" />

      <div
        className="flex w-max animate-marquee hover:[animation-play-state:paused]"
        style={{ animationDuration: `${MARQUEE_DURATION_SECONDS}s` }}
      >
        {loop.map((item, idx) => (
          <div key={`${accent}-${item.type}-${item.id}-${idx}`} className="shrink-0 w-[220px] h-24 px-4">
            <PartnerLogoCard item={item} accent={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Partner[]>([]);
  const [mediaPartners, setMediaPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPartners() {
      try {
        const res = await fetch(apiPath("/partners"), { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setSponsors(Array.isArray(data.sponsors) ? data.sponsors : []);
          setMediaPartners(Array.isArray(data.mediaPartners) ? data.mediaPartners : []);
        }
      } catch (err: any) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          console.warn("Could not fetch partners API:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoaded(true);
        }
      }
    }

    loadPartners();
    return () => controller.abort();
  }, []);

  if (!loaded) return null;
  if (sponsors.length === 0 && mediaPartners.length === 0) return null;

  return (
    <section className="py-16 relative overflow-hidden bg-navy-900/90 border-t-3 border-ink">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-pink/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        {sponsors.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <span className="font-pixel text-[10px] text-pink tracking-widest block uppercase mb-1">
                ◆ SUPPORTED BY
              </span>
              <h2 className="font-pixel text-cream text-2xl md:text-4xl tracking-wider drop-shadow-[0_3px_0_rgba(5,7,20,1)]">
                SPONSORS
              </h2>
            </div>
            <PartnerMarquee items={sponsors} accent="yellow" />
          </div>
        )}

        {mediaPartners.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <span className="font-pixel text-[10px] text-cyan tracking-widest block uppercase mb-1">
                ◆ OFFICIAL MEDIA PARTNER
              </span>
              <h2 className="font-pixel text-cream text-2xl md:text-4xl tracking-wider drop-shadow-[0_3px_0_rgba(5,7,20,1)]">
                MEDIA PARTNERS
              </h2>
            </div>
            <PartnerMarquee items={mediaPartners} accent="cyan" />
          </div>
        )}
      </div>
    </section>
  );
}
