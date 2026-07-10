"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type OrdersWeekChartProps = {
  data: Array<{ day: string; orders: number }>;
};

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

/**
 * Weekly orders trend for operational monitoring.
 * Stroke and grid colors follow the active theme so the chart stays readable in dark mode.
 */
export function OrdersWeekChart({ data }: OrdersWeekChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const palette = useMemo(() => {
    const dark = mounted && resolvedTheme === "dark";
    return {
      grid: dark ? "#45454e" : "#d4d4d8",
      axis: dark ? "#b0b0ba" : "#52525b",
      line: dark ? "#34d399" : "#059669",
      tooltipBg: dark ? "#16161a" : "#ffffff",
      tooltipFg: dark ? "#fafafa" : "#0f172a",
      tooltipBorder: dark ? "#45454e" : "#e4e4e7",
    };
  }, [mounted, resolvedTheme]);

  const chartHeight = 256;
  return (
    <div className="w-full min-w-0">
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: palette.axis }} stroke={palette.grid} />
            <YAxis
              tick={{ fontSize: 12, fill: palette.axis }}
              stroke={palette.grid}
              allowDecimals={false}
              tickFormatter={(v) => formatArabicLatnInteger(Number(v))}
            />
            <Tooltip
              formatter={(value) => [formatArabicLatnInteger(Number(value)), "Orders"]}
              labelFormatter={(label) => `Day: ${label}`}
              contentStyle={{
                backgroundColor: palette.tooltipBg,
                color: palette.tooltipFg,
                border: `1px solid ${palette.tooltipBorder}`,
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke={palette.line}
              strokeWidth={2}
              dot={{ r: 3, fill: palette.line }}
              activeDot={{ r: 5, fill: palette.line }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
