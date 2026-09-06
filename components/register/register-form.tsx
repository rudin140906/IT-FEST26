"use client";

import { useState } from "react";
import { RegisterEventItem } from "@/data/register-events";
import { CheckCircle2, RefreshCw, X, ShieldCheck } from "lucide-react";

interface RegisterModalProps {
  event: RegisterEventItem | null;
  onClose: () => void;
}

export default function RegisterForm({ event, onClose }: RegisterModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(event?.id || "");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md animate-fade-up">
      <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Retro Corner Accents */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-pink border-2 border-ink rotate-12" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow border-2 border-ink -rotate-12" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-5">
          <div>
            <span className="font-pixel text-[10px] text-pink tracking-widest uppercase block mb-1">
              ◆ FORM REGISTRASI IT-FESTIVAL
            </span>
            <h2 className="font-pixel text-cream text-base sm:text-lg tracking-wide uppercase text-yellow">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-navy-700 border-2 border-ink text-cream font-mono font-bold hover:bg-pink hover:text-ink transition-colors flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-yellow text-ink border-3 border-ink rounded-full flex items-center justify-center mx-auto text-3xl shadow-hard">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-pixel text-cream text-lg">PENDAFTARAN BERHASIL!</h3>
            <p className="text-xs font-sans text-cream/80 max-w-sm mx-auto leading-relaxed">
              Terima kasih <strong className="text-yellow">{fullName}</strong> telah mendaftar pada acara <strong className="text-pink">{event.title}</strong>. Tim panitia IT-Festival akan menghubungi Anda via WhatsApp/Email.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="press-btn px-6 py-2.5 bg-yellow text-ink border-2 border-ink font-pixel text-xs font-bold uppercase shadow-hard-sm hover:bg-yellow-dim cursor-pointer"
              >
                Tutup & Kembali
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                Nama Lengkap <span className="text-pink">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                  Email <span className="text-pink">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                  No. WhatsApp / HP <span className="text-pink">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>
            </div>

            <div>
              <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                Instansi / Sekolah / Universitas <span className="text-pink">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Universitas Sriwijaya / SMKN 2"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
              />
            </div>

            <div>
              <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Pesan atau catatan untuk panitia..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
              />
            </div>

            <div className="bg-navy-900/80 border border-ink/60 p-3 text-[11px] font-mono text-cyan flex items-center gap-2">
              <ShieldCheck size={16} className="text-yellow shrink-0" />
              <span>Data Anda aman & terlindungi oleh panitia IT-Festival 2026.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-navy-700 border-2 border-ink text-cream text-xs font-pixel tracking-wider hover:bg-navy-700/80 transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="press-btn px-6 py-2.5 bg-pink text-cream border-2 border-ink shadow-hard-sm text-xs font-pixel tracking-wider font-bold hover:bg-pink/90 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <span>KIRIM PENDAFTARAN &gt;</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
