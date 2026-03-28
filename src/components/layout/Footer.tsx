"use client";

import Link from "next/link";
import { Twitter, Linkedin, Instagram, Facebook } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";
import LanguageSelector from "@/components/layout/LanguageSelector";

const socialLinks = [
  { Icon: Twitter, label: "Twitter", href: "#" },
  { Icon: Linkedin, label: "LinkedIn", href: "#" },
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Facebook, label: "Facebook", href: "#" },
];

export default function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      section: t.footer.marketplace,
      links: [
        { label: t.footer.browseAircraft, href: "/search" },
        { label: t.footer.aircraftValuation, href: "/tools/valuation" },
        { label: t.footer.dealersDirectory, href: "/search?type=dealer" },
      ],
    },
    {
      section: t.footer.company,
      links: [
        { label: t.footer.aboutUs, href: "#" },
        { label: t.footer.careers, href: "#" },
        { label: t.footer.blog, href: "#" },
      ],
    },
    {
      section: t.footer.support,
      links: [
        { label: t.footer.helpCenter, href: "#" },
        { label: t.footer.contactUs, href: "#" },
        { label: t.footer.reportIssue, href: "#" },
      ],
    },
    {
      section: t.footer.legal,
      links: [
        { label: t.footer.terms, href: "/terms" },
        { label: t.footer.privacy, href: "/privacy" },
        { label: t.footer.cookies, href: "/privacy#cookies" },
      ],
    },
  ];

  return (
    <footer className="bg-[#0F172A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <span className="text-2xl font-bold text-white">Aero</span>
            <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
            <p className="text-slate-400 text-sm mt-2 max-w-xs">{t.footer.tagline}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map(({ section, links }) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-slate-400 hover:text-white text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">{t.footer.copyright}</p>
          <div className="flex items-center gap-5">
            {socialLinks.map(({ Icon, label, href }) => (
              <a key={label} href={href} aria-label={label} className="text-slate-400 hover:text-white transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
