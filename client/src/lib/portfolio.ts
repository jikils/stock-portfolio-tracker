// ============================================================
// Portfolio calculation utilities
// Design: Bloomberg Terminal Aesthetic
// ============================================================

export type TradeType = "buy" | "sell";

export interface Trade {
  id: string;
  ticker: string;       // 종목 코드 (예: 005930, AAPL)
  name: string;         // 종목명
  type: TradeType;      // 매수/매도
  quantity: number;     // 수량
  price: number;        // 단가
  fee: number;          // 수수료 (원)
  date: string;         // 거래일 (YYYY-MM-DD)
  account: string;      // 계좌 유형 (연금저축, IRP, 일반)
}

export type AccountType = "연금저축" | "IRP" | "일반";

export interface HoldingPosition {
  ticker: string;
  name: string;
  account: string;
  totalQuantity: number;        // 보유 수량
  avgCost: number;              // 평단가 (수수료 포함)
  totalCost: number;            // 총 매수 금액
  currentPrice: number;         // 현재가 (사용자 입력)
  currentValue: number;         // 현재 평가금액
  unrealizedPnL: number;        // 미실현 손익
  unrealizedPnLPct: number;     // 미실현 수익률 (%)
  realizedPnL: number;          // 실현 손익
  totalPnL: number;             // 총 손익
  trades: Trade[];
}

export interface PortfolioSummary {
  totalInvested: number;        // 총 투자금액
  totalCurrentValue: number;    // 총 평가금액
  totalUnrealizedPnL: number;   // 총 미실현 손익
  totalUnrealizedPnLPct: number;// 총 수익률
  totalRealizedPnL: number;     // 총 실현 손익
  byAccount: Record<string, {
    invested: number;
    currentValue: number;
    pnl: number;
    pnlPct: number;
  }>;
}

export interface AssetAllocation {
  name: string;
  ticker: string;
  account: string;
  value: number;
  percentage: number;
  color: string;
}

// Chart color palette for asset allocation
export const CHART_COLORS = [
  "#00D4AA", // emerald
  "#F59E0B", // amber
  "#60A5FA", // blue
  "#A78BFA", // violet
  "#F472B6", // pink
  "#34D399", // green
  "#FB923C", // orange
  "#38BDF8", // sky
  "#C084FC", // purple
  "#4ADE80", // lime
  "#FCD34D", // yellow
  "#F87171", // red
  "#2DD4BF", // teal
  "#818CF8", // indigo
  "#E879F9", // fuchsia
];

/**
 * 주어진 매매 이력으로 종목별 보유 포지션 계산
 * 평단가 = (매수금액 합계 + 수수료 합계) / 보유 수량
 * 선입선출(FIFO) 방식으로 실현 손익 계산
 */
