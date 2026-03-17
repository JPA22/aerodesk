"use client";

import { Fragment, useState, useEffect, useTransition } from "react";
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
  ClipboardList,
  X,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
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
  sale_price: number | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  sale_notes: string | null;
  sold_at: string | null;
}

const statusConfig: Record<ListingStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-green-100 text-green-700" },
  draft: { label: "Draft", cls: "bg-yellow-100 text-yellow-700" },
  sold: { label: "Sold", cls: "bg-red-100 text-red-600" },
  expired: { label: "Expired", cls: "bg-slate-100 text-slate-500" },
  pending_review: { label: "In Review", cls: "bg-blue-100 text-blue-700" },
};

type Tab = "all" | "active" | "draft" | "sold";

function getPrimaryImage(images: ListingImage[]): string | null {
  const primary = images.find((i) => i.is_primary);
  if (primary) return primary.image_url;
  return [...images].sort((a, b) => a.display_order - b.display_order)[0]?.image_url ?? null;
}

// ── Sale Details Panel ────────────────────────────────────────────────────────

interface SaleDetailsProps {
  listing: Listing;
  onClose: () => void;
  onSaved: (id: string, data: Partial<Listing>) => void;
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors";

function SaleDetailsPanel({ listing, onClose, onSaved }: SaleDetailsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [buyerName, setBuyerName] = useState(listing.buyer_name ?? "");
  const [buyerEmail, setBuyerEmail] = useState(listing.buyer_email ?? "");
  const [buyerPhone, setBuyerPhone] = useState(listing.buyer_phone ?? "");
  const [salePrice, setSalePrice] = useState(listing.sale_price?.toString() ?? "");
  const [saleNotes, setSaleNotes] = useState(listing.sale_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const payload = {
        buyer_name: buyerName || null,
        buyer_email: buyerEmail || null,
        buyer_phone: buyerPhone || null,
        sale_price: salePrice ? parseFloat(salePrice) : null,
        sale_notes: saleNotes || null,
        sold_at: listing.sold_at ?? new Date().toISOString(),
      };
      const { data, error: err } = await supabase
        .from("aircraft_listings")
        .update(payload)
        .eq("id", listing.id)
        .select("id");
      if (err) {
        setError(`Save failed: ${err.message}`);
        return;
      }
      if (!data?.length) {
        setError("Save failed: permission denied. Please re-login and try again.");
        return;
      }
      onSaved(listing.id, payload);
      startTransition(() => router.refresh());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-[#0F172A] text-sm">Sale Details</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Buyer Name</label>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="John Smith"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Buyer Email</label>
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            placeholder="buyer@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">Buyer Phone</label>
          <input
            type="tel"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="e.g. +55 (11) 99963-2204"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1">
            Actual Sale Price ({listing.currency})
          </label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="0"
            className={inputCls}
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-[#64748B] mb-1">Sale Notes</label>
        <textarea
          value={saleNotes}
          onChange={(e) => setSaleNotes(e.target.value)}
          placeholder="Any additional notes about the sale…"
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <Save size={13} />
        {saving ? "Saving…" : "Save Sale Details"}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ListingsClient({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saleDetailsId, setSaleDetailsId] = useState<string | null>(null);

  // ── Optimistic local state (FIX 1: prevents stale-prop race condition) ───────
  const [localListings, setLocalListings] = useState<Listing[]>(listings);
  useEffect(() => {
    setLocalListings(listings);
  }, [listings]);

  const filtered = localListings.filter((l) => {
    if (tab === "all") return true;
    if (tab === "sold") return l.status === "sold";
    return l.status === tab;
  });

  const tabCounts: Record<Tab, number> = {
    all: localListings.length,
    active: localListings.filter((l) => l.status === "active").length,
    draft: localListings.filter((l) => l.status === "draft").length,
    sold: localListings.filter((l) => l.status === "sold").length,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "draft", label: "Drafts" },
    { key: "sold", label: "Sold" },
  ];

  async function updateStatus(listingId: string, status: ListingStatus, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setErrorMsg(null);
    setLoadingId(listingId);

    const payload: { status: ListingStatus; published_at?: string; sold_at?: string } = { status };
    if (status === "active") payload.published_at = new Date().toISOString();
    if (status === "sold") payload.sold_at = new Date().toISOString();

    // Optimistically update local state immediately
    setLocalListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status } : l))
    );

    const supabase = createClient();
    const { data, error } = await supabase
      .from("aircraft_listings")
      .update(payload)
      .eq("id", listingId)
      .select("id");

    setLoadingId(null);
    if (error) {
      setLocalListings(listings);
      setErrorMsg(`Failed to update listing: ${error.message}`);
      return;
    }
    if (!data?.length) {
      setLocalListings(listings);
      setErrorMsg("Update failed: permission denied. Please re-login and try again.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function deleteListing(listingId: string) {
    if (!window.confirm("Delete this listing? This action cannot be undone.")) return;
    setErrorMsg(null);
    setLoadingId(listingId);

    // Optimistically remove from local state
    setLocalListings((prev) => prev.filter((l) => l.id !== listingId));

    const supabase = createClient();
    const { error } = await supabase.from("aircraft_listings").delete().eq("id", listingId);
    setLoadingId(null);
    if (error) {
      setLocalListings(listings); // roll back
      setErrorMsg(`Failed to delete listing: ${error.message}`);
      return;
    }
    startTransition(() => router.refresh());
  }

  function handleSaleDetailsSaved(id: string, data: Partial<Listing>) {
    setLocalListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data } : l))
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Listings</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage your aircraft listings</p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          Add New Listing
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}><X size={16} /></button>
        </div>
      )}

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
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === key ? "bg-slate-100" : "bg-white"}`}>
                {tabCounts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table / Empty */}
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
                  // Capture ID in a const so closures are unambiguous
                  const listingId = listing.id;
                  const img = getPrimaryImage(listing.images);
                  const sc = statusConfig[listing.status];
                  const isLoading = loadingId === listingId;
                  const showSaleDetails = saleDetailsId === listingId;

                  return (
                    <Fragment key={listingId}>
                      <tr
                        className={`hover:bg-slate-50 transition-colors ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/listings/${listingId}`}
                              className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 block hover:opacity-80 transition-opacity"
                            >
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Plane size={14} className="text-slate-300" />
                                </div>
                              )}
                            </Link>
                            <Link
                              href={`/listings/${listingId}`}
                              className="font-medium text-[#0F172A] hover:text-[#2563EB] hover:underline truncate max-w-[200px] transition-colors"
                            >
                              {listing.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#0F172A] font-medium">
                          {formatPrice(listing.asking_price, listing.currency)}
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
                          <div className="flex items-center gap-1.5 justify-end">
                            <Link
                              href={`/listings/new?edit=${listingId}`}
                              className="p-1.5 text-slate-400 hover:text-[#2563EB] rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </Link>

                            {listing.status === "active" && (
                              <button
                                onClick={() => void updateStatus(listingId, "draft", "Deactivate this listing? It will no longer appear in search results.")}
                                disabled={isLoading}
                                className="p-1.5 text-slate-400 hover:text-yellow-600 rounded transition-colors"
                                title="Deactivate"
                              >
                                <PauseCircle size={14} />
                              </button>
                            )}

                            {(listing.status === "draft") && (
                              <button
                                onClick={() => void updateStatus(listingId, "active")}
                                disabled={isLoading}
                                className="p-1.5 text-slate-400 hover:text-green-600 rounded transition-colors"
                                title="Activate"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}

                            {(listing.status === "sold" || listing.status === "expired") && (
                              <button
                                onClick={() => void updateStatus(listingId, "active")}
                                disabled={isLoading}
                                className="p-1.5 text-slate-400 hover:text-green-600 rounded transition-colors"
                                title="Reactivate"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}

                            {listing.status !== "sold" && (
                              <button
                                onClick={() => void updateStatus(listingId, "sold", "Mark this listing as sold?")}
                                disabled={isLoading}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors text-xs font-semibold"
                                title="Mark as Sold"
                              >
                                Sold
                              </button>
                            )}

                            {listing.status === "sold" && (
                              <button
                                onClick={() => setSaleDetailsId(showSaleDetails ? null : listingId)}
                                className="p-1.5 text-slate-400 hover:text-[#2563EB] rounded transition-colors"
                                title="Sale Details"
                              >
                                <ClipboardList size={14} />
                              </button>
                            )}

                            <button
                              onClick={() => void deleteListing(listingId)}
                              disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {showSaleDetails && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <SaleDetailsPanel
                              listing={listing}
                              onClose={() => setSaleDetailsId(null)}
                              onSaved={handleSaleDetailsSaved}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((listing) => {
              const listingId = listing.id;
              const img = getPrimaryImage(listing.images);
              const sc = statusConfig[listing.status];
              const isLoading = loadingId === listingId;
              const showSaleDetails = saleDetailsId === listingId;
              return (
                <div key={listingId} className={isLoading ? "opacity-50 pointer-events-none" : ""}>
                  <div className="p-4">
                    <div className="flex gap-3 mb-3">
                      <Link
                        href={`/listings/${listingId}`}
                        className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 block hover:opacity-80 transition-opacity"
                      >
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Plane size={16} className="text-slate-300" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/listings/${listingId}`}
                          className="font-medium text-[#0F172A] hover:text-[#2563EB] hover:underline text-sm truncate block transition-colors"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-[#2563EB] font-semibold text-sm mt-0.5">
                          {formatPrice(listing.asking_price, listing.currency)}
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
                        <Link href={`/listings/new?edit=${listingId}`} className="p-1.5 text-slate-400 hover:text-[#2563EB]" title="Edit">
                          <Pencil size={14} />
                        </Link>
                        {listing.status === "active" && (
                          <button onClick={() => void updateStatus(listingId, "draft", "Deactivate this listing?")} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-yellow-600" title="Deactivate">
                            <PauseCircle size={14} />
                          </button>
                        )}
                        {listing.status === "draft" && (
                          <button onClick={() => void updateStatus(listingId, "active")} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-green-600" title="Activate">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {(listing.status === "sold" || listing.status === "expired") && (
                          <button onClick={() => void updateStatus(listingId, "active")} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-green-600" title="Reactivate">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {listing.status === "sold" && (
                          <button onClick={() => setSaleDetailsId(showSaleDetails ? null : listingId)} className="p-1.5 text-slate-400 hover:text-[#2563EB]" title="Sale Details">
                            <ClipboardList size={14} />
                          </button>
                        )}
                        <button onClick={() => void deleteListing(listingId)} disabled={isLoading} className="p-1.5 text-slate-400 hover:text-red-500" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {showSaleDetails && (
                    <SaleDetailsPanel
                      listing={listing}
                      onClose={() => setSaleDetailsId(null)}
                      onSaved={handleSaleDetailsSaved}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
