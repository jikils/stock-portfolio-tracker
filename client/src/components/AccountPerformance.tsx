// ============================================================
// AccountPerformance — Account-level P&L bar chart
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatKRW, formatPercent } from "@/lib/portfolio";

const ACCOUNT_COLORS: Record<string, string> = {
  "연금저축": "oklch(0.72 0.18 168)",
  "IRP": "oklch(0.72 0.18 60)",
  "일반": "oklch(0.65 0.16 200)",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      account: string;
      pnlPct: number;
      pnl: number;
      invested: number;
      currentValue: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[oklch(0.15_0.02_250)] border border-[oklch(0.3_0.02_250)] rounded-lg p-3 shadow-xl text-xs space-y-1">
      <div className="font-semibold text-foreground text-sm mb-2">{d.account}</div>
      <div className="flex justify-between gap-6">
        <span className="text-muted-foreground">투자원금</span>
        <span className="font-['JetBrains_Mono']">{formatKRW(d.invested)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-muted-foreground">평가금액</span>
        <span className="font-['JetBrains_Mono']">{formatKRW(d.currentValue)}</span>
      </div>
      <div className="flex justify-between gap-6 border-t border-[oklch(0.25_0.02_250)] pt-1 mt-1">
        <span className="text-muted-foreground">수익률</span>
        <span
          className={`font-['JetBrains_Mono'] font-semibold ${
            d.pnlPct >= 0 ? "text-[oklch(0.72_0.18_168)]" : "text-[oklch(0.62_0.22_15)]"
          }`}
        >
          {formatPercent(d.pnlPct)}
        </span>
      </div>
    </div>
  );
}

export default function AccountPerformance() {
  const { summary } = usePortfolio();

  const data = Object.entries(summary.byAccount).map(([account, stats]) => ({
    account,
    pnlPct: stats.pnlPct,
    pnl: stats.pnl,
    invested: stats.invested,
    currentValue: stats.currentValue,
  }));

  if (data.length === 0) {
    return (
      <div className="card-terminal rounded-xl p-5">
        <h2 className="font-['Sora'] font-semibold text-base text-foreground mb-4">
          계좌별 수익률
        </h2>
        <div className="text-center py-8 text-muted-foreground text-sm">
          <div className="text-3xl mb-2 opacity-20">📈</div>
          <p>계좌별 수익률이 여기에 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-terminal rounded-xl p-5">
      <h2 className="font-['Sora'] font-semibold text-base text-foreground mb-4">
        계좌별 수익률
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.22 0.02 250)"
            vertical={false}
          />
          <XAxis
            dataKey="account"
            tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 12, fontFamily: "Sora" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            tick={{ fill: "oklch(0.55 0.01 220)", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.18 0.02 250)" }} />
          <ReferenceLine y={0} stroke="oklch(0.3 0.02 250)" />
          <Bar dataKey="pnlPct" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry) => (
              <Cell
                key={entry.account}
                fill={
                  entry.pnlPct >= 0
                    ? ACCOUNT_COLORS[entry.account] ?? "oklch(0.72 0.18 168)"
                    : "oklch(0.62 0.22 15)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Account summary rows */}
      <div className="mt-3 space-y-2">
        {data.map((d) => (
          <div
            key={d.account}
            className="flex items-center justify-between text-xs py-2 px-3 rounded bg-[oklch(0.18_0.02_250)]"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ACCOUNT_COLORS[d.account] ?? "#00D4AA" }}
              />
              <span className="font-medium">{d.account}</span>
            </div>
            <div className="flex items-center gap-4 font-['JetBrains_Mono']">
              <span className="text-muted-foreground">{formatKRW(d.invested)}</span>
              <span
                className={`font-semibold ${
                  d.pnlPct >= 0 ? "text-[oklch(0.72_0.18_168)]" : "text-[oklch(0.62_0.22_15)]"
                }`}
              >
                {formatPercent(d.pnlPct)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
