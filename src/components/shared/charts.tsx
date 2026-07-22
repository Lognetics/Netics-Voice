"use client";

import * as React from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const AXIS = { stroke: "#5b6478", fontSize: 11 };
const GRID = "rgba(255,255,255,0.05)";

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-soft">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">
            {formatter ? formatter(p.value, p.name) : p.value?.toLocaleString?.() ?? p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface SeriesChartProps {
  data: any[];
  xKey: string;
  series: { key: string; color: string; name?: string }[];
  height?: number;
  formatter?: (v: number, name: string) => string;
  showGrid?: boolean;
}

export function AreaTrend({
  data, xKey, series, height = 260, formatter, showGrid = true,
}: SeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />}
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name ?? s.key}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarSeries({
  data, xKey, series, height = 260, formatter, showGrid = true,
}: SeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />}
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} minTickGap={12} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<ChartTooltip formatter={formatter} />} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name ?? s.key} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={38} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data, xKey, series, height = 260, formatter,
}: SeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DonutProps {
  data: { name?: string; channel?: string; value: number; color: string }[];
  height?: number;
  innerRadius?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function Donut({ data, height = 240, innerRadius = 62, centerLabel, centerValue }: DonutProps) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey={data[0]?.channel ? "channel" : "name"}
            innerRadius={innerRadius}
            outerRadius={innerRadius + 26}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip formatter={(v: number) => `${v}%`} />} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{centerValue}</span>
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
