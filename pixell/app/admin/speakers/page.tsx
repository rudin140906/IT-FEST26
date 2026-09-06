"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Mic,
  FileText,
  Upload,
  X,
  Save,
  UserCheck,
} from "lucide-react";
import { apiPath, withBasePath } from "@/lib/site-path";
import { Speaker } from "@/types/speaker";

function hasRecentClientAdminSession() {
  return typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "true";
}

export default function AdminSpeakersPage() {
  const router = useRouter();

  // Auth
  const [verifyingAuth, setVerifyingAuth] = useState(true);

  // Data
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCategory, setFormCategory] = useState<"guest-star" | "speaker">("speaker");
  const [formPhoto, setFormPhoto] = useState("");
  const [formCv, setFormCv] = useState("");
  const [formColor, setFormColor] = useState<"pink" | "cyan" | "yellow">("pink");

  // Upload States
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Speaker | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const fetchSpeakers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath("/speakers?t=" + Date.now()));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.speakers)) {
          setSpeakers(data.speakers);
        }
      } else {
        showToast("Gagal mengambil data pemateri", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan koneksi server", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (verifyingAuth) return;
    fetchSpeakers();
  }, [verifyingAuth, fetchSpeakers]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_auth");
      document.cookie = "admin_session=; path=/; max-age=0";
    }
    fetch(apiPath("/admin/logout"), { method: "POST" }).catch(() => {});
    router.replace("/admin");
  }

  function openAddModal() {
    setEditingSpeaker(null);
    setFormName("");
    setFormRole("");
    setFormCategory("speaker");
    setFormPhoto("");
    setFormCv("");
    setFormColor("pink");
    setIsModalOpen(true);
  }

  function openEditModal(speaker: Speaker) {
    setEditingSpeaker(speaker);
    setFormName(speaker.name);
    setFormRole(speaker.role);
    setFormCategory(speaker.category);
    setFormPhoto(speaker.photo || "");
    setFormCv(speaker.cv || "");
    setFormColor(speaker.color);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingSpeaker(null);
  }

  // Upload Photo handler
  async function handleUploadPhoto() {
    const file = photoInputRef.current?.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran foto pemateri maksimal 10MB", "error");
      return;
    }

    setUploadingPhoto(true);
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
        setFormPhoto(data.publicUrl);
        showToast("Foto pemateri berhasil diupload!", "success");
      } else {
        showToast(data.error || "Upload foto gagal", "error");
      }
    } catch {
      showToast("Terjadi masalah saat mengunggah foto", "error");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  // Upload PDF CV handler
  async function handleUploadCv() {
    const file = cvInputRef.current?.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      showToast("Berkas CV harus berupa file PDF (.pdf)", "error");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      showToast("Ukuran berkas CV PDF maksimal 30MB", "error");
      return;
    }

    setUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "guidebook"); // pdf folder

      const res = await fetch(apiPath("/upload"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormCv(data.publicUrl);
        showToast("Berkas CV PDF berhasil diunggah!", "success");
      } else {
        showToast(data.error || "Upload CV gagal", "error");
      }
    } catch {
      showToast("Terjadi masalah saat mengunggah berkas CV", "error");
    } finally {
      setUploadingCv(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  }

  // Save Speaker
  async function handleSaveSpeaker() {
    if (!formName.trim() || !formRole.trim()) {
      showToast("Nama dan Peran/Jabatan pemateri wajib diisi!", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingSpeaker && { id: editingSpeaker.id, action: "update" }),
        name: formName.trim(),
        role: formRole.trim(),
        category: formCategory,
        photo: formPhoto || undefined,
        cv: formCv || undefined,
        color: formColor,
      };

      const res = await fetch(apiPath("/speakers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(
          editingSpeaker
            ? `Pemateri "${formName}" berhasil diperbarui!`
            : `Pemateri "${formName}" berhasil ditambahkan!`,
          "success"
        );
        closeModal();
        fetchSpeakers();
      } else {
        showToast(data.error || "Gagal menyimpan pemateri", "error");
      }
    } catch {
      showToast("Terjadi kesalahan server", "error");
    } finally {
      setSaving(false);
      closeModal();
    }
  }

  // Delete Speaker
  async function handleDeleteSpeaker() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setSpeakers((prev) => prev.filter((s) => s.id !== target.id));
    setDeleting(true);

    try {
      const res = await fetch(apiPath("/speakers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: target.id }),
      });

      if (res.ok) {
        showToast(`Pemateri "${target.name}" berhasil dihapus!`, "success");
      }
      fetchSpeakers();
    } catch {
      fetchSpeakers();
    } finally {
      setDeleting(false);
    }
  }

  if (verifyingAuth) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-cream">
        <RefreshCw size={36} className="animate-spin text-yellow mb-3" />
        <span className="font-pixel text-xs tracking-wider">MEMERIKSA HAK AKSES ADMIN...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-cream font-sans relative overflow-x-hidden selection:bg-pink selection:text-ink pb-20">
      {/* RETRO FLOATING OVERLAY & GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-pink/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />

      {/* ADMIN HEADER */}
      <header className="border-b-3 border-ink bg-navy-800/95 sticky top-0 z-40 backdrop-blur-md shadow-hard">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-navy-700 border-2 border-ink shadow-hard-sm hover:bg-yellow hover:text-ink transition-colors"
              title="Kembali ke Beranda Situs"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 relative shrink-0">
                <Image
                  src={withBasePath("/logos/logo_navbar.png")}
                  alt="Logo"
                  width={36}
                  height={36}
                  style={{ width: "auto", height: "auto" }}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-pixel text-yellow text-xs md:text-sm tracking-wider block">
                  IT-FESTIVAL 2026
                </span>
                <span className="text-[10px] text-pink font-mono uppercase tracking-widest block font-bold">
                  ◆ ADMINISTRATOR DASHBOARD
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
              title="Keluar Sesi Admin"
            >
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
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
          <Link
            href="/admin/events"
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-navy-800 text-cream/70 hover:bg-navy-700"
          >
            <Sparkles size={18} />
            <span>3. KELOLA LINK DAFTAR & MASKOT CARD</span>
          </Link>
          <button
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-pink text-ink font-bold shadow-hard"
          >
            <Mic size={18} />
            <span>4. KELOLA PEMATERI & CV PDF ({speakers.length})</span>
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink/40 pb-6">
          <div>
            <span className="inline-block font-pixel text-[10px] text-pink tracking-widest px-2.5 py-1 bg-pink/15 border border-pink/40 rounded-sm mb-2">
              ◆ SPEAKERS & GUEST STARS CONTROL
            </span>
            <h1 className="font-pixel text-2xl md:text-4xl text-cream tracking-wide drop-shadow-[0_3px_0_rgba(5,7,24,1)]">
              KELOLA <span className="text-pink">PEMATERI</span> & CV PDF
            </h1>
            <p className="text-cream/70 text-xs md:text-sm font-sans mt-2 max-w-2xl font-medium">
              Atur foto, data pembicara/guest star seminar, serta upload file **CV PDF** yang dapat langsung diunduh oleh pengunjung website.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="press-btn border-3 border-ink shadow-hard bg-pink text-ink font-bold text-xs px-5 py-3 flex items-center gap-2 hover:bg-pink/90 transition-all cursor-pointer shrink-0"
          >
            <Plus size={18} />
            <span>TAMBAH PEMATERI BARU</span>
          </button>
        </div>

        {/* SPEAKERS LIST GRID */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-navy-800/40 border-3 border-ink">
            <RefreshCw size={32} className="animate-spin text-pink mx-auto" />
            <p className="font-pixel text-xs text-cream/70">MEMUAT DATA PEMATERI...</p>
          </div>
        ) : speakers.length === 0 ? (
          <div className="bg-navy-800/60 border-3 border-ink p-12 text-center space-y-4">
            <div className="text-4xl">🎙️</div>
            <h3 className="font-pixel text-yellow text-sm">BELUM ADA PEMATERI DITEMUKAN</h3>
            <p className="text-xs text-cream/60 font-sans max-w-md mx-auto">
              Klik tombol &quot;TAMBAH PEMATERI BARU&quot; di atas untuk menambahkan pembicara atau guest star pertama Anda.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((sp) => (
              <div
                key={sp.id}
                className="group border-3 border-ink shadow-hard bg-navy-800 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-hard-lg relative"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-60 border-b-3 border-ink overflow-hidden bg-navy-900 flex items-center justify-center">
                    {sp.photo ? (
                      <Image
                        src={withBasePath(sp.photo)}
                        alt={sp.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: sp.photoPosition || "center" }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-cream/30 space-y-2">
                        <UserCheck size={48} />
                        <span className="font-pixel text-[10px]">TANPA FOTO</span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-yellow text-ink border-2 border-ink shadow-hard-sm font-pixel text-[9px] font-bold px-2.5 py-1 uppercase">
                      {sp.category === "guest-star" ? "GUEST STAR" : "SPEAKER"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-pixel text-base text-cream leading-snug group-hover:text-yellow transition-colors">
                      {sp.name}
                    </h3>
                    <p className="font-mono text-xs text-cyan font-bold">{sp.role}</p>

                    {/* CV PDF Link */}
                    {sp.cv ? (
                      <div className="pt-2">
                        <a
                          href={withBasePath(sp.cv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow hover:text-pink transition-colors font-mono underline"
                        >
                          <FileText size={14} />
                          <span>Lihat File CV (PDF) ↗</span>
                        </a>
                      </div>
                    ) : (
                      <p className="text-[10px] text-cream/40 font-mono italic pt-2">
                        Belum ada file CV PDF
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t-2 border-ink/40 bg-navy-900/40 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(sp)}
                    className="press-btn border-2 border-ink bg-cyan text-ink font-bold text-xs px-3.5 py-1.5 flex items-center gap-1.5 hover:bg-cyan/90 transition-all cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>EDIT</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(sp)}
                    className="press-btn border-2 border-ink bg-pink text-cream font-bold text-xs px-3.5 py-1.5 flex items-center gap-1.5 hover:bg-pink/90 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>HAPUS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-xl overflow-hidden animate-fade-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b-3 border-ink bg-navy-900/60">
              <div className="flex items-center gap-2.5">
                <Mic className="text-pink" size={20} />
                <h3 className="font-pixel text-sm text-cream tracking-wide">
                  {editingSpeaker ? "EDIT PEMATERI & CV" : "TAMBAH PEMATERI BARU"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-cream/60 hover:text-cream transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Nama */}
              <div>
                <label className="font-pixel text-[10px] text-yellow tracking-widest block uppercase mb-1.5">
                  NAMA PEMATERI *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Avip Syaifulloh, S.T."
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              {/* Jabatan / Peran */}
              <div>
                <label className="font-pixel text-[10px] text-cyan tracking-widest block uppercase mb-1.5">
                  JABATAN / PERAN *
                </label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="Contoh: CEO WPU Course / Senior Software Engineer"
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-cyan"
                />
              </div>

              {/* Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-pixel text-[10px] text-pink tracking-widest block uppercase mb-1.5">
                    KATEGORI
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as "guest-star" | "speaker")}
                    className="w-full px-3 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-pink cursor-pointer"
                  >
                    <option value="guest-star">GUEST STAR</option>
                    <option value="speaker">SPEAKER</option>
                  </select>
                </div>

                <div>
                  <label className="font-pixel text-[10px] text-yellow tracking-widest block uppercase mb-1.5">
                    WARNA TEMA CARD
                  </label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value as "pink" | "cyan" | "yellow")}
                    className="w-full px-3 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow cursor-pointer"
                  >
                    <option value="pink">PINK</option>
                    <option value="cyan">CYAN</option>
                    <option value="yellow">YELLOW</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD FOTO PEMATERI */}
              <div>
                <label className="font-pixel text-[10px] text-yellow tracking-widest block uppercase mb-1.5">
                  FOTO PEMATERI
                </label>

                {formPhoto && (
                  <div className="flex items-center gap-3 p-3 bg-navy-900 border border-ink mb-3">
                    <div className="w-12 h-12 relative border border-ink shrink-0 overflow-hidden">
                      <Image
                        src={withBasePath(formPhoto)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-mono text-cream/70 truncate flex-1">{formPhoto}</span>
                    <button
                      onClick={() => setFormPhoto("")}
                      className="text-pink hover:text-cream transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="press-btn border-2 border-ink shadow-hard-sm bg-yellow text-ink font-bold text-[10px] px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    {uploadingPhoto ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>MENGUPLOAD...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>UPLOAD FOTO</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-cream/40 font-sans">PNG, JPG, WEBP, SVG</span>
                </div>
              </div>

              {/* UPLOAD CV PDF */}
              <div className="border-t-2 border-ink/40 pt-4">
                <label className="font-pixel text-[10px] text-cyan tracking-widest block uppercase mb-1.5">
                  FILE CV PEMATERI (FORMAT PDF)
                </label>

                {formCv ? (
                  <div className="flex items-center gap-3 p-3 bg-cyan/10 border border-cyan/30 mb-3">
                    <FileText size={18} className="text-cyan shrink-0" />
                    <span className="text-xs font-mono text-cyan truncate flex-1">{formCv}</span>
                    <a
                      href={withBasePath(formCv)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-yellow hover:text-pink transition-colors font-mono"
                    >
                      Buka PDF ↗
                    </a>
                    <button
                      onClick={() => setFormCv("")}
                      className="text-pink hover:text-cream transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-navy-900 border border-ink/40 text-xs font-mono text-cream/40 mb-3">
                    Belum ada file CV PDF yang diunggah.
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleUploadCv}
                    className="hidden"
                  />
                  <button
                    onClick={() => cvInputRef.current?.click()}
                    disabled={uploadingCv}
                    className="press-btn border-2 border-ink shadow-hard-sm bg-cyan text-ink font-bold text-[10px] px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                  >
                    {uploadingCv ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>MENGUPLOAD...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>UPLOAD CV (PDF)</span>
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
                onClick={closeModal}
                className="press-btn border-2 border-ink bg-navy-700 text-cream/70 font-bold text-xs px-4 py-2 hover:bg-navy-600 transition-all cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={handleSaveSpeaker}
                disabled={saving}
                className="press-btn border-2 border-ink shadow-hard-sm bg-pink text-ink font-bold text-xs px-5 py-2 flex items-center gap-1.5 hover:bg-pink/90 transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>MENYIMPAN...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>SIMPAN PEMATERI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg max-w-md w-full p-6 text-center space-y-4 animate-fade-up">
            <div className="w-12 h-12 bg-pink/20 text-pink border-2 border-ink rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="font-pixel text-sm text-cream">HAPUS PEMATERI?</h3>
            <p className="text-xs text-cream/70 font-sans">
              Apakah Anda yakin ingin menghapus data pemateri <strong className="text-yellow">{deleteTarget.name}</strong>?
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="press-btn border-2 border-ink bg-navy-700 text-cream/70 font-bold text-xs px-4 py-2 hover:bg-navy-600 transition-all cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={handleDeleteSpeaker}
                disabled={deleting}
                className="press-btn border-2 border-ink bg-pink text-cream font-bold text-xs px-5 py-2 flex items-center gap-1.5 hover:bg-pink/90 transition-all cursor-pointer"
              >
                {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>YA, HAPUS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
