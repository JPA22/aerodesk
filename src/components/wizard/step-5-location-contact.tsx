"use client";

import { Mail, Phone, MessageCircle } from "lucide-react";
import type { WizardForm } from "./types";
import { BRAZIL_STATES } from "@/lib/brazil-states";

interface Props {
  form: WizardForm;
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent";

const labelClass = "block text-sm font-semibold text-[#0F172A] mb-1.5";

const CONTACT_OPTIONS = [
  { field: "contact_email" as const, label: "Email", Icon: Mail },
  { field: "contact_phone" as const, label: "Phone", Icon: Phone },
  { field: "contact_whatsapp" as const, label: "WhatsApp", Icon: MessageCircle },
];

export default function Step5LocationContact({ form }: Props) {
  const { register, watch, setValue, formState: { errors } } = form;

  const country = watch("location_country");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">Location & contact</h2>
        <p className="text-[#64748B] text-sm">
          Where is the aircraft based? How should buyers reach you?
        </p>
      </div>

      {/* Country */}
      <div>
        <label className={labelClass}>Country *</label>
        <select {...register("location_country")} className={inputClass}>
          <option value="Brazil">Brazil</option>
          <option value="Argentina">Argentina</option>
          <option value="Chile">Chile</option>
          <option value="Colombia">Colombia</option>
          <option value="Mexico">Mexico</option>
          <option value="United States">United States</option>
          <option value="Panama">Panama</option>
          <option value="Uruguay">Uruguay</option>
          <option value="Paraguay">Paraguay</option>
          <option value="Peru">Peru</option>
          <option value="Other">Other</option>
        </select>
        {errors.location_country && (
          <p className="text-red-600 text-xs mt-1">{errors.location_country.message}</p>
        )}
      </div>

      {/* State + City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>State *</label>
          {country === "Brazil" ? (
            <select {...register("location_state")} className={inputClass}>
              <option value="">Select state…</option>
              {BRAZIL_STATES.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="State / Province"
              {...register("location_state")}
              className={inputClass}
            />
          )}
          {errors.location_state && (
            <p className="text-red-600 text-xs mt-1">{errors.location_state.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input
            type="text"
            placeholder="e.g. São Paulo"
            {...register("location_city")}
            className={inputClass}
          />
          {errors.location_city && (
            <p className="text-red-600 text-xs mt-1">{errors.location_city.message}</p>
          )}
        </div>
      </div>

      {/* Contact methods */}
      <div>
        <label className={labelClass}>How should buyers contact you? *</label>
        <div className="flex gap-3">
          {CONTACT_OPTIONS.map(({ field, label, Icon }) => {
            const checked = watch(field);
            return (
              <button
                key={field}
                type="button"
                onClick={() => setValue(field, !checked)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                  checked
                    ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                    : "border-slate-200 text-[#64748B] hover:border-slate-300"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone number */}
      {(watch("contact_phone") || watch("contact_whatsapp")) && (
        <div>
          <label className={labelClass}>Phone / WhatsApp number</label>
          <input
            type="tel"
            placeholder="+55 11 99999-9999"
            {...register("phone")}
            className={inputClass}
          />
        </div>
      )}

      {/* Additional notes */}
      <div>
        <label className={labelClass}>Additional notes</label>
        <textarea
          rows={3}
          placeholder="Any additional information for buyers (viewing location, availability for demo flights, owner history, etc.)"
          {...register("additional_notes")}
          className={inputClass + " resize-none"}
        />
      </div>
    </div>
  );
}
