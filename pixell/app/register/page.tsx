"use client";

import EventCard from "@/components/register/event-card";
import { registerEventsData } from "@/data/register-events";
import { Trophy, Code2, Mic } from "lucide-react";

export default function RegisterPage() {
  // Filter events matching website definitions
  const kompetisiTop = registerEventsData.slice(0, 3); // Mobile Legends, Free Fire, Vibe Coding Comp
  const kompetisiBottom = registerEventsData.slice(3, 5); // CTF, Photography
  const pelatihanEvents = registerEventsData.filter((e) => e.category === "pelatihan"); // Vibe Coding, Cyber Security
  const seminarEvents = registerEventsData.filter((e) => e.category === "seminar"); // Seminar IT-Festival 2026

  return (
    <div className="min-h-screen bg-navy-900 text-cream font-sans relative overflow-x-hidden selection:bg-pink selection:text-ink pb-28 pt-24 md:pt-28">
      {/* RETRO PIXEL GRID BACKGROUND & AMBIENT NEON GLOW */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink/15 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/15 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-yellow/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Floating Retro Ornaments */}
      <div className="absolute top-28 left-8 w-6 h-6 bg-pink border-2 border-ink rotate-12 animate-float hidden lg:block" />
      <div className="absolute top-1/2 right-10 w-8 h-8 bg-cyan border-2 border-ink -rotate-12 animate-float hidden lg:block" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-40 left-12 w-6 h-6 bg-yellow border-2 border-ink rotate-[20deg] animate-float hidden lg:block" style={{ animationDelay: "2.5s" }} />

      <main className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 space-y-16">
        {/* HEADER SECTION */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="font-pixel text-xs text-yellow tracking-widest uppercase block">
            ◆ REGISTRASI IT-FESTIVAL 2026
          </span>
          <h1 className="font-pixel text-cream text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight drop-shadow-[0_4px_0_rgba(5,7,20,1)] uppercase">
            PENDAFTARAN ACARA
          </h1>
          <p className="text-cream/80 text-sm md:text-base font-sans leading-relaxed max-w-2xl mx-auto">
            Pilih perlombaan, pelatihan, atau seminar yang ingin kamu ikuti dan amankan tiketmu di IT-FESTIVAL 2026.
          </p>
          <div className="w-24 h-1.5 bg-yellow mx-auto mt-4 border-2 border-ink shadow-hard-sm" />
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: KOMPETISI */}
        {/* ========================================================= */}
        <section className="space-y-8">
          {/* Category Section Header */}
          <div className="text-center flex items-center justify-center gap-3">
            <span className="w-9 h-9 bg-cyan/20 border-2 border-cyan/60 text-cyan rounded-lg flex items-center justify-center shrink-0 shadow-hard-sm">
              <Trophy size={20} />
            </span>
            <h2 className="font-pixel text-cream text-2xl md:text-3xl tracking-wider uppercase drop-shadow-[0_2px_0_rgba(5,7,20,1)]">
              KOMPETISI
            </h2>
          </div>

          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kompetisiTop.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>

          {/* Bottom Row: 2 Cards Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {kompetisiBottom.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: PELATIHAN */}
        {/* ========================================================= */}
        <section className="space-y-8 pt-6">
          {/* Category Section Header */}
          <div className="text-center flex items-center justify-center gap-3">
            <span className="w-9 h-9 bg-yellow/20 border-2 border-yellow/60 text-yellow rounded-lg flex items-center justify-center shrink-0 shadow-hard-sm">
              <Code2 size={20} />
            </span>
            <h2 className="font-pixel text-cream text-2xl md:text-3xl tracking-wider uppercase drop-shadow-[0_2px_0_rgba(5,7,20,1)]">
              PELATIHAN
            </h2>
          </div>

          {/* Row: 2 Cards Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pelatihanEvents.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: SEMINAR */}
        {/* ========================================================= */}
        <section className="space-y-8 pt-6">
          {/* Category Section Header */}
          <div className="text-center flex items-center justify-center gap-3">
            <span className="w-9 h-9 bg-pink/20 border-2 border-pink/60 text-pink rounded-lg flex items-center justify-center shrink-0 shadow-hard-sm">
              <Mic size={20} />
            </span>
            <h2 className="font-pixel text-cream text-2xl md:text-3xl tracking-wider uppercase drop-shadow-[0_2px_0_rgba(5,7,20,1)]">
              SEMINAR
            </h2>
          </div>

          {/* Row: 1 Card Centered */}
          <div className="max-w-xl mx-auto">
            {seminarEvents.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
