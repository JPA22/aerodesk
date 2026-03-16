"use client";

import type { WizardForm } from "./types";

interface Props {
  form: WizardForm;
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent";

const labelClass = "block text-sm font-semibold text-[#0F172A] mb-1.5";

const CONDITION_LABELS: Record<number, string> = {
  1: "Project",
  2: "Poor",
  3: "Fair",
  4: "Below Average",
  5: "Good",
  6: "Very Good",
  7: "Above Average",
  8: "Excellent",
  9: "Show Quality",
  10: "Like New",
};

const CONDITION_COLOR: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f97316",
  4: "#eab308",
  5: "#84cc16",
  6: "#22c55e",
  7: "#22c55e",
  8: "#10b981",
  9: "#0ea5e9",
  10: "#2563EB",
};

export default function Step3ConditionPricing({ form }: Props) {
  const { register, watch, setValue, formState: { errors } } = form;

  const conditionRating = watch("condition_rating") ?? 5;
  const hasDamage = watch("has_damage_history") ?? false;
  const priceOnRequest = watch("price_on_request") ?? false;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">Condition & pricing</h2>
        <p className="text-[#64748B] text-sm">
          Honest condition ratings build trust with serious buyers.
        </p>
      </div>

      {/* Condition rating slider */}
      <div>
        <label className={labelClass}>Condition rating *</label>
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-bold" style={{ color: CONDITION_COLOR[conditionRating] }}>
              {conditionRating}/10
            </span>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: CONDITION_COLOR[conditionRating] + "20",
                color: CONDITION_COLOR[conditionRating],
              }}
            >
              {CONDITION_LABELS[conditionRating]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={conditionRating}
            onChange={(e) =>
              setValue("condition_rating", parseInt(e.target.value), {
                shouldValidate: true,
              })
            }
            className="w-full accent-[#2563EB] cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-400">1 — Project</span>
            <span className="text-xs text-slate-400">10 — Like New</span>
          </div>
        </div>
      </div>

      {/* Maintenance status */}
      <div>
        <label className={labelClass}>Maintenance status *</label>
        <select {...register("maintenance_status")} className={inputClass}>
          <option value="">Select status…</option>
          <option value="annual_current">Annual inspection current</option>
          <option value="inspection_due_6mo">Inspection due within 6 months</option>
          <option value="needs_inspection">Needs inspection</option>
          <option value="fresh_annual">Fresh annual — just completed</option>
        </select>
        {errors.maintenance_status && (
          <p className="text-red-600 text-xs mt-1">{errors.maintenance_status.message}</p>
        )}
      </div>

      {/* Damage history */}
      <div>
        <label className={labelClass}>Damage history</label>
        <div className="flex gap-3">
          {[
            { label: "No damage history", value: false },
            { label: "Yes, has damage history", value: true },
          ].map(({ label, value }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setValue("has_damage_history", value)}
              className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                hasDamage === value
                  ? value
                    ? "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                  : "border-slate-200 text-[#64748B] hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {hasDamage && (
          <textarea
            rows={3}
            placeholder="Briefly describe the damage history and repairs…"
            {...register("damage_description")}
            className={inputClass + " mt-3 resize-none"}
          />
        )}
      </div>

      {/* Pricing */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass + " mb-0"}>Asking price</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={priceOnRequest}
              onChange={(e) => setValue("price_on_request", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#2563EB]"
            />
            <span className="text-sm text-[#64748B]">Price on request</span>
          </label>
        </div>

        {!priceOnRequest && (
          <div className="flex gap-3">
            <select {...register("currency")} className={inputClass + " w-28 flex-shrink-0"}>
              <option value="USD">USD $</option>
              <option value="BRL">BRL R$</option>
              <option value="EUR">EUR €</option>
            </select>
            <input
              type="number"
              min={0}
              placeholder="0"
              {...register("asking_price")}
              className={inputClass}
            />
          </div>
        )}

        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("price_negotiable")}
            className="w-4 h-4 rounded border-slate-300 text-[#2563EB]"
          />
          <span className="text-sm text-[#64748B]">Price is negotiable</span>
        </label>
      </div>
    </div>
  );
}
