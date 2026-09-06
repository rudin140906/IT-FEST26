"use client";

import { RegisterEventItem } from "@/data/register-events";
import { Gamepad2, Flame, Code2, ShieldAlert, Camera, Mic, ExternalLink } from "lucide-react";

interface EventCardProps {
  event: RegisterEventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const getIcon = () => {
    switch (event.iconType) {
      case "gamepad":
        return <Gamepad2 size={22} />;
      case "flame":
        return <Flame size={22} />;
      case "code":
        return <Code2 size={22} />;
      case "shield":
        return <ShieldAlert size={22} />;
      case "camera":
        return <Camera size={22} />;
      case "mic":
        return <Mic size={22} />;
      default:
        return <Code2 size={22} />;
    }
  };

  const getThemeStyles = () => {
    switch (event.badgeColor) {
      case "yellow":
        return {
          iconBg: "bg-yellow/20 border-yellow/60 text-yellow group-hover:bg-yellow group-hover:text-ink",
          buttonBg: "bg-yellow text-ink border-3 border-ink shadow-hard-sm hover:bg-yellow-dim",
        };
      case "cyan":
        return {
          iconBg: "bg-cyan/20 border-cyan/60 text-cyan group-hover:bg-cyan group-hover:text-ink",
          buttonBg: "bg-cyan text-ink border-3 border-ink shadow-hard-sm hover:bg-cyan/90",
        };
      case "pink":
      default:
        return {
          iconBg: "bg-pink/20 border-pink/60 text-pink group-hover:bg-pink group-hover:text-ink",
          buttonBg: "bg-pink text-ink border-3 border-ink shadow-hard-sm hover:bg-pink/90",
        };
    }
  };

  const { iconBg, buttonBg } = getThemeStyles();

  return (
    <div className="bg-navy-800/90 border-3 border-ink shadow-hard p-6 md:p-7 flex flex-col justify-between relative group hover:border-yellow hover:-translate-y-1.5 transition-all duration-300">
      {/* Corner Pixel Accent */}
      <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-yellow border-2 border-ink opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header Icon Badge */}
        <div
          className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 shadow-hard-sm ${iconBg}`}
        >
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="font-pixel text-cream text-base md:text-lg tracking-wide uppercase leading-snug group-hover:text-yellow transition-colors mb-3">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-cream/80 text-xs md:text-sm font-sans leading-relaxed mb-6">
          {event.description}
        </p>
      </div>

      {/* Action Button Directing to Google Form */}
      <a
        href={event.gformUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`press-btn w-full py-3 ${buttonBg} font-pixel text-xs tracking-wider uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5`}
      >
        <span>DAFTAR SEKARANG</span>
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
