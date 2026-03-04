// ============================================================
// AllocationCharts — Asset allocation pie/donut charts
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatKRW, formatPercent } from "@/lib/portfolio";
import { motion } from "framer-motion";

type ViewMode = "ticker" | "account";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number; percentage: number; color: string };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[oklch(0.15_0.02_250)] border border-[oklch(0.3_0.02_250)] rounded-lg p-3 shadow-xl text-sm">
      <div className="font-semibold text-foreground mb-1">{item.name}</div>
      <div className="font-['JetBrains_Mono'] text-[oklch(0.72_0.18_168)]">
        {formatKRW(item.value)}
      </div>
      <div className="font-['JetBrains_Mono'] text-muted-foreground text-xs">
        {item.percentage.toFixed(1)}%
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <div className="w-32 h-32 rounded-full border-4 border-dashed border-[oklch(0.25_0.02_250)] flex items-center justify-center mb-4">
        <span className="text-3xl opacity-30">%</span>
      </div>
      <p className="text-sm">매매 이력과 현재가를 입력하면</p>
      <p className="text-sm">자산 배분 차트가 표시됩니다</p>
    </div>
  );
}

const RADIAN = Math.PI / 180;
function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percentage,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percentage: number;
}) {
  if (percentage < 5) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="oklch(0.1 0.02 250)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
      fontFamily="JetBrains Mono, monospace"
    >
      {percentage.toFixed(1)}%
    </text>
  );
}

export default function AllocationCharts() {
  const { assetAllocation, accountAllocation } = usePortfolio();
  const [viewMode, setViewMode] = useState<ViewMode>("ticker");

  const data = viewMode === "ticker" ? assetAllocation : accountAllocation;
  const hasData = data.length > 0;

  return (
    <div className="card-terminal rounded-xl p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Sora'] font-semibold text-base text-foreground">
          자산 배분
        </h2>
        <div className="flex bg-[oklch(0.18_0.02_250)] rounded-lg p-0.5 gap-0.5">
          {(["ticker", "account"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                viewMode === mode
                  ? "bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "ticker" ? "종목별" : "계좌별"}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <EmptyChart />
      ) : (
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={viewMode === "account" ? 55 : 0}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                animationBegin={0}
                animationDuration={600}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="oklch(0.13 0.02 250)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {data.map((item) => (
              <div key={item.ticker} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="font-['JetBrains_Mono'] text-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="font-['JetBrains_Mono'] text-muted-foreground w-24 text-right">
                    {formatKRW(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
