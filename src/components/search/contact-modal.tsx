"use client";

import { useState } from "react";
import { X, Loader2, Mail, Phone, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

interface Props {
  listingId: string;
  listingTitle: string;
  sellerPhone?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const CONTACT_METHODS = [
  { value: "email", label: "Email", Icon: Mail },
  { value: "phone", label: "Phone", Icon: Phone },
  { value: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
] as const;

export default function ContactModal({ listingId, listingTitle, onClose, onSuccess }: Props) {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [message, setMessage] = useState(
    `Hi, I'm interested in the ${listingTitle}. Could you please provide more details?`
  );
  const [contactMethod, setContactMethod] = useState<"email" | "phone" | "whatsapp">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setError(null);

    // Ensure profile row exists (FK requirement on leads.buyer_id)
    await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

    const { error: leadErr } = await supabase.from("leads").insert({
      listing_id: listingId,
      buyer_id: user.id,
      message,
      contact_method: contactMethod,
      status: "new",
    });

    setIsSubmitting(false);
    if (leadErr) {
      setError(leadErr.message || "Failed to send inquiry. Please try again.");
    } else {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#0F172A]">Contact Seller</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-[#64748B]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {!user ? (
            <div className="text-center py-6">
              <p className="text-[#64748B] mb-4">Sign in to contact the seller.</p>
              <a
                href="/login"
                className="bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3B82F6] transition-colors text-sm inline-block"
              >
                Sign in
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Buyer info (read-only) */}
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-[#64748B]">
                Sending as <strong className="text-[#0F172A]">{profile?.full_name ?? user.email}</strong>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
                />
              </div>

              {/* Contact method */}
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Preferred contact method
                </label>
                <div className="flex gap-2">
                  {CONTACT_METHODS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setContactMethod(value)}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        contactMethod === value
                          ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                          : "border-slate-200 text-[#64748B] hover:border-slate-300"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-lg shadow-blue-900/20"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Sending…" : "Send Inquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
