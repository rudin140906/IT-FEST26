import Image from "next/image";
import { withBasePath } from "@/lib/site-path";

export default function About() {
  return (
    <section id="about" className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="relative flex justify-center items-center">
          <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-pink/20 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDuration: "5s" }} />
          <div className="absolute w-48 h-48 bg-cyan/20 rounded-full blur-[60px] -z-10" />

          <div className="absolute top-2 left-6 w-6 h-6 bg-yellow border-3 border-ink rotate-12 hidden md:block animate-float" />
          <div className="absolute bottom-6 left-2 w-5 h-5 bg-cyan border-3 border-ink -rotate-12 hidden md:block animate-float" style={{ animationDelay: "1.2s" }} />

          <div className="relative group">
            <Image
              src={withBasePath("/maskot/pixie.png")}
              alt="VIXEL - Maskot IT-Festival"
              width={340}
              height={340}
              style={{ width: "auto", height: "auto" }}
              className="relative object-contain drop-shadow-[10px_10px_0_rgba(5,7,24,0.85)] group-hover:scale-105 transition-transform duration-500"
            />

            <span className="absolute -bottom-2 right-2 md:right-4 font-pixel text-[10px] md:text-xs bg-pink text-ink border-3 border-ink shadow-hard-sm px-4 py-2.5 rotate-[3deg] font-bold tracking-wider">
              ✦ HALO, AKU VIXEL! ✦
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <span className="inline-block font-pixel text-xs text-pink tracking-widest px-3 py-1 bg-pink/15 border border-pink/40 rounded-sm">
            ◆ TENTANG ACARA
          </span>

          <h2 className="font-pixel text-cream text-3xl md:text-5xl leading-tight mt-4 drop-shadow-[0_4px_0_rgba(5,7,24,1)]">
            ABOUT US
          </h2>

          <p className="font-pixel text-yellow text-sm md:text-base tracking-widest mt-2">
            THE BIGGEST IT-FESTIVAL 2026
          </p>

          <p className="text-cream/80 mt-5 leading-relaxed text-base md:text-lg max-w-lg font-sans font-medium">
            IT-Festival 2026 adalah wadah bagi mahasiswa dan penggiat teknologi untuk mengasah kemampuan,
            memperluas relasi, dan menyerap wawasan langsung dari para praktisi industri melalui kompetisi, pelatihan,
            dan seminar berkualitas.
          </p>

          <div className="grid grid-cols-3 gap-3 md:gap-5 mt-8 w-full">
            <div className="relative border-3 border-ink shadow-hard bg-navy-800 hover:bg-navy-700 p-4 transition-all duration-300 hover:-translate-y-1 rotate-[-1deg]">
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow border-2 border-ink" />
              <div className="font-pixel text-yellow text-xl md:text-2xl font-bold">500+</div>
              <div className="font-mono text-xs text-cream/70 mt-1 font-semibold">Peserta</div>
            </div>

            <div className="relative border-3 border-ink shadow-hard bg-cyan p-4 transition-all duration-300 hover:-translate-y-1 rotate-[1deg]">
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-navy-800 border-2 border-ink" />
              <div className="font-pixel text-ink text-xl md:text-2xl font-bold">12</div>
              <div className="font-mono text-xs text-ink/80 mt-1 font-bold">Kompetisi</div>
            </div>

            <div className="relative border-3 border-ink shadow-hard bg-pink p-4 transition-all duration-300 hover:-translate-y-1 rotate-[-1deg]">
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-navy-800 border-2 border-ink" />
              <div className="font-pixel text-ink text-xl md:text-2xl font-bold">20+</div>
              <div className="font-mono text-xs text-ink/80 mt-1 font-bold">Pembicara</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
