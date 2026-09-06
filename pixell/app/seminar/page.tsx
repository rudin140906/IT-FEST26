"use client";

import { useEffect, useState } from "react";
import SpeakerCard from "@/components/seminar/speaker-card";
import { speakers as initialSpeakers } from "@/data/speakers";
import { apiPath, withBasePath } from "@/lib/site-path";
import { Speaker } from "@/types/speaker";

export default function SeminarPage() {
  const [speakerList, setSpeakerList] = useState<Speaker[]>(initialSpeakers);

  useEffect(() => {
    async function loadSpeakers() {
      try {
        const res = await fetch(apiPath("/speakers"));
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.speakers) && data.speakers.length > 0) {
            setSpeakerList(
              data.speakers.map((s: Speaker) => ({
                ...s,
                photo: s.photo ? withBasePath(s.photo) : undefined,
                cv: s.cv ? withBasePath(s.cv) : undefined,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Error loading speakers:", err);
      }
    }
    loadSpeakers();
  }, []);

  return (
    <main className="relative pt-32 sm:pt-36 md:pt-40 pb-28">
      {/* Background Ambient Orbs */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-pink/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-cyan/15 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <section className="relative max-w-6xl mx-auto px-6 pb-14 overflow-hidden">
        <div className="absolute top-10 left-4 w-8 h-8 bg-pink border-3 border-ink rotate-[-6deg] hidden md:block animate-float" />
        <div
          className="absolute top-24 right-8 w-6 h-6 bg-cyan border-3 border-ink rotate-[10deg] hidden md:block animate-float"
          style={{ animationDelay: "1s" }}
        />

        <div className="space-y-4 max-w-3xl">
          <span className="inline-block font-pixel text-xs text-pink tracking-widest px-3 py-1 bg-pink/15 border border-pink/40 rounded-sm">
            ◆ NASIONAL SEMINAR
          </span>
          <h1 className="font-pixel text-cream text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight drop-shadow-[0_4px_0_rgba(5,7,24,1)]">
            SEMINAR <span className="text-pink">IT-FESTIVAL</span> 2026
          </h1>
          <p className="text-cream/80 text-base md:text-lg font-sans leading-relaxed max-w-2xl font-medium">
            Ikuti seminar kami dan dapatkan wawasan berharga langsung dari para ahli di bidang teknologi. Bertemu dan berdiskusi dengan praktisi berpengalaman yang siap membagikan ilmu dan pengalaman mereka.
          </p>
          <div className="w-28 h-1.5 bg-pink mt-4 border-2 border-ink shadow-hard-sm" />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 space-y-8">
        {speakerList.map((speaker, i) => (
          <SpeakerCard key={speaker.id} speaker={speaker} reverse={i % 2 === 1} />
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-12 flex flex-wrap justify-center gap-4">
        <a
          href="https://bit.ly/PendaftaranSeminarITFestival2026"
          target="_blank"
          rel="noopener noreferrer"
          className="press-btn border-3 border-ink shadow-hard bg-pink text-ink font-pixel text-xs md:text-sm font-extrabold px-8 py-4 flex items-center gap-2 hover:bg-pink/90"
        >
          <span>DAFTAR TIKET SEMINAR</span>
          <span>&gt;</span>
        </a>
        <a
          href="https://bit.ly/FeedbackPesertaSeminarITFestival2026"
          target="_blank"
          rel="noopener noreferrer"
          className="press-btn border-3 border-ink shadow-hard bg-yellow text-ink font-pixel text-xs md:text-sm font-extrabold px-8 py-4 flex items-center gap-2 hover:bg-yellow-dim"
        >
          <span>FEEDBACK SEMINAR &amp; TALKSHOW</span>
          <span>&gt;</span>
        </a>
      </section>
    </main>
  );
}
