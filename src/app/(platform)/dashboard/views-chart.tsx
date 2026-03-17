"use client";

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

interface ViewsChartProps {
  listings: { id: string; title: string; views_count: number }[];
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

export default function ViewsChart({ listings }: ViewsChartProps) {
  const data = listings.map((l) => ({
    name: truncate(l.title, 18),
    views: l.views_count,
  }));

  if (listings.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-[#64748B]">
        No listings yet
      </div>
    );
  }

  const allZero = data.every((d) => d.views === 0);
  if (allZero) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-sm text-[#64748B]">
        <p>No views recorded yet</p>
        <p className="text-xs">Views will appear here once buyers visit your listings</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 24, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0F172A",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 12,
          }}
          cursor={{ fill: "#F1F5F9" }}
          formatter={(v) => [v ?? 0, "Views"]}
        />
        <Bar dataKey="views" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i % 2 === 0 ? "#2563EB" : "#3B82F6"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
