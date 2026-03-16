"use client";

import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface WizardProgressProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (n: number) => void;
}

export default function WizardProgress({
  currentStep,
  steps,
  onStepClick,
}: WizardProgressProps) {
  return (
    <div className="flex items-start">
      {steps.map((step, idx) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        const clickable = done;

        return (
          <div key={step.id} className="flex items-start flex-1">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => clickable && onStepClick?.(step.id)}
                disabled={!clickable}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? "bg-[#2563EB] text-white cursor-pointer hover:bg-[#3B82F6]"
                    : active
                      ? "bg-[#0F172A] text-white ring-4 ring-[#0F172A]/10"
                      : "bg-slate-200 text-slate-400 cursor-default"
                }`}
              >
                {done ? <Check size={13} strokeWidth={3} /> : step.id}
              </button>
              <span
                className={`text-xs leading-tight text-center max-w-[56px] hidden sm:block ${
                  active
                    ? "text-[#0F172A] font-semibold"
                    : done
                      ? "text-[#2563EB]"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mt-4 mx-1 transition-colors ${
                  done ? "bg-[#2563EB]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
