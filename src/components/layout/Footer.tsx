import Link from "next/link";
import { Twitter, Linkedin, Instagram, Facebook } from "lucide-react";

const footerSections: { section: string; links: { label: string; href: string }[] }[] = [
  {
    section: "Marketplace",
    links: [
      { label: "Browse Aircraft", href: "/search" },
      { label: "Aircraft Valuation", href: "/tools/valuation" },
      { label: "Dealers Directory", href: "/search?type=dealer" },
    ],
  },
  {
    section: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    section: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Report an Issue", href: "#" },
    ],
  },
  {
    section: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/privacy#cookies" },
    ],
  },
];

const socialLinks = [
  { Icon: Twitter, label: "Twitter", href: "#" },
  { Icon: Linkedin, label: "LinkedIn", href: "#" },
  { Icon: Instagram, label: "Instagram", href: "#" },
  { Icon: Facebook, label: "Facebook", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo */}
        <div className="mb-10">
          <span className="text-2xl font-bold text-white">Aero</span>
          <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
          <p className="text-slate-400 text-sm mt-2 max-w-xs">
            The modern marketplace for pre-owned aircraft in Latin America and beyond.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map(({ section, links }) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 AeroDesk. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {socialLinks.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
