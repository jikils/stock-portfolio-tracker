// ============================================================
// PensionAllocationChart — Pension vs General account donut chart
// Design: Bloomberg Terminal Aesthetic
// Highlights pension assets (연금저축 + IRP) vs general
// ============================================================

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatKRW, formatPercent } from "@/lib/portfolio";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp } from "lucide-react";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: { name: string; value: number; percentage: number; color: string };
  }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
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

export default function PensionAllocationChart() {
  const { summary, positions } = usePortfolio();

  const pensionValue =
    (summary.byAccount["연금저축"]?.currentValue ?? 0) +
    (summary.byAccount["IRP"]?.currentValue ?? 0);
  const generalValue = summary.byAccount["일반"]?.currentValue ?? 0;
  const totalValue = pensionValue + generalValue;

  const pensionPct = totalValue > 0 ? (pensionValue / totalValue) * 100 : 0;
  const generalPct = totalValue > 0 ? (generalValue / totalValue) * 100 : 0;

  const data = [
    {
      name: "연금 자산 (연금저축+IRP)",
      value: pensionValue,
      percentage: pensionPct,
      color: "oklch(0.72 0.18 168)",
    },
    {
      name: "일반 계좌",
      value: generalValue,
      percentage: generalPct,
      color: "oklch(0.65 0.16 200)",
    },
  ].filter((d) => d.value > 0);

  const hasData = data.length > 0;

  // Pension account breakdown
  const pensionBreakdown = [
    {
      account: "연금저축",
      value: summary.byAccount["연금저축"]?.currentValue ?? 0,
      pct: totalValue > 0 ? ((summary.byAccount["연금저축"]?.currentValue ?? 0) / totalValue) * 100 : 0,
      color: "oklch(0.72 0.18 168)",
    },
    {
      account: "IRP",
      value: summary.byAccount["IRP"]?.currentValue ?? 0,
      pct: totalValue > 0 ? ((summary.byAccount["IRP"]?.currentValue ?? 0) / totalValue) * 100 : 0,
      color: "oklch(0.72 0.18 60)",
    },
    {
      account: "일반",
      value: summary.byAccount["일반"]?.currentValue ?? 0,
      pct: totalValue > 0 ? ((summary.byAccount["일반"]?.currentValue ?? 0) / totalValue) * 100 : 0,
      color: "oklch(0.65 0.16 200)",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="card-terminal rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
        <h2 className="font-['Sora'] font-semibold text-base text-foreground">
          연금 자산 비중
        </h2>
      </div>

      {!hasData ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p>연금저축·IRP·일반 계좌 데이터가 없습니다</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            {/* Donut chart */}
            <div className="shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={40}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationBegin={0}
                    animationDuration={600}
                  >
                    {data.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        stroke="oklch(0.13 0.02 250)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center text overlay */}
            <div className="flex-1 space-y-3">
              <div className="bg-[oklch(0.18_0.02_250)] rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.72_0.18_168)]" />
                  <span className="text-xs text-muted-foreground">연금 자산</span>
                </div>
                <div className="font-['JetBrains_Mono'] text-base font-bold text-[oklch(0.72_0.18_168)]">
                  {pensionPct.toFixed(1)}%
                </div>
                <div className="font-['JetBrains_Mono'] text-xs text-muted-foreground">
                  {formatKRW(pensionValue)}
                </div>
              </div>
              <div className="bg-[oklch(0.18_0.02_250)] rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.16_200)]" />
                  <span className="text-xs text-muted-foreground">일반 계좌</span>
                </div>
                <div className="font-['JetBrains_Mono'] text-base font-bold text-[oklch(0.65_0.16_200)]">
                  {generalPct.toFixed(1)}%
                </div>
                <div className="font-['JetBrains_Mono'] text-xs text-muted-foreground">
                  {formatKRW(generalValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown bar */}
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              계좌별 세부 비중
            </div>
            <div className="flex rounded-full overflow-hidden h-3 mb-2">
              {pensionBreakdown.map((d) => (
                <div
                  key={d.account}
                  style={{
                    width: `${d.pct}%`,
                    backgroundColor: d.color,
                  }}
                  title={`${d.account}: ${d.pct.toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="space-y-1.5">
              {pensionBreakdown.map((d) => (
                <div key={d.account} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-muted-foreground">{d.account}</span>
                  </div>
                  <div className="flex items-center gap-3 font-['JetBrains_Mono']">
                    <span className="text-foreground font-medium">{d.pct.toFixed(1)}%</span>
                    <span className="text-muted-foreground w-24 text-right">
                      {formatKRW(d.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
