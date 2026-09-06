"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-navy-900 text-cream font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-navy-800 border-3 border-ink shadow-hard-lg max-w-md w-full p-6 space-y-4">
          <div className="w-12 h-12 bg-pink/20 border-2 border-pink text-pink rounded-full flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <span className="font-pixel text-[10px] text-pink tracking-widest block uppercase">
            SYSTEM EXCEPTION DETECTED
          </span>
          <h2 className="font-pixel text-cream text-lg">SYSTEM ERROR</h2>
          <p className="text-xs text-cream/80 font-sans">
            Terjadi masalah koneksi atau cache aplikasi. Silakan klik tombol di bawah untuk memuat ulang sistem.
          </p>
          <button
            onClick={() => reset()}
            className="press-btn px-5 py-2.5 bg-yellow text-ink border-2 border-ink shadow-hard-sm font-pixel text-xs font-bold uppercase tracking-wider hover:bg-yellow-dim transition-all cursor-pointer"
          >
            COBA LAGI / RESET
          </button>
        </div>
      </body>
    </html>
  );
}
