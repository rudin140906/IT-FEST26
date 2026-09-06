"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, User, KeyRound, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { apiPath, fetchApi, withBasePath } from "@/lib/site-path";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetchApi("/admin/check");
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.authenticated) {
            sessionStorage.setItem("admin_auth", "true");
            router.replace("/admin/partners");
            return;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAuth(false);
      }
    }
    verifyAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username dan Password wajib diisi!");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetchApi("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type") || "";
      let isJsonResponse = false;

      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
          isJsonResponse = true;
        } catch (jsonErr) {
          console.error("Failed to parse JSON response:", jsonErr);
        }
      }

        if (res.ok && data.success) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_auth", "true");
          }
          router.replace("/admin/partners");
          return;
        }

      setErrorMsg(
        data.error ||
          (res.status && res.status !== 200 && isJsonResponse
            ? `Error (${res.status}): Username atau password salah!`
            : "Username atau password salah!")
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi masalah koneksi server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-cream">
        <RefreshCw size={36} className="animate-spin text-yellow mb-3" />
        <span className="font-pixel text-xs tracking-wider">MEMERIKSA HAK AKSES...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-cream font-sans flex flex-col justify-between relative overflow-hidden selection:bg-pink selection:text-ink">
      {/* Background Grid Pattern & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,241,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,241,224,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/15 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="p-4 md:p-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-cream/70 hover:text-yellow transition-colors bg-navy-800 border-2 border-ink px-3 py-1.5 shadow-hard-sm"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Website</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-8">
        <div className="bg-navy-800 border-3 border-ink shadow-hard-lg w-full max-w-md p-6 sm:p-8 relative">
          {/* Retro Corner Accents */}
          <div className="absolute -top-3 -left-3 w-5 h-5 bg-pink border-3 border-ink rotate-12" />
          <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-yellow border-3 border-ink -rotate-12" />

          {/* Logo & Title */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 bg-navy-900 border-3 border-ink shadow-hard-sm mx-auto flex items-center justify-center p-2 relative">
              <Image src={withBasePath("/logos/logo_navbar.png")} alt="Logo" width={40} height={40} style={{ width: "auto", height: "auto" }} className="object-contain" />
            </div>

            <div>
              <span className="font-pixel text-[10px] text-pink tracking-widest block uppercase">
                ◆ ADMIN PORTAL IT-FESTIVAL
              </span>
              <h1 className="font-pixel text-cream text-xl sm:text-2xl mt-1 tracking-wide drop-shadow-[0_2px_0_rgba(5,7,20,1)]">
                PANEL OTENTIKASI
              </h1>
            </div>
          </div>

          {/* Alert Notification */}
          {errorMsg && (
            <div className="bg-pink/10 border-2 border-pink p-3 mb-5 flex items-start gap-2.5 text-pink animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="font-mono text-xs leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-pixel text-[11px] text-cream/90 mb-1.5 uppercase tracking-wider">
                USERNAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cream/40">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin..."
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-900 border-2 border-ink text-cream text-xs font-mono focus:border-yellow focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-pixel text-[11px] text-cream/90 mb-1.5 uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cream/40">
                  <KeyRound size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin..."
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-900 border-2 border-ink text-cream text-xs font-mono focus:border-yellow focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full press-btn py-3 px-4 bg-yellow text-ink border-2 border-ink shadow-hard-sm font-pixel text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-yellow/90 disabled:opacity-50 transition-all mt-6 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>MEMPROSES LOGIN...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>MASUK KELOLA PARTNER ›</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center border-t border-ink/40 bg-navy-900/60 relative z-10">
        <p className="font-mono text-[10px] text-cream/40">
          © 2026 IT-FESTIVAL ADMIN SYSTEM — POLITEKNIK NEGERI SRIWIJAYA
        </p>
      </footer>
    </div>
  );
}
