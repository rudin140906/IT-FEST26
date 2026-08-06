"use client";

import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 relative z-20">
      <nav className="relative flex items-center justify-between border-3 border-ink shadow-hard bg-navy-700 px-4 py-2.5 md:px-6 md:py-3">
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-pink border-3 border-ink rotate-12 hidden md:block"/>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan border-3 border-ink -rotate-12 hidden md:block"/>

        {/* LOGO DAN JUDUL NAVBAR */}
        <div className="flex items-center gap-2 z-10">
          <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0">
            <Image src="/logos/logo_navbar.png" alt="IT-Festival Logo" width={36} height={36} className="object-contain"/>
          </div>
          <span className="text-yellow text-sm md:text-base tracking-widest font-extrabold">
            IT-FESTIVAL
          </span>
        </div>

        {/* LIST NAVBAR */}
        <div className="hidden md:flex items-center gap-8 text-sm text-cream/80 font-medium absolute left-1/2 -translate-x-1/2">
          <a href="/" className="hover:text-yellow transition-colors">Home</a>
          <a href="/competition" className="hover:text-yellow transition-colors">Kompetisi</a>
          <a href="/training" className="hover:text-yellow transition-colors">Pelatihan</a>
          <a href="/seminar" className="hover:text-yellow transition-colors">Seminar</a>
        </div>

        {/* REGISTER NAVBAR */}
        <a href="/register" className="hidden md:inline-block press-btn border-3 border-ink shadow-hard-sm bg-yellow text-ink font-bold px-3 py-1.5 text-sm z-10">
          Register &gt;
        </a>

        {/* MENU TOGGLER ICON HUMBERGER */}
        <button className="md:hidden text-cream text-xl z-10" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? "✕" : "☰"}
        </button>
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 md:hidden bg-navy-800 border-3 border-ink shadow-hard flex flex-col gap-4 p-6 mt-2">
            <a href="/" className="text-cream hover:text-yellow">Home</a>
            <a href="/competition" className="text-cream hover:text-yellow">Kompetisi</a>
            <a href="/training" className="text-cream hover:text-yellow">Pelatihan</a>
            <a href="/seminar" className="text-cream hover:text-yellow">Seminar</a>
            <a href="/register" className="border-3 border-ink bg-yellow text-ink font-bold px-4 py-2 text-center">
              Register
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}