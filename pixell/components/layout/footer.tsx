import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/site-path";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-navy-900 border-t-3 border-ink text-cream overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
        <div className="md:col-span-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <Image src={withBasePath("/logos/logo_navbar.png")} alt="IT-Festival Logo" width={36} height={36} className="object-contain" />
            </div>
            <span className="font-pixel text-yellow text-lg md:text-xl font-bold tracking-wider">IT-FESTIVAL</span>
          </div>

          <p className="text-cream/80 text-sm leading-relaxed max-w-md font-sans">
            Festival teknologi terbesar tahun 2026 yang menghadirkan kompetisi, pelatihan, dan seminar untuk mengembangkan talenta digital masa depan.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://www.instagram.com/itfestival.polsri/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-pink text-ink border-2 border-ink shadow-hard-sm flex items-center justify-center hover:bg-yellow hover:scale-110 transition-all duration-300"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://wa.me/62882279840310"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-pink text-ink border-2 border-ink shadow-hard-sm flex items-center justify-center hover:bg-yellow hover:scale-110 transition-all duration-300"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
            <a
              href="mailto:itfestivalpolsri2026@gmail.com"
              className="w-9 h-9 rounded-full bg-pink text-ink border-2 border-ink shadow-hard-sm flex items-center justify-center hover:bg-yellow hover:scale-110 transition-all duration-300"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <h3 className="font-pixel text-pink text-base md:text-lg tracking-wider uppercase">QUICK LINKS</h3>
          <ul className="space-y-2.5 text-sm font-sans text-cream/70 font-medium">
            <li>
              <Link href="/" className="hover:text-yellow transition-colors inline-flex items-center gap-2">
                <span className="text-pink text-xs">◆</span> HOME
              </Link>
            </li>
            <li>
              <Link href="/competition" className="hover:text-yellow transition-colors inline-flex items-center gap-2">
                <span className="text-pink text-xs">◆</span> KOMPETISI
              </Link>
            </li>
            <li>
              <Link href="/training" className="hover:text-yellow transition-colors inline-flex items-center gap-2">
                <span className="text-pink text-xs">◆</span> PELATIHAN
              </Link>
            </li>
            <li>
              <Link href="/seminar" className="hover:text-yellow transition-colors inline-flex items-center gap-2">
                <span className="text-pink text-xs">◆</span> SEMINAR
              </Link>
            </li>
            <li>
              <Link href="/#timeline" className="hover:text-yellow transition-colors inline-flex items-center gap-2">
                <span className="text-pink text-xs">◆</span> TIMELINE
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-4">
          <h3 className="font-pixel text-cyan text-base md:text-lg tracking-wider uppercase">CONTACT</h3>
          <ul className="space-y-3.5 text-sm font-sans text-cream/80">
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-pink/20 border border-pink/40 flex items-center justify-center shrink-0 text-pink">
                <Mail size={14} />
              </span>
              <a href="mailto:itfestivalpolsri2026@gmail.com" className="hover:text-yellow transition-colors break-all">
                itfestivalpolsri2026@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-pink/20 border border-pink/40 flex items-center justify-center shrink-0 text-pink mt-0.5">
                <Phone size={14} />
              </span>
              <div className="space-y-0.5">
                <div>08822-7984-0310</div>
                <div>08838-1925-5395</div>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-pink/20 border border-pink/40 flex items-center justify-center shrink-0 text-pink">
                <MapPin size={14} />
              </span>
              <span>Palembang, Indonesia</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-ink/40 bg-navy-800/50 py-5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-cream/60">
          <div>© 2026 IT-Festival. All rights reserved.</div>
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
              <Image src={withBasePath("/logos/logo_navbar.png")} alt="IT-Festival Logo" width={44} height={44} style={{ width: "auto", height: "auto" }} className="object-contain max-h-full" />
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
              <Image src={withBasePath("/logos/logo_itfest.png")} alt="IT-Fest Lotus Logo" width={44} height={44} style={{ width: "auto", height: "auto" }} className="object-contain max-h-full" />
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
              <Image src={withBasePath("/logos/logo_hmj_mi.png")} alt="HMJ MI Logo" width={44} height={44} style={{ width: "auto", height: "auto" }} className="object-contain max-h-full" />
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
              <Image src={withBasePath("/logos/logo_polsri.png")} alt="POLSRI Logo" width={44} height={44} style={{ width: "auto", height: "auto" }} className="object-contain max-h-full" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
