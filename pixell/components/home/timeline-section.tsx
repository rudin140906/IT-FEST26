"use client";

import { useEffect, useState } from "react";
import { timelineData, TimelineItem } from "@/data/timeline";

export default function TimelineSection() {
  const [items, setItems] = useState<TimelineItem[]>(timelineData);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await fetch("/api/timeline?t=" + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
            setItems(data.timeline);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic timeline, using local fallback:", err);
      }
    }

    loadTimeline();
  }, []);

  return (
    <section id="timeline" className="relative max-w-6xl mx-auto px-4 md:px-6 py-20 overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink/15 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16 relative z-10">
        <span className="font-pixel text-xs text-pink tracking-widest uppercase">
          ◆ AGENDA ACARA
        </span>
        <h2 className="font-pixel text-cream text-3xl md:text-5xl mt-3 tracking-tight drop-shadow-[0_4px_0_rgba(5,7,20,1)]">
          TIMELINE
        </h2>
        <div className="w-24 h-1.5 bg-pink mx-auto mt-4 border-2 border-ink shadow-hard-sm" />
      </div>

      {/* Timeline Tree Container */}
      <div className="relative">
        {/* Central Vertical Line */}
        <div className="absolute left-5 md:left-1/2 top-4 bottom-4 w-1.5 -translate-x-1/2 bg-gradient-to-b from-pink via-cyan to-yellow border-x border-ink z-0" />

        {/* Timeline Items */}
        <div className="space-y-10 md:space-y-12">
          {items.map((item, index) => {
            const isEven = index % 2 === 1;

            const badgeBg =
              item.badgeColor === "cyan"
                ? "bg-cyan text-ink"
                : item.badgeColor === "yellow"
                ? "bg-yellow text-ink"
                : "bg-pink text-ink";

            const badgeBorderColor =
              item.badgeColor === "cyan"
                ? "border-cyan"
                : item.badgeColor === "yellow"
                ? "border-yellow"
                : "border-pink";

            return (
              <div key={`timeline-${item.id}-${index}`} className="relative flex items-center z-10 group">
                {/* Number Badge (On the vertical line) */}
                <div
                  className={`absolute left-5 md:left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 border-3 border-ink shadow-hard-sm ${badgeBg} font-pixel text-xs md:text-sm font-bold flex items-center justify-center rounded-full z-20 group-hover:scale-110 transition-transform duration-300`}
                >
                  {index + 1}
                </div>

                {/* Content Card Container */}
                <div
                  className={`w-full pl-14 md:pl-0 md:w-1/2 ${
                    isEven ? "md:pr-12 md:mr-auto text-left" : "md:pl-12 md:ml-auto text-left"
                  }`}
                >
                  <div
                    className={`relative border-3 border-ink shadow-hard bg-navy-800 p-5 md:p-6 hover:shadow-hard-lg hover:-translate-y-1 transition-all duration-300 ${badgeBorderColor} border-t-4`}
                  >
                    {/* Floating Corner Category Badge */}
                    <div
                      className={`absolute -top-3 left-4 px-2.5 py-0.5 text-[10px] font-pixel border-2 border-ink shadow-hard-sm ${badgeBg} uppercase font-bold`}
                    >
                      {item.category || "AGENDAR"}
                    </div>

                    {/* Title */}
                    <h3 className="font-pixel text-xs md:text-sm text-cream leading-relaxed mt-2 group-hover:text-yellow transition-colors">
                      {item.title}
                    </h3>

                    {/* Date Tag */}
                    <div className="mt-4 pt-3 border-t border-cream/10 flex items-center gap-2 text-xs md:text-sm font-mono text-cream/70 justify-start">
                      <span className="text-pink">🗓</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
