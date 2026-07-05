"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  Pagato: "#1f7a5c",
  "In ritardo": "#96692c",
  Insoluto: "#b23a2e",
};

export function PagamentiDonut({ data }: { data: { name: string; value: number }[] }) {
  const totale = data.reduce((sum, d) => sum + d.value, 0);

  if (totale === 0) {
    return <p className="flex h-[220px] items-center justify-center text-sm text-slate-400">Nessun pagamento registrato.</p>;
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e4e1d9",
              boxShadow: "0 4px 12px -2px rgb(14 47 60 / 0.12)",
              fontSize: 13,
              padding: "8px 12px",
            }}
          />
          <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[188px] flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold text-ink">{totale}</span>
        <span className="text-xs text-slate-400">totale</span>
      </div>
    </div>
  );
}
