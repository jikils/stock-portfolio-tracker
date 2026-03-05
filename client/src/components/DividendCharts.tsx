// ============================================================
// DividendCharts — Dividend growth and yield analysis
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatKRW, formatPercent } from "@/lib/portfolio";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[oklch(0.15_0.02_250)] border border-[oklch(0.3_0.02_250)] rounded-lg p-3 shadow-xl text-xs space-y-1">
      <div className="font-semibold text-foreground text-sm mb-2">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex justify-between gap-6">
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}
          </span>
          <span className="font-['JetBrains_Mono'] text-foreground">
            {entry.dataKey === "avgYield"
              ? `${entry.value.toFixed(2)}%`
              : formatKRW(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DividendCharts() {
  const { dividends } = usePortfolio();

  const chartData = useMemo(() => {
    if (dividends.length === 0) return [];

    // Group by ticker
    const byTicker: Record<
      string,
      {
        name: string;
        totalDiv: number;
        avgYield: number;
        count: number;
      }
    > = {};

    for (const div of dividends) {
      if (!byTicker[div.ticker]) {
        byTicker[div.ticker] = {
          name: div.name,
          totalDiv: 0,
          avgYield: 0,
          count: 0,
        };
      }
      byTicker[div.ticker].totalDiv += div.totalDividend;
      byTicker[div.ticker].avgYield += div.dividendYield;
      byTicker[div.ticker].count += 1;
    }

    // Calculate averages
    const data = Object.entries(byTicker).map(([ticker, info]) => ({
      ticker,
      name: info.name,
      totalDividend: Math.round(info.totalDiv),
      avgYield: info.avgYield / info.count,
    }));

    // Sort by total dividend descending
    return data.sort((a, b) => b.totalDividend - a.totalDividend);
  }, [dividends]);

  if (chartData.length === 0) {
    return (
      <div className="card-terminal rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
          <h2 className="font-['Sora'] font-semibold text-base text-foreground">
            배당 성장 분석
          </h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">배당 데이터가 2개 이상이면 분석이 표시됩니다</p>
        </div>
      </div>
    );
  }

  const totalDividends = chartData.reduce((sum, d) => sum + d.totalDividend, 0);
  const avgYield =
    chartData.reduce((sum, d) => sum + d.avgYield, 0) / chartData.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-terminal rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
            <span className="text-xs text-muted-foreground">총 배당금</span>
          </div>
          <div className="font-['JetBrains_Mono'] text-xl font-bold text-[oklch(0.72_0.18_168)]">
            {formatKRW(totalDividends)}
          </div>
        </div>

        <div className="card-terminal rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
            <span className="text-xs text-muted-foreground">평균 배당 수익률</span>
          </div>
          <div className="font-['JetBrains_Mono'] text-xl font-bold text-[oklch(0.72_0.18_168)]">
            {avgYield.toFixed(2)}%
          </div>
        </div>

        <div className="card-terminal rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">배당 종목 수</span>
          </div>
          <div className="font-['JetBrains_Mono'] text-xl font-bold text-[oklch(0.72_0.18_168)]">
            {chartData.length}개
          </div>
        </div>
      </div>

      {/* Dividend by ticker bar chart */}
      <div className="card-terminal rounded-xl p-5">
        <div className="mb-4">
          <h3 className="font-['Sora'] font-semibold text-base text-foreground">
            종목별 총 배당금
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            각 종목에서 받은 총 배당금
          </p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.22 0.02 250)"
              vertical={false}
            />
            <XAxis
              dataKey="ticker"
              tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "Sora" }}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.18 0.02 250)" }} />
            <Bar
              dataKey="totalDividend"
              fill="oklch(0.72 0.18 168)"
              name="배당금"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dividend yield by ticker */}
      <div className="card-terminal rounded-xl p-5">
        <div className="mb-4">
          <h3 className="font-['Sora'] font-semibold text-base text-foreground">
            종목별 평균 배당 수익률
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            주당 배당금 ÷ 현재가 (%)
          </p>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.22 0.02 250)"
              vertical={false}
            />
            <XAxis
              dataKey="ticker"
              tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "Sora" }}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.18 0.02 250)" }} />
            <Bar
              dataKey="avgYield"
              fill="oklch(0.72 0.18 60)"
              name="배당 수익률"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
