"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

export default function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="bg-[#0F172A] py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#2563EB]/20 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, ease: "easeOut" }}>
          <p className="text-[#93C5FD] text-sm font-semibold uppercase tracking-widest mb-4">{t.cta.eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">{t.cta.title}</h2>
          <p className="text-slate-300 text-lg mb-12 max-w-xl mx-auto">{t.cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#0F172A] font-semibold px-8 py-3.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              {t.cta.getStarted} <ArrowRight size={16} />
            </button>
            <button className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
              {t.cta.learnMore}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
