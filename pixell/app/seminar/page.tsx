import SpeakerCard from "@/components/seminar/speaker-card";
import { speakers } from "@/data/speakers";

export default function SeminarPage() {
  return (
    <main>
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-16 overflow-hidden">
        <div className="absolute top-10 left-4 w-8 h-8 bg-pink border-3 border-ink rotate-[-6deg] hidden md:block animate-float" />
        <div
          className="absolute top-24 right-8 w-6 h-6 bg-cyan border-3 border-ink rotate-[10deg] hidden md:block animate-float"
          style={{ animationDelay: "1s" }}
        />

        <span className="font-pixel text-[9px] text-pink">◆ SEMINAR</span>
        <h1 className="font-pixel text-cream text-3xl md:text-5xl mt-4 leading-relaxed">
          SEMINAR IT-FESTIVAL 2026
        </h1>
        <p className="text-cream/70 mt-6 max-w-2xl leading-relaxed text-base md:text-lg">
          Ikuti seminar kami dan dapatkan wawasan berharga langsung dari para
          ahli di bidang teknologi. Bertemu dan berdiskusi dengan praktisi
          berpengalaman yang siap membagikan ilmu dan pengalaman mereka.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 space-y-8">
        {speakers.map((speaker, i) => (
          <SpeakerCard key={speaker.id} speaker={speaker} reverse={i % 2 === 1} />
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 flex justify-center">
        <a
          href="/register"
          className="press-btn border-3 border-ink shadow-hard bg-pink text-ink font-pixel text-[11px] px-8 py-4"
        >
          DAFTAR SEMINAR
        </a>
      </section>
    </main>
  );
}