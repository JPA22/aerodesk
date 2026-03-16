"use client";

import type { WizardForm } from "./types";

interface Props {
  form: WizardForm;
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent";

const labelClass = "block text-sm font-semibold text-[#0F172A] mb-1.5";

export default function Step2AircraftDetails({ form }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">Aircraft details</h2>
        <p className="text-[#64748B] text-sm">
          Accurate information builds buyer trust and improves search ranking.
        </p>
      </div>

      {/* Year + Registration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Year *</label>
          <input
            type="number"
            min={1950}
            max={2026}
            placeholder="e.g. 2019"
            {...register("year", { valueAsNumber: true })}
            className={inputClass}
          />
          {errors.year && (
            <p className="text-red-600 text-xs mt-1">{errors.year.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Registration</label>
          <input
            type="text"
            placeholder="e.g. PR-AXY or N123AB"
            {...register("registration_number")}
            className={inputClass}
          />
        </div>
      </div>

      {/* Serial number */}
      <div>
        <label className={labelClass}>Serial number</label>
        <input
          type="text"
          placeholder="Aircraft serial number"
          {...register("serial_number")}
          className={inputClass}
        />
      </div>

      {/* TT / SMOH */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Total Time (TT)</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              placeholder="0"
              {...register("total_time_hours")}
              className={inputClass + " pr-12"}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              hrs
            </span>
          </div>
        </div>
        <div>
          <label className={labelClass}>Engine SMOH</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              placeholder="0"
              {...register("engine_time_smoh")}
              className={inputClass + " pr-12"}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              hrs
            </span>
          </div>
        </div>
      </div>

      {/* Engine program */}
      <div>
        <label className={labelClass}>Engine maintenance program</label>
        <select {...register("engine_program")} className={inputClass}>
          <option value="enrolled">Enrolled (e.g. MSP, ESP, JSSI)</option>
          <option value="not_enrolled">Not enrolled</option>
          <option value="na">N/A — piston or non-applicable</option>
        </select>
        <p className="text-xs text-[#64748B] mt-1">
          Enrolled engines command significantly higher prices.
        </p>
      </div>

      {/* Avionics */}
      <div>
        <label className={labelClass}>Avionics description</label>
        <textarea
          rows={3}
          placeholder="e.g. Garmin G1000 NXi, ADS-B Out (WAAS), Traffic, XM Weather, Synthetic Vision, GFC 700 Autopilot"
          {...register("avionics_description")}
          className={inputClass + " resize-none"}
        />
        <p className="text-xs text-[#64748B] mt-1">
          List the major avionics and navigation equipment installed.
        </p>
      </div>
    </div>
  );
}
