"use client";

import { useEffect, useState } from "react";
import CompetitionTimeline from "@/components/competition/competition-timeline";
import CompetitionCard from "@/components/competition/competition-card";
import { competitions as initialCompetitions } from "@/data/competitions";
import { apiPath, withBasePath } from "@/lib/site-path";
import { Competition } from "@/types/competition";

export default function CompetitionPage() {
  const [competitionList, setCompetitionList] = useState<Competition[]>(initialCompetitions);

  useEffect(() => {
    async function loadEventData() {
      try {
        const res = await fetch(apiPath("/events"));
        if (res.ok) {
          const events = await res.json();
          if (Array.isArray(events)) {
            setCompetitionList((prev) =>
              prev.map((comp) => {
                const found = events.find(
                  (e: { id: string; category?: string; guidebookUrl?: string; gformUrl?: string; mascotUrl?: string }) =>
                    e.id === comp.id || (e.category === "kompetisi" && (e.id.includes(comp.id) || comp.id.includes(e.id)))
                );
                return {
                  ...comp,
                  guidebookUrl: found?.guidebookUrl ? withBasePath(found.guidebookUrl) : comp.guidebookUrl,
                  registerUrl: found?.gformUrl || comp.registerUrl,
                  mascot: found?.mascotUrl ? withBasePath(found.mascotUrl) : comp.mascot,
                };
              })
            );
          }
        }
      } catch (err) {
        console.error("Error loading competition event data:", err);
      }
    }
    loadEventData();
  }, []);

  return (
    <main className="relative max-w-6xl mx-auto px-6 pt-32 sm:pt-36 md:pt-40 pb-28">
      {/* Background Ambient Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-pink/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan/15 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Retro Floating Ornaments */}
      <div className="absolute top-28 left-4 w-7 h-7 bg-pink border-3 border-ink rotate-12 animate-float hidden lg:block" />
      <div className="absolute top-60 right-8 w-8 h-8 bg-cyan border-3 border-ink -rotate-12 animate-float hidden lg:block" style={{ animationDelay: "1.5s" }} />

      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="inline-block font-pixel text-xs text-pink tracking-widest px-3 py-1 bg-pink/15 border border-pink/40 rounded-sm">
          ◆ EVENT KOMPETISI
        </span>
        <h1 className="font-pixel text-cream text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight drop-shadow-[0_4px_0_rgba(5,7,24,1)]">
          KOMPETISI <span className="text-yellow">IT-FESTIVAL</span> 2026
        </h1>
        <p className="text-cream/80 text-base md:text-lg font-sans leading-relaxed max-w-2xl font-medium">
          Tunjukkan keahlianmu dalam berbagai kompetisi teknologi bergengsi dan menangkan total hadiah jutaan rupiah.
        </p>
        <div className="w-28 h-1.5 bg-pink mt-4 border-2 border-ink shadow-hard-sm" />
      </div>

      <div className="mt-14 md:mt-16">
        <CompetitionTimeline />
      </div>

      <div className="mt-12">
        <div className="text-center mb-12">
          <span className="inline-block font-pixel text-xs text-yellow tracking-widest px-3 py-1 bg-yellow/15 border border-yellow/40 rounded-sm">
            ◆ KATEGORI LOMBA
          </span>
          <h2 className="font-pixel text-cream text-2xl md:text-4xl mt-3 drop-shadow-[0_3px_0_rgba(5,7,24,1)]">
            PILIH <span className="text-pink">KOMPETISIMU</span>
          </h2>
          <div className="w-20 h-1.5 bg-yellow mx-auto mt-3 border-2 border-ink shadow-hard-sm" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {competitionList.map((competition, i) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              index={i}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
