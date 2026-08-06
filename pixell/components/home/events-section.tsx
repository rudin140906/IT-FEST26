import { events } from "@/data/events";

const colorClasses: Record<string, string> = {
  yellow: "bg-yellow text-ink",
  pink: "bg-pink text-ink",
  cyan: "bg-cyan text-ink",
};

export default function EventsSection() {
  return (
    <section id="events" className="max-w-6xl mx-auto px-6 pt-10 pb-8 md:pb-15">
      <div className="text-center mb-12">
        <span className="font-pixel text-[9px] text-pink">
          ◆ OUR EVENTS
        </span>
        <h2 className="font-pixel text-cream text-2xl md:text-4xl mt-4">
          Check Our Best Events
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {events.map((event, i) => (
          <div
            key={event.id}
            className="press-btn border-3 border-ink shadow-hard bg-navy-700 p-6"
            style={{ transform: i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)" }}
          >
            <div
              className={`w-10 h-10 border-3 border-ink mb-4 ${colorClasses[event.color]}`}
            />
            <h3 className="font-bold text-lg mb-2 text-cream">
              {event.title}
            </h3>
            <p className="text-sm text-cream/60 leading-relaxed">
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}