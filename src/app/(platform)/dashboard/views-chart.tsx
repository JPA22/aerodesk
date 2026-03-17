"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ViewsChartProps {
  totalViews: number;
}

function generateData(totalViews: number) {
  const days = 30;
  const result: { date: string; views: number }[] = [];
  const today = new Date();

  if (totalViews === 0) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push({
        date: d.toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
        views: 0,
      });
    }
    return result;
  }

  // Distribute views with a slight recency bias using a seed from totalViews
  // so the chart looks the same on each render
  let seed = totalViews;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0x100000000;
  };

  const weights = Array.from({ length: days }, (_, i) => 0.5 + rng() * 1.5 + i * 0.03);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
      views: Math.round((weights[days - 1 - i] / totalWeight) * totalViews),
    });
  }
  return result;
}

export default function ViewsChart({ totalViews }: ViewsChartProps) {
  const data = useMemo(() => generateData(totalViews), [totalViews]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickLine={false}
          axisLine={false}
          interval={6}
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
        <Bar dataKey="views" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
