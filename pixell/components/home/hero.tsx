import Countdown from "@/components/ui/countdown";
import Typewriter from "@/components/ui/typewriter";

export default function Hero() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-8 pb-16 min-h-[85vh] flex flex-col justify-center">

      {/* glow orbs */}
      <div className="absolute top-[-10%] left-[10%] w-72 h-72 md:w-96 md:h-96 bg-pink/25 rounded-full blur-[100px] -z-10"/>
      <div className="absolute bottom-[-15%] right-[5%] w-72 h-72 md:w-96 md:h-96 bg-cyan/20 rounded-full blur-[100px] -z-10"/>
      <div className="absolute top-[30%] right-[30%] w-56 h-56 bg-yellow/15 rounded-full blur-[100px] -z-10"/>

      {/* dekorasi kotak melayang */}
      <div className="absolute top-10 left-2 w-8 h-8 bg-pink border-3 border-ink rotate-[-6deg] hidden md:block animate-float"/>
      <div className="absolute top-32 right-8 w-10 h-10 bg-cyan border-3 border-ink rotate-[8deg] hidden md:block animate-float" style={{ animationDelay: "1.2s" }}/>
      <div className="absolute bottom-16 left-16 w-6 h-6 bg-yellow border-3 border-ink rotate-[12deg] hidden md:block animate-float" style={{ animationDelay: "2s" }}/>
      <div className="absolute top-1/3 right-20 w-5 h-5 bg-pink border-3 border-ink rotate-[20deg] hidden lg:block animate-float" style={{ animationDelay: "0.6s" }}/>
      <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-cyan border-3 border-ink rotate-[-15deg] hidden lg:block animate-float" style={{ animationDelay: "1.8s" }}/>
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow border-3 border-ink rotate-[25deg] hidden lg:block animate-float" style={{ animationDelay: "0.9s" }}/>

      <div className="flex flex-col items-center justify-center gap-10">
        <h1 className="font-pixel text-center text-cream leading-[1.6] text-[26px] md:text-[52px] tracking-tight max-w-4xl">
          <Typewriter text="WELCOME TO IT-FESTIVAL" speed={90}/>
        </h1>

        <div>
          <p className="text-center font-pixel text-pink text-sm md:text-xl tracking-widest mb-6">
            BERAKHIR DALAM
          </p>
          <Countdown targetDate="2026-09-12T00:00:00"/>
        </div>

        <span className="text-xs md:text-base font-mono font-bold bg-pink text-ink border-3 border-ink shadow-hard px-5 py-3 rotate-[-2deg]">
          ✦ THE BIGGEST IT-FESTIVAL ✦
        </span>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-bounce">
        <span className="text-pink text-3xl">↓</span>
      </div>
    </section>
  );
}