import Image from "next/image";
import { Speaker } from "@/types/speaker";
import { withBasePath } from "@/lib/site-path";

interface SpeakerCardProps {
  speaker: Speaker;
  reverse?: boolean;
}

const labelMap = {
  "guest-star": "GUEST STAR",
  speaker: "SPEAKER",
};

const colorClasses: Record<string, string> = {
  yellow: "bg-yellow text-ink",
  pink: "bg-pink text-ink",
  cyan: "bg-cyan text-ink",
};

export default function SpeakerCard({ speaker, reverse = false }: SpeakerCardProps) {
  return (
    <div
      className={`group border-3 border-ink shadow-hard bg-navy-800 overflow-hidden grid md:grid-cols-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-hard-lg ${
        reverse ? "md:[&>*:first-child]:order-2 md:[&>*:first-child]:border-l-3 md:[&>*:first-child]:border-r-0" : ""
      }`}
    >
      <div className="relative h-64 md:h-full min-h-[280px] border-b-3 md:border-b-0 md:border-r-3 border-ink overflow-hidden bg-navy-900">
        <Image
          src={withBasePath(speaker.photo || "/logos/logo_navbar.png")}
          alt={speaker.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover scale-100 group-hover:scale-108 transition-transform duration-500"
          style={{ objectPosition: speaker.photoPosition || "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="p-6 md:p-8 flex flex-col justify-center">
        <span
          className={`inline-block w-fit font-pixel text-[9px] border-3 border-ink px-3 py-1.5 mb-4 font-bold shadow-hard-sm ${colorClasses[speaker.color]}`}
        >
          {labelMap[speaker.category]}
        </span>

        <h3 className="font-pixel text-cream text-lg md:text-2xl leading-relaxed transition-colors duration-300 group-hover:text-yellow">
          {speaker.name}
        </h3>
        <p className="font-mono text-sm text-cyan font-bold mt-2">{speaker.role}</p>

        {speaker.cv && (
          <a
            href={withBasePath(speaker.cv)}
            target="_blank"
            rel="noopener noreferrer"
            className="press-btn inline-flex items-center gap-2 w-fit mt-6 border-3 border-ink shadow-hard-sm bg-yellow text-ink font-pixel text-[10px] font-extrabold px-5 py-2.5"
          >
            LIHAT CV ↗
          </a>
        )}
      </div>
    </div>
  );
}