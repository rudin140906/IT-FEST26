"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripBasePath, withBasePath } from "@/lib/site-path";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const currentPath = stripBasePath(pathname || "/");

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Kompetisi", href: "/competition" },
    { name: "Pelatihan", href: "/training" },
    { name: "Seminar", href: "/seminar" },
  ];

  const isActiveRoute = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(`${href}/`);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out mx-auto ${
        scrolled ? "pt-3 px-3 md:px-4 max-w-[98%] lg:max-w-7xl" : "pt-4 px-4 md:px-6 max-w-6xl"
      }`}
    >
      <nav
        className={`relative flex items-center justify-between transition-all duration-500 ease-out border-3 ${
          scrolled
            ? "bg-navy-800/90 backdrop-blur-xl border-yellow shadow-hard-lg px-5 md:px-8 py-3"
            : "bg-navy-800/80 backdrop-blur-md border-ink shadow-hard px-5 md:px-7 py-3"
        }`}
      >
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

        <Link href="/" className="flex items-center gap-2.5 z-10 group">
          <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image
              src={withBasePath("/logos/logo_navbar.png")}
              alt="IT-Festival Logo"
              width={36}
              height={36}
              style={{ width: "auto", height: "auto" }}
              className="object-contain group-hover:rotate-12 transition-transform duration-300"
            />
          </div>
          <span className="text-yellow text-sm md:text-base lg:text-lg tracking-widest font-extrabold font-pixel">
            IT-FESTIVAL
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7 lg:gap-9 text-sm md:text-base font-medium absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = isActiveRoute(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 px-1.5 font-pixel text-xs transition-all duration-200 group ${
                  isActive ? "text-yellow font-bold drop-shadow-[0_2px_0_rgba(5,7,24,1)] scale-105" : "text-cream/80 hover:text-yellow"
                }`}
              >
                <span>{link.name}</span>
                {isActive && <span className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-yellow border border-ink shadow-hard-sm rounded-sm" />}
              </Link>
            );
          })}
        </div>

        <Link
          href="/register"
          className={`hidden md:inline-block press-btn border-3 border-ink shadow-hard-sm text-ink font-pixel text-xs font-extrabold px-4 py-2 z-10 ${
            isActiveRoute("/register") ? "bg-pink text-ink border-yellow glow-pink" : "bg-yellow hover:bg-yellow-dim text-ink"
          }`}
        >
          Register &gt;
        </Link>

        <button className="md:hidden text-cream text-xl z-10 p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? "✕" : "☰"}
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 md:hidden bg-navy-800 border-3 border-ink shadow-hard flex flex-col gap-4 p-6 mt-2 animate-fade-up z-50">
            {navLinks.map((link) => {
              const isActive = isActiveRoute(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`font-pixel text-sm py-2 px-3 border border-transparent rounded-sm flex items-center justify-between ${
                    isActive ? "text-yellow bg-yellow/15 border-yellow/60 font-bold shadow-hard-sm" : "text-cream hover:text-yellow"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="text-yellow">✦</span>}
                </Link>
              );
            })}
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="border-3 border-ink bg-yellow text-ink font-pixel text-xs font-bold px-4 py-3 text-center press-btn mt-2"
            >
              Register &gt;
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}
