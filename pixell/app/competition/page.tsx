import CompetitionTimeline from "@/components/competition/competition-timeline";
import CompetitionCard from "@/components/competition/competition-card";
import { competitions } from "@/data/competitions";

export default function CompetitionPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <span className="font-pixel text-[9px] text-pink">◆ KOMPETISI</span>
      <h1 className="font-pixel text-cream text-3xl md:text-5xl mt-4 leading-relaxed">
        KOMPETISI IT-FESTIVAL 2026
      </h1>
      <p className="text-cream/70 mt-6 max-w-2xl leading-relaxed text-base md:text-lg">
        Tunjukkan keahlianmu dalam berbagai kompetisi teknologi bergengsi dan
        menangkan total hadiah jutaan rupiah.
      </p>

      <div className="mt-16 md:mt-20">
        <CompetitionTimeline />
      </div>

      <div className="mt-8">
        <div className="text-center mb-12">
          <span className="text-pink font-pixel text-[9px]">
            ◆ KATEGORI LOMBA
          </span>
          <h2 className="font-pixel text-cream text-x1 md:text-3xl mt-4">
            Pilih Kompetisimu
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition, i) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              index={i}
            />
          ))}
        </div>
      </div>
    </main>
  );
}