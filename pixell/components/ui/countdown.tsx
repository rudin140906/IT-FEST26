"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

function getTimeLeft(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [time, setTime] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "HARI", value: time.days },
    { label: "JAM", value: time.hours },
    { label: "MENIT", value: time.mins },
    { label: "DETIK", value: time.secs },
  ];

  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {units.map((unit) => (
        <div key={unit.label} className="border-3 border-ink shadow-hard bg-navy-700 px-5 py-4 md:px-8 md:py-6 text-center the classmin-w-[80px] the classmd:min-w-[110px]">
          <div className="font-mono text-3xl md:text-6xl font-bold text-yellow" suppressHydrationWarning>
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] md:text-xs font-mono text-cream/60 mt-2 tracking-widest">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}