import { Calendar } from "lucide-react";
import { competitionTimeline } from "@/data/competition-timeline";

export default function CompetitionTimeline() {
  return (
    <section className="pb-12 relative">
      <div className="flex justify-center mb-14">
        <span className="font-pixel text-yellow text-sm md:text-base border-3 border-ink shadow-hard bg-navy-800 px-6 py-3.5 rotate-[-1deg] font-bold tracking-wider">
          ✦ TIMELINE KOMPETISI ✦
        </span>
      </div>

      {/* Desktop Timeline */}
      <div className="hidden md:block relative px-4">
        {/* Gradient Connecting Line */}
        <div className="absolute top-6 left-12 right-12 h-1 bg-gradient-to-r from-pink via-cyan to-yellow border-y border-ink z-0 shadow-sm" />

        <div className="grid grid-cols-5 gap-4 relative z-10">
          {competitionTimeline.map((item, i) => (
            <div key={item.step} className="flex flex-col items-center text-center group">
              <div className="relative z-10 w-12 h-12 rounded-full border-3 border-ink bg-navy-800 text-pink group-hover:bg-pink group-hover:text-ink shadow-hard-sm flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Calendar className="w-5 h-5 transition-colors" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow border border-ink text-[9px] font-pixel text-ink flex items-center justify-center font-bold">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-pixel text-cream group-hover:text-yellow text-xs leading-relaxed min-h-[2.8rem] flex items-center justify-center px-1 transition-colors">
                {item.title}
              </h3>

              <p className="font-mono text-[11px] font-bold text-cyan mt-2 px-2 py-0.5 bg-navy-800 border border-cyan/40 rounded-sm whitespace-nowrap">
                {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="md:hidden relative space-y-8 pl-2">
        {/* Vertical Gradient Connecting Line */}
        <div className="absolute top-4 bottom-4 left-8 w-1 bg-gradient-to-b from-pink via-cyan to-yellow border-x border-ink z-0" />

        {competitionTimeline.map((item, i) => (
          <div key={item.step} className="relative flex gap-5 items-start z-10 group">
            <div className="relative z-10 w-12 h-12 rounded-full border-3 border-ink bg-navy-800 text-pink group-hover:bg-pink group-hover:text-ink shadow-hard-sm flex items-center justify-center shrink-0 transition-transform duration-300">
              <Calendar className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow border border-ink text-[9px] font-pixel text-ink flex items-center justify-center font-bold">
                {i + 1}
              </span>
            </div>

            <div className="bg-navy-800 border-2 border-ink shadow-hard-sm p-4 rounded-sm flex-1">
              <h3 className="font-pixel text-cream text-xs leading-relaxed group-hover:text-yellow transition-colors">
                {item.title}
              </h3>
              <p className="font-mono text-xs text-cyan font-bold mt-2">
                📅 {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}