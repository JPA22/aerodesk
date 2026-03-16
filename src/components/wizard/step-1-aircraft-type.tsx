"use client";

import { useState } from "react";
import { Zap, Wind, Gauge, Plane, Plus } from "lucide-react";
import type { WizardForm } from "./types";
import type { Manufacturer, AircraftModel } from "@/types/database";

interface Props {
  form: WizardForm;
  manufacturers: Manufacturer[];
  models: AircraftModel[];
}

const CATEGORIES = [
  { value: "jet", label: "Jets", description: "Light, midsize & heavy jets", Icon: Zap },
  { value: "turboprop", label: "Turboprops", description: "Single & twin turboprops", Icon: Wind },
  { value: "piston", label: "Pistons", description: "Single & multi-engine piston", Icon: Gauge },
  { value: "helicopter", label: "Helicopters", description: "Turbine & piston rotorcraft", Icon: Plane },
] as const;

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent";

export default function Step1AircraftType({ form, manufacturers, models }: Props) {
  const [showCustomModel, setShowCustomModel] = useState(false);
  const { register, watch, setValue, formState: { errors } } = form;

  const selectedCategory = watch("category");
  const selectedManufacturerId = watch("manufacturer_id");
  const selectedModelId = watch("aircraft_model_id");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">What type of aircraft?</h2>
        <p className="text-[#64748B] text-sm">Select the category that best describes your aircraft.</p>
      </div>

      {/* Category cards */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Category *</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(({ value, label, description, Icon }) => {
            const selected = selectedCategory === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setValue("category", value, { shouldValidate: true })}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? "border-[#2563EB] bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    selected ? "bg-[#2563EB] text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <p
                  className={`font-semibold text-sm ${selected ? "text-[#2563EB]" : "text-[#0F172A]"}`}
                >
                  {label}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="text-red-600 text-xs mt-2">{errors.category.message}</p>
        )}
      </div>

      {/* Manufacturer */}
      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
          Manufacturer *
        </label>
        <select
          {...register("manufacturer_id")}
          className={inputClass}
        >
          <option value="">Select manufacturer…</option>
          {manufacturers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} {m.country ? `(${m.country})` : ""}
            </option>
          ))}
        </select>
        {errors.manufacturer_id && (
          <p className="text-red-600 text-xs mt-1">{errors.manufacturer_id.message}</p>
        )}
      </div>

      {/* Model — only shown once a manufacturer is selected */}
      {selectedManufacturerId && (
        <div>
          <label className="block text-sm font-semibold text-[#0F172A] mb-2">
            Model
          </label>
          {!showCustomModel ? (
            <>
              <select
                value={selectedModelId ?? ""}
                onChange={(e) =>
                  setValue("aircraft_model_id", e.target.value || undefined, {
                    shouldValidate: true,
                  })
                }
                className={inputClass}
              >
                <option value="">Select model…</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setShowCustomModel(true);
                  setValue("aircraft_model_id", undefined);
                }}
                className="mt-2 flex items-center gap-1.5 text-[#2563EB] text-xs font-medium hover:underline"
              >
                <Plus size={12} /> My model isn&apos;t listed
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="e.g. Citation CJ4"
                {...register("custom_model_name")}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomModel(false);
                  setValue("custom_model_name", undefined);
                }}
                className="mt-2 text-[#64748B] text-xs hover:underline"
              >
                ← Back to model list
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
