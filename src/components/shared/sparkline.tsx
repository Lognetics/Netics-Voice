"use client";

import * as React from "react";

interface SparklineProps {
  data: number[];
  stroke?: string;
  fill?: boolean;
  className?: string;
}

/** Lightweight inline SVG sparkline - no chart library overhead. */
export function Sparkline({
  data,
  stroke = "#3A86FF",
  fill = true,
  className,
}: SparklineProps) {
  const gradientId = React.useId();
  if (!data.length) return null;

  const width = 100;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      width="100%"
      height="100%"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gradientId})`} />}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
