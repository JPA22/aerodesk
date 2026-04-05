"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Trash2,
  FileText,
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/components/providers/language-provider";
import { DDBadgeLarge, type DDTier } from "@/components/ui/dd-badge";

// ── Types ────────────────────────────────────────────────────────────────────

interface Document {
  id: string;
  category: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  year: number;
  dd_tier: string | null;
  dd_score: number | null;
  dd_analysis: DDAnalysis | null;
  dd_analyzed_at: string | null;
  aircraft_models: {
    name: string;
    category: string;
    manufacturers: { name: string };
  };
}

interface DDAnalysis {
  score: number;
  tier: string;
  covered: string[];
  uncovered: string[];
  strengths: string[];
  gaps: string[];
  summary: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DOC_CATEGORIES = [
  "airworthiness_certificate",
  "registration_certificate",
  "logbook_airframe",
  "logbook_engine",
  "logbook_propeller",
  "maintenance_records",
  "ad_compliance",
  "insurance_certificate",
  "weight_balance",
  "equipment_list",
  "pre_purchase_inspection",
  "other",
] as const;

const CRITICAL_CATEGORIES = new Set([
  "airworthiness_certificate",
  "registration_certificate",
  "logbook_airframe",
  "logbook_engine",
  "maintenance_records",
]);

// ── Main component ──────────────────────────────────────────────────────────

export default function DocumentsClient({
  listing,
  documents: initialDocs,
}: {
  listing: Listing;
  documents: Document[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();

  const [docs, setDocs] = useState<Document[]>(initialDocs);
  const [uploadingCat, setUploadingCat] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DDAnalysis | null>(
    listing.dd_analysis as DDAnalysis | null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  const model = listing.aircraft_models;
  const docsByCategory = DOC_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = docs.filter((d) => d.category === cat);
      return acc;
    },
    {} as Record<string, Document[]>
  );

  // ── Upload ───────────────────────────────────────────────────────────────
  function triggerUpload(category: string) {
    setPendingCategory(category);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingCategory) return;

    setUploadingCat(pendingCategory);
    try {
      // Upload to Supabase Storage
      const ext = file.name.split(".").pop() ?? "pdf";
      const storagePath = `${listing.id}/${pendingCategory}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("listing-documents")
        .upload(storagePath, file, { upsert: false });

      if (uploadErr) {
        alert(`Upload failed: ${uploadErr.message}`);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("listing-documents")
        .getPublicUrl(storagePath);

      // Insert document record
      const { data: newDoc, error: insertErr } = await supabase
        .from("listing_documents")
        .insert({
          listing_id: listing.id,
          category: pendingCategory,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertErr) {
        alert(`Save failed: ${insertErr.message}`);
        return;
      }

      setDocs((prev) => [...prev, newDoc as Document]);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploadingCat(null);
      setPendingCategory(null);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Remove ───────────────────────────────────────────────────────────────
  async function removeDoc(doc: Document) {
    if (!window.confirm(`Remove "${doc.file_name}"?`)) return;
    setRemovingId(doc.id);

    try {
      // Extract storage path from URL
      const urlParts = doc.file_url.split("/listing-documents/");
      if (urlParts[1]) {
        await supabase.storage
          .from("listing-documents")
          .remove([decodeURIComponent(urlParts[1])]);
      }

      await supabase.from("listing_documents").delete().eq("id", doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      alert(`Remove failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRemovingId(null);
    }
  }

  // ── AI Analysis ──────────────────────────────────────────────────────────
  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/dd-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Analysis failed: ${data.error}`);
        return;
      }

      setAnalysisResult(data as DDAnalysis);
      router.refresh(); // Re-fetch server data (updates dd_tier on listing)
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAnalyzing(false);
    }
  }

  const totalDocs = docs.length;
  const coveredCats = new Set(docs.map((d) => d.category));
  const criticalCovered = [...CRITICAL_CATEGORIES].filter((c) => coveredCats.has(c)).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv,.txt"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#2563EB] mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> {t.common.back}
        </Link>
        <h1 className="text-2xl font-bold text-[#0F172A]">{t.dd.title}</h1>
        <p className="text-[#64748B] text-sm mt-1">
          {listing.year} {model.manufacturers.name} {model.name} — {listing.title}
        </p>
        <p className="text-[#64748B] text-xs mt-2 max-w-2xl">{t.dd.subtitle}</p>
      </div>

      {/* Current tier badge */}
      {listing.dd_tier && (
        <div className="mb-6">
          <DDBadgeLarge
            tier={listing.dd_tier as DDTier}
            score={listing.dd_score}
          />
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center gap-6 text-sm">
        <div>
          <span className="text-[#64748B]">Documents:</span>{" "}
          <span className="font-semibold text-[#0F172A]">{totalDocs}</span>
        </div>
        <div>
          <span className="text-[#64748B]">Categories:</span>{" "}
          <span className="font-semibold text-[#0F172A]">{coveredCats.size} / {DOC_CATEGORIES.length - 1}</span>
        </div>
        <div>
          <span className="text-[#64748B]">Critical:</span>{" "}
          <span className={`font-semibold ${criticalCovered === CRITICAL_CATEGORIES.size ? "text-emerald-600" : "text-amber-600"}`}>
            {criticalCovered} / {CRITICAL_CATEGORIES.size}
          </span>
        </div>
        <div className="flex-1" />
        <button
          onClick={runAnalysis}
          disabled={analyzing || totalDocs === 0}
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          {analyzing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {t.dd.analyzing}
            </>
          ) : (
            <>
              <Sparkles size={14} />
              {analysisResult ? t.dd.reanalyze : t.dd.runAnalysis}
            </>
          )}
        </button>
      </div>

      {/* Document categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {DOC_CATEGORIES.map((cat) => {
          const catDocs = docsByCategory[cat];
          const isCritical = CRITICAL_CATEGORIES.has(cat);
          const isUploading = uploadingCat === cat;
          const catLabel = t.dd.categories[cat as keyof typeof t.dd.categories];

          return (
            <div
              key={cat}
              className={`bg-white rounded-xl border p-4 ${
                catDocs.length > 0
                  ? "border-emerald-200 bg-emerald-50/30"
                  : isCritical
                    ? "border-amber-200"
                    : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText
                    size={16}
                    className={catDocs.length > 0 ? "text-emerald-600" : "text-slate-400"}
                  />
                  <span className="text-sm font-semibold text-[#0F172A]">{catLabel}</span>
                  {isCritical && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      Critical
                    </span>
                  )}
                </div>
                <button
                  onClick={() => triggerUpload(cat)}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#3B82F6] disabled:opacity-50 transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      {t.dd.uploading}
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      {t.dd.uploadDoc}
                    </>
                  )}
                </button>
              </div>

              {catDocs.length > 0 ? (
                <div className="space-y-1.5">
                  {catDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-100"
                    >
                      <FileText size={12} className="text-emerald-500 flex-shrink-0" />
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0F172A] hover:text-[#2563EB] truncate flex-1 transition-colors"
                      >
                        {doc.file_name}
                      </a>
                      {doc.file_size && (
                        <span className="text-[10px] text-[#64748B] flex-shrink-0">
                          {Math.round(doc.file_size / 1024)} KB
                        </span>
                      )}
                      <button
                        onClick={() => void removeDoc(doc)}
                        disabled={removingId === doc.id}
                        className="text-slate-300 hover:text-red-500 flex-shrink-0 transition-colors"
                        title={t.dd.removeDoc}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] mt-1">
                  {isCritical ? "⚠ Recommended for higher tier" : "Optional"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-[#2563EB]" />
            <h2 className="font-bold text-[#0F172A] text-lg">{t.dd.analysisResult}</h2>
          </div>

          {/* Score bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#64748B]">{t.dd.coverageLabel}</span>
              <span className="text-sm font-bold text-[#0F172A]">{analysisResult.score}/100</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  analysisResult.score >= 80
                    ? "bg-gradient-to-r from-yellow-400 to-amber-400"
                    : analysisResult.score >= 50
                      ? "bg-gradient-to-r from-slate-400 to-slate-500"
                      : "bg-gradient-to-r from-amber-600 to-orange-500"
                }`}
                style={{ width: `${analysisResult.score}%` }}
              />
            </div>
          </div>

          {/* Summary */}
          {analysisResult.summary && (
            <p className="text-sm text-[#64748B] mb-5 leading-relaxed bg-slate-50 rounded-lg p-3">
              {analysisResult.summary}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {analysisResult.strengths.length > 0 && (
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle size={12} /> {t.dd.strengths}
                </p>
                <ul className="space-y-1.5">
                  {analysisResult.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-[#0F172A] flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {analysisResult.gaps.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {t.dd.gaps}
                </p>
                <ul className="space-y-1.5">
                  {analysisResult.gaps.map((g, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">○</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {listing.dd_analyzed_at && (
            <p className="text-[10px] text-[#64748B] mt-4 pt-3 border-t border-slate-100">
              {t.dd.lastAnalyzed}: {new Date(listing.dd_analyzed_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
