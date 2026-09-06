import { events } from "@/data/events";
import Link from "next/link";

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: "bg-yellow", border: "border-yellow", text: "text-yellow" },
  pink: { bg: "bg-pink", border: "border-pink", text: "text-pink" },
  cyan: { bg: "bg-cyan", border: "border-cyan", text: "text-cyan" },
};

export default function EventsSection() {
  return (
    <section id="events" className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <span className="inline-block font-pixel text-xs text-pink tracking-widest px-3 py-1 bg-pink/15 border border-pink/40 rounded-sm">
          ◆ EVENT UNGGULAN
        </span>
        <h2 className="font-pixel text-cream text-3xl md:text-5xl mt-3 tracking-tight drop-shadow-[0_4px_0_rgba(5,7,24,1)]">
          CHECK OUR BEST EVENTS
        </h2>
        <div className="w-24 h-1.5 bg-yellow mx-auto mt-4 border-2 border-ink shadow-hard-sm" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
        {events.map((event, i) => {
          const colorTheme = colorClasses[event.color] || colorClasses.yellow;
          return (
            <div
              key={event.id}
              className={`group border-3 border-ink shadow-hard bg-navy-800 p-6 md:p-7 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-hard-lg border-t-4 ${colorTheme.border}`}
              style={{ transform: i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)" }}
            >
              <div
                className={`w-12 h-12 border-3 border-ink mb-5 flex items-center justify-center font-pixel text-lg font-bold shadow-hard-sm ${colorTheme.bg} text-ink group-hover:scale-110 transition-transform duration-300`}
              >
                ✦
              </div>

              <h3 className={`font-pixel text-base md:text-lg mb-3 text-cream transition-colors duration-300 group-hover:${colorTheme.text}`}>
                {event.title}
              </h3>

              <p className="text-sm text-cream/75 leading-relaxed font-sans font-medium mb-6">
                {event.description}
              </p>

              <Link
                href="/competition"
                className="inline-flex items-center gap-2 font-pixel text-[11px] text-yellow hover:text-pink transition-colors font-bold uppercase tracking-wider"
              >
                <span>LIHAT DETAIL</span>
                <span>→</span>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
