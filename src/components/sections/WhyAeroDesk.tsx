"use client";

import { motion, type Variants } from "framer-motion";
import { TrendingUp, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    Icon: TrendingUp,
    title: "AI-Powered Valuations",
    description:
      "Get accurate, instant market valuations powered by machine learning trained on thousands of aircraft transactions across Latin America and beyond.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified Dealers",
    description:
      "Every dealer on AeroDesk is manually verified. Browse listings from trusted aviation professionals — no scams, no surprises.",
  },
  {
    Icon: Users,
    title: "Seamless Transactions",
    description:
      "From first inquiry to closing, our platform streamlines every step. Integrated PPI scheduling, document management, and escrow support.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function WhyAeroDesk() {
  return (
    <section className="bg-[#F1F5F9] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#2563EB] text-sm font-semibold uppercase tracking-widest mb-3">
            Built for aviation
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
            Why AeroDesk
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="flex flex-col items-center text-center gap-5"
            >
              <div className="bg-[#2563EB] rounded-2xl p-5 shadow-lg shadow-blue-900/20">
                <feature.Icon size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A]">
                {feature.title}
              </h3>
              <p className="text-[#64748B] text-base leading-relaxed max-w-xs">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
