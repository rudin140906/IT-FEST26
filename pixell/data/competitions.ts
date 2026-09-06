import { Competition } from "@/types/competition";
import { withBasePath } from "@/lib/site-path";

export const competitions: Competition[] = [
  {
    id: "ml",
    title: "Mobile Legends",
    description:
      "Buktikan skill dan kerja sama timmu di arena Mobile Legends, raih kemenangan demi kemenangan.",
    mascot: withBasePath("/maskot/mascot-ml.png"),
    registerUrl: "/register",
    guidebookUrl: "#",
    color: "cyan",
  },
  {
    id: "ff",
    title: "Free Fire",
    description:
      "Turun ke medan pertempuran Free Fire, jadi yang terakhir bertahan dan raih Booyah!",
    mascot: withBasePath("/maskot/mascot-ff.png"),
    registerUrl: "/register",
    guidebookUrl: "#",
    color: "pink",
  },
  {
    id: "vibe-coding-comp",
    title: "Vibe Coding Competition",
    description:
      "Bangun aplikasi atau produk digital secepat mungkin menggunakan bantuan AI, untuk menciptakan kreativitas.",
    mascot: withBasePath("/maskot/mascot-vibe-coding.png"),
    registerUrl: "/register",
    guidebookUrl: "#",
    color: "yellow",
  },
  {
    id: "ctf-comp",
    title: "Capture The Flag Competition",
    description:
      "Uji kemampuan hacking dan keamanan sibermu dengan memecahkan berbagai tantangan CTF dari level pemula hingga expert.",
    mascot: withBasePath("/maskot/mascot-ctf.png"),
    registerUrl: "/register",
    guidebookUrl: "#",
    color: "cyan",
  },
  {
    id: "photography-comp",
    title: "Photography Competition",
    description:
      "Tunjukkan sudut pandang kreatifmu lewat lensa kamera dan abadikan momen terbaik dalam kompetisi fotografi ini.",
    mascot: withBasePath("/maskot/mascot-photography.png"),
    registerUrl: "/register",
    guidebookUrl: "#",
    color: "pink",
  },
];
