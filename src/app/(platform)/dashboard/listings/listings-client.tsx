"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Users,
  Pencil,
  Trash2,
  CheckCircle,
  PauseCircle,
  Plane,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ListingStatus } from "@/types/database";

interface ListingImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface Listing {
  id: string;
  title: string;
  asking_price: number;
  currency: string;
  status: ListingStatus;
  views_count: number;
  leads_count: number;
  created_at: string;
  images: ListingImage[];
}

const statusConfig: Record<
  ListingStatus,
  { label: string; cls: string }
> = {
  active: { label: "Active", cls: "bg-green-100 text-green-700" },
  draft: { label: "Draft", cls: "bg-yellow-100 text-yellow-700" },
  sold: { label: "Sold", cls: "bg-red-100 text-red-600" },
  expired: { label: "Expired", cls: "bg-slate-100 text-slate-500" },
  pending_review: { label: "In Review", cls: "bg-blue-100 text-blue-700" },
};

type Tab = "all" | "active" | "draft" | "sold";

export default function ListingsClient({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = listings.filter((l) => {
    if (tab === "all") return true;
    if (tab === "sold") return l.status === "sold";
    return l.status === tab;
  });

  const tabCounts: Record<Tab, number> = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    draft: listings.filter((l) => l.status === "draft").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "draft", label: "Drafts" },
    { key: "sold", label: "Sold" },
  ];

  async function updateStatus(id: string, status: ListingStatus) {
    setLoadingId(id);
    const supabase = createClient();
    await supabase.from("aircraft_listings").update({ status }).eq("id", id);
    setLoadingId(null);
    startTransition(() => router.refresh());
  }

  async function deleteListing(id: string) {
    if (!confirm("Delete this listing? This action cannot be undone.")) return;
    setLoadingId(id);
    const supabase = createClient();
    await supabase.from("aircraft_listings").delete().eq("id", id);
    setLoadingId(null);
    startTransition(() => router.refresh());
  }

  function getPrimaryImage(images: ListingImage[]): string | null {
    const primary = images.find((i) => i.is_primary);
    if (primary) return primary.image_url;
    const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
    return sorted[0]?.image_url ?? null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Listings</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Manage your aircraft listings
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          Add New Listing
        </Link>
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Plane size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-[#0F172A] mb-1">No listings yet</p>
          <p className="text-[#64748B] text-sm mb-6 max-w-xs">
            Start listing your aircraft to reach thousands of qualified buyers.
          </p>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#3B82F6] transition-colors"
          >
            <Plus size={14} /> Create your first listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Aircraft</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">
                    <div className="flex items-center gap-1"><Eye size={12} /> Views</div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">
                    <div className="flex items-center gap-1"><Users size={12} /> Leads</div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Listed</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((listing) => {
                  const img = getPrimaryImage(listing.images);
                  const sc = statusConfig[listing.status];
                  const isLoading = loadingId === listing.id;
                  return (
                    <tr key={listing.id} className={`hover:bg-slate-50 transition-colors ${isLoading ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Plane size={14} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-[#0F172A] truncate max-w-[200px]">
                            {listing.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#0F172A] font-medium">
                        {listing.currency} {listing.asking_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{listing.views_count}</td>
                      <td className="px-4 py-3 text-[#64748B]">{listing.leads_count}</td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {new Date(listing.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/listings/new?edit=${listing.id}`}
                            className="p-1.5 text-slate-400 hover:text-[#2563EB] rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Link>
                          {listing.status === "active" ? (
                            <button
                              onClick={() => void updateStatus(listing.id, "draft")}
                              disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-yellow-600 rounded transition-colors"
                              title="Deactivate"
                            >
                              <PauseCircle size={14} />
                            </button>
                          ) : listing.status === "draft" ? (
                            <button
                              onClick={() => void updateStatus(listing.id, "active")}
                              disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-green-600 rounded transition-colors"
                              title="Activate"
                            >
                              <CheckCircle size={14} />
                            </button>
                          ) : null}
                          {listing.status !== "sold" && (
                            <button
                              onClick={() => void updateStatus(listing.id, "sold")}
                              disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors text-xs font-semibold"
                              title="Mark as Sold"
                            >
                              Sold
                            </button>
                          )}
                          <button
                            onClick={() => void deleteListing(listing.id)}
                            disabled={isLoading}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((listing) => {
              const img = getPrimaryImage(listing.images);
              const sc = statusConfig[listing.status];
              const isLoading = loadingId === listing.id;
              return (
                <div key={listing.id} className={`p-4 ${isLoading ? "opacity-50" : ""}`}>
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Plane size={16} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0F172A] text-sm truncate">{listing.title}</p>
                      <p className="text-[#2563EB] font-semibold text-sm mt-0.5">
                        {listing.currency} {listing.asking_price.toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full h-fit ${sc.cls}`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1"><Eye size={11} /> {listing.views_count}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {listing.leads_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/listings/new?edit=${listing.id}`} className="p-1.5 text-slate-400 hover:text-[#2563EB]">
                        <Pencil size={14} />
                      </Link>
                      {listing.status === "active" ? (
                        <button onClick={() => void updateStatus(listing.id, "draft")} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-yellow-600">
                          <PauseCircle size={14} />
                        </button>
                      ) : listing.status === "draft" ? (
                        <button onClick={() => void updateStatus(listing.id, "active")} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-green-600">
                          <CheckCircle size={14} />
                        </button>
                      ) : null}
                      <button onClick={() => void deleteListing(listing.id)} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
