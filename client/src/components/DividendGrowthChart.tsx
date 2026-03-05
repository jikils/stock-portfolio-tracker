// ============================================================
// DividendGrowthChart — Yearly dividend growth trend line chart
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { usePortfolio } from "@/contexts/PortfolioContext";
import { calculateYearlyDividends, formatKRW } from "@/lib/portfolio";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DividendGrowthChart() {
  const { dividends } = usePortfolio();
  const yearlyData = calculateYearlyDividends(dividends);

  if (yearlyData.length === 0) {
    return (
      <div className="card-terminal rounded-xl p-5 h-80 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          배당 데이터가 2개 이상이면 성장 추세가 표시됩니다
        </p>
      </div>
    );
  }

  // 차트 데이터 포맷
  const chartData = yearlyData.map((item) => ({
    year: item.year.toString(),
    배당금: item.totalDividend,
  }));

  return (
    <div className="card-terminal rounded-xl p-5">
      <div className="mb-4">
        <h3 className="font-['Sora'] font-semibold text-base text-foreground">
          연도별 배당금 추이
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          지급일 기준 연도별 총 배당금 지급액
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.22 0.02 250)"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            stroke="oklch(0.55 0.016 285.938)"
            style={{ fontSize: "12px", fontFamily: "'JetBrains Mono'" }}
          />
          <YAxis
            stroke="oklch(0.55 0.016 285.938)"
            style={{ fontSize: "12px", fontFamily: "'JetBrains Mono'" }}
            tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.15 0.02 250)",
              border: "1px solid oklch(0.25 0.02 250)",
              borderRadius: "6px",
              color: "oklch(0.85 0.005 65)",
            }}
            formatter={(value: number) => [formatKRW(value), "배당금"]}
            labelStyle={{ color: "oklch(0.85 0.005 65)" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "12px",
              color: "oklch(0.55 0.016 285.938)",
            }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="배당금"
            stroke="oklch(0.72 0.18 168)"
            strokeWidth={2.5}
            dot={{
              fill: "oklch(0.72 0.18 168)",
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 통계 카드 */}
      {yearlyData.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-[oklch(0.1_0.02_250)] rounded-lg p-3">
            <p className="text-xs text-muted-foreground">총 배당금</p>
            <p className="font-['JetBrains_Mono'] text-sm font-semibold text-[oklch(0.72_0.18_168)] mt-1">
              {formatKRW(yearlyData.reduce((s, y) => s + y.totalDividend, 0))}
            </p>
          </div>
          <div className="bg-[oklch(0.1_0.02_250)] rounded-lg p-3">
            <p className="text-xs text-muted-foreground">평균 연배당</p>
            <p className="font-['JetBrains_Mono'] text-sm font-semibold text-[oklch(0.72_0.18_168)] mt-1">
              {formatKRW(
                yearlyData.reduce((s, y) => s + y.totalDividend, 0) / yearlyData.length
              )}
            </p>
          </div>
          <div className="bg-[oklch(0.1_0.02_250)] rounded-lg p-3">
            <p className="text-xs text-muted-foreground">기록 연도</p>
            <p className="font-['JetBrains_Mono'] text-sm font-semibold text-[oklch(0.72_0.18_168)] mt-1">
              {yearlyData.length}개년
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
