"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out mx-auto ${
        scrolled
          ? "pt-2 px-2 md:px-4 max-w-[98%] lg:max-w-7xl"
          : "pt-4 px-4 md:px-6 max-w-6xl"
      }`}
    >
      <nav
        className={`relative flex items-center justify-between transition-all duration-500 ease-out border-3 ${
          scrolled
            ? "bg-navy-800/95 backdrop-blur-md border-yellow shadow-hard-lg px-5 md:px-8 py-2.5 md:py-3"
            : "bg-navy-700 border-ink shadow-hard px-4 md:px-6 py-2.5 md:py-3"
        }`}
      >
        {/* Animated Corner Ornaments */}
        <div
          className={`absolute -top-2 -left-2 w-4 h-4 bg-pink border-3 border-ink transition-transform duration-500 hidden md:block ${
            scrolled ? "rotate-45 scale-110 bg-yellow" : "rotate-12 scale-100"
          }`}
        />
        <div
          className={`absolute -bottom-2 -right-2 w-4 h-4 bg-cyan border-3 border-ink transition-transform duration-500 hidden md:block ${
            scrolled ? "-rotate-45 scale-110 bg-pink" : "-rotate-12 scale-100"
          }`}
        />

        {/* LOGO DAN JUDUL NAVBAR */}
        <a href="/" className="flex items-center gap-2.5 z-10 group">
          <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logos/logo_navbar.png"
              alt="IT-Festival Logo"
              width={36}
              height={36}
              className="object-contain group-hover:rotate-12 transition-transform duration-300"
            />
          </div>
          <span className="text-yellow text-sm md:text-base lg:text-lg tracking-widest font-extrabold font-pixel">
            IT-FESTIVAL
          </span>
        </a>

        {/* LIST NAVBAR (DESKTOP) */}
        <div className="hidden md:flex items-center gap-7 lg:gap-9 text-sm md:text-base text-cream/90 font-medium absolute left-1/2 -translate-x-1/2">
          <a href="/" className="hover:text-yellow transition-colors">
            Home
          </a>
          <a href="/competition" className="hover:text-yellow transition-colors">
            Kompetisi
          </a>
          <a href="/training" className="hover:text-yellow transition-colors">
            Pelatihan
          </a>
          <a href="/seminar" className="hover:text-yellow transition-colors">
            Seminar
          </a>
        </div>

        {/* REGISTER NAVBAR BUTTON */}
        <a
          href="/register"
          className="hidden md:inline-block press-btn border-3 border-ink shadow-hard-sm bg-yellow text-ink font-bold px-3.5 py-1.5 text-sm z-10"
        >
          Register &gt;
        </a>

        {/* MENU TOGGLER ICON HAMBURGER (MOBILE) */}
        <button
          className="md:hidden text-cream text-xl z-10 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 md:hidden bg-navy-800 border-3 border-ink shadow-hard flex flex-col gap-4 p-6 mt-2 animate-fade-up">
            <a href="/" className="text-cream hover:text-yellow font-medium">
              Home
            </a>
            <a href="/competition" className="text-cream hover:text-yellow font-medium">
              Kompetisi
            </a>
            <a href="/training" className="text-cream hover:text-yellow font-medium">
              Pelatihan
            </a>
            <a href="/seminar" className="text-cream hover:text-yellow font-medium">
              Seminar
            </a>
            <a
              href="/register"
              className="border-3 border-ink bg-yellow text-ink font-bold px-4 py-2 text-center"
            >
              Register &gt;
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}