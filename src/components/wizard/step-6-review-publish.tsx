"use client";

import { Loader2, Pencil, ImageIcon } from "lucide-react";
import type { WizardForm, ImageItem } from "./types";
import type { Manufacturer, AircraftModel } from "@/types/database";

interface Props {
  form: WizardForm;
  manufacturers: Manufacturer[];
  models: AircraftModel[];
  images: ImageItem[];
  onGoToStep: (n: number) => void;
  onPublish: (status: "draft" | "active") => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

const CONDITION_LABEL: Record<number, string> = {
  1: "Project", 2: "Poor", 3: "Fair", 4: "Below Average", 5: "Good",
  6: "Very Good", 7: "Above Average", 8: "Excellent", 9: "Show Quality", 10: "Like New",
};
const MAINTENANCE_LABEL: Record<string, string> = {
  annual_current: "Annual inspection current",
  inspection_due_6mo: "Due within 6 months",
  needs_inspection: "Needs inspection",
  fresh_annual: "Fresh annual",
};
const ENGINE_PROGRAM_LABEL = { enrolled: "Enrolled", not_enrolled: "Not enrolled", na: "N/A" };
const CURRENCY_SYMBOL = { USD: "$", BRL: "R$", EUR: "€" };

function Section({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-[#2563EB] text-xs font-medium hover:underline"
        >
          <Pencil size={12} /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className="text-xs font-medium text-[#0F172A] text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function Step6ReviewPublish({
  form,
  manufacturers,
  models,
  images,
  onGoToStep,
  onPublish,
  isSubmitting,
  submitError,
}: Props) {
  const values = form.getValues();

  const manufacturer = manufacturers.find((m) => m.id === values.manufacturer_id);
  const model = models.find((m) => m.id === values.aircraft_model_id);
  const currency = values.currency ?? "USD";
  const sym = CURRENCY_SYMBOL[currency];
  const priceDisplay = values.price_on_request
    ? "Price on request"
    : values.asking_price
      ? `${sym} ${Number(values.asking_price).toLocaleString()}`
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">Review your listing</h2>
        <p className="text-[#64748B] text-sm">
          Everything look good? Publish now or save a draft to finish later.
        </p>
      </div>

      {/* Step 1 */}
      <Section title="Aircraft type" step={1} onEdit={() => onGoToStep(1)}>
        <Row label="Category" value={values.category ? values.category.charAt(0).toUpperCase() + values.category.slice(1) : undefined} />
        <Row label="Manufacturer" value={manufacturer?.name} />
        <Row label="Model" value={model?.name ?? values.custom_model_name} />
      </Section>

      {/* Step 2 */}
      <Section title="Aircraft details" step={2} onEdit={() => onGoToStep(2)}>
        <Row label="Year" value={values.year} />
        <Row label="Registration" value={values.registration_number} />
        <Row label="Serial number" value={values.serial_number} />
        <Row label="Total time (TT)" value={values.total_time_hours ? `${values.total_time_hours} hrs` : undefined} />
        <Row label="Engine SMOH" value={values.engine_time_smoh ? `${values.engine_time_smoh} hrs` : undefined} />
        <Row label="Engine program" value={ENGINE_PROGRAM_LABEL[values.engine_program ?? "na"]} />
        <Row label="Avionics" value={values.avionics_description} />
      </Section>

      {/* Step 3 */}
      <Section title="Condition & pricing" step={3} onEdit={() => onGoToStep(3)}>
        <Row label="Condition" value={`${values.condition_rating}/10 — ${CONDITION_LABEL[values.condition_rating ?? 5]}`} />
        <Row label="Maintenance" value={MAINTENANCE_LABEL[values.maintenance_status ?? ""] ?? values.maintenance_status} />
        <Row label="Damage history" value={values.has_damage_history ? "Yes" : "None"} />
        <Row label="Asking price" value={priceDisplay} />
        <Row label="Negotiable" value={values.price_negotiable ? "Yes" : "No"} />
      </Section>

      {/* Step 4 */}
      <Section title="Photos" step={4} onEdit={() => onGoToStep(4)}>
        {images.length === 0 ? (
          <div className="flex items-center gap-2 text-[#64748B] text-sm py-2">
            <ImageIcon size={16} />
            No photos added — listing will have lower visibility
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.slice(0, 6).map((img, i) => (
              <div key={img.id} className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={`Photo ${i + 1}`}
                  className="w-16 h-12 object-cover rounded-lg"
                />
                {img.isPrimary && (
                  <span className="absolute top-0.5 left-0.5 text-xs bg-[#2563EB] text-white px-1 rounded">
                    ★
                  </span>
                )}
              </div>
            ))}
            {images.length > 6 && (
              <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-[#64748B] flex-shrink-0">
                +{images.length - 6}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Step 5 */}
      <Section title="Location & contact" step={5} onEdit={() => onGoToStep(5)}>
        <Row
          label="Location"
          value={
            [values.location_city, values.location_state, values.location_country]
              .filter(Boolean)
              .join(", ") || undefined
          }
        />
        <Row
          label="Contact via"
          value={[
            values.contact_email && "Email",
            values.contact_phone && "Phone",
            values.contact_whatsapp && "WhatsApp",
          ]
            .filter(Boolean)
            .join(", ")}
        />
        <Row label="Phone" value={values.phone} />
      </Section>

      {/* Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {submitError}
        </div>
      )}

      {/* Publish actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => void onPublish("draft")}
          disabled={isSubmitting}
          className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-[#0F172A] font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={() => void onPublish("active")}
          disabled={isSubmitting}
          className="flex-1 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-lg shadow-blue-900/20"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Publishing…" : "Publish listing"}
        </button>
      </div>

      <p className="text-center text-xs text-[#64748B]">
        By publishing you agree to our{" "}
        <a href="/terms" className="text-[#2563EB] hover:underline">
          Listing Terms
        </a>
        . Listings are reviewed within 24 hours.
      </p>
    </div>
  );
}
