// ============================================================
// TimeseriesChart — Portfolio value progression over time
// Design: Bloomberg Terminal Aesthetic
// Shows invested amount, total value, and return %
// ============================================================

import { useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  calculateTimeseriesData,
  formatTimeseriesForChart,
  getRecentTimeseriesData,
} from "@/lib/timeseries";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatKRW, formatPercent } from "@/lib/portfolio";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

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
            {entry.dataKey === "totalReturn"
              ? formatPercent(entry.value)
              : formatKRW(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TimeseriesChart() {
  const { trades, currentPrices, positions } = usePortfolio();

  const chartData = useMemo(() => {
    if (trades.length === 0) return [];
    const timeseriesData = calculateTimeseriesData(trades, currentPrices);
    const recent = getRecentTimeseriesData(timeseriesData, 50);
    return formatTimeseriesForChart(recent);
  }, [trades, currentPrices]);

  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <div className="card-terminal rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
          <h2 className="font-['Sora'] font-semibold text-base text-foreground">
            포트폴리오 성과 추이
          </h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">매매 이력이 2개 이상이면 성과 추이가 표시됩니다</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];
  const valueChange = lastPoint.totalValue - firstPoint.invested;
  const returnPct = lastPoint.totalReturn;
  const isPositive = returnPct >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="card-terminal rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
            <h2 className="font-['Sora'] font-semibold text-base text-foreground">
              포트폴리오 성과 추이
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            거래일 기준 누적 투자금액 vs 포트폴리오 가치
          </p>
        </div>
        <div className="text-right">
          <div
            className={`font-['JetBrains_Mono'] text-lg font-bold ${
              isPositive ? "text-[oklch(0.72_0.18_168)]" : "text-[oklch(0.62_0.22_15)]"
            }`}
          >
            {formatPercent(returnPct)}
          </div>
          <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
            {isPositive ? "+" : ""}
            {formatKRW(valueChange)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.22 0.02 250)"
            vertical={false}
          />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "Sora" }}
            axisLine={false}
            tickLine={false}
            interval={Math.max(0, Math.floor(chartData.length / 6) - 1)}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
            tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.18 0.02 250)" }} />
          <Legend wrapperStyle={{ paddingTop: "16px" }} />
          <ReferenceLine
            yAxisId="left"
            y={firstPoint.invested}
            stroke="oklch(0.3 0.02 250)"
            strokeDasharray="5 5"
            label={{
              value: "초기 투자금",
              position: "right",
              fill: "oklch(0.55 0.01 220)",
              fontSize: 11,
              fontFamily: "Sora",
              offset: 5,
            }}
          />

          {/* Invested amount bar */}
          <Bar
            yAxisId="left"
            dataKey="invested"
            fill="oklch(0.3 0.02 250)"
            fillOpacity={0.3}
            name="누적 투자금액"
            radius={[2, 2, 0, 0]}
            maxBarSize={20}
          />

          {/* Total value line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="totalValue"
            stroke="oklch(0.72 0.18 168)"
            strokeWidth={2.5}
            dot={false}
            name="포트폴리오 가치"
            isAnimationActive={true}
            animationDuration={800}
          />

          {/* Return % line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalReturn"
            stroke="oklch(0.72 0.18 60)"
            strokeWidth={2}
            dot={false}
            name="총 수익률 (%)"
            isAnimationActive={true}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Stats footer */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-[oklch(0.18_0.02_250)] rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">초기 투자금</div>
          <div className="font-['JetBrains_Mono'] text-sm font-semibold text-foreground">
            {formatKRW(firstPoint.invested)}
          </div>
        </div>
        <div className="bg-[oklch(0.18_0.02_250)] rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">현재 포트폴리오</div>
          <div className="font-['JetBrains_Mono'] text-sm font-semibold text-[oklch(0.72_0.18_168)]">
            {formatKRW(lastPoint.totalValue)}
          </div>
        </div>
        <div className="bg-[oklch(0.18_0.02_250)] rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">총 수익률</div>
          <div
            className={`font-['JetBrains_Mono'] text-sm font-semibold ${
              isPositive ? "text-[oklch(0.72_0.18_168)]" : "text-[oklch(0.62_0.22_15)]"
            }`}
          >
            {formatPercent(returnPct)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
