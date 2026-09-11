"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, PIE_COLORS, tooltipStyle } from "./chart-theme";

type Datum = { name: string; value: number };
type StackDatum = { name: string; stay: number; leave: number };

const axisProps = {
  stroke: CHART.axis,
  tick: { fill: CHART.axis, fontSize: 11 },
  tickLine: false,
};

export function BarSingle({
  data,
  color = CHART.primary,
  height = 260,
  unit = "",
  horizontal = false,
}: {
  data: Datum[];
  color?: string;
  height?: number;
  unit?: string;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 6, right: 12, left: horizontal ? 8 : -12, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey="name" width={92} {...axisProps} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" {...axisProps} interval={0} angle={0} />
            <YAxis {...axisProps} />
          </>
        )}
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(79,70,229,0.06)" }}
          formatter={(v: number) => [`${v}${unit}`, "Value"]}
        />
        <Bar dataKey="value" fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={54} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BarStacked({
  data,
  height = 260,
}: {
  data: StackDatum[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="name" {...axisProps} interval={0} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(79,70,229,0.06)" }} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar dataKey="stay" name="Stayed" stackId="a" fill={CHART.good} radius={[0, 0, 0, 0]} maxBarSize={70} />
        <Bar dataKey="leave" name="Left" stackId="a" fill={CHART.bad} radius={[6, 6, 0, 0]} maxBarSize={70} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 260,
}: {
  data: Datum[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={54}
          outerRadius={92}
          paddingAngle={2}
          stroke="#fff"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
