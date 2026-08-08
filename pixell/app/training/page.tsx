import TrainingTimeline from "@/components/training/training-timeline";
import TrainingCard from "@/components/training/training-card";
import { trainings } from "@/data/trainings";

export default function TrainingPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <span className="font-pixel text-[9px] text-cyan">◆ PELATIHAN</span>
      <h1 className="font-pixel text-cream text-3xl md:text-5xl mt-4 leading-relaxed">
        PELATIHAN IT-FESTIVAL 2026
      </h1>
      <p className="text-cream/70 mt-6 max-w-2xl leading-relaxed text-base md:text-lg">
        Tingkatkan skill digitalmu bersama para mentor profesional dalam workshop interaktif dan hands-on.
      </p>
      <div className="mt-16 md:mt-20">
        <TrainingTimeline />
      </div>
      <div className="mt-8">
        <div className="text-center mb-12">
          <span className="font-pixel text-[9px] text-pink">
            ◆ KATEGORI PELATIHAN
          </span>
          <h2 className="font-pixel text-cream text-xl md:text-3xl mt-4">
            Pilih Pelatihanmu
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {trainings.map((training, i) => (
          <TrainingCard key={training.id} training={training} index={i}/>
          ))}
        </div>
      </div>
    </main>
  );
}
