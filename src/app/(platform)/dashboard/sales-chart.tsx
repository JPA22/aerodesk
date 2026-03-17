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
import { DollarSign } from "lucide-react";

export interface SoldListing {
  id: string;
  title: string;
  shortLabel: string;
  asking_price: number;
  currency: string;
  sale_price: number | null;
  sold_at: string | null;
  created_at: string;
}

interface SalesChartProps {
  listings: SoldListing[];
}

interface TooltipEntry {
  payload: {
    id: string;
    title: string;
    price: number;
    asking: number;
    currency: string;
    discountPct: number | null;
    daysToSale: number;
  };
}

function fmt(n: number, currency: string) {
  if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${currency} ${(n / 1_000).toFixed(0)}K`;
  return `${currency} ${n.toLocaleString()}`;
}

function SalesTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload?.length) return null;
  const { title, price, asking, currency, discountPct, daysToSale } = payload[0].payload;
  return (
    <div
      style={{
        background: "#0F172A",
        borderRadius: 8,
        padding: "10px 14px",
        color: "#fff",
        fontSize: 12,
        maxWidth: 280,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{title}</p>
      <p style={{ color: "#94A3B8", marginBottom: 2 }}>
        Sale price:{" "}
        <span style={{ color: "#34D399", fontWeight: 600 }}>{fmt(price, currency)}</span>
      </p>
      {discountPct !== null && discountPct > 0 && (
        <p style={{ color: "#94A3B8", marginBottom: 2 }}>
          Asking price:{" "}
          <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(asking, currency)}</span>
          {"  "}
          <span style={{ color: "#F87171" }}>(-{discountPct.toFixed(1)}%)</span>
        </p>
      )}
      <p style={{ color: "#94A3B8" }}>
        Days to sale:{" "}
        <span style={{ color: "#fff", fontWeight: 600 }}>{daysToSale}</span>
      </p>
    </div>
  );
}

export default function SalesChart({ listings }: SalesChartProps) {
  const router = useRouter();

  const data = listings.map((l) => {
    const price = l.sale_price ?? l.asking_price;
    const discountPct =
      l.sale_price && l.sale_price !== l.asking_price
        ? ((l.asking_price - l.sale_price) / l.asking_price) * 100
        : null;
    const soldMs = l.sold_at
      ? new Date(l.sold_at).getTime()
      : new Date(l.created_at).getTime();
    const daysToSale = Math.max(
      0,
      Math.round((soldMs - new Date(l.created_at).getTime()) / 86_400_000)
    );
    return {
      id: l.id,
      name: l.shortLabel,
      title: l.title,
      price,
      asking: l.asking_price,
      currency: l.currency,
      discountPct,
      daysToSale,
    };
  });

  if (listings.length === 0) {
    return (
      <div className="h-[180px] flex flex-col items-center justify-center gap-2 text-sm text-[#64748B]">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
          <DollarSign size={18} className="text-slate-400" />
        </div>
        <p>No sales yet</p>
        <p className="text-xs">Sold listings will appear here</p>
      </div>
    );
  }

  const maxLen = Math.max(...data.map((d) => d.name.length));
  const bottomMargin = Math.min(Math.round(maxLen * 3.5), 90);

  // Y-axis formatter: abbreviate large numbers
  const yFormatter = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return String(v);
  };

  return (
    <ResponsiveContainer width="100%" height={200 + bottomMargin}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, bottom: bottomMargin, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
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
          tickFormatter={yFormatter}
          width={42}
        />
        <Tooltip content={<SalesTooltip />} cursor={{ fill: "#F1F5F9" }} />
        <Bar
          dataKey="price"
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
          cursor="pointer"
          onClick={(entry) => {
            const id = (entry as { id?: string }).id;
            if (id) router.push(`/listings/${id}`);
          }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? "#10B981" : "#34D399"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
