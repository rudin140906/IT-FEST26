"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Edit2,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Trophy,
  GraduationCap,
  Mic,
  FileText,
  Upload,
  X,
  Save,
  Building2,
  Calendar,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { apiPath, withBasePath } from "@/lib/site-path";

interface EventItem {
  id: string;
  title: string;
  category: "kompetisi" | "pelatihan" | "seminar";
  categoryLabel: string;
  description: string;
  iconType: string;
  badgeColor: "pink" | "cyan" | "yellow";
  gformUrl: string;
  guidebookUrl: string;
  mascotUrl?: string;
}

function hasRecentClientAdminSession() {
  return typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "true";
}

export default function AdminEventsPage() {
  const router = useRouter();

  // Auth
  const [verifyingAuth, setVerifyingAuth] = useState(true);

  // Data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editGformUrl, setEditGformUrl] = useState("");
  const [editGuidebookUrl, setEditGuidebookUrl] = useState("");
  const [editMascotUrl, setEditMascotUrl] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingMascot, setUploadingMascot] = useState(false);
  const [saving, setSaving] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const mascotInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<"all" | "kompetisi" | "pelatihan" | "seminar">("all");

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      if (hasRecentClientAdminSession()) {
        setVerifyingAuth(false);
        return;
      }

      try {
        const res = await fetch(apiPath("/admin/check"));
        if (!res.ok) {
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.replace("/admin");
          return;
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_auth", "true");
        }
        setVerifyingAuth(false);
      } catch {
        router.replace("/admin");
      }
    }
    checkAuth();
  }, [router]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath("/events?t=" + Date.now()));
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
        showToast("Gagal memuat data event", "error");
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      showToast("Terjadi masalah koneksi server", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (verifyingAuth) return;
    fetchEvents();
  }, [verifyingAuth, fetchEvents]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_auth");
      document.cookie = "admin_session=; path=/; max-age=0";
    }
    fetch(apiPath("/admin/logout"), { method: "POST" }).catch(() => {});
    router.replace("/admin");
  }

  function openEditModal(event: EventItem) {
    setEditingEvent(event);
    setEditGformUrl(event.gformUrl);
    setEditGuidebookUrl(event.guidebookUrl);
    setEditMascotUrl(event.mascotUrl || "");
  }

  function closeEditModal() {
    setEditingEvent(null);
    setEditGformUrl("");
    setEditGuidebookUrl("");
    setEditMascotUrl("");
  }

  // Upload Guidebook PDF
  async function handleUploadPdf() {
    const file = pdfInputRef.current?.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      showToast("File harus berupa berkas PDF (.pdf)", "error");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      showToast("Ukuran file PDF maksimal 30MB", "error");
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "guidebook");

      const res = await fetch(apiPath("/upload"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditGuidebookUrl(data.publicUrl);
        showToast("Guidebook PDF berhasil diupload!", "success");
      } else {
        showToast(data.error || "Upload PDF gagal", "error");
      }
    } catch {
      showToast("Terjadi masalah saat upload PDF", "error");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  }

  // Upload Mascot Image
  async function handleUploadMascot() {
    const file = mascotInputRef.current?.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran gambar maskot maksimal 10MB", "error");
      return;
    }

    setUploadingMascot(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const res = await fetch(apiPath("/upload"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditMascotUrl(data.publicUrl);
        showToast("Gambar Maskot berhasil diupload!", "success");
      } else {
        showToast(data.error || "Upload gambar maskot gagal", "error");
      }
    } catch {
      showToast("Terjadi masalah saat upload maskot", "error");
    } finally {
      setUploadingMascot(false);
      if (mascotInputRef.current) mascotInputRef.current.value = "";
    }
  }

  async function handleSaveEvent() {
    if (!editingEvent) return;
    setSaving(true);

    try {
      const res = await fetch(apiPath("/events"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: editingEvent.id,
          gformUrl: editGformUrl,
          guidebookUrl: editGuidebookUrl,
          mascotUrl: editMascotUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(`Event "${editingEvent.title}" berhasil diperbarui!`, "success");
        closeEditModal();
        fetchEvents();
      } else {
        showToast(data.error || "Gagal menyimpan perubahan", "error");
      }
    } catch {
      showToast("Terjadi masalah koneksi server", "error");
    } finally {
      setSaving(false);
      closeEditModal();
    }
  }

  const filteredEvents = categoryFilter === "all" ? events : events.filter((e) => e.category === categoryFilter);

  const categoryBadge: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    kompetisi: { bg: "bg-cyan/20 border-cyan/50", text: "text-cyan", icon: <Trophy size={14} /> },
    pelatihan: { bg: "bg-yellow/20 border-yellow/50", text: "text-yellow", icon: <GraduationCap size={14} /> },
    seminar: { bg: "bg-pink/20 border-pink/50", text: "text-pink", icon: <Mic size={14} /> },
  };

  if (verifyingAuth) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-cream">
        <RefreshCw size={36} className="animate-spin text-yellow mb-3" />
        <span className="font-pixel text-xs tracking-wider">MEMERIKSA HAK AKSES...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-cream font-sans relative overflow-x-hidden selection:bg-pink selection:text-ink pb-20">
      {/* OVERLAY & GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />

      {/* ADMIN HEADER */}
      <header className="border-b-3 border-ink bg-navy-800/95 sticky top-0 z-40 backdrop-blur-md shadow-hard">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-navy-700 border-2 border-ink shadow-hard-sm hover:bg-yellow hover:text-ink transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 relative shrink-0">
                <Image src={withBasePath("/logos/logo_navbar.png")} alt="Logo" width={36} height={36} style={{ width: "auto", height: "auto" }} className="object-contain" />
              </div>
              <div>
                <span className="font-pixel text-yellow text-xs md:text-sm tracking-wider block">
                  IT-FESTIVAL 2026
                </span>
                <span className="text-[10px] text-pink font-mono uppercase tracking-widest block font-bold">
                  ◆ KELOLA LINK DAFTAR & MASKOT CARD
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-navy-700 border border-ink text-xs font-mono text-cyan">
              <ShieldCheck size={14} className="text-yellow" />
              SESI ADMIN AKTIF
            </span>
            <Link
              href="/"
              target="_blank"
              className="press-btn border-2 border-ink shadow-hard-sm bg-cyan text-ink font-bold text-xs px-3.5 py-1.5 flex items-center gap-1.5 hover:bg-cyan/90 transition-all"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Prinjau Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="press-btn border-2 border-ink shadow-hard-sm bg-pink text-cream font-bold text-xs px-3.5 py-1.5 flex items-center gap-1.5 hover:bg-pink/90 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-20 right-4 md:right-8 z-50 px-5 py-3 border-3 border-ink shadow-hard flex items-center gap-3 font-bold text-sm transition-all transform animate-fade-up ${
            toast.type === "success" ? "bg-yellow text-ink" : "bg-pink text-cream"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-8 relative z-10">
        {/* UNIFIED 4-TAB NAVIGATION BAR */}
        <div className="flex flex-wrap items-center gap-3 border-b-3 border-ink pb-4">
          <Link
            href="/admin/partners"
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-navy-800 text-cream/70 hover:bg-navy-700"
          >
            <Building2 size={18} />
            <span>1. SPONSOR & MEDIA PARTNER</span>
          </Link>
          <Link
            href="/admin/partners"
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-navy-800 text-cream/70 hover:bg-navy-700"
          >
            <Calendar size={18} />
            <span>2. TIMELINE AGENDA</span>
          </Link>
          <button
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-cyan text-ink font-bold shadow-hard"
          >
            <Sparkles size={18} />
            <span>3. KELOLA LINK DAFTAR & MASKOT CARD ({events.length})</span>
          </button>
          <Link
            href="/admin/speakers"
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-navy-800 text-cream/70 hover:bg-navy-700"
          >
            <Mic size={18} />
            <span>4. KELOLA PEMATERI & CV PDF &gt;</span>
          </Link>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink/40 pb-6">
          <div>
            <span className="inline-block font-pixel text-[10px] text-cyan tracking-widest px-2.5 py-1 bg-cyan/15 border border-cyan/40 rounded-sm mb-2">
              ◆ EVENTS, REGISTRATION & MASCOT CONTROL
            </span>
            <h1 className="font-pixel text-2xl md:text-4xl text-cream tracking-wide drop-shadow-[0_3px_0_rgba(5,7,24,1)]">
              KELOLA <span className="text-cyan">LINK DAFTAR</span> & MASKOT CARD
            </h1>
            <p className="text-cream/70 text-xs md:text-sm font-sans mt-2 max-w-2xl font-medium">
              Atur **Link Google Form**, file **Guidebook PDF**, dan **Gambar Maskot Card** untuk setiap event kompetisi & pelatihan.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-navy-800 p-1.5 border-2 border-ink shrink-0">
            {(["all", "kompetisi", "pelatihan", "seminar"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 font-pixel text-[10px] uppercase transition-all cursor-pointer ${
                  categoryFilter === cat ? "bg-cyan text-ink font-bold" : "text-cream/60 hover:text-cream"
                }`}
              >
                {cat === "all" ? "SEMUA" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* EVENTS GRID */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-navy-800/40 border-3 border-ink">
            <RefreshCw size={32} className="animate-spin text-cyan mx-auto" />
            <p className="font-pixel text-xs text-cream/70">MEMUAT DATA EVENT...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const badge = categoryBadge[event.category] || categoryBadge.kompetisi;
              const hasGform = event.gformUrl && event.gformUrl.trim() !== "";
              const hasGuidebook = event.guidebookUrl && event.guidebookUrl !== "#" && event.guidebookUrl.trim() !== "";

              return (
                <div
                  key={event.id}
                  className="group border-3 border-ink shadow-hard bg-navy-800 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-hard-lg relative"
                >
                  {/* Card Top */}
                  <div className="p-6 space-y-4">
                    {/* Badge Category & Icon */}
                    <div className="flex items-center justify-between gap-3">
                      <span className={`inline-flex items-center gap-1.5 font-pixel text-[9px] border-2 border-ink px-2.5 py-1 font-bold ${badge.bg} ${badge.text}`}>
                        {badge.icon}
                        <span>{event.categoryLabel}</span>
                      </span>

                      {/* Mascot Preview Badge */}
                      {event.mascotUrl ? (
                        <div className="w-9 h-9 relative border-2 border-ink rounded-full overflow-hidden bg-navy-900 shrink-0">
                          <Image src={withBasePath(event.mascotUrl)} alt="Mascot" fill className="object-contain p-0.5" />
                        </div>
                      ) : null}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-pixel text-base text-cream group-hover:text-yellow transition-colors leading-snug">
                        {event.title}
                      </h3>
                      <p className="text-xs text-cream/70 font-sans mt-2 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Status Highlights */}
                    <div className="space-y-2 pt-2 border-t border-ink/40">
                      {/* GForm Status */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cream/50 flex items-center gap-1">
                          <ExternalLink size={12} /> Link Form:
                        </span>
                        {hasGform ? (
                          <a
                            href={event.gformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan font-bold truncate max-w-[170px] hover:underline"
                          >
                            {event.gformUrl}
                          </a>
                        ) : (
                          <span className="text-pink font-bold">Belum Diatur</span>
                        )}
                      </div>

                      {/* Guidebook Status */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cream/50 flex items-center gap-1">
                          <FileText size={12} /> Guidebook PDF:
                        </span>
                        {hasGuidebook ? (
                          <a
                            href={withBasePath(event.guidebookUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow font-bold truncate max-w-[170px] hover:underline"
                          >
                            PDF Terdistribusi ↗
                          </a>
                        ) : (
                          <span className="text-cream/30">Belum Ada PDF</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-4 border-t-2 border-ink/40 bg-navy-900/40">
                    <button
                      onClick={() => openEditModal(event)}
                      className="press-btn w-full border-2 border-ink bg-cyan text-ink font-bold text-xs py-2.5 flex items-center justify-center gap-2 hover:bg-cyan/90 transition-all cursor-pointer shadow-hard-sm"
                    >
                      <Edit2 size={14} />
                      <span>EDIT LINK, PDF & MASKOT</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-xl overflow-hidden animate-fade-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b-3 border-ink bg-navy-900/60">
              <div className="flex items-center gap-2.5">
                <Sparkles className="text-yellow" size={20} />
                <h3 className="font-pixel text-sm text-cream tracking-wide">
                  EDIT EVENT: <span className="text-yellow">{editingEvent.title}</span>
                </h3>
              </div>
              <button onClick={closeEditModal} className="text-cream/60 hover:text-cream transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Google Form Link */}
              <div>
                <label className="font-pixel text-[10px] text-yellow tracking-widest block uppercase mb-2">
                  LINK REGISTRASI (GOOGLE FORM)
                </label>
                <input
                  type="url"
                  value={editGformUrl}
                  onChange={(e) => setEditGformUrl(e.target.value)}
                  placeholder="https://forms.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              {/* UPLOAD GAMBAR MASKOT CARD */}
              <div className="border-t-2 border-ink/40 pt-4">
                <label className="font-pixel text-[10px] text-yellow tracking-widest block uppercase mb-2">
                  GAMBAR MASKOT CARD LOMBA/EVENT
                </label>

                {editMascotUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-navy-900 border border-ink mb-3">
                    <div className="w-12 h-12 relative border border-ink shrink-0 overflow-hidden bg-navy-900 p-0.5">
                      <Image src={withBasePath(editMascotUrl)} alt="Mascot Preview" fill className="object-contain" />
                    </div>
                    <span className="text-xs font-mono text-cream/70 truncate flex-1">{editMascotUrl}</span>
                    <button onClick={() => setEditMascotUrl("")} className="text-pink hover:text-cream transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-navy-900 border border-ink/40 text-xs font-mono text-cream/40 mb-3">
                    Menggunakan gambar maskot bawaan tema.
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input ref={mascotInputRef} type="file" accept="image/*" onChange={handleUploadMascot} className="hidden" />
                  <button
                    onClick={() => mascotInputRef.current?.click()}
                    disabled={uploadingMascot}
                    className="press-btn border-2 border-ink shadow-hard-sm bg-yellow text-ink font-bold text-[10px] px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    {uploadingMascot ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>MENGUPLOAD...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={13} />
                        <span>UPLOAD MASKOT BARU</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-cream/40 font-sans">PNG, SVG, WEBP</span>
                </div>
              </div>

              {/* Guidebook PDF */}
              <div className="border-t-2 border-ink/40 pt-4">
                <label className="font-pixel text-[10px] text-cyan tracking-widest block uppercase mb-2">
                  GUIDEBOOK PDF
                </label>

                {editGuidebookUrl && editGuidebookUrl !== "#" && editGuidebookUrl !== "" ? (
                  <div className="flex items-center gap-3 p-3 bg-cyan/10 border border-cyan/30 mb-3">
                    <FileText size={18} className="text-cyan shrink-0" />
                    <span className="text-xs font-mono text-cyan truncate flex-1">{editGuidebookUrl}</span>
                    <a
                      href={withBasePath(editGuidebookUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-yellow hover:text-pink transition-colors font-mono"
                    >
                      Buka PDF ↗
                    </a>
                    <button onClick={() => setEditGuidebookUrl("")} className="text-pink hover:text-cream transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-navy-900 border border-ink/40 text-xs font-mono text-cream/40 mb-3">
                    Belum ada file guidebook PDF.
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" onChange={handleUploadPdf} className="hidden" />
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="press-btn border-2 border-ink shadow-hard-sm bg-cyan text-ink font-bold text-[10px] px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    {uploadingPdf ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>MENGUPLOAD...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>UPLOAD GUIDEBOOK PDF</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-cream/40 font-sans">Maks. 30MB, PDF</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t-3 border-ink bg-navy-900/50">
              <button
                onClick={closeEditModal}
                className="press-btn border-2 border-ink bg-navy-700 text-cream/70 font-bold text-xs px-4 py-2 hover:bg-navy-600 transition-all cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={saving}
                className="press-btn border-2 border-ink shadow-hard-sm bg-yellow text-ink font-bold text-xs px-5 py-2 flex items-center gap-1.5 hover:bg-yellow-dim transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>MENYIMPAN...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>SIMPAN PERUBAHAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
