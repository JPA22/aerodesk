"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";

interface ListingCard {
  name: string;
  specs: string;
  price: string;
  location: string;
  gradient: string;
}

const listings: ListingCard[] = [
  {
    name: "2019 Cessna Citation CJ4",
    specs: "2,165 nm · 451 kts · 9 seats",
    price: "$8,950,000",
    location: "São Paulo, Brazil",
    gradient: "from-[#0c1e45] to-[#2563EB]",
  },
  {
    name: "2020 Embraer Phenom 300E",
    specs: "1,971 nm · 453 kts · 9 seats",
    price: "$9,750,000",
    location: "Miami, Florida",
    gradient: "from-[#0F172A] to-[#0EA5E9]",
  },
  {
    name: "2018 Beechcraft King Air 350",
    specs: "1,806 nm · 312 kts · 11 seats",
    price: "$4,200,000",
    location: "Buenos Aires, Argentina",
    gradient: "from-[#0d2347] to-[#3B82F6]",
  },
  {
    name: "2021 Cirrus SR22T",
    specs: "1,021 nm · 183 kts · 4 seats",
    price: "$895,000",
    location: "Campinas, Brazil",
    gradient: "from-[#0F172A] to-[#2563EB]",
  },
  {
    name: "2017 Bombardier Challenger 350",
    specs: "3,200 nm · 459 kts · 10 seats",
    price: "$18,500,000",
    location: "Bogotá, Colombia",
    gradient: "from-[#0c1a2e] to-[#0EA5E9]",
  },
  {
    name: "2022 Piper M600/SLS",
    specs: "1,484 nm · 274 kts · 6 seats",
    price: "$3,100,000",
    location: "Santiago, Chile",
    gradient: "from-[#0d2347] to-[#64748B]",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Plane silhouette SVG path (inline to avoid external deps)
function PlaneSilhouette() {
  return (
    <svg
      className="w-20 h-20 text-white/25"
      fill="currentColor"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path d="M56 24l-12 4-14-18H24l6 18-12 4-6-6H8l4 10-4 10h4l6-6 12 4-6 18h6l14-18 12 4c4 0 8-2 8-6s-4-6-8-8z" />
    </svg>
  );
}

export default function FeaturedListings() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4"
        >
          <div>
            <p className="text-[#2563EB] text-sm font-semibold uppercase tracking-widest mb-3">
              Hand-picked for you
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
              Featured Aircraft
            </h2>
          </div>
          <Link
            href="/search"
            className="text-[#2563EB] font-semibold text-sm flex items-center gap-1.5 hover:gap-3 transition-all"
          >
            View all listings <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {listings.map((listing) => (
            <motion.div
              key={listing.name}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group bg-white rounded-xl shadow-md shadow-slate-200/80 overflow-hidden border border-slate-100 cursor-pointer"
            >
              {/* Image placeholder */}
              <div
                className={`h-52 bg-gradient-to-br ${listing.gradient} flex items-center justify-center relative overflow-hidden`}
              >
                {/* subtle grid overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:24px_24px]" />
                <PlaneSilhouette />
                <div className="absolute top-3 right-3 bg-[#2563EB] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                  Featured
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <h3 className="font-bold text-[#0F172A] text-base mb-1 group-hover:text-[#2563EB] transition-colors">
                  {listing.name}
                </h3>
                <p className="text-[#64748B] text-sm mb-4">{listing.specs}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#2563EB] font-bold text-lg">
                    {listing.price}
                  </span>
                  <span className="text-[#64748B] text-xs flex items-center gap-1">
                    <MapPin size={12} />
                    {listing.location}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
