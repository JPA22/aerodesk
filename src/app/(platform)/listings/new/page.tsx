"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Manufacturer, AircraftModel } from "@/types/database";

import {
  wizardSchema,
  STEP_FIELDS,
  WIZARD_DEFAULTS,
  WIZARD_STORAGE_KEY,
  type WizardData,
  type ImageItem,
} from "@/components/wizard/types";

import WizardProgress from "@/components/wizard/wizard-progress";
import Step1 from "@/components/wizard/step-1-aircraft-type";
import Step2 from "@/components/wizard/step-2-aircraft-details";
import Step3 from "@/components/wizard/step-3-condition-pricing";
import Step4 from "@/components/wizard/step-4-photos";
import Step5 from "@/components/wizard/step-5-location-contact";
import Step6 from "@/components/wizard/step-6-review-publish";

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Aircraft Type" },
  { id: 2, label: "Details" },
  { id: 3, label: "Condition & Price" },
  { id: 4, label: "Photos" },
  { id: 5, label: "Location" },
  { id: 6, label: "Review" },
];

// ── Framer-motion slide variants ──────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 36 : -36 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -36 : 36 }),
};

// ── Load saved wizard state from localStorage ─────────────────────────────────

function loadDraft(): Partial<WizardData> {
  if (typeof window === "undefined") return WIZARD_DEFAULTS;
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (raw) return { ...WIZARD_DEFAULTS, ...(JSON.parse(raw) as Partial<WizardData>) };
  } catch {}
  return WIZARD_DEFAULTS;
}

// ── Page component ────────────────────────────────────────────────────────────

