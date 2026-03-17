"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Plane,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { LeadStatus } from "@/types/database";

interface ListingImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Lead {
  id: string;
  message: string | null;
  contact_method: string;
  status: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    listing_images: ListingImage[];
  } | null;
  buyer: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const contactIcon = {
  email: { Icon: Mail, label: "Email", color: "text-blue-500" },
  phone: { Icon: Phone, label: "Phone", color: "text-green-500" },
  whatsapp: { Icon: MessageCircle, label: "WhatsApp", color: "text-emerald-500" },
};

const statusConfig: Record<LeadStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", cls: "bg-yellow-100 text-yellow-700" },
  qualified: { label: "Qualified", cls: "bg-green-100 text-green-700" },
  closed: { label: "Closed", cls: "bg-slate-100 text-slate-500" },
};

const nextActions: Record<string, { status: LeadStatus; label: string; cls: string }[]> = {
  new: [
    { status: "contacted", label: "Mark Contacted", cls: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
    { status: "closed", label: "Close", cls: "bg-slate-50 text-slate-600 hover:bg-slate-100" },
  ],
  contacted: [
    { status: "qualified", label: "Mark Qualified", cls: "bg-green-50 text-green-700 hover:bg-green-100" },
    { status: "closed", label: "Close", cls: "bg-slate-50 text-slate-600 hover:bg-slate-100" },
  ],
  qualified: [
    { status: "closed", label: "Close", cls: "bg-slate-50 text-slate-600 hover:bg-slate-100" },
  ],
  closed: [],
};

type Tab = "all" | "new" | "contacted" | "qualified";

function getListingImage(images: ListingImage[]): string | null {
  const primary = images.find((i) => i.is_primary);
  if (primary) return primary.image_url;
  return [...images].sort((a, b) => a.display_order - b.display_order)[0]?.image_url ?? null;
}

function BuyerInitials({ name }: { name: string | null }) {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
      {initials}
    </div>
  );
}

export default function LeadsClient({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = leads.filter((l) => tab === "all" || l.status === tab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "contacted", label: "Contacted" },
    { key: "qualified", label: "Qualified" },
  ];

  const tabCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
  };

  async function updateStatus(id: string, status: LeadStatus) {
    setLoadingId(id);
    const supabase = createClient();
    await supabase.from("leads").update({ status }).eq("id", id);
    setLoadingId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Leads Inbox</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Buyer inquiries on your listings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? "bg-white text-[#0F172A] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {label}
            {tabCounts[key] > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === key ? "bg-slate-100" : "bg-white"
                }`}
              >
                {tabCounts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Users size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-[#0F172A] mb-1">No leads yet</p>
          <p className="text-[#64748B] text-sm max-w-xs">
            Promote your listings to get more inquiries from buyers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const sc = statusConfig[lead.status as LeadStatus] ?? statusConfig.new;
            const contact = contactIcon[lead.contact_method as keyof typeof contactIcon] ?? contactIcon.email;
            const listingImg = lead.listing
              ? getListingImage(lead.listing.listing_images)
              : null;
            const isExpanded = expanded === lead.id;
            const isLoading = loadingId === lead.id;
            const actions = nextActions[lead.status] ?? [];

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-opacity ${isLoading ? "opacity-50" : ""}`}
              >
                {/* Lead row */}
                <button
                  className="w-full text-left p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : lead.id)}
                >
                  <BuyerInitials name={lead.buyer?.full_name ?? null} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-[#0F172A] text-sm">
                          {lead.buyer?.full_name ?? "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <contact.Icon size={12} className={contact.color} />
                          <span className="text-xs text-[#64748B]">{contact.label}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-[#64748B]">
                            {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.cls}`}>
                          {sc.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                    {/* Listing + message preview */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 h-6 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                        {listingImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={listingImg} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Plane size={10} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] truncate">
                        {lead.listing?.title ?? "Unknown listing"}
                      </p>
                    </div>
                    {!isExpanded && lead.message && (
                      <p className="text-xs text-[#64748B] mt-1.5 line-clamp-1 italic">
                        &ldquo;{lead.message}&rdquo;
                      </p>
                    )}
                  </div>
                </button>

                {/* Expanded view */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4">
                    {lead.message && (
                      <div>
                        <p className="text-xs font-medium text-[#64748B] mb-1">Message</p>
                        <p className="text-sm text-[#0F172A] bg-slate-50 rounded-lg p-3 leading-relaxed">
                          {lead.message}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          onClick={() => void updateStatus(lead.id, action.status)}
                          disabled={isLoading}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${action.cls}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
