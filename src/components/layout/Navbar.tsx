"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTranslation } from "@/components/providers/language-provider";
import LanguageSelector from "@/components/layout/LanguageSelector";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isLoading, signOut } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { label: t.nav.browse, href: "/search" },
    { label: t.nav.valuation, href: "/tools/valuation" },
    { label: t.nav.dealers, href: "/dealers" },
    { label: t.nav.about, href: "/about" },
  ];

  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const initials = (profile?.full_name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 flex items-baseline">
            <span className="text-2xl font-bold text-white">Aero</span>
            <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            {isLoading ? (
              <div className="w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  <LayoutDashboard size={15} />
                  {t.nav.dashboard}
                </Link>
                <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                  <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-slate-300 text-sm">{firstName}</span>
                  <button onClick={() => void signOut()} className="text-slate-400 hover:text-white transition-colors ml-1" aria-label="Sign out">
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  {t.nav.login}
                </Link>
                <Link href="/register" className="bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  {t.nav.getStarted}
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <button className="text-white p-1" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0F172A] border-t border-white/10 px-4 py-5 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white text-sm font-medium transition-colors" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <hr className="border-white/10" />
          {user ? (
            <>
              <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm font-medium flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={15} /> {t.nav.dashboard}
              </Link>
              <button onClick={() => { void signOut(); setMobileOpen(false); }} className="text-slate-300 hover:text-white text-sm font-medium text-left flex items-center gap-2">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium" onClick={() => setMobileOpen(false)}>
                {t.nav.login}
              </Link>
              <Link href="/register" className="bg-[#2563EB] text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                {t.nav.getStarted}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
