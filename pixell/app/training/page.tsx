import TrainingTimeline from "@/components/training/training-timeline";

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
    </main>
  );
}
