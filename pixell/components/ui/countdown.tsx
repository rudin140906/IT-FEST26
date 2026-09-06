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
    <div className="grid grid-cols-4 gap-2 sm:gap-3.5 md:gap-4 w-full max-w-xl mx-auto">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="border-3 border-ink shadow-hard bg-navy-900/90 py-3 sm:py-4 md:py-5 px-1 sm:px-3 text-center rounded-sm group hover:border-yellow transition-all duration-200"
        >
          <div
            className="font-pixelify text-2xl sm:text-4xl md:text-5xl font-bold text-yellow drop-shadow-[0_2px_0_rgba(5,7,24,1)] group-hover:scale-105 transition-transform"
            suppressHydrationWarning
          >
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-[8px] sm:text-[10px] md:text-xs font-pixel font-bold text-pink mt-1 sm:mt-1.5 tracking-wider uppercase">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}