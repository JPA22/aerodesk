"use client";

import { motion, type Variants } from "framer-motion";
import { Plane, Wind, Gauge, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  name: string;
  description: string;
  count: number;
  Icon: LucideIcon;
}

const categories: Category[] = [
  {
    name: "Jets",
    description: "Light, midsize & heavy jets",
    count: 842,
    Icon: Zap,
  },
  {
    name: "Turboprops",
    description: "Single & twin turboprops",
    count: 456,
    Icon: Wind,
  },
  {
    name: "Pistons",
    description: "Single & multi-engine piston",
    count: 1020,
    Icon: Gauge,
  },
  {
    name: "Helicopters",
    description: "Turbine & piston rotorcraft",
    count: 312,
    Icon: Plane,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function BrowseByCategory() {
  return (
    <section className="bg-[#F1F5F9] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[#2563EB] text-sm font-semibold uppercase tracking-widest mb-3">
            Explore the fleet
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
            Browse by Category
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={cardVariants}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              className="group cursor-pointer bg-gradient-to-br from-[#0F172A] to-[#2563EB] rounded-xl p-8 flex flex-col items-center text-center gap-4 shadow-lg shadow-navy/20"
            >
              <div className="bg-white/10 group-hover:bg-white/20 transition-colors rounded-full p-4">
                <cat.Icon size={30} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-xl">{cat.name}</h3>
              <p className="text-slate-300 text-sm leading-snug">
                {cat.description}
              </p>
              <span className="text-[#93C5FD] text-sm font-medium group-hover:text-white transition-colors mt-1">
                Browse {cat.count.toLocaleString()} listings →
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
