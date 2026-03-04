// ============================================================
// SummaryCards — Top KPI summary cards
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatKRW, formatPercent, formatPnL } from "@/lib/portfolio";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Wallet } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

function KPICard({ label, value, sub, icon, trend, delay = 0 }: KPICardProps) {
  const trendColor =
    trend === "up"
      ? "text-[oklch(0.72_0.18_168)]"
      : trend === "down"
      ? "text-[oklch(0.62_0.22_15)]"
      : "text-muted-foreground";

  const borderColor =
    trend === "up"
      ? "border-[oklch(0.72_0.18_168)/0.3]"
      : trend === "down"
      ? "border-[oklch(0.62_0.22_15)/0.3]"
      : "border-[oklch(0.25_0.02_250)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`card-terminal rounded-lg p-4 border ${borderColor}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          {label}
        </span>
        <div className="text-muted-foreground opacity-50">{icon}</div>
      </div>
      <div className={`text-xl font-['JetBrains_Mono'] font-semibold ${trendColor}`}>
        {value}
      </div>
      {sub && (
        <div className="text-xs text-muted-foreground mt-1 font-['JetBrains_Mono']">{sub}</div>
      )}
    </motion.div>
  );
}

export default function SummaryCards() {
  const { summary, positions } = usePortfolio();

  const hasData = positions.length > 0;
  const pnlTrend =
    summary.totalUnrealizedPnL > 0
      ? "up"
      : summary.totalUnrealizedPnL < 0
      ? "down"
      : "neutral";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard
        label="총 평가금액"
        value={hasData ? formatKRW(summary.totalCurrentValue) : "—"}
        sub={hasData ? `투자원금 ${formatKRW(summary.totalInvested)}` : "데이터 없음"}
        icon={<Wallet className="w-4 h-4" />}
        trend="neutral"
        delay={0}
      />
      <KPICard
        label="미실현 손익"
        value={hasData ? formatPnL(summary.totalUnrealizedPnL) : "—"}
        sub={hasData ? formatPercent(summary.totalUnrealizedPnLPct) : undefined}
        icon={
          pnlTrend === "up" ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )
        }
        trend={pnlTrend}
        delay={0.05}
      />
      <KPICard
        label="실현 손익"
        value={hasData ? formatPnL(summary.totalRealizedPnL) : "—"}
        sub={hasData ? "확정 수익" : undefined}
        icon={<DollarSign className="w-4 h-4" />}
        trend={
          summary.totalRealizedPnL > 0
            ? "up"
            : summary.totalRealizedPnL < 0
            ? "down"
            : "neutral"
        }
        delay={0.1}
      />
      <KPICard
        label="보유 종목 수"
        value={hasData ? `${positions.length}종목` : "—"}
        sub={
          hasData
            ? `${Object.keys(summary.byAccount).length}개 계좌`
            : undefined
        }
        icon={<BarChart3 className="w-4 h-4" />}
        trend="neutral"
        delay={0.15}
      />
    </div>
  );
}
