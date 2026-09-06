import { Training } from "@/types/training";
import { withBasePath } from "@/lib/site-path";

export const trainings: Training[] = [
  {
    id: "vibe-coding-training",
    title: "Vibe Coding",
    description:
      "Belajar membangun aplikasi dan produk digital secara cepat dengan bantuan AI, dari ide sampai jadi produk nyata.",
    mascot: withBasePath("/maskot/mascot-vibe-coding.png"),
    registerUrl: "/register",
    guidebookUrl: "#",
    color: "yellow",
  },
  {
    id: "cyber-security-training",
    title: "Cyber Security",
    description:
      "Pelajari dasar-dasar keamanan siber, mulai dari deteksi celah keamanan hingga teknik perlindungan sistem.",
    mascot: withBasePath("/maskot/mascot-ctf.png"),
    registerUrl: "/register",
    guidebookUrl: "#",
    color: "cyan",
  },
];
