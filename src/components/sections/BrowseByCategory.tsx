"use client";

import { motion, type Variants } from "framer-motion";
import { Plane, Wind, Gauge, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

const containerVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const cardVariants: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

const categoryIcons: LucideIcon[] = [Zap, Wind, Gauge, Plane];
const categoryCounts = [842, 456, 1020, 312];

export default function BrowseByCategory() {
  const { t } = useTranslation();

  const categories = [
    { name: t.categories.jetsName, description: t.categories.jetsDesc, count: categoryCounts[0], Icon: categoryIcons[0] },
    { name: t.categories.turbopropsName, description: t.categories.turbopropsDesc, count: categoryCounts[1], Icon: categoryIcons[1] },
    { name: t.categories.pistonsName, description: t.categories.pistonsDesc, count: categoryCounts[2], Icon: categoryIcons[2] },
    { name: t.categories.helicoptersName, description: t.categories.helicoptersDesc, count: categoryCounts[3], Icon: categoryIcons[3] },
  ];

  return (
    <section className="bg-[#F1F5F9] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <p className="text-[#2563EB] text-sm font-semibold uppercase tracking-widest mb-3">{t.categories.eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">{t.categories.title}</h2>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <motion.div key={cat.name} variants={cardVariants} whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              className="group cursor-pointer bg-gradient-to-br from-[#0F172A] to-[#2563EB] rounded-xl p-8 flex flex-col items-center text-center gap-4 shadow-lg shadow-navy/20">
              <div className="bg-white/10 group-hover:bg-white/20 transition-colors rounded-full p-4"><cat.Icon size={30} className="text-white" /></div>
              <h3 className="text-white font-bold text-xl">{cat.name}</h3>
              <p className="text-slate-300 text-sm leading-snug">{cat.description}</p>
              <span className="text-[#93C5FD] text-sm font-medium group-hover:text-white transition-colors mt-1">
                {t.categories.browseListings.replace("{count}", cat.count.toLocaleString())}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
