import Image from "next/image";
import { Training } from "@/types/training";
import { withBasePath } from "@/lib/site-path";

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
    <div className="group relative border-3 border-ink shadow-hard bg-navy-800 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-hard-lg" style={{ transform: index % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)" }}>
      <div className={`absolute -top-2 -right-2 w-6 h-6 border-3 border-ink rotate-12 transition-transform duration-300 group-hover:rotate-45 ${badgeClasses[training.color]}`}/>
      <div className="relative h-64 sm:h-72 p-4 flex items-center justify-center border-b-3 border-ink overflow-hidden bg-navy-900">
        <div className={`absolute w-44 h-44 rounded-full blur-[50px] ${glowClasses[training.color]}`}/>
        <Image
          src={withBasePath(training.mascot)}
          alt={training.title}
          width={280}
          height={280}
          style={{ maxHeight: "100%", maxWidth: "100%", width: "auto", height: "auto" }}
          className="relative object-contain max-h-full max-w-full py-1 transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      <div className="p-6">
        <span className={`inline-block font-pixel text-[9px] border-3 border-ink px-2.5 py-1 mb-3 font-bold ${badgeClasses[training.color]}`}>
          PELATIHAN
        </span>
        <h3 className="font-pixel text-base md:text-lg mb-2 text-cream transition-colors duration-300 group-hover:text-yellow leading-snug">
          {training.title}
        </h3>
        <p className="text-sm text-cream/80 font-sans leading-relaxed mb-6 font-medium">
          {training.description}
        </p>

        <div className="flex flex-wrap gap-3">
          <a href={withBasePath(training.registerUrl)} className="press-btn border-3 border-ink shadow-hard-sm bg-cyan text-ink font-pixel text-[10px] font-extrabold px-4 py-2.5">
            DAFTAR &gt;
          </a>
          {training.guidebookUrl && training.guidebookUrl !== "#" && (
            <a href={withBasePath(training.guidebookUrl)} target="_blank" rel="noopener noreferrer" className="press-btn border-3 border-ink shadow-hard-sm bg-navy-700 text-cream hover:text-cyan font-pixel text-[10px] font-bold px-4 py-2.5">
              GUIDEBOOK
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
