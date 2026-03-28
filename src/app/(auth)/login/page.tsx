"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/components/providers/language-provider";
import LanguageSelector from "@/components/layout/LanguageSelector";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const supabase = createClient();

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) {
      setServerError(error.message === "Invalid login credentials" ? t.auth.incorrectCredentials : error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#0d2347] to-[#1e3a6e] flex-col justify-between p-12">
        <a href="/" className="flex items-baseline">
          <span className="text-2xl font-bold text-white">Aero</span>
          <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
        </a>
        <div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            {t.auth.brandTitle1}<br />
            <span className="text-[#3B82F6]">{t.auth.brandTitle2}</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-sm">{t.auth.brandSubtitle}</p>
        </div>
        <div className="flex gap-10">
          {[
            { value: "2,500+", label: t.auth.aircraftListed },
            { value: "500+", label: t.auth.verifiedDealers },
            { value: "12", label: t.auth.countries },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <a href="/" className="flex items-baseline lg:hidden">
              <span className="text-2xl font-bold text-[#0F172A]">Aero</span>
              <span className="text-2xl font-bold text-[#3B82F6]">Desk</span>
            </a>
            <LanguageSelector />
          </div>

          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">{t.auth.welcomeBack}</h1>
          <p className="text-[#64748B] text-sm mb-8">{t.auth.signInSubtitle}</p>

          <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-[#0F172A] hover:bg-slate-50 transition-colors disabled:opacity-50 mb-6">
            {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
            {t.auth.continueGoogle}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <hr className="flex-1 border-slate-200" />
            <span className="text-xs text-slate-400 font-medium">{t.auth.orSignInEmail}</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">{serverError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{t.auth.email}</label>
              <input type="email" autoComplete="email" placeholder={t.auth.emailPlaceholder} {...register("email")}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent" />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#0F172A]">{t.auth.password}</label>
                <Link href="/forgot-password" className="text-xs text-[#2563EB] hover:underline">{t.auth.forgotPassword}</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder={t.auth.passwordPlaceholder} {...register("password")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? "Hide" : "Show"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting || googleLoading}
              className="w-full bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-60 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-1">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {t.auth.signIn}
            </button>
          </form>

          <p className="text-center text-sm text-[#64748B] mt-6">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="text-[#2563EB] font-medium hover:underline">{t.auth.createAccount}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