export function calculatePositions(
  trades: Trade[],
  currentPrices: Record<string, number>
): HoldingPosition[] {
  // Group trades by ticker + account
  const groupKey = (t: Trade) => `${t.ticker}__${t.account}`;
  const groups: Record<string, Trade[]> = {};

  for (const trade of trades) {
    const key = groupKey(trade);
    if (!groups[key]) groups[key] = [];
    groups[key].push(trade);
  }

  const positions: HoldingPosition[] = [];

  for (const [key, groupTrades] of Object.entries(groups)) {
    const sorted = [...groupTrades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // FIFO queue: [{qty, costPerShare}]
    const buyQueue: { qty: number; costPerShare: number }[] = [];
    let realizedPnL = 0;

    for (const trade of sorted) {
      if (trade.type === "buy") {
        const costPerShare = (trade.price * trade.quantity + trade.fee) / trade.quantity;
        buyQueue.push({ qty: trade.quantity, costPerShare });
      } else {
        // sell — FIFO
        let remainSell = trade.quantity;
        const sellFeePerShare = trade.fee / trade.quantity;
        while (remainSell > 0 && buyQueue.length > 0) {
          const front = buyQueue[0];
          const matched = Math.min(front.qty, remainSell);
          realizedPnL +=
            matched * (trade.price - front.costPerShare - sellFeePerShare);
          front.qty -= matched;
          remainSell -= matched;
          if (front.qty === 0) buyQueue.shift();
        }
      }
    }

    // Remaining buy queue = current holdings
    const totalQuantity = buyQueue.reduce((s, b) => s + b.qty, 0);
    if (totalQuantity <= 0) continue; // fully sold out

    const totalCostInQueue = buyQueue.reduce(
      (s, b) => s + b.qty * b.costPerShare,
      0
    );
    const avgCost = totalCostInQueue / totalQuantity;

    const ticker = sorted[0].ticker;
    const currentPrice = currentPrices[ticker] ?? 0;
    const currentValue = totalQuantity * currentPrice;
    const unrealizedPnL = currentValue - totalCostInQueue;
    const unrealizedPnLPct =
      totalCostInQueue > 0 ? (unrealizedPnL / totalCostInQueue) * 100 : 0;

    positions.push({
      ticker,
      name: sorted[0].name,
      account: sorted[0].account,
      totalQuantity,
      avgCost,
      totalCost: totalCostInQueue,
      currentPrice,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPct,
      realizedPnL,
      totalPnL: unrealizedPnL + realizedPnL,
      trades: sorted,
    });
  }

  return positions.sort((a, b) => b.currentValue - a.currentValue);
}

/**
 * 포트폴리오 요약 통계 계산
 */
export function calculateSummary(positions: HoldingPosition[]): PortfolioSummary {
  const byAccount: PortfolioSummary["byAccount"] = {};

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalUnrealizedPnL = 0;
  let totalRealizedPnL = 0;

  for (const pos of positions) {
    totalInvested += pos.totalCost;
    totalCurrentValue += pos.currentValue;
    totalUnrealizedPnL += pos.unrealizedPnL;
    totalRealizedPnL += pos.realizedPnL;

    if (!byAccount[pos.account]) {
      byAccount[pos.account] = { invested: 0, currentValue: 0, pnl: 0, pnlPct: 0 };
    }
    byAccount[pos.account].invested += pos.totalCost;
    byAccount[pos.account].currentValue += pos.currentValue;
    byAccount[pos.account].pnl += pos.unrealizedPnL;
  }

  for (const acc of Object.values(byAccount)) {
    acc.pnlPct = acc.invested > 0 ? (acc.pnl / acc.invested) * 100 : 0;
  }

  return {
    totalInvested,
    totalCurrentValue,
    totalUnrealizedPnL,
    totalUnrealizedPnLPct:
      totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0,
    totalRealizedPnL,
    byAccount,
  };
}

/**
 * 자산 배분 비율 계산 (종목별)
 */
export function calculateAssetAllocation(
  positions: HoldingPosition[]
): AssetAllocation[] {
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  if (total === 0) return [];

  return positions.map((pos, i) => ({
    name: pos.name,
    ticker: pos.ticker,
    account: pos.account,
    value: pos.currentValue,
    percentage: (pos.currentValue / total) * 100,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

/**
 * 계좌별 자산 배분 계산
 */
export function calculateAccountAllocation(
  positions: HoldingPosition[]
): AssetAllocation[] {
  const total = positions.reduce((s, p) => s + p.currentValue, 0);
  if (total === 0) return [];

  const byAccount: Record<string, number> = {};
  for (const pos of positions) {
    byAccount[pos.account] = (byAccount[pos.account] ?? 0) + pos.currentValue;
  }

  const accountColors: Record<string, string> = {
    "연금저축": "#00D4AA",
    "IRP": "#F59E0B",
    "일반": "#60A5FA",
  };

  return Object.entries(byAccount).map(([account, value], i) => ({
    name: account,
    ticker: account,
    account,
    value,
    percentage: (value / total) * 100,
    color: accountColors[account] ?? CHART_COLORS[i % CHART_COLORS.length],
  }));
}

/**
 * 숫자 포맷 유틸리티
 */
export function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatPnL(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatKRW(value)}`;
}

// Sample data for demonstration
export const SAMPLE_TRADES: Trade[] = [
  {
    id: "1",
    ticker: "005930",
    name: "삼성전자",
    type: "buy",
    quantity: 50,
    price: 72000,
    fee: 3600,
    date: "2024-01-15",
    account: "연금저축",
  },
  {
    id: "2",
    ticker: "005930",
    name: "삼성전자",
    type: "buy",
    quantity: 30,
    price: 68000,
    fee: 2040,
    date: "2024-03-10",
    account: "연금저축",
  },
  {
    id: "3",
    ticker: "000660",
    name: "SK하이닉스",
    type: "buy",
    quantity: 20,
    price: 135000,
    fee: 2700,
    date: "2024-02-20",
    account: "IRP",
  },
  {
    id: "4",
    ticker: "035420",
    name: "NAVER",
    type: "buy",
    quantity: 15,
    price: 185000,
    fee: 2775,
    date: "2024-04-05",
    account: "연금저축",
  },
  {
    id: "5",
    ticker: "035420",
    name: "NAVER",
    type: "sell",
    quantity: 5,
    price: 195000,
    fee: 975,
    date: "2024-06-15",
    account: "연금저축",
  },
  {
    id: "6",
    ticker: "373220",
    name: "LG에너지솔루션",
    type: "buy",
    quantity: 10,
    price: 420000,
    fee: 4200,
    date: "2024-05-20",
    account: "IRP",
  },
  {
    id: "7",
    ticker: "AAPL",
    name: "Apple Inc.",
    type: "buy",
    quantity: 25,
    price: 185000,
    fee: 4625,
    date: "2024-03-01",
    account: "일반",
  },
  {
    id: "8",
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    type: "buy",
    quantity: 10,
    price: 820000,
    fee: 8200,
    date: "2024-02-10",
    account: "일반",
  },
];

export const SAMPLE_PRICES: Record<string, number> = {
  "005930": 75500,
  "000660": 158000,
  "035420": 178000,
  "373220": 385000,
  "AAPL": 198000,
  "NVDA": 1250000,
};
