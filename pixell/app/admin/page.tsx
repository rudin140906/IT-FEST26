"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, User, KeyRound, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";

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
        if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "true") {
          router.replace("/admin/partners");
          return;
        }

        const res = await fetch("/api/admin/check");
        if (res.ok) {
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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("admin_auth", "true");
          document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Lax";
        }
        router.replace("/admin/partners");
      } else {
        setErrorMsg(data.error || "Username atau password salah!");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi masalah koneksi server.");
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
              <Image src="/logos/logo_navbar.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <span className="font-pixel text-[10px] text-pink tracking-widest block uppercase mb-1">
                ◆ ADMIN PORTAL IT-FESTIVAL
              </span>
              <h1 className="font-pixel text-cream text-xl sm:text-2xl tracking-wider">
                PANEL OTENTIKASI
              </h1>
            </div>
          </div>


          {/* Error Notification */}
          {errorMsg && (
            <div className="bg-pink/20 border-2 border-pink p-3 mb-5 flex items-center gap-2.5 text-xs font-bold text-pink animate-fade-up">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                USERNAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" size={16} />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Masukkan username admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>
            </div>

            <div>
              <label className="font-pixel text-[10px] text-cream/80 block uppercase mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50" size={16} />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-900 border-2 border-ink text-xs font-mono text-cream focus:outline-none focus:border-yellow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="press-btn w-full py-3 bg-yellow text-ink border-3 border-ink shadow-hard text-xs font-pixel tracking-wider font-bold hover:bg-yellow-dim transition-all cursor-pointer flex items-center justify-center gap-2 mt-6 uppercase"
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>MEMPROSES...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>MASUK KELOLA PARTNER &gt;</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[10px] font-mono text-cream/50 relative z-10">
        © 2026 IT-Festival Admin Control Center
      </footer>
    </div>
  );
}
