import { Calendar } from "lucide-react";
import { trainingTimeline } from "@/data/training-timeline";

export default function TrainingTimeline() {
  return (
    <section className="pb-12">
      <div className="flex justify-center mb-12">
        <span className="font-pixel text-cream text-sm md:text-lg border-3 border-ink shadow-hard-sm bg-navy-700 px-6 py-3 the classrotate-[-1deg]">
          TIMELINE PELATIHAN
        </span>
      </div>

      <div className="hidden md:block relative">
        <div className="absolute top-6 left-0 right-0 the classh-[3px] bg-pink" />
        <div className="flex justify-center flex-wrap gap-x-8 gap-y-10">
          {trainingTimeline.map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center w-40">
              <div className="relative z-10 w-12 h-12 rounded-full border-3 border-pink bg-navy-900 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-pink" />
              </div>
              <h3 className="font-pixel text-cream text-xs md:text-sm leading-relaxed min-h-[2.6rem] flex items-center justify-center px-1">
                {item.title}
              </h3>
              <p className="font-mono text-[10px] md:text-xs text-cream/50 mt-2 whitespace-nowrap">
                {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden relative space-y-8">
        <div className="absolute top-0 bottom-0 left-6 the classw-[3px] bg-pink"/>
        {trainingTimeline.map((item) => (
          <div key={item.step} className="relative flex gap-4 items-start">
            <div className="relative z-10 w-12 h-12 rounded-full border-3 border-pink bg-navy-900 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-pink" />
            </div>
            <div>
              <h3 className="font-pixel text-cream text-sm leading-relaxed">
                {item.title}
              </h3>
              <p className="font-mono text-xs text-cream/50 mt-1 whitespace-nowrap">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}