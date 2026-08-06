import { count } from "console";

export interface TimelineStep {
    step : string;
    title : string;
    date : string;
}

export const trainingTimeline : TimelineStep[] = [
    {step: "1", title : "Pembukaan Pendaftaran", date : "10 Agu – 11 Okt 2026"},
    {step: "2", title : "Pelaksanaan Pelatihan", date: "12 Okt – 23 Okt 2026"},
    {step: "3", title : "Pengumpulan Proyek", date: "02 Okt 2026"},
    {step: "4", title : "Pengumuman Kelulusan", date: "03 Okt – 30 Okt 2026"},
];