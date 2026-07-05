"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function IncassiChart({ data }: { data: { mese: string; importo: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="incassiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="mese" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          width={56}
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k€` : `${v}€`)}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e4e1d9",
            boxShadow: "0 4px 12px -2px rgb(14 47 60 / 0.12)",
            fontSize: 13,
            padding: "8px 12px",
          }}
          labelStyle={{ fontWeight: 600, color: "#12242b", marginBottom: 2 }}
          cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="importo"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="url(#incassiFill)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
