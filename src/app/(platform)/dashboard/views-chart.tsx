"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartListing {
  id: string;
  title: string;
  views_count: number;
  leads_count: number;
}

interface ViewsChartProps {
  listings: ChartListing[];
}

interface TooltipPayloadEntry {
  payload: {
    id: string;
    title: string;
    views: number;
    leads: number;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload?.length) return null;
  const { title, views, leads } = payload[0].payload;
  return (
    <div
      style={{
        background: "#0F172A",
        borderRadius: 8,
        padding: "10px 14px",
        color: "#fff",
        fontSize: 12,
        maxWidth: 260,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{title}</p>
      <p style={{ color: "#94A3B8", marginBottom: 2 }}>
        <span style={{ color: "#fff", fontWeight: 600 }}>{views}</span> Views
      </p>
      <p style={{ color: "#94A3B8" }}>
        <span style={{ color: "#fff", fontWeight: 600 }}>{leads}</span> Leads
      </p>
    </div>
  );
}

export default function ViewsChart({ listings }: ViewsChartProps) {
  const router = useRouter();

  const data = listings.map((l) => ({
    id: l.id,
    title: l.title,
    views: l.views_count,
    leads: l.leads_count,
  }));

  if (listings.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-[#64748B]">
        No listings yet
      </div>
    );
  }

  const allZero = data.every((d) => d.views === 0);
  if (allZero) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-sm text-[#64748B]">
        <p>No views recorded yet</p>
        <p className="text-xs">Views will appear here once buyers visit your listings</p>
      </div>
    );
  }

  // Compute bottom margin based on longest title so angled labels fit
  const maxLen = Math.max(...data.map((d) => d.title.length));
  const bottomMargin = Math.min(Math.round(maxLen * 3.5), 100);

  return (
    <ResponsiveContainer width="100%" height={220 + bottomMargin}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, bottom: bottomMargin, left: -20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="title"
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F1F5F9" }} />
        <Bar
          dataKey="views"
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
          cursor="pointer"
          onClick={(entry) => {
            const id = (entry as { id?: string }).id;
            if (id) router.push(`/listings/${id}`);
          }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? "#2563EB" : "#3B82F6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
