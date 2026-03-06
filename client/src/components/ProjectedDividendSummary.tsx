// ============================================================
// ProjectedDividendSummary — Projected annual dividend summary
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  calculateProjectedDividends,
  calculateProjectedDividendSummary,
  formatKRW,
  formatPercent,
} from "@/lib/portfolio";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function ProjectedDividendSummary() {
  const { trades, dividends, currentPrices } = usePortfolio();

  // 현재 보유 포지션 계산
  const holdings = Array.from(
    trades
      .reduce(
        (map, trade) => {
          const key = trade.ticker;
          if (!map.has(key)) {
            map.set(key, {
              ticker: trade.ticker,
              name: trade.name,
              account: trade.account,
              totalQuantity: 0,
              totalCost: 0,
              trades: [],
            });
          }
          const holding = map.get(key)!;
          if (trade.type === "buy") {
            holding.totalQuantity += trade.quantity;
            holding.totalCost += trade.quantity * trade.price + trade.fee;
          } else {
            holding.totalQuantity -= trade.quantity;
            holding.totalCost -= trade.quantity * trade.price + trade.fee;
          }
          holding.trades.push(trade);
          return map;
        },
        new Map<
          string,
          {
            ticker: string;
            name: string;
            account: string;
            totalQuantity: number;
            totalCost: number;
            trades: typeof trades;
          }
        >()
      )
      .values()
  )
    .filter((h) => h.totalQuantity > 0)
    .map((h) => ({
      ticker: h.ticker,
      name: h.name,
      account: h.account,
      totalQuantity: h.totalQuantity,
      avgCost: h.totalCost / h.totalQuantity,
      totalCost: h.totalCost,
      currentPrice: currentPrices[h.ticker] || 0,
      currentValue: (currentPrices[h.ticker] || 0) * h.totalQuantity,
      unrealizedPnL: (currentPrices[h.ticker] || 0) * h.totalQuantity - h.totalCost,
      unrealizedPnLPct:
        h.totalCost > 0
          ? (((currentPrices[h.ticker] || 0) * h.totalQuantity - h.totalCost) / h.totalCost) * 100
          : 0,
      realizedPnL: 0,
      totalPnL: (currentPrices[h.ticker] || 0) * h.totalQuantity - h.totalCost,
      trades: h.trades,
    }));

  // 포트폴리오 총 가치
  const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  // 예상 배당금 계산
  const projected = calculateProjectedDividends(holdings, dividends);
  const summary = calculateProjectedDividendSummary(projected, totalPortfolioValue);

  if (projected.length === 0) {
    return (
      <Card className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.25_0.02_250)] p-5 rounded-xl">
        <p className="text-xs text-muted-foreground">
          배당 이력이 있는 보유 종목이 없습니다
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.25_0.02_250)] p-5 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
            <h3 className="font-['Sora'] font-semibold text-base text-foreground">
              연간 예상 배당금
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            최근 배당 이력 기반 예상 연 배당액
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[oklch(0.1_0.02_250)] rounded-lg p-3">
          <p className="text-xs text-muted-foreground">예상 배당금</p>
          <p className="font-['JetBrains_Mono'] text-lg font-bold text-[oklch(0.72_0.18_168)] mt-2">
            {formatKRW(summary.totalProjectedDividend)}
          </p>
        </div>
        <div className="bg-[oklch(0.1_0.02_250)] rounded-lg p-3">
          <p className="text-xs text-muted-foreground">배당 수익률</p>
          <p className="font-['JetBrains_Mono'] text-lg font-bold text-[oklch(0.72_0.18_168)] mt-2">
            {formatPercent(summary.projectedDividendYield)}
          </p>
        </div>
        <div className="bg-[oklch(0.1_0.02_250)] rounded-lg p-3">
          <p className="text-xs text-muted-foreground">배당 종목</p>
          <p className="font-['JetBrains_Mono'] text-lg font-bold text-[oklch(0.72_0.18_168)] mt-2">
            {summary.tickerCount}개
          </p>
        </div>
      </div>

      {/* 종목별 예상 배당금 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[oklch(0.25_0.02_250)]">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">종목</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">보유수량</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                최근배당/주
              </th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">
                예상 배당금
              </th>
            </tr>
          </thead>
          <tbody>
            {projected.map((p) => (
              <tr key={p.ticker} className="border-b border-[oklch(0.2_0.02_250)]">
                <td className="py-2 px-2">
                  <div>
                    <p className="font-semibold text-foreground">{p.ticker}</p>
                    <p className="text-muted-foreground text-xs">{p.name}</p>
                  </div>
                </td>
                <td className="text-right py-2 px-2 font-['JetBrains_Mono'] text-foreground">
                  {p.currentQuantity}주
                </td>
                <td className="text-right py-2 px-2 font-['JetBrains_Mono'] text-[oklch(0.72_0.18_168)]">
                  {formatKRW(p.lastDividendPerShare)}
                </td>
                <td className="text-right py-2 px-2 font-['JetBrains_Mono'] font-semibold text-[oklch(0.72_0.18_168)]">
                  {formatKRW(p.projectedAnnualDividend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
