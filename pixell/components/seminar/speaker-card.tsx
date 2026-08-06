import Image from "next/image";
import { Speaker } from "@/types/speaker";

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
      className={`group border-3 border-ink shadow-hard bg-navy-700 overflow-hidden grid md:grid-cols-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-hard-lg ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="relative h-64 md:h-full the classmin-h-[280px] border-b-3 md:border-b-0 md:border-r-3 border-ink overflow-hidden">
        <Image
          src={speaker.photo!}
          alt={speaker.name}
          fill
          className="object-cover scale-100 group-hover:scale-110 transition-transform duration-500"
          style={{ objectPosition: speaker.photoPosition || "center" }}
        />
      </div>

      <div className="p-6 md:p-8 flex flex-col justify-center">
        <span
          className={`inline-block w-fit font-pixel text-[9px] border-3 border-ink px-3 py-2 mb-4 ${colorClasses[speaker.color]}`}
        >
          {labelMap[speaker.category]}
        </span>

        <h3 className="font-pixel text-cream text-lg md:text-2xl leading-relaxed transition-colors duration-300 group-hover:text-yellow">
          {speaker.name}
        </h3>
        <p className="font-mono text-sm text-pink mt-2">{speaker.role}</p>

        {speaker.cv && (
          <a
            href={speaker.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="press-btn inline-flex items-center gap-2 w-fit mt-6 border-3 border-ink shadow-hard-sm bg-yellow text-ink font-mono text-sm font-bold px-4 py-2"
          >
            LIHAT CV ↗
          </a>
        )}
      </div>
    </div>
  );
}