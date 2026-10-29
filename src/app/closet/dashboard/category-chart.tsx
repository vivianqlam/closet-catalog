"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// One series, so one color: a lighter step of the burgundy accent that reads
// clearly against the paper background (checked with the dataviz palette validator).
const BAR = "#9c4a43";
const INK = "#191919";
const MUTED = "#66625d";
const LINE = "#cfc8bc";

type Row = { name: string; count: number };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const { name, count } = payload[0].payload;
  return (
    <div className="border border-line bg-paper px-3 py-2 text-sm shadow-sm">
      <span className="font-medium">{name}</span>: {count} {count === 1 ? "item" : "items"}
    </div>
  );
}

// Horizontal bars so long names like "Accessories" fit on a phone.
export function CategoryChart({ data }: { data: Row[] }) {
  return (
    <div style={{ height: data.length * 40 + 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, bottom: 8, left: 0 }}>
          <XAxis type="number" hide allowDecimals={false} domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tickLine={false}
            axisLine={{ stroke: LINE }}
            tick={{ fill: MUTED, fontSize: 13 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: LINE, fillOpacity: 0.35 }} />
          <Bar dataKey="count" fill={BAR} barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="count" position="right" fill={INK} fontSize={13} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
