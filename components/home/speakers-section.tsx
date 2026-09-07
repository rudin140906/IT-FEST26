"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { speakers as initialSpeakers } from "@/data/speakers";
import { apiPath, withBasePath } from "@/lib/site-path";
import { Speaker } from "@/types/speaker";

export default function SpeakersSection() {
  const [speakerList, setSpeakerList] = useState<Speaker[]>(initialSpeakers);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSpeakers() {
      try {
        const res = await fetch(apiPath("/speakers"), { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.speakers) && data.speakers.length > 0) {
            setSpeakerList(data.speakers);
          }
        }
      } catch (err: any) {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          console.warn("Could not fetch speakers API:", err);
        }
      }
    }

    loadSpeakers();
    return () => controller.abort();
  }, []);

  return (
    <section id="speakers" className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <span className="inline-block font-pixel text-xs text-pink tracking-widest px-3 py-1 bg-pink/15 border border-pink/40 rounded-sm">
          ◆ PEMBICARA UTAMA
        </span>
        <h2 className="font-pixel text-cream text-3xl md:text-5xl mt-3 tracking-tight drop-shadow-[0_4px_0_rgba(5,7,24,1)]">
          MEET OUR PROFESSIONAL SPEAKERS
        </h2>
        <div className="w-24 h-1.5 bg-pink mx-auto mt-4 border-2 border-ink shadow-hard-sm" />
      </div>

      <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {speakerList.map((speaker, i) => (
          <div
            key={speaker.id}
            className="group border-3 border-ink shadow-hard bg-navy-800 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-hard-lg relative"
            style={{ transform: i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)" }}
          >
            {/* Speaker Photo Container */}
            <div className="relative h-72 border-b-3 border-ink overflow-hidden bg-navy-900">
              <Image
                src={withBasePath(speaker.photo || "/logos/logo_navbar.png")}
                alt={speaker.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover scale-100 group-hover:scale-108 transition-transform duration-500"
                style={{ objectPosition: speaker.photoPosition || "center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              
              <div className="absolute top-3 left-3 bg-yellow text-ink border-2 border-ink shadow-hard-sm font-pixel text-[10px] font-bold px-3 py-1">
                {speaker.category === "guest-star" ? "GUEST STAR" : "KEYNOTE SPEAKER"}
              </div>
            </div>

            {/* Speaker Bio */}
            <div className="p-6">
              <h3 className="font-pixel text-lg md:text-xl text-cream transition-colors duration-300 group-hover:text-yellow leading-tight">
                {speaker.name}
              </h3>
              <p className="font-mono text-xs text-cyan mt-2 font-bold tracking-wide">
                {speaker.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Link
          href="/seminar"
          className="press-btn border-3 border-ink shadow-hard bg-pink text-ink font-pixel text-xs md:text-sm font-extrabold px-8 py-4 flex items-center gap-2 hover:bg-pink/90"
        >
          <span>LIHAT JADWAL SEMINAR</span>
          <span>&gt;</span>
        </Link>
      </div>
    </section>
  );
}