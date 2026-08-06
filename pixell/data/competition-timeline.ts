export interface TimelineStep {
  step: string;
  title: string;
  date: string;
}

export const competitionTimeline: TimelineStep[] = [
  { step: "1", title: "Pendaftaran Lomba", date: "10 Agu – 11 Okt 2026" },
  { step: "2", title: "Pengumpulan Karya", date: "12 Okt – 23 Okt 2026" },
  { step: "3", title: "Technical Meeting", date: "02 Okt & 12 Okt 2026" },
  { step: "4", title: "Turnamen & Penjurian", date: "03 Okt – 30 Okt 2026" },
  { step: "5", title: "Pengumuman Pemenang", date: "02 Nov 2026" },
];