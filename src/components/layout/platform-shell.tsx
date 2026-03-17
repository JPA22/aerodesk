"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plane,
  Heart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/types/database";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/listings", icon: Plane, label: "My Listings", exact: false },
  { href: "/dashboard/saved", icon: Heart, label: "Saved Aircraft", exact: false },
  { href: "/dashboard/leads", icon: Users, label: "Leads", exact: false, badgeKey: "leads" as const },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", exact: false },
];

interface PlatformShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: UserRole;
  avatarUrl: string | null;
  newLeadsCount?: number;
}

function UserAvatar({
  name,
  avatarUrl,
  size = 36,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-[#2563EB] flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function PlatformShell({
  children,
  userName,
  userRole,
  avatarUrl,
  newLeadsCount = 0,
}: PlatformShellProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleLabel: Record<UserRole, string> = {
    buyer: "Buyer",
    private_seller: "Private Seller",
    dealer: "Dealer",
    admin: "Admin",
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-baseline">
          <span className="text-xl font-bold text-white">Aero</span>
          <span className="text-xl font-bold text-[#3B82F6]">Desk</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, exact, badgeKey }) => {
          const active = isActive(href, exact);
          const showBadge = badgeKey === "leads" && newLeadsCount > 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2563EB] text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="bg-[#3B82F6] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {newLeadsCount > 99 ? "99+" : newLeadsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Browse Aircraft */}
      <div className="px-3 pb-3">
        <Link
          href="/search"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Search size={18} />
          Browse Aircraft
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <UserAvatar name={userName} avatarUrl={avatarUrl} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-slate-400 text-xs">{roleLabel[userRole]}</p>
          </div>
          <button
            onClick={() => void signOut()}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col bg-[#0F172A] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-60 bg-[#0F172A] flex flex-col z-10">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 h-14 flex items-center justify-between flex-shrink-0">
          {/* Hamburger (mobile) */}
          <button
            className="md:hidden text-[#64748B] hover:text-[#0F172A]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:block" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1.5 transition-colors"
            >
              <UserAvatar name={userName} avatarUrl={avatarUrl} size={28} />
              <span className="text-sm font-medium text-[#0F172A] hidden sm:block">
                {userName.split(" ")[0]}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-slate-50"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => void signOut()}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
