import Image from "next/image";
import Link from "next/link";
import { speakers } from "@/data/speakers";

export default function SpeakersSection() {
  return (
    <section id="speakers" className="max-w-6xl mx-auto px-6 pt-2 md:pb-15">
      <div className="text-center mb-12">
        <span className="font-pixel text-[9px] text-pink">
          ◆ OUR SPEAKERS
        </span>
        <h2 className="font-pixel text-cream text-2xl md:text-4xl mt-4">
          Meet Our Professional Speakers
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {speakers.map((speaker, i) => (
          <div
            key={speaker.id}
            className="group border-3 border-ink shadow-hard bg-navy-700 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-hard-lg"
            style={{ transform: i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)" }}
          >
            <div className="relative h-64 border-b-3 border-ink overflow-hidden">
              <Image
                src={speaker.photo!}
                alt={speaker.name}
                fill
                className="object-cover scale-100 group-hover:scale-110 transition-transform duration-500"
                style={{ objectPosition: speaker.photoPosition || "center" }}
              />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-cream transition-colors duration-300 group-hover:text-yellow">
                {speaker.name}
              </h3>
              <p className="font-mono text-xs text-pink mt-1">
                {speaker.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <Link
          href="/seminar"
          className="press-btn border-3 border-ink shadow-hard bg-pink text-ink font-pixel text-[11px] px-6 py-4"
        >
          LIHAT PEMBICARA
        </Link>
      </div>
    </section>
  );
}