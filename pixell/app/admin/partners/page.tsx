"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Calendar,
  Building2,
  Sparkles,
} from "lucide-react";

export interface Partner {
  id: number;
  name: string;
  logoUrl: string;
  type: "sponsor" | "media_partner";
  websiteUrl?: string;
}

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  category?: string;
  badgeColor?: "pink" | "cyan" | "yellow";
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication State
  const [verifyingAuth, setVerifyingAuth] = useState(true);

  // Main Dashboard Tab: "partners" or "timeline"
  const [mainTab, setMainTab] = useState<"partners" | "timeline">("partners");

  // === PARTNERS STATE ===
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sponsorsCount, setSponsorsCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [loadingPartners, setLoadingPartners] = useState(true);

  const [partnerFilterTab, setPartnerFilterTab] = useState<"all" | "sponsor" | "media_partner">("all");
  const [partnerSearch, setPartnerSearch] = useState("");

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState<"sponsor" | "media_partner">("sponsor");
  const [partnerLogoMode, setPartnerLogoMode] = useState<"upload" | "url">("upload");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submittingPartner, setSubmittingPartner] = useState(false);
  const [deletePartnerTarget, setDeletePartnerTarget] = useState<Partner | null>(null);

  // === TIMELINE STATE ===
  const [timelineList, setTimelineList] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [timelineSearch, setTimelineSearch] = useState("");

  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);

  const [timelineTitle, setTimelineTitle] = useState("");
  const [timelineDate, setTimelineDate] = useState("");
  const [timelineCategory, setTimelineCategory] = useState("REGISTRASI");
  const [timelineBadgeColor, setTimelineBadgeColor] = useState<"pink" | "cyan" | "yellow">("pink");
  const [submittingTimeline, setSubmittingTimeline] = useState(false);
  const [deleteTimelineTarget, setDeleteTimelineTarget] = useState<TimelineItem | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Auth Verification
  useEffect(() => {
    async function checkAuth() {
      try {
        const isClientAuthed =
          typeof window !== "undefined" &&
          (sessionStorage.getItem("admin_auth") === "true" ||
            document.cookie.includes("admin_session=authenticated"));

        if (isClientAuthed) {
          setVerifyingAuth(false);
          fetchPartners();
          fetchTimeline();
          return;
        }

        const res = await fetch("/api/admin/check");
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
        fetchPartners();
        fetchTimeline();
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/admin");
      }
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("admin_auth");
        document.cookie = "admin_session=; path=/; max-age=0";
      }
      await fetch("/api/admin/logout", { method: "POST" });
      showToast("Berhasil logout!");
      setTimeout(() => {
        router.replace("/admin");
      }, 300);
    } catch (err) {
      console.error("Logout error:", err);
      router.replace("/admin");
    }
  };

  // === FETCH FUNCTIONS ===
  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const res = await fetch("/api/partners?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setPartners(data.all || []);
        setSponsorsCount(data.sponsors?.length || 0);
        setMediaCount(data.mediaPartners?.length || 0);
      } else {
        showToast("Gagal mengambil data partner", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan koneksi partner", "error");
    } finally {
      setLoadingPartners(false);
    }
  };

  const fetchTimeline = async () => {
    setLoadingTimeline(true);
    try {
      const res = await fetch("/api/timeline?t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setTimelineList(data.timeline || []);
      } else {
        showToast("Gagal mengambil data timeline", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan koneksi timeline", "error");
    } finally {
      setLoadingTimeline(false);
    }
  };

  // === PARTNER ACTIONS ===
  const openAddPartnerModal = () => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerType("sponsor");
    setPartnerLogoMode("upload");
    setPartnerLogoUrl("");
    setPartnerWebsiteUrl("");
    setSelectedFile(null);
    setPreviewUrl("");
    setIsPartnerModalOpen(true);
  };

  const openEditPartnerModal = (item: Partner) => {
    setEditingPartner(item);
    setPartnerName(item.name);
    setPartnerType(item.type);
    setPartnerLogoMode("url");
    setPartnerLogoUrl(item.logoUrl);
    setPartnerWebsiteUrl(item.websiteUrl || "");
    setSelectedFile(null);
    setPreviewUrl(item.logoUrl);
    setIsPartnerModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("File harus berupa gambar (PNG, SVG, JPG, WEBP)", "error");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      showToast("Nama partner wajib diisi!", "error");
      return;
    }

    setSubmittingPartner(true);
    let finalLogoUrl = partnerLogoUrl || previewUrl || "";

    try {
      if (selectedFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        setUploading(false);

        if (!uploadRes.ok || (!uploadJson.url && !uploadJson.apiServedUrl && !uploadJson.publicUrl)) {
          showToast(uploadJson.error || "Gagal mengunggah gambar logo", "error");
          setSubmittingPartner(false);
          return;
        }

        finalLogoUrl = uploadJson.url || uploadJson.apiServedUrl || uploadJson.publicUrl;
      }

      if (!finalLogoUrl.trim()) {
        showToast("Logo URL atau file gambar wajib diisi/diunggah!", "error");
        setSubmittingPartner(false);
        return;
      }

      const payload = {
        name: partnerName.trim(),
        logoUrl: finalLogoUrl.trim(),
        type: partnerType,
        websiteUrl: partnerWebsiteUrl.trim(),
      };

      if (editingPartner) {
        const res = await fetch("/api/partners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPartner.id, ...payload }),
        });

        if (res.ok) {
          showToast(`Berhasil memperbarui "${partnerName}"!`);
          setIsPartnerModalOpen(false);
          fetchPartners();
        } else {
          const errData = await res.json();
          showToast(errData.error || "Gagal mengedit partner", "error");
        }
      } else {
        const res = await fetch("/api/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showToast(`Berhasil menambahkan "${partnerName}"!`);
          setIsPartnerModalOpen(false);
          fetchPartners();
        } else {
          const errData = await res.json();
          showToast(errData.error || "Gagal menambahkan partner", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyimpan data partner", "error");
    } finally {
      setSubmittingPartner(false);
    }
  };

  const handlePartnerDelete = async () => {
    if (!deletePartnerTarget) return;

    try {
      const res = await fetch(`/api/partners?id=${deletePartnerTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`Partner "${deletePartnerTarget.name}" berhasil dihapus.`);
        setDeletePartnerTarget(null);
        fetchPartners();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal menghapus partner", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menghapus data partner", "error");
    }
  };

  // === TIMELINE ACTIONS ===
  const openAddTimelineModal = () => {
    setEditingTimeline(null);
    setTimelineTitle("");
    setTimelineDate("");
    setTimelineCategory("REGISTRASI");
    setTimelineBadgeColor("pink");
    setIsTimelineModalOpen(true);
  };

  const openEditTimelineModal = (item: TimelineItem) => {
    setEditingTimeline(item);
    setTimelineTitle(item.title);
    setTimelineDate(item.date);
    setTimelineCategory(item.category || "AGENDAR");
    setTimelineBadgeColor(item.badgeColor || "pink");
    setIsTimelineModalOpen(true);
  };

  const handleTimelineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineTitle.trim() || !timelineDate.trim()) {
      showToast("Judul dan Tanggal agenda wajib diisi!", "error");
      return;
    }

    setSubmittingTimeline(true);

    try {
      const payload = {
        title: timelineTitle.trim(),
        date: timelineDate.trim(),
        category: timelineCategory.trim(),
        badgeColor: timelineBadgeColor,
      };

      if (editingTimeline) {
        const res = await fetch("/api/timeline", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTimeline.id, ...payload }),
        });

        if (res.ok) {
          showToast("Berhasil memperbarui acara timeline!");
          setIsTimelineModalOpen(false);
          fetchTimeline();
        } else {
          const errData = await res.json();
          showToast(errData.error || "Gagal mengedit acara timeline", "error");
        }
      } else {
        const res = await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showToast("Berhasil menambahkan acara timeline baru!");
          setIsTimelineModalOpen(false);
          fetchTimeline();
        } else {
          const errData = await res.json();
          showToast(errData.error || "Gagal menambahkan acara timeline", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyimpan acara timeline", "error");
    } finally {
      setSubmittingTimeline(false);
    }
  };

  const handleTimelineDelete = async () => {
    if (!deleteTimelineTarget) return;

    try {
      const res = await fetch(`/api/timeline?id=${deleteTimelineTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Acara timeline berhasil dihapus.");
        setDeleteTimelineTarget(null);
        fetchTimeline();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal menghapus acara timeline", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menghapus acara timeline", "error");
    }
  };

  // Filter lists
  const filteredPartners = partners.filter((p) => {
    const matchesTab = partnerFilterTab === "all" || p.type === partnerFilterTab;
    const matchesSearch = p.name.toLowerCase().includes(partnerSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredTimeline = timelineList.filter((item) =>
    item.title.toLowerCase().includes(timelineSearch.toLowerCase()) ||
    item.date.toLowerCase().includes(timelineSearch.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(timelineSearch.toLowerCase()))
  );

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

      {/* Floating Retro Block Ornaments */}
      <div className="absolute top-20 left-6 w-6 h-6 bg-pink border-2 border-ink rotate-12 animate-float hidden md:block" />
      <div className="absolute top-1/3 right-8 w-7 h-7 bg-cyan border-2 border-ink -rotate-12 animate-float hidden md:block" style={{ animationDelay: "1.2s" }} />

      {/* INDEPENDENT ADMIN HEADER (No Public Site Navbar/Footer) */}
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
                <Image src="/logos/logo_navbar.png" alt="Logo" width={36} height={36} className="object-contain" />
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
        {/* MAIN DASHBOARD SWITCHER TABS */}
        <div className="flex items-center gap-3 border-b-3 border-ink pb-4">
          <button
            onClick={() => setMainTab("partners")}
            className={`px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              mainTab === "partners"
                ? "bg-yellow text-ink font-bold shadow-hard"
                : "bg-navy-800 text-cream/70 hover:bg-navy-700"
            }`}
          >
            <Building2 size={18} />
            <span>1. SPONSOR & MEDIA PARTNER</span>
          </button>
          <button
            onClick={() => setMainTab("timeline")}
            className={`px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              mainTab === "timeline"
                ? "bg-pink text-ink font-bold shadow-hard"
                : "bg-navy-800 text-cream/70 hover:bg-navy-700"
            }`}
          >
            <Calendar size={18} />
            <span>2. TIMELINE AGENDA ACARA ({timelineList.length})</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SPONSOR & MEDIA PARTNERS MANAGEMENT */}
        {/* ========================================================= */}
        {mainTab === "partners" && (
          <div className="space-y-8 animate-fade-up">
            {/* Header & Add Button */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink/40 pb-6">
              <div>
                <span className="font-pixel text-[10px] text-pink tracking-widest uppercase block mb-1">
                  ◆ SPONSORS & MEDIA CONTROL
                </span>
                <h1 className="font-pixel text-cream text-2xl md:text-4xl tracking-wide drop-shadow-[0_2px_0_rgba(5,7,20,1)]">
                  KELOLA SPONSOR & MEDIA
                </h1>
                <p className="text-cream/70 text-sm mt-1 max-w-xl font-sans">
                  Tambah dan edit logo sponsor serta media partner. Foto yang diunggah langsung tampil di marquee beranda secara otomatis.
                </p>
              </div>
              <button
                onClick={openAddPartnerModal}
                className="press-btn border-3 border-ink shadow-hard bg-yellow text-ink font-pixel text-xs md:text-sm px-5 py-3.5 flex items-center gap-2 hover:bg-yellow-dim transition-all uppercase tracking-wider font-extrabold cursor-pointer"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Tambah Partner Baru</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-navy-800 border-3 border-ink shadow-hard p-5">
                <span className="font-pixel text-[10px] text-cream/60 tracking-wider block uppercase mb-1">
                  TOTAL PARTNERS
                </span>
                <div className="font-pixel text-yellow text-3xl font-bold">{partners.length}</div>
              </div>
              <div className="bg-navy-800 border-3 border-ink shadow-hard p-5">
                <span className="font-pixel text-[10px] text-pink tracking-wider block uppercase mb-1">
                  SPONSORS
                </span>
                <div className="font-pixel text-pink text-3xl font-bold">{sponsorsCount}</div>
              </div>
              <div className="bg-navy-800 border-3 border-ink shadow-hard p-5">
                <span className="font-pixel text-[10px] text-cyan tracking-wider block uppercase mb-1">
                  MEDIA PARTNERS
                </span>
                <div className="font-pixel text-cyan text-3xl font-bold">{mediaCount}</div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-navy-800/80 border-3 border-ink shadow-hard p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setPartnerFilterTab("all")}
                  className={`px-4 py-2 text-xs font-pixel tracking-wider border-2 border-ink transition-all cursor-pointer ${
                    partnerFilterTab === "all" ? "bg-yellow text-ink font-bold" : "bg-navy-700 text-cream/80"
                  }`}
                >
                  SEMUA ({partners.length})
                </button>
                <button
                  onClick={() => setPartnerFilterTab("sponsor")}
                  className={`px-4 py-2 text-xs font-pixel tracking-wider border-2 border-ink transition-all cursor-pointer ${
                    partnerFilterTab === "sponsor" ? "bg-pink text-ink font-bold" : "bg-navy-700 text-cream/80"
                  }`}
                >
                  SPONSORS ({sponsorsCount})
                </button>
                <button
                  onClick={() => setPartnerFilterTab("media_partner")}
                  className={`px-4 py-2 text-xs font-pixel tracking-wider border-2 border-ink transition-all cursor-pointer ${
                    partnerFilterTab === "media_partner" ? "bg-cyan text-ink font-bold" : "bg-navy-700 text-cream/80"
                  }`}
                >
                  MEDIA PARTNERS ({mediaCount})
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" size={16} />
                  <input
                    type="text"
                    placeholder="Cari nama partner..."
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                  />
                </div>
                <button
                  onClick={fetchPartners}
                  className="p-2.5 bg-navy-700 border-2 border-ink hover:bg-yellow hover:text-ink transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw size={16} className={loadingPartners ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Partners Cards Grid */}
            {loadingPartners ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw size={36} className="animate-spin text-yellow mx-auto" />
                <p className="font-pixel text-xs text-cream/70">MEMUAT DATA PARTNER...</p>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="bg-navy-800/60 border-3 border-ink p-12 text-center space-y-4">
                <div className="text-4xl">🔍</div>
                <h3 className="font-pixel text-yellow text-sm">TIDAK ADA PARTNER DITEMUKAN</h3>
                <button
                  onClick={openAddPartnerModal}
                  className="press-btn border-2 border-ink shadow-hard-sm bg-pink text-ink font-bold text-xs px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Tambah Partner Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPartners.map((item) => (
                  <div
                    key={item.id}
                    className="bg-navy-800 border-3 border-ink shadow-hard p-4 flex flex-col justify-between relative group hover:border-yellow transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[9px] font-pixel px-2 py-0.5 border border-ink font-bold tracking-wider ${
                            item.type === "sponsor" ? "bg-pink text-ink" : "bg-cyan text-ink"
                          }`}
                        >
                          {item.type === "sponsor" ? "SPONSOR" : "MEDIA PARTNER"}
                        </span>
                        <span className="text-[10px] font-mono text-cream/40">#{item.id}</span>
                      </div>

                      {/* Logo Display Box */}
                      <div className="w-full h-24 bg-navy-900 border-2 border-ink/80 p-3 flex items-center justify-center relative overflow-hidden mb-3 group-hover:bg-navy-900/80 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.logoUrl}
                          alt={item.name}
                          className="max-h-16 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/logos/logo_navbar.png";
                          }}
                        />
                      </div>

                      <h3 className="font-pixel text-cream text-xs md:text-sm tracking-wide line-clamp-1 mb-1" title={item.name}>
                        {item.name}
                      </h3>

                      {item.websiteUrl ? (
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-cyan hover:underline inline-flex items-center gap-1 line-clamp-1"
                        >
                          <span>{item.websiteUrl.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-cream/40 block">Tanpa link</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 mt-3 border-t border-ink/40">
                      <button
                        onClick={() => openEditPartnerModal(item)}
                        className="flex-1 py-1.5 px-2 bg-navy-700 border-2 border-ink hover:bg-yellow hover:text-ink text-cream text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletePartnerTarget(item)}
                        className="py-1.5 px-2.5 bg-pink/20 border-2 border-ink hover:bg-pink hover:text-ink text-pink text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Hapus Partner"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DYNAMIC TIMELINE / AGENDA MANAGEMENT */}
        {/* ========================================================= */}
        {mainTab === "timeline" && (
          <div className="space-y-8 animate-fade-up">
            {/* Header & Add Button */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink/40 pb-6">
              <div>
                <span className="font-pixel text-[10px] text-cyan tracking-widest uppercase block mb-1">
                  ◆ AGENDA & EVENT SCHEDULER
                </span>
                <h1 className="font-pixel text-cream text-2xl md:text-4xl tracking-wide drop-shadow-[0_2px_0_rgba(5,7,20,1)]">
                  KELOLA TIMELINE ACARA
                </h1>
                <p className="text-cream/70 text-sm mt-1 max-w-xl font-sans">
                  Tambah dan edit agenda acara secara bebas tanpa batas (bisa lebih dari 9 acara). Cukup ketik dan simpan, otomatis tampil di website utama.
                </p>
              </div>
              <button
                onClick={openAddTimelineModal}
                className="press-btn border-3 border-ink shadow-hard bg-pink text-cream font-pixel text-xs md:text-sm px-5 py-3.5 flex items-center gap-2 hover:bg-pink/90 transition-all uppercase tracking-wider font-extrabold cursor-pointer"
              >
                <Plus size={18} strokeWidth={3} />
                <span>Tambah Acara Baru</span>
              </button>
            </div>

            {/* Search Toolbar */}
            <div className="bg-navy-800/80 border-3 border-ink shadow-hard p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-cream/80 font-bold">
                TOTAL AGENDA ACARA: <span className="text-yellow">{timelineList.length} ACARA</span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" size={16} />
                  <input
                    type="text"
                    placeholder="Cari judul / tanggal acara..."
                    value={timelineSearch}
                    onChange={(e) => setTimelineSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                  />
                </div>
                <button
                  onClick={fetchTimeline}
                  className="p-2.5 bg-navy-700 border-2 border-ink hover:bg-yellow hover:text-ink transition-colors cursor-pointer"
                  title="Refresh Timeline"
                >
                  <RefreshCw size={16} className={loadingTimeline ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Timeline List Items */}
            {loadingTimeline ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw size={36} className="animate-spin text-yellow mx-auto" />
                <p className="font-pixel text-xs text-cream/70">MEMUAT TIMELINE ACARA...</p>
              </div>
            ) : filteredTimeline.length === 0 ? (
              <div className="bg-navy-800/60 border-3 border-ink p-12 text-center space-y-4">
                <div className="text-4xl">📅</div>
                <h3 className="font-pixel text-yellow text-sm">BELUM ADA ACARA TIMELINE</h3>
                <button
                  onClick={openAddTimelineModal}
                  className="press-btn border-2 border-ink shadow-hard-sm bg-pink text-cream font-bold text-xs px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Tambah Acara Baru
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTimeline.map((item, index) => {
                  const badgeBg =
                    item.badgeColor === "cyan"
                      ? "bg-cyan text-ink"
                      : item.badgeColor === "yellow"
                      ? "bg-yellow text-ink"
                      : "bg-pink text-ink";

                  return (
                    <div
                      key={item.id}
                      className="bg-navy-800 border-3 border-ink shadow-hard p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-yellow transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 shrink-0 border-2 border-ink shadow-hard-sm ${badgeBg} font-pixel text-xs font-bold flex items-center justify-center rounded-full mt-0.5`}
                        >
                          {index + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-pixel px-2 py-0.5 border border-ink uppercase font-bold ${badgeBg}`}
                            >
                              {item.category || "AGENDAR"}
                            </span>
                            <span className="text-[10px] font-mono text-cream/40">ID #{item.id}</span>
                          </div>

                          <h3 className="font-pixel text-cream text-xs md:text-sm group-hover:text-yellow transition-colors leading-relaxed">
                            {item.title}
                          </h3>

                          <div className="text-xs font-mono text-cream/70 flex items-center gap-1.5 pt-1">
                            <span className="text-pink">🗓</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0">
                        <button
                          onClick={() => openEditTimelineModal(item)}
                          className="py-1.5 px-3 bg-navy-700 border-2 border-ink hover:bg-yellow hover:text-ink text-cream text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTimelineTarget(item)}
                          className="py-1.5 px-3 bg-pink/20 border-2 border-ink hover:bg-pink hover:text-ink text-pink text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL PARTNER (ADD / EDIT) */}
      {/* ========================================================= */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-up">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-lg p-6 relative">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-pink border-2 border-ink rotate-12" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow border-2 border-ink -rotate-12" />

            <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-5">
              <div>
                <span className="font-pixel text-[10px] text-pink tracking-widest uppercase block mb-0.5">
                  ◆ {editingPartner ? "PERBAARUI PARTNER" : "TAMBAH PARTNER BARU"}
                </span>
                <h2 className="font-pixel text-cream text-lg md:text-xl">
                  {editingPartner ? `EDIT: ${editingPartner.name}` : "FORM PARTNER BARU"}
                </h2>
              </div>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="w-8 h-8 bg-navy-700 border-2 border-ink text-cream font-mono font-bold hover:bg-pink hover:text-ink transition-colors flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-4">
              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                  Tipe Partner <span className="text-pink">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPartnerType("sponsor")}
                    className={`py-2.5 px-3 border-2 border-ink font-pixel text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      partnerType === "sponsor" ? "bg-pink text-ink font-bold shadow-hard-sm" : "bg-navy-700 text-cream/70"
                    }`}
                  >
                    <span>SPONSOR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerType("media_partner")}
                    className={`py-2.5 px-3 border-2 border-ink font-pixel text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      partnerType === "media_partner" ? "bg-cyan text-ink font-bold shadow-hard-sm" : "bg-navy-700 text-cream/70"
                    }`}
                  >
                    <span>MEDIA PARTNER</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                  Nama Partner / Instansi <span className="text-pink">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank BRI / HIMA IF"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-pixel text-[10px] text-cream/80 uppercase">
                    Logo Gambar <span className="text-pink">*</span>
                  </label>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <label className="flex items-center gap-1.5 cursor-pointer text-cream/80">
                      <input
                        type="radio"
                        name="logoMode"
                        checked={partnerLogoMode === "upload"}
                        onChange={() => setPartnerLogoMode("upload")}
                        className="accent-yellow"
                      />
                      <span>Upload File</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-cream/80">
                      <input
                        type="radio"
                        name="logoMode"
                        checked={partnerLogoMode === "url"}
                        onChange={() => setPartnerLogoMode("url")}
                        className="accent-yellow"
                      />
                      <span>URL Gambar</span>
                    </label>
                  </div>
                </div>

                {partnerLogoMode === "upload" ? (
                  <div className="border-2 border-dashed border-ink/80 bg-navy-900 p-4 text-center hover:border-yellow transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      id="logoFileInput"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="logoFileInput" className="cursor-pointer block space-y-2">
                      <Upload className="mx-auto text-yellow" size={24} />
                      <div className="text-xs font-mono text-cream/80">
                        {selectedFile ? (
                          <span className="text-yellow font-bold">{selectedFile.name}</span>
                        ) : (
                          "Klik di sini untuk memilih file logo (PNG, SVG, JPG, WEBP)"
                        )}
                      </div>
                      <span className="text-[10px] text-cream/50 block">Maksimal 5MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" size={16} />
                    <input
                      type="text"
                      placeholder="https://... atau /logos/sponsors/nama.svg"
                      value={partnerLogoUrl}
                      onChange={(e) => {
                        setPartnerLogoUrl(e.target.value);
                        setPreviewUrl(e.target.value);
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                    />
                  </div>
                )}
              </div>

              {previewUrl && (
                <div>
                  <span className="text-[10px] font-mono text-cream/60 block mb-1">PREVIEW LOGO:</span>
                  <div className="w-full h-24 bg-navy-900 border-2 border-ink/80 p-2 flex items-center justify-center relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-20 max-w-full object-contain"
                      onError={() => showToast("Gagal memuat preview gambar", "error")}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                  Website URL (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={partnerWebsiteUrl}
                  onChange={(e) => setPartnerWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-ink">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 bg-navy-700 border-2 border-ink text-cream text-xs font-pixel tracking-wider hover:bg-navy-700/80 transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={submittingPartner || uploading}
                  className="press-btn px-5 py-2 bg-yellow text-ink border-2 border-ink shadow-hard-sm text-xs font-pixel tracking-wider font-bold hover:bg-yellow-dim transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {(submittingPartner || uploading) && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingPartner ? "SIMPAN PERUBAHAN" : "TAMBAHKAN PARTNER"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PARTNER CONFIRMATION MODAL */}
      {deletePartnerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-up">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-md p-6 text-center space-y-4 relative">
            <div className="w-12 h-12 bg-pink/20 border-2 border-pink text-pink rounded-full flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h3 className="font-pixel text-cream text-base">KONFIRMASI HAPUS PARTNER</h3>
            <p className="text-xs font-sans text-cream/80">
              Apakah kamu yakin ingin menghapus partner <strong className="text-yellow">{deletePartnerTarget.name}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletePartnerTarget(null)}
                className="px-4 py-2 bg-navy-700 border-2 border-ink text-cream text-xs font-pixel tracking-wider hover:bg-navy-700/80 transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={handlePartnerDelete}
                className="press-btn px-5 py-2 bg-pink text-cream border-2 border-ink shadow-hard-sm text-xs font-pixel tracking-wider font-bold hover:bg-pink/90 transition-all cursor-pointer"
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL TIMELINE (ADD / EDIT) */}
      {/* ========================================================= */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-up">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-lg p-6 relative">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-cyan border-2 border-ink rotate-12" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-pink border-2 border-ink -rotate-12" />

            <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-5">
              <div>
                <span className="font-pixel text-[10px] text-cyan tracking-widest uppercase block mb-0.5">
                  ◆ {editingTimeline ? "PERBAARUI AGENDA ACARA" : "TAMBAH AGENDA ACARA BARU"}
                </span>
                <h2 className="font-pixel text-cream text-lg md:text-xl">
                  {editingTimeline ? `EDIT AGENDA #${editingTimeline.id}` : "FORM AGENDA TIMELINE"}
                </h2>
              </div>
              <button
                onClick={() => setIsTimelineModalOpen(false)}
                className="w-8 h-8 bg-navy-700 border-2 border-ink text-cream font-mono font-bold hover:bg-pink hover:text-ink transition-colors flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTimelineSubmit} className="space-y-4">
              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                  Judul Acara / Agenda <span className="text-pink">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: OPEN REGISTRATION SEMINAR & PERLOMBAAN"
                  value={timelineTitle}
                  onChange={(e) => setTimelineTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                  Waktu / Tanggal Pelaksanaan <span className="text-pink">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selasa, 16 Agustus 2026 atau 16 - 20 Agustus 2026"
                  value={timelineDate}
                  onChange={(e) => setTimelineDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                    Label Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="REGISTRASI / DEADLINE / PENGUMUMAN"
                    value={timelineCategory}
                    onChange={(e) => setTimelineCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                  />
                </div>

                <div>
                  <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1">
                    Warna Badge
                  </label>
                  <select
                    value={timelineBadgeColor}
                    onChange={(e) => setTimelineBadgeColor(e.target.value as "pink" | "cyan" | "yellow")}
                    className="w-full px-3 py-2 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                  >
                    <option value="pink">Pink Accent</option>
                    <option value="cyan">Cyan Accent</option>
                    <option value="yellow">Yellow Accent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-ink">
                <button
                  type="button"
                  onClick={() => setIsTimelineModalOpen(false)}
                  className="px-4 py-2 bg-navy-700 border-2 border-ink text-cream text-xs font-pixel tracking-wider hover:bg-navy-700/80 transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={submittingTimeline}
                  className="press-btn px-5 py-2 bg-pink text-cream border-2 border-ink shadow-hard-sm text-xs font-pixel tracking-wider font-bold hover:bg-pink/90 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submittingTimeline && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingTimeline ? "SIMPAN PERUBAHAN" : "TAMBAHKAN AGENDA"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TIMELINE CONFIRMATION MODAL */}
      {deleteTimelineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-up">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-md p-6 text-center space-y-4 relative">
            <div className="w-12 h-12 bg-pink/20 border-2 border-pink text-pink rounded-full flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h3 className="font-pixel text-cream text-base">KONFIRMASI HAPUS AGENDA</h3>
            <p className="text-xs font-sans text-cream/80">
              Apakah kamu yakin ingin menghapus acara <strong className="text-yellow">{deleteTimelineTarget.title}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTimelineTarget(null)}
                className="px-4 py-2 bg-navy-700 border-2 border-ink text-cream text-xs font-pixel tracking-wider hover:bg-navy-700/80 transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={handleTimelineDelete}
                className="press-btn px-5 py-2 bg-pink text-cream border-2 border-ink shadow-hard-sm text-xs font-pixel tracking-wider font-bold hover:bg-pink/90 transition-all cursor-pointer"
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
