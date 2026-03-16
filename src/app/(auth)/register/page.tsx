"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm_password: z.string(),
    role: z.enum(["buyer", "private_seller", "dealer"] as const, {
      error: "Please select an account type",
    }),
    terms: z
      .boolean()
      .refine((v) => v === true, "You must accept the terms to continue"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLES = [
  {
    value: "buyer" as const,
    label: "Buy aircraft",
    description: "Looking to purchase a pre-owned aircraft",
  },
  {
    value: "private_seller" as const,
    label: "Sell privately",
    description: "Selling my own aircraft as a private owner",
  },
  {
    value: "dealer" as const,
    label: "I'm a dealer",
    description: "Professional aviation broker or dealer",
  },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "buyer", terms: false },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, role: data.role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-3">
            Check your email
          </h2>
          <p className="text-[#64748B] leading-relaxed mb-6">
            We&apos;ve sent a confirmation link to your email. Click it to
            activate your account and sign in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#3B82F6] transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#0d2347] to-[#1e3a6e] flex-col justify-between p-12">
        <a href="/" className="flex items-baseline">
          <span className="text-2xl font-bold text-white">Aero</span>
          <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
        </a>

        <div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Join the future<br />
            <span className="text-[#3B82F6]">of aviation commerce.</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
            Whether you&apos;re buying, selling privately, or running a brokerage
            — AeroDesk has the tools you need.
          </p>
        </div>

        <ul className="space-y-3">
          {[
            "AI-powered market valuations",
            "Professional listing galleries",
            "Secure lead management",
            "ANAC-ready documentation tools",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <a href="/" className="flex items-baseline mb-8 lg:hidden">
            <span className="text-2xl font-bold text-[#0F172A]">Aero</span>
            <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
          </a>

          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
            Create your account
          </h1>
          <p className="text-[#64748B] text-sm mb-8">
            Join AeroDesk — free to get started
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="João Silva"
                {...register("full_name")}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
              {errors.full_name && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...register("password")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  {...register("confirm_password")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                I want to…
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue("role", r.value)}
                    className={`text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      selectedRole === r.value
                        ? "border-[#2563EB] bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        selectedRole === r.value
                          ? "text-[#2563EB]"
                          : "text-[#0F172A]"
                      }`}
                    >
                      {r.label}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {r.description}
                    </p>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-red-600 text-xs mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("terms")}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[#64748B]">
                I agree to the{" "}
                <Link href="/terms" className="text-[#2563EB] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#2563EB] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-600 text-xs -mt-2">{errors.terms.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-60 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Create account
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#2563EB] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
