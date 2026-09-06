import Countdown from "@/components/ui/countdown";
import Typewriter from "@/components/ui/typewriter";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-8 min-h-[84vh] md:min-h-[86vh] flex flex-col justify-between">
      <div className="absolute top-10 left-[10%] w-72 h-72 md:w-96 md:h-96 bg-pink/25 rounded-full blur-[110px] -z-10 animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute bottom-[-10%] right-[5%] w-72 h-72 md:w-96 md:h-96 bg-cyan/20 rounded-full blur-[110px] -z-10 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute top-[35%] right-[30%] w-56 h-56 bg-yellow/20 rounded-full blur-[100px] -z-10" />

      <div className="absolute top-24 left-6 w-8 h-8 bg-pink border-3 border-ink rotate-[-6deg] hidden md:block animate-float" />
      <div className="absolute top-36 right-10 w-10 h-10 bg-cyan border-3 border-ink rotate-[8deg] hidden md:block animate-float" style={{ animationDelay: "1.2s" }} />
      <div className="absolute bottom-16 left-16 w-6 h-6 bg-yellow border-3 border-ink rotate-[12deg] hidden md:block animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/3 right-20 w-5 h-5 bg-pink border-3 border-ink rotate-[20deg] hidden lg:block animate-float" style={{ animationDelay: "0.6s" }} />

      <div className="flex flex-col items-center justify-center gap-6 md:gap-8 text-center relative z-10 my-auto">
        <div className="inline-flex items-center gap-2 font-pixel text-xs md:text-sm font-bold bg-gradient-to-r from-pink via-yellow to-cyan text-ink border-3 border-ink shadow-hard px-5 py-2 rotate-[-1.5deg] tracking-widest uppercase">
          <span>✦ THE BIGGEST IT-FESTIVAL 2026 ✦</span>
        </div>

        <div className="relative py-1 flex items-center justify-center min-h-[70px] sm:min-h-[100px] md:min-h-[150px]">
          <h1 className="font-pixel leading-[1.45] text-[24px] sm:text-[34px] md:text-[50px] lg:text-[52px] tracking-tight max-w-4xl drop-shadow-[0_5px_0_rgba(5,7,24,1)]">
            <Typewriter text="WELCOME TO IT-FESTIVAL 2026" speed={100} pauseDelay={2800} />
          </h1>
        </div>

        <div className="w-full max-w-2xl bg-navy-800/90 backdrop-blur-xl border-3 border-ink shadow-hard p-5 md:p-7 rounded-sm relative mt-1">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 font-pixel text-[10px] md:text-xs bg-yellow text-ink border-2 border-ink shadow-hard-sm px-5 py-1 uppercase font-extrabold tracking-widest whitespace-nowrap z-20">
            ⏰ BERAKHIR DALAM
          </div>
          <Countdown targetDate="2026-09-12T00:00:00" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="press-btn border-3 border-ink shadow-hard bg-yellow text-ink font-pixel text-xs md:text-sm px-7 py-3.5 font-extrabold flex items-center gap-2 hover:bg-yellow-dim"
          >
            <span>DAFTAR SEKARANG</span>
            <span>&gt;</span>
          </Link>
          <Link
            href="/#events"
            className="press-btn border-3 border-ink shadow-hard bg-navy-700 hover:bg-navy-800 text-cream font-pixel text-xs md:text-sm px-6 py-3.5 font-bold flex items-center gap-2"
          >
            <span>JELAJAHI EVENT</span>
            <span className="text-pink">↓</span>
          </Link>
        </div>
      </div>

      <div className="flex justify-center animate-bounce pointer-events-none pt-2 pb-1">
        <span className="text-pink text-xl drop-shadow-[0_2px_0_rgba(5,7,24,1)]">↓</span>
      </div>
    </section>
  );
}
