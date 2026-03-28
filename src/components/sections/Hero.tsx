"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/components/providers/language-provider";

const manufacturers = [
  "Cessna", "Embraer", "Bombardier", "Gulfstream",
  "Beechcraft", "Piper", "Cirrus", "Diamond", "Pilatus",
];

export default function Hero() {
  const router = useRouter();
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = [
    { label: t.hero.allCategories, value: "" },
    { label: t.hero.jets, value: "jet" },
    { label: t.hero.turboprops, value: "turboprop" },
    { label: t.hero.pistons, value: "piston" },
    { label: t.hero.helicopters, value: "helicopter" },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (manufacturer) params.set("manufacturer", manufacturer);
    const priceNum = Number(maxPrice.replace(/,/g, ""));
    if (priceNum > 0) params.set("maxPrice", String(priceNum));
    router.push("/search" + (params.toString() ? "?" + params.toString() : ""));
  };

  return (
    <section className="bg-gradient-to-br from-[#0F172A] via-[#0d2347] to-[#1e3a6e] min-h-[calc(100vh-64px)] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#2563EB]/20 border border-[#3B82F6]/30 text-[#93C5FD] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            {t.hero.badge}
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
            {t.hero.title}{" "}
            <span className="text-[#3B82F6]">{t.hero.titleHighlight}</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-5 md:p-7 max-w-3xl mx-auto">
            <p className="text-[#0F172A] font-semibold text-left mb-4 text-sm uppercase tracking-widest">
              {t.hero.findYourAircraft}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.hero.category}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent">
                  {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.hero.manufacturer}</label>
                <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent">
                  <option value="">{t.hero.allManufacturers}</option>
                  {manufacturers.map((m) => (<option key={m}>{m}</option>))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.hero.maxPrice}</label>
                <input type="text" placeholder={t.hero.maxPricePlaceholder} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent" />
              </div>
            </div>
            <button onClick={handleSearch}
              className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-colors text-base shadow-lg shadow-blue-900/30">
              <Search size={18} />
              {t.hero.searchAircraft}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-10 text-slate-400 text-sm">
            <span>✦ {t.hero.statsAircraft}</span>
            <span>✦ {t.hero.statsDealers}</span>
            <span>✦ {t.hero.statsCountries}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
