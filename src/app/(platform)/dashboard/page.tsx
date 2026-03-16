import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plane, Users, Heart, Plus, ArrowRight, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile and counts in parallel
  const [{ data: profile }, { count: listingsCount }, { count: leadsCount }, { count: savedCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("aircraft_listings")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user!.id),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("buyer_id", user!.id),
      supabase
        .from("saved_listings")
        .select("listing_id", { count: "exact", head: true })
        .eq("user_id", user!.id),
    ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "My Listings",
      value: listingsCount ?? 0,
      icon: Plane,
      href: "/listings",
      color: "bg-blue-50 text-[#2563EB]",
      cta: "View all",
    },
    {
      label: "My Leads",
      value: leadsCount ?? 0,
      icon: Users,
      href: "/leads",
      color: "bg-indigo-50 text-indigo-600",
      cta: "View all",
    },
    {
      label: "Saved Aircraft",
      value: savedCount ?? 0,
      icon: Heart,
      href: "/saved",
      color: "bg-pink-50 text-pink-600",
      cta: "View all",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Here&apos;s what&apos;s happening with your account.
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          Create Listing
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <Link
                href={stat.href}
                className="text-xs text-[#2563EB] font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {stat.cta} <ArrowRight size={12} />
              </Link>
            </div>
            <p className="text-3xl font-bold text-[#0F172A]">{stat.value}</p>
            <p className="text-[#64748B] text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Create listing CTA */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#2563EB] rounded-xl p-6 text-white">
          <div className="bg-white/10 rounded-xl p-3 w-fit mb-4">
            <Plane size={24} className="text-white" />
          </div>
          <h3 className="font-bold text-lg mb-1">List an aircraft</h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Reach thousands of qualified buyers across Latin America. AI-powered
            pricing included.
          </p>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 bg-white text-[#0F172A] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Plus size={14} /> Create listing
          </Link>
        </div>

        {/* Market insights placeholder */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="bg-[#2563EB]/10 rounded-xl p-3 w-fit mb-4">
            <TrendingUp size={24} className="text-[#2563EB]" />
          </div>
          <h3 className="font-bold text-[#0F172A] text-lg mb-1">
            Market insights
          </h3>
          <p className="text-[#64748B] text-sm mb-4 leading-relaxed">
            AI-powered valuations and market trend analysis — coming soon for
            your aircraft category.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            Coming soon
          </span>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-[#0F172A] mb-4">Recent activity</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <Plane size={24} className="text-slate-400" />
          </div>
          <p className="text-[#0F172A] font-medium text-sm">No activity yet</p>
          <p className="text-[#64748B] text-xs mt-1 max-w-xs">
            Your listing views, new leads, and saved aircraft will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