export default function NewListingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<AircraftModel[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const form = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: loadDraft() as WizardData,
    mode: "onChange",
  });

  const watchedManufacturerId = form.watch("manufacturer_id");
  const watchedCategory = form.watch("category");

  // Persist form state to localStorage on every change
  useEffect(() => {
    const { unsubscribe } = form.watch((values) => {
      try {
        localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(values));
      } catch {}
    });
    return unsubscribe;
  }, [form]);

  // Fetch manufacturers once
  useEffect(() => {
    supabase
      .from("manufacturers")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) console.error("[wizard] manufacturers fetch error:", error);
        if (data) {
          setManufacturers(data as unknown as Manufacturer[]);
          // Validate stored manufacturer_id — localStorage may hold a stale UUID
          // from a previous session or a reset database.
          const storedId = form.getValues("manufacturer_id");
          if (storedId && !(data as unknown as Manufacturer[]).find((m) => m.id === storedId)) {
            form.setValue("manufacturer_id", "" as never);
            form.setValue("aircraft_model_id", undefined);
            setModels([]);
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch models when manufacturer OR category changes — filter by both
  useEffect(() => {
    if (!watchedManufacturerId || !watchedCategory) {
      setModels([]);
      return;
    }
    supabase
      .from("aircraft_models")
      .select("*")
      .eq("manufacturer_id", watchedManufacturerId)
      .eq("category", watchedCategory)
      .order("name")
      .then(({ data, error }) => {
        if (error) console.error("[wizard] aircraft_models fetch error:", error);
        if (data) setModels(data as unknown as AircraftModel[]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedManufacturerId, watchedCategory]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const navigate = (n: number) => {
    setDirection(n > step ? 1 : -1);
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step] ?? [];
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }
    if (step < 6) navigate(step + 1);
  };

  const goBack = () => {
    if (step > 1) {
      navigate(step - 1);
    } else {
      router.push("/dashboard/listings");
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handlePublish = async (status: "draft" | "active") => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Safety net: force-stop the spinner after 15s so it never freezes
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setSubmitError("Request timed out after 15 seconds. Check your connection and try again.");
    }, 15_000);

    try {
      const values = form.getValues();

      // Safe auth check (avoids crash if data is unexpectedly null)
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error("Not authenticated — please sign in again.");
      }
      const user = authData.user;

      // Ensure profile row exists (handles users created before the trigger was added)
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });
      if (profileErr) {
        console.error("[wizard] profile upsert error:", profileErr);
        // Non-fatal if profile already exists; only throw if it's a real error
        if (profileErr.code !== "23505") {
          throw new Error(`Profile error (${profileErr.code}): ${profileErr.message}`);
        }
      }

      // Resolve or create model
      let modelId = values.aircraft_model_id;
      if (!modelId && values.custom_model_name && values.manufacturer_id) {
        const { data: newModel, error: modelErr } = await supabase
          .from("aircraft_models")
          .insert({
            manufacturer_id: values.manufacturer_id,
            name: values.custom_model_name,
            category: values.category,
          })
          .select("id")
          .single();
        if (modelErr) throw new Error(`Could not create model (${modelErr.code}): ${modelErr.message}`);
        modelId = (newModel as unknown as { id: string })?.id;
      }
      if (!modelId) throw new Error("Please select a model or enter a custom model name.");

      // Auto-generate listing title
      const mfr = manufacturers.find((m) => m.id === values.manufacturer_id);
      const mdl = models.find((m) => m.id === modelId);
      const title = [values.year, mfr?.name, mdl?.name ?? values.custom_model_name]
        .filter(Boolean)
        .join(" ");

      // Insert aircraft listing
      const { data: listing, error: listingErr } = await supabase
        .from("aircraft_listings")
        .insert({
          seller_id: user.id,
          aircraft_model_id: modelId,
          title: title || "Aircraft Listing",
          year: values.year,
          serial_number: values.serial_number ?? null,
          registration_number: values.registration_number ?? null,
          total_time_hours: values.total_time_hours ? Number(values.total_time_hours) : null,
          engine_time_smoh: values.engine_time_smoh ? Number(values.engine_time_smoh) : null,
          engine_program: values.engine_program,
          avionics_description: values.avionics_description ?? null,
          condition_rating: values.condition_rating,
          maintenance_status: values.maintenance_status,
          passenger_seats: values.passenger_seats ? Number(values.passenger_seats) : null,
          galley_config: values.galley_config || null,
          asking_price: values.price_on_request ? 0 : Number(values.asking_price ?? 0),
          currency: values.currency,
          location_country: values.location_country,
          location_state: values.location_state,
          location_city: values.location_city,
          description: values.additional_notes ?? null,
          status,
          published_at: status === "active" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();

      if (listingErr || !listing) {
        const msg = listingErr
          ? `DB error (${listingErr.code}): ${listingErr.message}${listingErr.details ? ` — ${listingErr.details}` : ""}`
          : "Failed to create listing.";
        throw new Error(msg);
      }

      const listingId = (listing as unknown as { id: string }).id;

      // Upload images and insert records
      const primaryIdx = images.findIndex((img) => img.isPrimary);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const ext = img.file.name.split(".").pop() ?? "jpg";
        const path = `${listingId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("listing-images")
          .upload(path, img.file, { contentType: img.file.type });

        if (uploadErr) {
          console.error("[wizard] image upload error:", uploadErr);
        } else {
          const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
          await supabase.from("listing_images").insert({
            listing_id: listingId,
            image_url: publicUrl,
            display_order: i,
            is_primary: i === (primaryIdx >= 0 ? primaryIdx : 0),
          });
        }
      }

      // Clear saved draft
      try { localStorage.removeItem(WIZARD_STORAGE_KEY); } catch {}

      clearTimeout(timeoutId);
      router.push(`/dashboard?created=1`);
    } catch (err) {
      console.error("[wizard] publish error:", err);
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Create a listing</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Step {step} of {STEPS.length} — {STEPS[step - 1].label}
        </p>
      </div>

      {/* Progress */}
      <WizardProgress currentStep={step} steps={STEPS} onStepClick={navigate} />

      {/* Step content — animated */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-10"
        >
          {step === 1 && (
            <Step1 form={form} manufacturers={manufacturers} models={models} />
          )}
          {step === 2 && <Step2 form={form} />}
          {step === 3 && <Step3 form={form} />}
          {step === 4 && <Step4 images={images} setImages={setImages} />}
          {step === 5 && <Step5 form={form} />}
          {step === 6 && (
            <Step6
              form={form}
              manufacturers={manufacturers}
              models={models}
              images={images}
              onGoToStep={navigate}
              onPublish={handlePublish}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Back / Next navigation (hidden on review step) */}
      {step < 6 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] font-medium text-sm transition-colors"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm shadow-md shadow-blue-900/20"
          >
            {step === 5 ? "Review listing" : "Continue"}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
