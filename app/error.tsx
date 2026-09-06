"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-navy-800 border-3 border-ink shadow-hard max-w-md w-full p-6 space-y-4">
        <div className="w-12 h-12 bg-pink/20 border-2 border-pink text-pink rounded-full flex items-center justify-center mx-auto text-2xl">
          ⚡
        </div>
        <span className="font-pixel text-[10px] text-yellow tracking-widest block uppercase">
          PERINGATAN HALAMAN
        </span>
        <h2 className="font-pixel text-cream text-base">Gagal Memuat Komponen</h2>
        <p className="text-xs text-cream/80 font-sans">
          Beberapa data belum dapat dimuat. Silakan klik muat ulang di bawah.
        </p>
        <button
          onClick={() => reset()}
          className="press-btn px-5 py-2.5 bg-pink text-cream border-2 border-ink shadow-hard-sm font-pixel text-xs font-bold uppercase tracking-wider hover:bg-pink/90 transition-all cursor-pointer"
        >
          MUAT ULANG HALAMAN
        </button>
      </div>
    </div>
  );
}
