import Hero from "@/components/home/hero";
import About from "@/components/home/about";
import Marquee from "@/components/ui/marquee";
import EventsSection from "@/components/home/events-section";
import TimelineSection from "@/components/home/timeline-section";
import SpeakersSection from "@/components/home/speakers-section";
import SponsorsSection from "@/components/home/sponsors-section";

export default function Home() {
  return (
    <main>
      <Hero/>
      <Marquee
        items={[
          "◆ WEBINAR",
          "◆ PELATIHAN WEB",
          "◆ PELATIHAN CYBER",
          "◆ KOMPETISI",
          "◆ VIBE CODING COMPETITION",
          "◆ CAPTURE THE FLAG COMPETITION",
          "◆ PHOTOGRAPHY COMPETITION",
        ]}
      />
      <About/>
      <EventsSection/>
      <SpeakersSection/>
      <TimelineSection/>
      <SponsorsSection/>
    </main>
  );
}