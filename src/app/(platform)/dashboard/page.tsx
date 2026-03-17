import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Plane,
  Users,
  Eye,
  Plus,
  TrendingUp,
  BarChart2,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import ViewsChart from "./views-chart";

const contactIcon = {
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
};

const leadStatusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-500",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: listingsData }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user!.id).single(),
    supabase
      .from("aircraft_listings")
      .select("id, title, status, views_count")
      .eq("seller_id", user!.id),
  ]);

  const listingIds = listingsData?.map((l) => l.id) ?? [];
  const totalListings = listingsData?.length ?? 0;
  const activeListings = listingsData?.filter((l) => l.status === "active").length ?? 0;
  const totalViews = listingsData?.reduce((sum, l) => sum + (l.views_count ?? 0), 0) ?? 0;

  let totalLeads = 0;
  let recentLeads: {
    id: string;
    created_at: string;
    status: string;
    contact_method: string;
    listing: { id: string; title: string } | null;
    buyer: { full_name: string | null } | null;
  }[] = [];

  if (listingIds.length > 0) {
    const [{ count }, { data: leadsData }] = await Promise.all([
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .in("listing_id", listingIds),
      supabase
        .from("leads")
        .select(
          "id, created_at, status, contact_method, listing:aircraft_listings(id, title), buyer:profiles(full_name)"
        )
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    totalLeads = count ?? 0;
    recentLeads = (leadsData ?? []) as typeof recentLeads;
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Total Listings",
      value: totalListings,
      icon: Plane,
      color: "bg-blue-50 text-[#2563EB]",
      href: "/dashboard/listings",
    },
    {
      label: "Active Listings",
      value: activeListings,
      icon: BarChart2,
      color: "bg-green-50 text-green-600",
      href: "/dashboard/listings",
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "bg-purple-50 text-purple-600",
      href: null,
    },
    {
      label: "Total Leads",
      value: totalLeads,
      icon: Users,
      color: "bg-orange-50 text-orange-600",
      href: "/dashboard/leads",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Welcome back, {firstName}
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
          Add New Listing
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
          >
            <div className={`p-2.5 rounded-xl w-fit ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
            <p className="text-[#64748B] text-xs mt-1">{stat.label}</p>
            {stat.href && (
              <Link
                href={stat.href}
                className="text-xs text-[#2563EB] font-medium mt-2 inline-block hover:underline"
              >
                View all →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Views Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#0F172A]">Views by Listing</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {totalViews === 0 ? "No views yet" : `${totalViews} total views`}
              </p>
            </div>
          </div>
          <ViewsChart
            listings={(listingsData ?? []).map((l) => ({
              id: l.id,
              title: l.title,
              views_count: l.views_count ?? 0,
            }))}
          />
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#2563EB] rounded-xl p-5 text-white flex-1">
            <div className="bg-white/10 rounded-xl p-2.5 w-fit mb-3">
              <Plane size={20} className="text-white" />
            </div>
            <h3 className="font-bold mb-1">List an aircraft</h3>
            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              Reach thousands of qualified buyers across Latin America.
            </p>
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 bg-white text-[#0F172A] font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Plus size={12} /> Create listing
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex-1">
            <div className="bg-[#2563EB]/10 rounded-xl p-2.5 w-fit mb-3">
              <TrendingUp size={20} className="text-[#2563EB]" />
            </div>
            <h3 className="font-bold text-[#0F172A] mb-1">Market insights</h3>
            <p className="text-[#64748B] text-xs mb-3 leading-relaxed">
              AI-powered valuations — coming soon.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              Coming soon
            </span>
          </div>
        </div>
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#0F172A]">Recent Leads</h3>
          <Link
            href="/dashboard/leads"
            className="text-xs text-[#2563EB] font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Users size={20} className="text-slate-400" />
            </div>
            <p className="text-[#0F172A] font-medium text-sm">No leads yet</p>
            <p className="text-[#64748B] text-xs mt-1 max-w-xs">
              Leads from buyers will appear here once your listings are active.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeads.map((lead) => {
              const Icon = contactIcon[lead.contact_method as keyof typeof contactIcon] ?? Mail;
              const badgeCls = leadStatusBadge[lead.status] ?? leadStatusBadge.new;
              return (
                <div key={lead.id} className="py-3 flex items-center gap-4">
                  <div className="bg-slate-100 rounded-lg p-2 flex-shrink-0">
                    <Icon size={16} className="text-[#64748B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {lead.buyer?.full_name ?? "Anonymous"}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      {lead.listing?.title ?? "Unknown listing"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeCls}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                    <span className="text-xs text-[#64748B] hidden sm:block">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
