// ============================================================
// Timeseries calculation utilities
// Calculate portfolio value progression over time
// ============================================================

import { Trade } from "./portfolio";

export interface TimeseriesDataPoint {
  date: string;
  dateObj: Date;
  investedAmount: number;      // 누적 투자금액
  realizedPnL: number;         // 누적 실현 손익
  unrealizedPnL: number;       // 미실현 손익 (현재가 기준)
  totalValue: number;          // 총 포트폴리오 가치
  totalReturn: number;         // 총 수익률 (%)
}

/**
 * 날짜별 포트폴리오 가치 변화 계산
 * 각 거래일마다 누적 투자금액과 손익을 계산
 */
export function calculateTimeseriesData(
  trades: Trade[],
  currentPrices: Record<string, number>
): TimeseriesDataPoint[] {
  if (trades.length === 0) return [];

  // Sort trades by date
  const sorted = [...trades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by date
  const byDate: Record<string, Trade[]> = {};
  for (const trade of sorted) {
    if (!byDate[trade.date]) byDate[trade.date] = [];
    byDate[trade.date].push(trade);
  }

  const dates = Object.keys(byDate).sort();
  const result: TimeseriesDataPoint[] = [];

  // Track holdings by ticker+account
  const holdings: Record<
    string,
    {
      quantity: number;
      totalCost: number;
      realizedPnL: number;
    }
  > = {};

  let totalInvested = 0;
  let totalRealizedPnL = 0;

  for (const date of dates) {
    const tradesOnDate = byDate[date];

    // Process trades on this date
    for (const trade of tradesOnDate) {
      const key = `${trade.ticker}__${trade.accountId}`;

      if (!holdings[key]) {
        holdings[key] = { quantity: 0, totalCost: 0, realizedPnL: 0 };
      }

      if (trade.type === "buy") {
        const costWithFee = trade.price * trade.quantity + trade.fee;
        holdings[key].quantity += trade.quantity;
        holdings[key].totalCost += costWithFee;
        totalInvested += costWithFee;
      } else {
        // sell
        const avgCost =
          holdings[key].quantity > 0
            ? holdings[key].totalCost / holdings[key].quantity
            : 0;
        const sellProceeds = trade.price * trade.quantity - trade.fee;
        const sellCost = avgCost * trade.quantity;
        holdings[key].realizedPnL += sellProceeds - sellCost;
        totalRealizedPnL += sellProceeds - sellCost;

        holdings[key].quantity -= trade.quantity;
        holdings[key].totalCost -= sellCost;
        totalInvested -= sellCost;
      }
    }

    // Calculate unrealized P&L at end of this date
    let totalUnrealizedPnL = 0;
    let totalCurrentValue = 0;

    for (const [key, holding] of Object.entries(holdings)) {
      if (holding.quantity > 0) {
        const ticker = key.split("__")[0];
        const currentPrice = currentPrices[ticker] ?? 0;
        const currentValue = holding.quantity * currentPrice;
        const unrealized = currentValue - holding.totalCost;

        totalUnrealizedPnL += unrealized;
        totalCurrentValue += currentValue;
      }
    }

    const totalValue = totalInvested + totalRealizedPnL + totalUnrealizedPnL;
    const totalReturn =
      totalInvested > 0
        ? ((totalRealizedPnL + totalUnrealizedPnL) / totalInvested) * 100
        : 0;

    result.push({
      date,
      dateObj: new Date(date),
      investedAmount: totalInvested,
      realizedPnL: totalRealizedPnL,
      unrealizedPnL: totalUnrealizedPnL,
      totalValue,
      totalReturn,
    });
  }

  return result;
}

/**
 * 시계열 데이터를 차트용으로 포맷
 */
export function formatTimeseriesForChart(data: TimeseriesDataPoint[]) {
  return data.map((d) => ({
    date: d.date,
    dateLabel: new Date(d.dateObj).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    invested: Math.round(d.investedAmount),
    totalValue: Math.round(d.totalValue),
    totalReturn: parseFloat(d.totalReturn.toFixed(2)),
    pnl: Math.round(d.realizedPnL + d.unrealizedPnL),
  }));
}

/**
 * 최근 N개 데이터 포인트만 반환 (차트 가독성)
 */
export function getRecentTimeseriesData(
  data: TimeseriesDataPoint[],
  limit: number = 30
): TimeseriesDataPoint[] {
  return data.slice(Math.max(0, data.length - limit));
}
