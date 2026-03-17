"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Bell, LogOut, Save, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/types/database";

interface SettingsClientProps {
  userId: string;
  email: string;
  profile: {
    full_name: string;
    phone: string;
    avatar_url: string | null;
    role: UserRole;
  };
  dealerProfile: {
    company_name: string;
    cnpj: string;
    website: string;
    description: string;
    logo_url: string | null;
  } | null;
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <Icon size={18} className="text-[#64748B]" />
        <h2 className="font-semibold text-[#0F172A]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors";

export default function SettingsClient({
  userId,
  email,
  profile,
  dealerProfile,
}: SettingsClientProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);

  const [companyName, setCompanyName] = useState(dealerProfile?.company_name ?? "");
  const [cnpj, setCnpj] = useState(dealerProfile?.cnpj ?? "");
  const [website, setWebsite] = useState(dealerProfile?.website ?? "");
  const [description, setDescription] = useState(dealerProfile?.description ?? "");

  const [emailNotifications, setEmailNotifications] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDealer = profile.role === "dealer" || profile.role === "private_seller";

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const profileResult = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", userId);

    let dealerError = false;
    if (isDealer && dealerProfile) {
      const { error } = await supabase
        .from("dealer_profiles")
        .update({
          company_name: companyName,
          cnpj: cnpj || null,
          website: website || null,
          description: description || null,
        })
        .eq("user_id", userId);
      dealerError = !!error;
    }

    const anyError = profileResult.error || dealerError;

    if (anyError) {
      setError("Failed to save changes. Please try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="space-y-4">
            <Field label="Full Name">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                readOnly
                className={`${inputCls} bg-slate-50 text-[#64748B] cursor-not-allowed`}
              />
              <p className="text-xs text-[#64748B] mt-1">
                Email cannot be changed here. Contact support if needed.
              </p>
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 (11) 99999-9999"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* Dealer / Company */}
        {isDealer && dealerProfile !== null && (
          <Section icon={Building2} title="Company">
            <div className="space-y-4">
              <Field label="Company Name">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="AeroDesk Aviation LLC"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="CNPJ">
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className={inputCls}
                  />
                </Field>
                <Field label="Website">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourdomain.com"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell buyers about your company..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>
          </Section>
        )}

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Email notifications</p>
              <p className="text-xs text-[#64748B] mt-0.5">
                Get notified by email when you receive a new lead
              </p>
            </div>
            <button
              onClick={() => setEmailNotifications((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? "bg-[#2563EB]" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </Section>

        {/* Save / Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            {saved ? (
              <>
                <CheckCircle size={16} className="text-green-300" />
                Saved!
              </>
            ) : (
              <>
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </>
            )}
          </button>

          <button
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
