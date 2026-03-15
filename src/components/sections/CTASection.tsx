"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-[#0F172A] py-20 md:py-28 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#2563EB]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <p className="text-[#93C5FD] text-sm font-semibold uppercase tracking-widest mb-4">
            Join the marketplace
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to list your aircraft?
          </h2>
          <p className="text-slate-300 text-lg mb-12 max-w-xl mx-auto">
            Join 500+ dealers already on AeroDesk and reach thousands of
            qualified buyers across Latin America.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#0F172A] font-semibold px-8 py-3.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={16} />
            </button>
            <button className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
