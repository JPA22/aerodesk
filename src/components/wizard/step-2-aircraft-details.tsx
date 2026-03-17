"use client";

import { useController } from "react-hook-form";
import type { WizardForm } from "./types";

interface Props {
  form: WizardForm;
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent";

const labelClass = "block text-sm font-semibold text-[#0F172A] mb-1.5";

/** Controlled number-with-commas input backed by a RHF field (stores raw number). */
function HoursInput({
  form,
  name,
  placeholder,
}: {
  form: WizardForm;
  name: "total_time_hours" | "engine_time_smoh";
  placeholder: string;
}) {
  const { field } = useController({ name, control: form.control });

  const display =
    field.value != null && field.value !== ""
      ? Number(String(field.value).replace(/[^0-9]/g, "")).toLocaleString("en-US")
      : "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    field.onChange(digits === "" ? "" : digits);
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onBlur={field.onBlur}
        ref={field.ref}
        placeholder={placeholder}
        className={inputClass + " pr-12"}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
        hrs
      </span>
    </div>
  );
}

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
          <HoursInput form={form} name="total_time_hours" placeholder="e.g. 1,200" />
        </div>
        <div>
          <label className={labelClass}>Engine SMOH</label>
          <HoursInput form={form} name="engine_time_smoh" placeholder="e.g. 800" />
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

      {/* Passenger seats + Galley */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Passenger seats</label>
          <input
            type="number"
            min={1}
            max={100}
            placeholder="e.g. 9"
            {...register("passenger_seats")}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Galley configuration</label>
          <select {...register("galley_config")} className={inputClass}>
            <option value="">Not specified</option>
            <option value="none">No galley</option>
            <option value="forward">Forward galley</option>
            <option value="aft">Aft galley</option>
            <option value="both">Both (forward &amp; aft)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
