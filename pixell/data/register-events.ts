export interface RegisterEventItem {
  id: string;
  title: string;
  category: "kompetisi" | "pelatihan" | "seminar";
  categoryLabel: string;
  description: string;
  iconType: "gamepad" | "flame" | "code" | "shield" | "camera" | "mic";
  badgeColor: "pink" | "cyan" | "yellow";
  gformUrl: string;
}

export const registerEventsData: RegisterEventItem[] = [
  // KOMPETISI (5 Events from data/competitions.ts)
  {
    id: "ml",
    title: "Mobile Legends",
    category: "kompetisi",
    categoryLabel: "KOMPETISI",
    description: "Buktikan skill dan kerja sama timmu di arena Mobile Legends, raih kemenangan demi kemenangan.",
    iconType: "gamepad",
    badgeColor: "cyan",
    gformUrl: "https://forms.google.com/",
  },
  {
    id: "ff",
    title: "Free Fire",
    category: "kompetisi",
    categoryLabel: "KOMPETISI",
    description: "Turun ke medan pertempuran Free Fire, jadi yang terakhir bertahan dan raih Booyah!",
    iconType: "flame",
    badgeColor: "pink",
    gformUrl: "https://forms.google.com/",
  },
  {
    id: "vibe-coding-comp",
    title: "Vibe Coding Competition",
    category: "kompetisi",
    categoryLabel: "KOMPETISI",
    description: "Bangun aplikasi atau produk digital secepat mungkin menggunakan bantuan AI, untuk menciptakan kreativitas.",
    iconType: "code",
    badgeColor: "yellow",
    gformUrl: "https://forms.google.com/",
  },
  {
    id: "ctf-comp",
    title: "Capture The Flag Competition",
    category: "kompetisi",
    categoryLabel: "KOMPETISI",
    description: "Uji kemampuan hacking dan keamanan sibermu dengan memecahkan berbagai tantangan CTF dari level pemula hingga expert.",
    iconType: "shield",
    badgeColor: "cyan",
    gformUrl: "https://forms.google.com/",
  },
  {
    id: "photography-comp",
    title: "Photography Competition",
    category: "kompetisi",
    categoryLabel: "KOMPETISI",
    description: "Tunjukkan sudut pandang kreatifmu lewat lensa kamera dan abadikan momen terbaik dalam kompetisi fotografi ini.",
    iconType: "camera",
    badgeColor: "pink",
    gformUrl: "https://forms.google.com/",
  },

  // PELATIHAN (2 Events from data/trainings.ts)
  {
    id: "vibe-coding-training",
    title: "Vibe Coding",
    category: "pelatihan",
    categoryLabel: "PELATIHAN",
    description: "Belajar membangun aplikasi dan produk digital secara cepat dengan bantuan AI, dari ide sampai jadi produk nyata.",
    iconType: "code",
    badgeColor: "yellow",
    gformUrl: "https://forms.google.com/",
  },
  {
    id: "cyber-security-training",
    title: "Cyber Security",
    category: "pelatihan",
    categoryLabel: "PELATIHAN",
    description: "Pelajari dasar-dasar keamanan siber, mulai dari deteksi celah keamanan hingga teknik perlindungan sistem.",
    iconType: "shield",
    badgeColor: "cyan",
    gformUrl: "https://forms.google.com/",
  },

  // SEMINAR (1 Event from app/seminar/page.tsx)
  {
    id: "seminar-itfest",
    title: "Seminar IT-Festival 2026",
    category: "seminar",
    categoryLabel: "SEMINAR",
    description: "Ikuti seminar kami dan dapatkan wawasan berharga langsung dari para ahli di bidang teknologi.",
    iconType: "mic",
    badgeColor: "pink",
    gformUrl: "https://forms.google.com/",
  },
];
