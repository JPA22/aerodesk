"use client";

import { Shield } from "lucide-react";
import { useTranslation } from "@/components/providers/language-provider";

export type DDTier = "bronze" | "silver" | "gold";

const TIER_CONFIG: Record<DDTier, { cls: string; bg: string; icon: string }> = {
  bronze: {
    cls: "text-amber-800",
    bg: "bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200",
    icon: "text-amber-600",
  },
  silver: {
    cls: "text-slate-700",
    bg: "bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300",
    icon: "text-slate-500",
  },
  gold: {
    cls: "text-yellow-800",
    bg: "bg-gradient-to-r from-yellow-100 to-amber-50 border-yellow-300",
    icon: "text-yellow-600",
  },
};

/** Compact badge for listing cards */
export function DDBadgeSmall({ tier }: { tier: DDTier }) {
  const { t } = useTranslation();
  const cfg = TIER_CONFIG[tier];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.cls}`}
    >
      <Shield size={9} className={cfg.icon} />
      {t.dd.tierLabel[tier]}
    </span>
  );
}

/** Medium badge for dashboard table */
export function DDBadgeMedium({ tier, score }: { tier: DDTier; score?: number | null }) {
  const { t } = useTranslation();
  const cfg = TIER_CONFIG[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.cls}`}
    >
      <Shield size={11} className={cfg.icon} />
      {t.dd.tierLabel[tier]}
      {score != null && (
        <span className="opacity-60 text-[10px]">({score})</span>
      )}
    </span>
  );
}

/** Large badge for listing detail page */
export function DDBadgeLarge({ tier, score }: { tier: DDTier; score?: number | null }) {
  const { t } = useTranslation();
  const cfg = TIER_CONFIG[tier];
  return (
    <div className={`rounded-xl border p-4 ${cfg.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-white/80 flex items-center justify-center ${cfg.icon}`}>
          <Shield size={20} />
        </div>
        <div>
          <p className={`text-sm font-bold ${cfg.cls}`}>
            {t.dd.preDDVerified} — {t.dd.tierLabel[tier]}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.dd.tierDesc[tier]}
            {score != null && ` · ${t.dd.score}: ${score}/100`}
          </p>
        </div>
      </div>
    </div>
  );
}
