export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  category?: string;
  badgeColor?: "pink" | "cyan" | "yellow";
}

export const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "OPEN REGISTRATION SEMINAR, PERLOMBAAN DAN PELATIHAN (ANDROID & WEB)",
    date: "Selasa, 16 Agustus 2026",
    category: "REGISTRASI",
    badgeColor: "pink",
  },
  {
    id: 2,
    title: "PERLOMBAAN (PEMBUATAN KARYA)",
    date: "16 Agustus – 13 Oktober 2026",
    category: "KOMPETISI",
    badgeColor: "cyan",
  },
  {
    id: 3,
    title: "BATAS SUBMIT ABSTRAK (CIPTA INOVASI)",
    date: "Sabtu, 30 Agustus 2026",
    category: "DEADLINE",
    badgeColor: "yellow",
  },
  {
    id: 4,
    title: "PENYISIHAN ABSTRAK (CIPTA INOVASI)",
    date: "Minggu, 31 Agustus 2026 – Selasa, 2 September 2026",
    category: "SELEKSI",
    badgeColor: "pink",
  },
  {
    id: 5,
    title: "PENGUMUMAN LOLOS BATCH 2 (CIPTA INOVASI)",
    date: "Rabu, 3 September 2026",
    category: "PENGUMUMAN",
    badgeColor: "cyan",
  },
  {
    id: 6,
    title: "CLOSE REGISTRATION PELATIHAN DAN SEMINAR",
    date: "Sabtu, 6 September 2026",
    category: "DEADLINE",
    badgeColor: "yellow",
  },
  {
    id: 7,
    title: "OPENING CEREMONY IT FESTIVAL 2026",
    date: "Selasa, 16 September 2026",
    category: "CEREMONY",
    badgeColor: "pink",
  },
  {
    id: 8,
    title: "PELAKSANAAN SEMINAR & TALKSHOW",
    date: "Selasa, 16 September 2026",
    category: "ACARA UTAMA",
    badgeColor: "cyan",
  },
];
