import { Speaker } from "@/types/speaker";
import { withBasePath } from "@/lib/site-path";

export const speakers: Speaker[] = [
  {
    id: "avip-syaifulloh",
    name: "Avip Syaifulloh, S.T.",
    role: "CEO WPU Course",
    category: "guest-star",
    photo: withBasePath("/speakers/avip-syaifulloh.jpg"),
    photoPosition: "center 25%",
    cv: withBasePath("/speakers/cv-avip-syaifulloh.pdf"),
    color: "pink",
  },
  {
    id: "rahmi-liza",
    name: "Rahmi Liza, S.Tr.Kom., M.Sc.",
    role: "Software Engineer",
    category: "speaker",
    photo: withBasePath("/speakers/rahmi-liza.jpg"),
    photoPosition: "center 60%",
    cv: withBasePath("/speakers/cv-rahmi-liza.pdf"),
    color: "cyan",
  },
];
