"use client";

import { useEffect, useState } from "react";
import TrainingTimeline from "@/components/training/training-timeline";
import TrainingCard from "@/components/training/training-card";
import { trainings as initialTrainings } from "@/data/trainings";
import { apiPath, withBasePath } from "@/lib/site-path";
import { Training } from "@/types/training";

export default function TrainingPage() {
  const [trainingList, setTrainingList] = useState<Training[]>(initialTrainings);

  useEffect(() => {
    async function loadEventData() {
      try {
        const res = await fetch(apiPath("/events"));
        if (res.ok) {
          const events = await res.json();
          if (Array.isArray(events)) {
            setTrainingList((prev) =>
              prev.map((item) => {
                const found = events.find(
                  (e: { id: string; category?: string; guidebookUrl?: string; gformUrl?: string; mascotUrl?: string }) =>
                    e.id === item.id || (e.category === "pelatihan" && (e.id.includes(item.id) || item.id.includes(e.id)))
                );
                return {
                  ...item,
                  guidebookUrl: found?.guidebookUrl ? withBasePath(found.guidebookUrl) : item.guidebookUrl,
                  registerUrl: found?.gformUrl || item.registerUrl,
                  mascot: found?.mascotUrl ? withBasePath(found.mascotUrl) : item.mascot,
                };
              })
            );
          }
        }
      } catch (err) {
        console.error("Error loading training event data:", err);
      }
    }
    loadEventData();
  }, []);

  return (
    <main className="relative max-w-6xl mx-auto px-6 pt-32 sm:pt-36 md:pt-40 pb-28">
      {/* Background Ambient Orbs */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-cyan/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-yellow/15 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Retro Floating Ornaments */}
      <div className="absolute top-28 right-6 w-7 h-7 bg-cyan border-3 border-ink rotate-12 animate-float hidden lg:block" />
      <div className="absolute top-60 left-8 w-8 h-8 bg-yellow border-3 border-ink -rotate-12 animate-float hidden lg:block" style={{ animationDelay: "1.2s" }} />

      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="inline-block font-pixel text-xs text-cyan tracking-widest px-3 py-1 bg-cyan/15 border border-cyan/40 rounded-sm">
          ◆ WORKSHOP & TRAINING
        </span>
        <h1 className="font-pixel text-cream text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight drop-shadow-[0_4px_0_rgba(5,7,24,1)]">
          PELATIHAN <span className="text-cyan">IT-FESTIVAL</span> 2026
        </h1>
        <p className="text-cream/80 text-base md:text-lg font-sans leading-relaxed max-w-2xl font-medium">
          Tingkatkan skill digitalmu bersama para mentor profesional dalam workshop interaktif dan hands-on.
        </p>
        <div className="w-28 h-1.5 bg-cyan mt-4 border-2 border-ink shadow-hard-sm" />
      </div>

      <div className="mt-14 md:mt-16">
        <TrainingTimeline />
      </div>

      <div className="mt-12">
        <div className="text-center mb-12">
          <span className="inline-block font-pixel text-xs text-pink tracking-widest px-3 py-1 bg-pink/15 border border-pink/40 rounded-sm">
            ◆ KATEGORI PELATIHAN
          </span>
          <h2 className="font-pixel text-cream text-2xl md:text-4xl mt-3 drop-shadow-[0_3px_0_rgba(5,7,24,1)]">
            PILIH <span className="text-yellow">PELATIHANMU</span>
          </h2>
          <div className="w-20 h-1.5 bg-pink mx-auto mt-3 border-2 border-ink shadow-hard-sm" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {trainingList.map((training, i) => (
            <TrainingCard key={training.id} training={training} index={i} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="https://bit.ly/FeedbackPelatihanITFestival2026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex press-btn border-3 border-ink shadow-hard bg-cyan text-ink font-pixel text-xs md:text-sm font-extrabold px-8 py-4 items-center gap-2 hover:bg-cyan/90"
          >
            <span>FEEDBACK PELATIHAN</span>
            <span>&gt;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
