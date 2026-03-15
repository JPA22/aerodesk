"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Browse Aircraft", href: "#" },
  { label: "For Dealers", href: "#" },
  { label: "About", href: "#" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0F172A]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 flex items-baseline">
            <span className="text-2xl font-bold text-white">Aero</span>
            <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
          </a>

          {/* Center links — desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions — desktop */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Login
            </button>
            <button className="bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Get Started
            </button>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0F172A] border-t border-white/10 px-4 py-5 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-white/10" />
          <button className="text-slate-300 hover:text-white text-sm font-medium text-left transition-colors">
            Login
          </button>
          <button className="bg-[#2563EB] text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
