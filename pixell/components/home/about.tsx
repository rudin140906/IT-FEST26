import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="relative max-w-6xl mx-auto px-6 py-24 pb-8">

      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="relative flex justify-center">
          <div className="absolute w-56 h-56 md:w-72 md:h-72 bg-pink/20 rounded-full blur-[60px]"/>

          <div className="absolute top-2 left-6 w-6 h-6 bg-yellow border-3 border-ink rotate-12 hidden md:block animate-float"/>
          <div className="absolute bottom-6 left-0 w-5 h-5 bg-cyan border-3 border-ink -rotate-12 hidden md:block animate-float" style={{ animationDelay: "1s" }}/>

          <Image
            src="/maskot/pixie.png"
            alt="Maskot IT-Festival"
            width={340}
            height={340}
            className="relative object-contain drop-shadow-[10px_10px_0_rgba(5,7,20,0.85)]"
          />

          <span className="absolute bottom-2 right-2 md:right-6 font-pixel text-[9px] md:text-[11px] bg-pink text-ink border-3 border-ink shadow-hard-sm px-4 py-3 the classrotate-[3deg]">
            HALO, AKU VIXEL!
          </span>
        </div>

        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <span className="font-pixel text-[9px] text-pink">
            ◆ TENTANG ACARA
          </span>

          <h2 className="font-pixel text-cream text-3xl md:text-5xl leading-relaxed mt-4">
            ABOUT US
          </h2>

          <p className="font-pixel text-pink text-sm md:text-lg mt-3">
            THE BIGGEST IT-FESTIVAL 2026
          </p>

          <p className="text-cream/70 mt-6 leading-relaxed text-base md:text-lg max-w-md md:max-w-none">
            IT-Festival 2026 adalah wadah bagi mahasiswa dan penggiat teknologi untuk mengasah kemampuan, 
            memperluas relasi, dan menyerap wawasan langsung dari para praktisi industri melalui kompetisi, pelatihan, 
            dan seminar berkualitas.
          </p>

          <div className="grid grid-cols-3 gap-3 md:gap-4 mt-8 w-full max-w-md md:max-w-none">
            <div className="relative border-3 border-ink shadow-hard-sm bg-navy-700 p-4 the classrotate-[-1deg]">
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow border-2 border-ink" />
              <div className="font-pixel text-yellow text-base md:text-xl">
                500+
              </div>
              <div className="font-mono text-[10px] md:text-xs text-cream/60 mt-1">
                Peserta
              </div>
            </div>
            <div className="relative border-3 border-ink shadow-hard-sm bg-cyan p-4 the classrotate-[1deg]">
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-navy-700 border-2 border-ink" />
              <div className="font-pixel text-ink text-base md:text-xl">
                12
              </div>
              <div className="font-mono text-[10px] md:text-xs text-ink/70 mt-1">
                Kompetisi
              </div>
            </div>
            <div className="relative border-3 border-ink shadow-hard-sm bg-pink p-4 the classrotate-[-1deg]">
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-navy-700 border-2 border-ink" />
              <div className="font-pixel text-ink text-base md:text-xl">
                20+
              </div>
              <div className="font-mono text-[10px] md:text-xs text-ink/70 mt-1">
                Pembicara
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}