"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { label: "All Categories", value: "" },
  { label: "Jets", value: "jet" },
  { label: "Turboprops", value: "turboprop" },
  { label: "Pistons", value: "piston" },
  { label: "Helicopters", value: "helicopter" },
];

const manufacturers = [
  "All Manufacturers",
  "Cessna",
  "Embraer",
  "Bombardier",
  "Gulfstream",
  "Beechcraft",
  "Piper",
  "Cirrus",
  "Diamond",
  "Pilatus",
];

export default function Hero() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("All Manufacturers");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (manufacturer !== "All Manufacturers") params.set("manufacturer", manufacturer);
    const priceNum = Number(maxPrice.replace(/,/g, ""));
    if (priceNum > 0) params.set("maxPrice", String(priceNum));
    router.push("/search" + (params.toString() ? "?" + params.toString() : ""));
  };

  return (
    <section className="bg-gradient-to-br from-[#0F172A] via-[#0d2347] to-[#1e3a6e] min-h-[calc(100vh-64px)] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#2563EB]/20 border border-[#3B82F6]/30 text-[#93C5FD] text-sm font-medium px-4 py-1.5 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            Now live in Brazil · LABACE 2026
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
            The Modern Marketplace for{" "}
            <span className="text-[#3B82F6]">Pre-Owned Aircraft</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Buy and sell aircraft with confidence. AI-powered valuations,
            stunning galleries, and seamless transactions.
          </p>

          {/* Search bar — the hero element */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-5 md:p-7 max-w-3xl mx-auto"
          >
            <p className="text-[#0F172A] font-semibold text-left mb-4 text-sm uppercase tracking-widest">
              Find your aircraft
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Category dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Manufacturer dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Manufacturer
                </label>
                <select
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                >
                  {manufacturers.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Max price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Max Price (USD)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5,000,000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-colors text-base shadow-lg shadow-blue-900/30"
            >
              <Search size={18} />
              Search Aircraft
            </button>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-10 text-slate-400 text-sm"
          >
            <span>✦ 2,500+ aircraft listed</span>
            <span>✦ 500+ verified dealers</span>
            <span>✦ Trusted in 12 countries</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
