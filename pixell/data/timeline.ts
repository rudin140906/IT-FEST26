export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  category?: string;
  badgeColor?: "pink" | "cyan" | "yellow";
  imageUrl?: string;
}

export const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "OPEN REGISTRATION SEMINAR, PERLOMBAAN DAN PELATIHAN (CYBER & WEB)",
    date: "Senin, 10 Agustus 2026",
    category: "REGISTRASI",
    badgeColor: "pink",
  },
  {
    id: 2,
    title: "Close Registration Pelatihan dan Seminar",
    date: "Rabu, 9 September 2026",
    category: "CLOSE REG",
    badgeColor: "cyan",
  },
  {
    id: 3,
    title: "Opening Ceremony IT Festival 2026",
    date: "Rabu, 16 September 2026",
    category: "OPENING",
    badgeColor: "yellow",
  },
  {
    id: 4,
    title: "Pelaksanaan Seminar & Talkshow",
    date: "Rabu, 16 September 2026",
    category: "SEMINAR",
    badgeColor: "pink",
  },
  {
    id: 5,
    title: "Pelatihan vibe Coding",
    date: "17-18 September, 21-22 September 2026",
    category: "PELATIHAN",
    badgeColor: "cyan",
  },
  {
    id: 6,
    title: "Pelatihan Cyber",
    date: "23-25 September, 28 September 2026",
    category: "PELATIHAN",
    badgeColor: "yellow",
  },
  {
    id: 7,
    title: "Close Registration Lomba Mobile legends & Free Fire",
    date: "Kamis, 1 Oktober 2026",
    category: "CLOSE REG",
    badgeColor: "pink",
  },
  {
    id: 8,
    title: "Pelaksanaan Technical Meeting Lomba Mobile Legends",
    date: "Jum’at, 2 Oktober 2026",
    category: "TM",
    badgeColor: "cyan",
  },
  {
    id: 9,
    title: "Pelaksanaan Lomba Mobile Legends",
    date: "Sabtu, 3 Oktober 2026 (Online) – Minggu, 4 Oktober 2026 (Ofline)",
    category: "LOMBA",
    badgeColor: "yellow",
  },
  {
    id: 10,
    title: "Pelaksanaan Technical Meeting Lomba Free Fire",
    date: "Jum’at, 9 Oktober 2026",
    category: "TM",
    badgeColor: "pink",
  },
  {
    id: 11,
    title: "Pelaksanaan Lomba Free Fire",
    date: "Sabtu, 10 Oktober 2026 (Online) – Minggu, 11 Oktober 2026 (Ofline)",
    category: "LOMBA",
    badgeColor: "cyan",
  },
  {
    id: 12,
    title: "Close Registration Lomba Vibe Coding , Capture the flag , Fotografi",
    date: "Minggu, 11 Oktober 2026",
    category: "CLOSE REG",
    badgeColor: "pink",
  },
  {
    id: 13,
    title: "Technical Meeting Vibe Coding , Capture the flag , Fotografi",
    date: "Senin, 12 Oktober 2026",
    category: "TM",
    badgeColor: "yellow",
  },
  {
    id: 14,
    title: "Pelaksaan Lomba Capture The Flag",
    date: "Sabtu, 17 Oktober 2026",
    category: "LOMBA",
    badgeColor: "cyan",
  },
  {
    id: 15,
    title: "Batas Pengumpulan Karya Vibe Coding dan Fotografi",
    date: "Jum’at, 23 Oktober 2026",
    category: "DEADLINE",
    badgeColor: "pink",
  },
  {
    id: 16,
    title: "Penjurian Lomba Vibe Coding Dan Fotografi",
    date: "Jum’at 24 – 30 Oktober 2026",
    category: "PENJURIAN",
    badgeColor: "yellow",
  },
  {
    id: 17,
    title: "Closing Ceremony IT Festival 2026 & Pengumuman Pemenang",
    date: "Senin, 2 November 2026",
    category: "CLOSING",
    badgeColor: "cyan",
  },
];
