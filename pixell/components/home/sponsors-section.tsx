"use client";

import { useEffect, useState } from "react";
import { fallbackSponsors, fallbackMediaPartners, Partner } from "@/data/sponsors";

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Partner[]>(fallbackSponsors);
  const [mediaPartners, setMediaPartners] = useState<Partner[]>(fallbackMediaPartners);

  useEffect(() => {
    async function loadPartners() {
      try {
        const res = await fetch("/api/partners");
        if (res.ok) {
          const data = await res.json();
          if (data.sponsors && data.sponsors.length > 0) {
            setSponsors(data.sponsors);
          }
          if (data.mediaPartners && data.mediaPartners.length > 0) {
            setMediaPartners(data.mediaPartners);
          }
        }
      } catch (err) {
        console.warn("Could not fetch partners API, using local fallback data:", err);
      }
    }

    loadPartners();
  }, []);

  // Triple items for seamless continuous looping marquee
  const sponsorLoop = [...sponsors, ...sponsors, ...sponsors, ...sponsors];
  const mediaPartnerLoop = [...mediaPartners, ...mediaPartners, ...mediaPartners, ...mediaPartners];

  return (
    <section className="py-16 relative overflow-hidden bg-navy-900/90 border-t-3 border-ink">
      {/* Background Grid Pattern & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-pink/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        
        {/* SPONSORS SECTION */}
        <div>
          <div className="text-center mb-8">
            <span className="font-pixel text-[10px] text-pink tracking-widest block uppercase mb-1">
              ◆ SUPPORTED BY
            </span>
            <h2 className="font-pixel text-cream text-2xl md:text-4xl tracking-wider drop-shadow-[0_3px_0_rgba(5,7,20,1)]">
              SPONSORS
            </h2>
          </div>

          {/* Marquee Row for Sponsors */}
          <div className="relative overflow-hidden w-full py-4 border-y-2 border-ink/40 bg-navy-800/40">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {sponsorLoop.map((item, idx) => (
                <div
                  key={`sponsor-${item.id}-${idx}`}
                  className="flex items-center justify-center shrink-0 min-w-[160px] md:min-w-[200px] h-20 px-6 mx-3 border-2 border-ink/80 shadow-hard-sm bg-navy-800/90 hover:border-yellow hover:scale-105 transition-all duration-300 group relative cursor-pointer"
                  title={item.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="max-h-12 max-w-[140px] object-contain filter group-hover:brightness-110 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MEDIA PARTNERS SECTION */}
        <div>
          <div className="text-center mb-8">
            <span className="font-pixel text-[10px] text-cyan tracking-widest block uppercase mb-1">
              ◆ OFFICIAL MEDIA PARTNER
            </span>
            <h2 className="font-pixel text-cream text-2xl md:text-4xl tracking-wider drop-shadow-[0_3px_0_rgba(5,7,20,1)]">
              MEDIA PARTNERS
            </h2>
          </div>

          {/* Marquee Row for Media Partners */}
          <div className="relative overflow-hidden w-full py-4 border-y-2 border-ink/40 bg-navy-800/40">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {mediaPartnerLoop.map((item, idx) => (
                <div
                  key={`media-${item.id}-${idx}`}
                  className="flex items-center justify-center shrink-0 min-w-[160px] md:min-w-[200px] h-20 px-6 mx-3 border-2 border-ink/80 shadow-hard-sm bg-navy-800/90 hover:border-cyan hover:scale-105 transition-all duration-300 group relative cursor-pointer"
                  title={item.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="max-h-12 max-w-[140px] object-contain filter group-hover:brightness-110 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
