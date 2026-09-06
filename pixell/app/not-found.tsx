import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 text-cream px-4">
      <div className="text-center max-w-md bg-navy-800/90 border-3 border-pink p-8 shadow-hard">
        <span className="font-pixel text-4xl md:text-5xl text-pink block mb-4">404</span>
        <h1 className="font-pixel text-lg md:text-xl text-yellow mb-4">
          PAGE NOT FOUND
        </h1>
        <p className="font-sans text-sm text-cream/70 mb-6">
          Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block font-pixel text-xs bg-cyan text-ink px-6 py-3 border-2 border-ink shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
        >
          KEMBALI KE HOME
        </Link>
      </div>
    </div>
  );
}
