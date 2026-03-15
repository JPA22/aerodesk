import { Twitter, Linkedin, Instagram, Facebook } from "lucide-react";

const footerSections: Record<string, string[]> = {
  Marketplace: ["Browse Aircraft", "Categories", "Dealers Directory"],
  Company: ["About Us", "Careers", "Blog"],
  Support: ["Help Center", "Contact Us", "Report an Issue"],
  Legal: ["Terms of Service", "Privacy Policy", "Cookie Policy"],
};

const socialLinks = [
  { Icon: Twitter, label: "Twitter" },
  { Icon: Linkedin, label: "LinkedIn" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Facebook, label: "Facebook" },
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
          {Object.entries(footerSections).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </a>
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
            {socialLinks.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
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
