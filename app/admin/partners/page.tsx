"use client";

import { useEffect, useState, useCallback } from "react";
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
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiPath, withBasePath } from "@/lib/site-path";

// Types & Interfaces
interface PartnerItem {
  id: number;
  name: string;
  logoUrl: string;
  type: "sponsor" | "media_partner";
  websiteUrl?: string;
  isVisible?: boolean;
  logoScale?: number;
  logoPositionX?: number;
  logoPositionY?: number;
}

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  category?: string;
  badgeColor?: "pink" | "cyan" | "yellow";
  imageUrl?: string;
}

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

// Helpers
function normalizePartnerWebsiteUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatPartnerWebsiteLabel(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function isManagedUploadUrl(url: string): boolean {
  return url.includes("/uploads/") || url.includes("/api/uploads/");
}

function clampLogoControl(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function partnerLogoStyle(item: Pick<PartnerItem, "logoScale" | "logoPositionX" | "logoPositionY">) {
  const scale = clampLogoControl(item.logoScale, 100, 55, 180);
  const x = clampLogoControl(item.logoPositionX, 50, 0, 100);
  const y = clampLogoControl(item.logoPositionY, 50, 0, 100);

  return {
    width: `${scale}%`,
    height: `${scale}%`,
    objectPosition: `${x}% ${y}%`,
  };
}

function hasRecentClientAdminSession() {
  return typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "true";
}

export default function AdminPartnersPage() {
  const router = useRouter();

  // Auth state
  const [verifyingAuth, setVerifyingAuth] = useState(true);

  // Active Main Tab ("partners" or "timeline")
  const [mainTab, setMainTab] = useState<"partners" | "timeline">("partners");

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

  // === PARTNERS DATA & STATES ===
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [partnerFilterTab, setPartnerFilterTab] = useState<"all" | "sponsor" | "media_partner">("all");
  const [partnerSearch, setPartnerSearch] = useState("");

  // Partner Modal States
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState<"sponsor" | "media_partner">("sponsor");
  const [partnerLogoMode, setPartnerLogoMode] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState("");
  const [partnerLogoScale, setPartnerLogoScale] = useState(100);
  const [partnerLogoPositionX, setPartnerLogoPositionX] = useState(50);
  const [partnerLogoPositionY, setPartnerLogoPositionY] = useState(50);
  const [submittingPartner, setSubmittingPartner] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Partner Delete Modal
  const [deletePartnerTarget, setDeletePartnerTarget] = useState<PartnerItem | null>(null);

  // === TIMELINE DATA & STATES ===
  const [timelineList, setTimelineList] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [timelineSearch, setTimelineSearch] = useState("");

  // Timeline Modal States
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);
  const [timelineTitle, setTimelineTitle] = useState("");
  const [timelineDate, setTimelineDate] = useState("");
  const [timelineCategory, setTimelineCategory] = useState("REGISTRASI");
  const [timelineBadgeColor, setTimelineBadgeColor] = useState<"pink" | "cyan" | "yellow">("pink");
  const [timelineImageUrl, setTimelineImageUrl] = useState("");
  const [timelineFile, setTimelineFile] = useState<File | null>(null);
  const [submittingTimeline, setSubmittingTimeline] = useState(false);
  const [uploadingTimelineFile, setUploadingTimelineFile] = useState(false);

  // Timeline Delete Modal
  const [deleteTimelineTarget, setDeleteTimelineTarget] = useState<TimelineItem | null>(null);

  // Fetch Partners
  const fetchPartners = useCallback(async () => {
    setLoadingPartners(true);
    try {
      const res = await fetch(apiPath("/partners?includeHidden=true&t=" + Date.now()));
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPartners(data);
        } else if (data && Array.isArray(data.all)) {
          setPartners(data.all);
        } else {
          setPartners([]);
        }
      } else {
        setPartners([]);
        showToast("Gagal memuat data partner", "error");
      }
    } catch (err) {
      console.error("Failed to fetch partners:", err);
      setPartners([]);
      showToast("Terjadi kesalahan koneksi server", "error");
    } finally {
      setLoadingPartners(false);
    }
  }, [showToast]);

  // Fetch Timeline
  const fetchTimeline = useCallback(async () => {
    setLoadingTimeline(true);
    try {
      const res = await fetch(apiPath("/timeline?t=" + Date.now()));
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTimelineList(data);
        } else if (data && Array.isArray(data.timeline)) {
          setTimelineList(data.timeline);
        } else {
          setTimelineList([]);
        }
      } else {
        setTimelineList([]);
        showToast("Gagal memuat data timeline", "error");
      }
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
      setTimelineList([]);
      showToast("Terjadi kesalahan koneksi server", "error");
    } finally {
      setLoadingTimeline(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (verifyingAuth) return;
    fetchPartners();
    fetchTimeline();
  }, [verifyingAuth, fetchPartners, fetchTimeline]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_auth");
      document.cookie = "admin_session=; path=/; max-age=0";
    }
    fetch(apiPath("/admin/logout"), { method: "POST" }).catch(() => {});
    router.replace("/admin");
  }

  // === PARTNER ACTIONS ===
  const openAddPartnerModal = (defaultType: "sponsor" | "media_partner" = "sponsor") => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerType(defaultType);
    setPartnerLogoMode("upload");
    setSelectedFile(null);
    setPartnerLogoUrl("");
    setPreviewUrl("");
    setPartnerWebsiteUrl("");
    setPartnerLogoScale(100);
    setPartnerLogoPositionX(50);
    setPartnerLogoPositionY(50);
    setIsPartnerModalOpen(true);
  };

  const openEditPartnerModal = (item: PartnerItem) => {
    setEditingPartner(item);
    setPartnerName(item.name);
    setPartnerType(item.type);
    setPartnerLogoMode(isManagedUploadUrl(item.logoUrl) ? "upload" : "url");
    setSelectedFile(null);
    setPartnerLogoUrl(item.logoUrl);
    setPreviewUrl(withBasePath(item.logoUrl));
    setPartnerWebsiteUrl(item.websiteUrl || "");
    setPartnerLogoScale(clampLogoControl(item.logoScale, 100, 55, 180));
    setPartnerLogoPositionX(clampLogoControl(item.logoPositionX, 50, 0, 100));
    setPartnerLogoPositionY(clampLogoControl(item.logoPositionY, 50, 0, 100));
    setIsPartnerModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_UPLOAD_SIZE) {
        e.target.value = "";
        setSelectedFile(null);
        setPreviewUrl(editingPartner ? withBasePath(editingPartner.logoUrl) : "");
        showToast("Ukuran file maksimal 10 MB", "error");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      showToast("Nama partner wajib diisi!", "error");
      return;
    }

    setSubmittingPartner(true);

    try {
      let finalLogoUrl = partnerLogoUrl;

      if (partnerLogoMode === "upload" && selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", "image");

        const uploadRes = await fetch(apiPath("/upload"), {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          finalLogoUrl = uploadData.apiServedUrl || uploadData.publicUrl;
        } else {
          showToast(uploadData.error || "Gagal mengunggah file logo", "error");
          setSubmittingPartner(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      if (!finalLogoUrl.trim()) {
        showToast("Logo partner wajib diunggah atau diisi URL-nya!", "error");
        setSubmittingPartner(false);
        return;
      }

      const payload = {
        name: partnerName.trim(),
        logoUrl: finalLogoUrl.trim(),
        type: partnerType,
        websiteUrl: partnerWebsiteUrl.trim(),
        isVisible: editingPartner ? editingPartner.isVisible ?? true : true,
        logoScale: partnerLogoScale,
        logoPositionX: partnerLogoPositionX,
        logoPositionY: partnerLogoPositionY,
      };

      if (editingPartner) {
        const res = await fetch(apiPath("/partners"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", id: editingPartner.id, previousType: editingPartner.type, ...payload }),
        });

        if (res.ok) {
          showToast(`Berhasil memperbarui ${partnerType === "sponsor" ? "Sponsor" : "Media Partner"} "${partnerName}"!`);
          setIsPartnerModalOpen(false);
          fetchPartners();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || "Gagal mengedit data partner", "error");
        }
      } else {
        const res = await fetch(apiPath("/partners"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showToast(`Berhasil menambahkan ${partnerType === "sponsor" ? "Sponsor" : "Media Partner"} "${partnerName}"!`);
          setIsPartnerModalOpen(false);
          fetchPartners();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || "Gagal menambahkan data partner", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyimpan data partner", "error");
    } finally {
      setSubmittingPartner(false);
    }
  };

  const handlePartnerVisibilityToggle = async (item: PartnerItem) => {
    const nextVisibility = !(item.isVisible ?? true);

    setPartners((prev) =>
      prev.map((p) =>
        p.id === item.id && p.type === item.type
          ? { ...p, isVisible: nextVisibility }
          : p
      )
    );

    try {
      const res = await fetch(apiPath("/partners"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: item.id,
          type: item.type,
          name: item.name,
          logoUrl: item.logoUrl,
          websiteUrl: item.websiteUrl,
          isVisible: nextVisibility,
          logoScale: item.logoScale ?? 100,
          logoPositionX: item.logoPositionX ?? 50,
          logoPositionY: item.logoPositionY ?? 50,
        }),
      });

      if (res.ok) {
        showToast(
          `${item.type === "sponsor" ? "Sponsor" : "Media Partner"} "${item.name}" sekarang ${
            nextVisibility ? "TAMPIL DI BERANDA HOME" : "DISEMBUNYIKAN DARI BERANDA HOME"
          }.`
        );
      } else {
        // Revert optimistic update on failure
        setPartners((prev) =>
          prev.map((p) =>
            p.id === item.id && p.type === item.type
              ? { ...p, isVisible: !nextVisibility }
              : p
          )
        );
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "Gagal memperbarui visibilitas partner", "error");
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on error
      setPartners((prev) =>
        prev.map((p) =>
          p.id === item.id && p.type === item.type
            ? { ...p, isVisible: !nextVisibility }
            : p
        )
      );
      showToast("Terjadi kesalahan saat memperbarui visibilitas partner", "error");
    }
  };

  const handlePartnerDelete = async () => {
    if (!deletePartnerTarget) return;

    const target = deletePartnerTarget;
    setDeletePartnerTarget(null);

    setPartners((prev) => prev.filter((p) => !(p.id === target.id && p.type === target.type)));

    try {
      const res = await fetch(apiPath("/partners"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: target.id, type: target.type, name: target.name }),
      });

      if (res.ok) {
        showToast(`${target.type === "sponsor" ? "Sponsor" : "Media Partner"} "${target.name}" berhasil dihapus.`);
      }
      fetchPartners();
    } catch (err) {
      console.error(err);
      fetchPartners();
    }
  };

  // === TIMELINE ACTIONS ===
  const openAddTimelineModal = () => {
    setEditingTimeline(null);
    setTimelineTitle("");
    setTimelineDate("");
    setTimelineCategory("REGISTRASI");
    setTimelineBadgeColor("pink");
    setTimelineImageUrl("");
    setTimelineFile(null);
    setIsTimelineModalOpen(true);
  };

  const openEditTimelineModal = (item: TimelineItem) => {
    setEditingTimeline(item);
    setTimelineTitle(item.title);
    setTimelineDate(item.date);
    setTimelineCategory(item.category || "AGENDAR");
    setTimelineBadgeColor(item.badgeColor || "pink");
    setTimelineImageUrl(item.imageUrl || "");
    setTimelineFile(null);
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
      let finalImageUrl = timelineImageUrl;
      if (timelineFile) {
        setUploadingTimelineFile(true);
        const formData = new FormData();
        formData.append("file", timelineFile);
        formData.append("type", "image");

        const uploadRes = await fetch(apiPath("/upload"), {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          finalImageUrl = uploadData.apiServedUrl || uploadData.publicUrl;
        } else {
          showToast(uploadData.error || "Gagal mengunggah gambar agenda", "error");
          setSubmittingTimeline(false);
          setUploadingTimelineFile(false);
          return;
        }
        setUploadingTimelineFile(false);
      }

      const payload = {
        title: timelineTitle.trim(),
        date: timelineDate.trim(),
        category: timelineCategory.trim(),
        badgeColor: timelineBadgeColor,
        imageUrl: finalImageUrl,
      };

      if (editingTimeline) {
        const res = await fetch(apiPath("/timeline"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTimeline.id, action: "update", ...payload }),
        });

        if (res.ok) {
          showToast("Berhasil memperbarui acara timeline!");
          setIsTimelineModalOpen(false);
          fetchTimeline();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || "Gagal mengedit acara timeline", "error");
        }
      } else {
        const res = await fetch(apiPath("/timeline"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showToast("Berhasil menambahkan acara timeline baru!");
          setIsTimelineModalOpen(false);
          fetchTimeline();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(errData.error || "Gagal menambahkan acara timeline", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyimpan acara timeline", "error");
    } finally {
      setSubmittingTimeline(false);
      setIsTimelineModalOpen(false);
    }
  };

  const handleTimelineDelete = async () => {
    if (!deleteTimelineTarget) return;

    const target = deleteTimelineTarget;
    setDeleteTimelineTarget(null);
    setTimelineList((prev) => prev.filter((t) => t.id !== target.id));

    try {
      const res = await fetch(apiPath("/timeline"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: target.id, title: target.title }),
      });

      if (res.ok) {
        showToast("Acara timeline berhasil dihapus.");
      }
      fetchTimeline();
    } catch (err) {
      console.error(err);
      fetchTimeline();
    }
  };

  // Filter lists
  const safePartners = Array.isArray(partners) ? partners : [];
  const safeTimeline = Array.isArray(timelineList) ? timelineList : [];

  const filteredPartners = safePartners.filter((p) => {
    const matchesTab = partnerFilterTab === "all" || p.type === partnerFilterTab;
    const matchesSearch = p.name.toLowerCase().includes(partnerSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredTimeline = safeTimeline.filter((item) =>
    item.title.toLowerCase().includes(timelineSearch.toLowerCase()) ||
    item.date.toLowerCase().includes(timelineSearch.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(timelineSearch.toLowerCase()))
  );

  const sponsorsCount = safePartners.filter((p) => p.type === "sponsor").length;
  const mediaCount = safePartners.filter((p) => p.type === "media_partner").length;

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
      {/* RETRO OVERLAY & GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-pink/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse" />

      {/* Floating Retro Block Ornaments */}
      <div className="absolute top-20 left-6 w-6 h-6 bg-pink border-2 border-ink rotate-12 animate-float hidden md:block" />
      <div className="absolute top-1/3 right-8 w-7 h-7 bg-cyan border-2 border-ink -rotate-12 animate-float hidden md:block" style={{ animationDelay: "1.2s" }} />

      {/* INDEPENDENT ADMIN HEADER */}
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
                <Image src={withBasePath("/logos/logo_navbar.png")} alt="Logo" width={36} height={36} style={{ width: "auto", height: "auto" }} className="object-contain" />
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
        <div className="flex flex-wrap items-center gap-3 border-b-3 border-ink pb-4">
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
            <span>2. TIMELINE AGENDA ({safeTimeline.length})</span>
          </button>
          <Link
            href="/admin/events"
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-navy-800 text-cream/70 hover:bg-navy-700"
          >
            <Sparkles size={18} />
            <span>3. KELOLA LINK DAFTAR & MASKOT CARD &gt;</span>
          </Link>
          <Link
            href="/admin/speakers"
            className="px-5 py-3 border-3 border-ink font-pixel text-xs md:text-sm tracking-wider flex items-center gap-2.5 transition-all cursor-pointer bg-navy-800 text-cream/70 hover:bg-navy-700"
          >
            <Mic size={18} />
            <span>4. KELOLA PEMATERI & CV PDF &gt;</span>
          </Link>
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
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openAddPartnerModal("sponsor")}
                  className="press-btn border-3 border-ink shadow-hard bg-pink text-ink font-pixel text-xs px-4 py-3 flex items-center gap-2 hover:bg-pink/90 transition-all uppercase tracking-wider font-extrabold cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>+ Tambah Sponsor</span>
                </button>
                <button
                  onClick={() => openAddPartnerModal("media_partner")}
                  className="press-btn border-3 border-ink shadow-hard bg-cyan text-ink font-pixel text-xs px-4 py-3 flex items-center gap-2 hover:bg-cyan/90 transition-all uppercase tracking-wider font-extrabold cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>+ Tambah Medpart</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-navy-800 border-3 border-ink shadow-hard p-5">
                <span className="font-pixel text-[10px] text-cream/60 tracking-wider block uppercase mb-1">
                  TOTAL PARTNERS
                </span>
                <div className="font-pixel text-yellow text-3xl font-bold">{safePartners.length}</div>
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
                  SEMUA ({safePartners.length})
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
                  onClick={() => openAddPartnerModal("sponsor")}
                  className="press-btn border-2 border-ink shadow-hard-sm bg-pink text-ink font-bold text-xs px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Tambah Sponsor Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPartners.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`bg-navy-800 border-3 shadow-hard p-4 flex flex-col justify-between relative group transition-all duration-200 ${
                      item.isVisible === false ? "border-pink/70 opacity-70" : "border-ink hover:border-yellow"
                    }`}
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
                        <div className="flex items-center gap-2">
                          {item.isVisible !== false ? (
                            <span className="text-[9px] font-pixel px-2 py-0.5 border border-cyan bg-cyan/20 text-cyan tracking-wider">
                              TAMPIL
                            </span>
                          ) : (
                            <span className="text-[9px] font-pixel px-2 py-0.5 border border-pink bg-pink/20 text-pink tracking-wider">
                              HIDDEN
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-cream/40">#{item.id}</span>
                        </div>
                      </div>

                      {/* Logo Display Box */}
                      <div className="w-full h-24 bg-gradient-to-br from-yellow via-yellow-dim to-pink/35 border-2 border-ink/80 p-3 flex items-center justify-center relative overflow-hidden mb-3 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow/35 via-pink/10 to-cyan/20 opacity-80" />
                        <div className="absolute inset-x-2 top-1 h-1 bg-cream/60" />
                        <div className="absolute -left-6 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-cream/35 blur-xl" />
                        <div className="absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-ink/10 blur-xl" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={withBasePath(item.logoUrl)}
                          alt={item.name}
                          className="relative object-contain filter group-hover:scale-105 transition-transform duration-300"
                          style={partnerLogoStyle(item)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = withBasePath("/logos/logo_navbar.png");
                          }}
                        />
                      </div>

                      <h3 className="font-pixel text-cream text-xs md:text-sm tracking-wide line-clamp-1 mb-1" title={item.name}>
                        {item.name}
                      </h3>

                      {item.websiteUrl ? (
                        <a
                          href={normalizePartnerWebsiteUrl(item.websiteUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-cyan hover:underline inline-flex items-center gap-1 line-clamp-1"
                        >
                          <span>{formatPartnerWebsiteLabel(normalizePartnerWebsiteUrl(item.websiteUrl))}</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-cream/40 block">Tanpa link</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 mt-3 border-t border-ink/40">
                      <button
                        onClick={() => handlePartnerVisibilityToggle(item)}
                        className={`px-2.5 py-1.5 border-2 border-ink text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          item.isVisible !== false
                            ? "bg-navy-700 text-yellow hover:bg-yellow hover:text-ink"
                            : "bg-navy-700 text-cream/40 hover:bg-pink hover:text-ink"
                        }`}
                        title={item.isVisible !== false ? "Logo TAMPIL di Beranda. Klik untuk sembunyikan." : "Logo DISEMBUNYIKAN dari Beranda. Klik untuk tampilkan."}
                      >
                        {item.isVisible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
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
                TOTAL AGENDA ACARA: <span className="text-yellow">{safeTimeline.length} ACARA</span>
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
                      key={`timeline-${item.id}-${index}`}
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
                    <span>Sponsor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerType("media_partner")}
                    className={`py-2.5 px-3 border-2 border-ink font-pixel text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      partnerType === "media_partner" ? "bg-cyan text-ink font-bold shadow-hard-sm" : "bg-navy-700 text-cream/70"
                    }`}
                  >
                    <span>Media Partner</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                  Nama Partner / Perusahaan <span className="text-pink">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Syneps Academy"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                  Metode Logo <span className="text-pink">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setPartnerLogoMode("upload")}
                    className={`py-2 px-3 border-2 border-ink text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      partnerLogoMode === "upload" ? "bg-yellow text-ink" : "bg-navy-700 text-cream/70"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerLogoMode("url")}
                    className={`py-2 px-3 border-2 border-ink text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      partnerLogoMode === "url" ? "bg-yellow text-ink" : "bg-navy-700 text-cream/70"
                    }`}
                  >
                    URL Gambar
                  </button>
                </div>

                {partnerLogoMode === "upload" ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs font-mono text-cream/70 file:mr-3 file:py-2 file:px-4 file:border-2 file:border-ink file:bg-yellow file:text-ink file:font-bold hover:file:bg-yellow-dim cursor-pointer"
                    />
                    <p className="mt-1.5 text-[10px] text-yellow font-mono">
                      Batas upload logo maksimal 10 MB.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="logos/sponsors/logo.png atau https://..."
                      value={partnerLogoUrl}
                      onChange={(e) => {
                        setPartnerLogoUrl(e.target.value);
                        setPreviewUrl(withBasePath(e.target.value));
                      }}
                      className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                    />
                  </div>
                )}

                {previewUrl && (
                  <div className="mt-3 p-3 bg-gradient-to-br from-yellow via-yellow-dim to-pink/35 border-2 border-ink flex items-center justify-center h-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow/35 via-pink/10 to-cyan/20 opacity-80" />
                    <div className="absolute inset-x-2 top-1 h-1 bg-cream/60" />
                    <div className="absolute -left-6 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-cream/35 blur-xl" />
                    <div className="absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-ink/10 blur-xl" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="relative object-contain"
                      style={partnerLogoStyle({
                        logoScale: partnerLogoScale,
                        logoPositionX: partnerLogoPositionX,
                        logoPositionY: partnerLogoPositionY,
                      })}
                      onError={() => showToast("Gagal memuat pratinjau gambar", "error")}
                    />
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="block">
                    <span className="font-pixel text-[9px] text-cream/70 block uppercase mb-1">
                      Ukuran {partnerLogoScale}%
                    </span>
                    <input
                      type="range"
                      min={55}
                      max={180}
                      value={partnerLogoScale}
                      onChange={(e) => setPartnerLogoScale(Number(e.target.value))}
                      className="w-full accent-yellow"
                    />
                  </label>
                  <label className="block">
                    <span className="font-pixel text-[9px] text-cream/70 block uppercase mb-1">
                      Posisi X {partnerLogoPositionX}%
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={partnerLogoPositionX}
                      onChange={(e) => setPartnerLogoPositionX(Number(e.target.value))}
                      className="w-full accent-cyan"
                    />
                  </label>
                  <label className="block">
                    <span className="font-pixel text-[9px] text-cream/70 block uppercase mb-1">
                      Posisi Y {partnerLogoPositionY}%
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={partnerLogoPositionY}
                      onChange={(e) => setPartnerLogoPositionY(Number(e.target.value))}
                      className="w-full accent-pink"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                  Website URL (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={partnerWebsiteUrl}
                  onChange={(e) => setPartnerWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-ink">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 border-2 border-ink bg-navy-700 text-cream/80 font-mono text-xs font-bold hover:bg-navy-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingPartner || uploading}
                  className="press-btn px-5 py-2 border-2 border-ink shadow-hard-sm bg-yellow text-ink font-mono text-xs font-bold flex items-center gap-2 hover:bg-yellow-dim cursor-pointer"
                >
                  {submittingPartner || uploading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingPartner ? "Simpan Perubahan" : "Tambah Partner"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DELETE PARTNER */}
      {/* ========================================================= */}
      {deletePartnerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-up">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-md p-6 text-center space-y-4 relative">
            <div className="w-12 h-12 bg-pink/20 border-2 border-ink rounded-full flex items-center justify-center mx-auto text-pink">
              <Trash2 size={24} />
            </div>
            <h3 className="font-pixel text-cream text-sm">HAPUS PARTNER?</h3>
            <p className="text-xs font-sans text-cream/70">
              Apakah Anda yakin ingin menghapus {deletePartnerTarget.type === "sponsor" ? "Sponsor" : "Media Partner"}{" "}
              <strong className="text-yellow">{deletePartnerTarget.name}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletePartnerTarget(null)}
                className="px-4 py-2 border-2 border-ink bg-navy-700 text-cream/80 font-mono text-xs font-bold hover:bg-navy-600 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handlePartnerDelete}
                className="press-btn px-5 py-2 border-2 border-ink shadow-hard-sm bg-pink text-cream font-mono text-xs font-bold hover:bg-pink/90 cursor-pointer"
              >
                Ya, Hapus
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
            <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-5">
              <div>
                <span className="font-pixel text-[10px] text-cyan tracking-widest uppercase block mb-0.5">
                  ◆ {editingTimeline ? "PERBARUI AGENDA TIMELINE" : "TAMBAH AGENDA TIMELINE BARU"}
                </span>
                <h2 className="font-pixel text-cream text-lg md:text-xl">
                  {editingTimeline ? `EDIT AGENDA #${editingTimeline.id}` : "FORM TIMELINE BARU"}
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
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                  Judul Acara / Agenda <span className="text-pink">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: OPEN REGISTRATION SEMINAR..."
                  value={timelineTitle}
                  onChange={(e) => setTimelineTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                  Tanggal Acara <span className="text-pink">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senin, 10 Agustus 2026"
                  value={timelineDate}
                  onChange={(e) => setTimelineDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                    Label Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="REGISTRASI / LOMBA / TM"
                    value={timelineCategory}
                    onChange={(e) => setTimelineCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow uppercase"
                  />
                </div>

                <div>
                  <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                    Warna Badge
                  </label>
                  <select
                    value={timelineBadgeColor}
                    onChange={(e) => setTimelineBadgeColor(e.target.value as "pink" | "cyan" | "yellow")}
                    className="w-full px-3.5 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow cursor-pointer"
                  >
                    <option value="pink">Pink</option>
                    <option value="cyan">Cyan</option>
                    <option value="yellow">Yellow</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                  Gambar Ilustrasi Agenda (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > MAX_UPLOAD_SIZE) {
                        e.target.value = "";
                        setTimelineFile(null);
                        setTimelineImageUrl(editingTimeline?.imageUrl || "");
                        showToast("Ukuran file maksimal 10 MB", "error");
                        return;
                      }
                      setTimelineFile(file);
                      setTimelineImageUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs font-mono text-cream/70 file:mr-3 file:py-2 file:px-4 file:border-2 file:border-ink file:bg-cyan file:text-ink file:font-bold cursor-pointer"
                />
                <p className="mt-1.5 text-[10px] text-cyan font-mono">Batas upload gambar maksimal 10 MB.</p>
                {timelineImageUrl && (
                  <div className="mt-2 text-xs font-mono text-cyan truncate">
                    Gambar terpilih: {timelineImageUrl}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-ink">
                <button
                  type="button"
                  onClick={() => setIsTimelineModalOpen(false)}
                  className="px-4 py-2 border-2 border-ink bg-navy-700 text-cream/80 font-mono text-xs font-bold hover:bg-navy-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingTimeline || uploadingTimelineFile}
                  className="press-btn px-5 py-2 border-2 border-ink shadow-hard-sm bg-pink text-cream font-mono text-xs font-bold flex items-center gap-2 hover:bg-pink/90 cursor-pointer"
                >
                  {submittingTimeline || uploadingTimelineFile ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingTimeline ? "Simpan Perubahan" : "Tambah Acara"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DELETE TIMELINE */}
      {/* ========================================================= */}
      {deleteTimelineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-up">
          <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-md p-6 text-center space-y-4 relative">
            <div className="w-12 h-12 bg-pink/20 border-2 border-ink rounded-full flex items-center justify-center mx-auto text-pink">
              <Trash2 size={24} />
            </div>
            <h3 className="font-pixel text-cream text-sm">HAPUS AGENDA TIMELINE?</h3>
            <p className="text-xs font-sans text-cream/70">
              Apakah Anda yakin ingin menghapus acara <strong className="text-yellow">{deleteTimelineTarget.title}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTimelineTarget(null)}
                className="px-4 py-2 border-2 border-ink bg-navy-700 text-cream/80 font-mono text-xs font-bold hover:bg-navy-600 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleTimelineDelete}
                className="press-btn px-5 py-2 border-2 border-ink shadow-hard-sm bg-pink text-cream font-mono text-xs font-bold hover:bg-pink/90 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
