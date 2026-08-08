import Image from "next/image";
import { Training } from "@/types/training";

interface TrainingCardProps {
  training: Training;
  index: number;
}

const badgeClasses: Record<string, string> = {
  yellow: "bg-yellow text-ink",
  pink: "bg-pink text-ink",
  cyan: "bg-cyan text-ink",
};

const glowClasses: Record<string, string> = {
  yellow: "bg-yellow/25",
  pink: "bg-pink/25",
  cyan: "bg-cyan/25",
};

export default function TrainingCard({ training, index }: TrainingCardProps) {
  return (
    <div className="group relative border-3 border-ink shadow-hard bg-navy-700 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-hard-lg" style={{ transform: index % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)" }}>
      <div className={`absolute -top-2 -right-2 w-6 h-6 border-3 border-ink rotate-12 transition-transform duration-300 group-hover:rotate-45 ${badgeClasses[training.color]}`}/>
      <div className="relative h-56 flex items-center justify-center border-b-3 border-ink overflow-hidden bg-navy-800">
        <div className={`absolute w-40 h-40 rounded-full blur-[50px] ${glowClasses[training.color]}`}/>
        <Image
          src={training.mascot}
          alt={training.title}
          width={200}
          height={200}
          className="relative object-contain h-full w-auto py-2 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1"
        />
      </div>

      <div className="p-6">
        <span className={`inline-block font-pixel text-[9px] border-3 border-ink px-2 py-1 mb-3 ${badgeClasses[training.color]}`}>
          PELATIHAN
        </span>
        <h3 className="font-bold text-lg mb-2 text-cream transition-colors duration-300 group-hover:text-yellow">
          {training.title}
        </h3>
        <p className="text-sm text-cream/60 leading-relaxed mb-6">
          {training.description}
        </p>

        <div className="flex flex-wrap gap-3">
          <a href={training.registerUrl} className="press-btn border-3 border-ink shadow-hard-sm bg-yellow text-ink font-mono text-xs font-bold px-4 py-2">
            DAFTAR
          </a>
          <a href={training.guidebookUrl} target="_blank" rel="noopener noreferrer" className="press-btn border-3 border-ink shadow-hard-sm bg-transparent text-cream font-mono text-xs font-bold px-4 py-2">
            GUIDEBOOK
          </a>
        </div>
      </div>
    </div>
  );
}