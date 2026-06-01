// Portfolio calculation utilities
// Design: Bloomberg Terminal Aesthetic
// ============================================================

export type TradeType = "buy" | "sell";
export type AccountType = "연금저축" | "IRP" | "일반";

/**
 * 다중 사용자/계좌 구조
 */
export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  createdAt: string;
}

export interface Trade {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  type: TradeType;
  quantity: number;
  price: number;
  fee: number;
  date: string;
}

export interface Dividend {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  exDate: string;
  payDate: string;
  dividendPerShare: number;
  totalDividend: number;
  quantity: number;
  dividendYield: number;
}

export type CashFlowType = "deposit" | "withdrawal";

export interface CashFlow {
  id: string;
  accountId: string;
  type: CashFlowType;
  amount: number;
  fee: number;
  date: string;
  note?: string;
}

export interface HoldingPosition {
  ticker: string;
  name: string;
  accountId: string;
  accountName: string;
  accountType: AccountType;
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
  accountId: string;
  accountName: string;
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
  currentPrices: Record<string, number>,
  accounts: Account[]
): HoldingPosition[] {
  const accountMap = new Map(accounts.map(a => [a.id, a]));
  
  const positions = new Map<string, HoldingPosition>();

  for (const trade of trades) {
    const key = `${trade.accountId}:${trade.ticker}`;
    const account = accountMap.get(trade.accountId);
    
    if (!account) continue;

    if (!positions.has(key)) {
      positions.set(key, {
        ticker: trade.ticker,
        name: trade.name,
        accountId: trade.accountId,
        accountName: account.name,
        accountType: account.type,
        totalQuantity: 0,
        avgCost: 0,
        totalCost: 0,
        currentPrice: currentPrices[trade.ticker] || 0,
        currentValue: 0,
        unrealizedPnL: 0,
        unrealizedPnLPct: 0,
        realizedPnL: 0,
        totalPnL: 0,
        trades: [],
      });
    }

    const position = positions.get(key)!;
    position.trades.push(trade);

    if (trade.type === "buy") {
      const newCost = position.totalCost + trade.quantity * trade.price + trade.fee;
      const newQuantity = position.totalQuantity + trade.quantity;
      position.avgCost = newQuantity > 0 ? newCost / newQuantity : 0;
      position.totalCost = newCost;
      position.totalQuantity = newQuantity;
    } else {
      position.totalQuantity -= trade.quantity;
      position.totalCost -= trade.quantity * position.avgCost;
    }

    position.currentPrice = currentPrices[trade.ticker] || 0;
    position.currentValue = position.totalQuantity * position.currentPrice;
    position.unrealizedPnL = position.currentValue - position.totalCost;
    position.unrealizedPnLPct =
      position.totalCost > 0 ? (position.unrealizedPnL / position.totalCost) * 100 : 0;
    position.totalPnL = position.unrealizedPnL + position.realizedPnL;
  }

  return Array.from(positions.values()).filter((p) => p.totalQuantity > 0);
}

export function calculateSummary(positions: HoldingPosition[]): PortfolioSummary {
  const byAccount: Record<string, any> = {};

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalRealizedPnL = 0;

  for (const position of positions) {
    totalInvested += position.totalCost;
    totalCurrentValue += position.currentValue;
    totalRealizedPnL += position.realizedPnL;

    if (!byAccount[position.accountId]) {
      byAccount[position.accountId] = {
        invested: 0,
        currentValue: 0,
        pnl: 0,
        pnlPct: 0,
      };
    }

    byAccount[position.accountId].invested += position.totalCost;
    byAccount[position.accountId].currentValue += position.currentValue;
    byAccount[position.accountId].pnl +=
      position.currentValue - position.totalCost + position.realizedPnL;
  }

  // Calculate percentage for each account
  for (const accountId in byAccount) {
    const account = byAccount[accountId];
    account.pnlPct = account.invested > 0 ? (account.pnl / account.invested) * 100 : 0;
  }

  const totalUnrealizedPnL = totalCurrentValue - totalInvested;
  const totalUnrealizedPnLPct =
    totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalCurrentValue,
    totalUnrealizedPnL,
    totalUnrealizedPnLPct,
    totalRealizedPnL,
    byAccount,
  };
}

export function calculateAssetAllocation(positions: HoldingPosition[]): AssetAllocation[] {
  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);

  return positions.map((position, index) => ({
    name: position.name,
    ticker: position.ticker,
    accountId: position.accountId,
    accountName: position.accountName,
    value: position.currentValue,
    percentage: totalValue > 0 ? (position.currentValue / totalValue) * 100 : 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
}

export function calculateAccountAllocation(positions: HoldingPosition[]): AssetAllocation[] {
  const byAccount = new Map<string, { value: number; name: string; type: AccountType }>();

  for (const position of positions) {
    if (!byAccount.has(position.accountId)) {
      byAccount.set(position.accountId, {
        value: 0,
        name: position.accountName,
        type: position.accountType,
      });
    }
    byAccount.get(position.accountId)!.value += position.currentValue;
  }

  const totalValue = Array.from(byAccount.values()).reduce((sum, a) => sum + a.value, 0);

  return Array.from(byAccount.entries()).map(([accountId, data], index) => ({
    name: data.name,
    ticker: accountId,
    accountId,
    accountName: data.name,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
}

export function formatKRW(value: number, decimals = 0): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
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
export const SAMPLE_USERS: User[] = [
  {
    id: "user1",
    name: "김철수",
    createdAt: "2024-01-01",
  },
  {
    id: "user2",
    name: "이영희",
    createdAt: "2024-01-05",
  },
];

export const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    userId: "user1",
    name: "일반 계좌",
    type: "일반",
    createdAt: "2024-01-01",
  },
  {
    id: "acc2",
    userId: "user1",
    name: "연금저축",
    type: "연금저축",
    createdAt: "2024-01-01",
  },
  {
    id: "acc3",
    userId: "user1",
    name: "IRP",
    type: "IRP",
    createdAt: "2024-01-01",
  },
  {
    id: "acc4",
    userId: "user2",
    name: "일반 계좌",
    type: "일반",
    createdAt: "2024-01-05",
  },
];

export const SAMPLE_TRADES: Trade[] = [
  {
    id: "1",
    accountId: "acc1",
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    type: "buy",
    quantity: 10,
    price: 820820,
    fee: 41041,
    date: "2024-01-15",
  },
  {
    id: "2",
    accountId: "acc2",
    ticker: "005930",
    name: "삼성전자",
    type: "buy",
    quantity: 50,
    price: 72000,
    fee: 3600,
    date: "2024-01-15",
  },
  {
    id: "3",
    accountId: "acc2",
    ticker: "005930",
    name: "삼성전자",
    type: "buy",
    quantity: 30,
    price: 68000,
    fee: 2040,
    date: "2024-03-10",
  },
  {
    id: "4",
    accountId: "acc1",
    ticker: "AAPL",
    name: "Apple Inc.",
    type: "buy",
    quantity: 25,
    price: 185185,
    fee: 9259,
    date: "2024-02-20",
  },
  {
    id: "5",
    accountId: "acc3",
    ticker: "373220",
    name: "LG에너지솔루션",
    type: "buy",
    quantity: 10,
    price: 420420,
    fee: 21021,
    date: "2024-01-20",
  },
  {
    id: "6",
    accountId: "acc3",
    ticker: "000660",
    name: "SK하이닉스",
    type: "buy",
    quantity: 20,
    price: 135135,
    fee: 6757,
    date: "2024-02-10",
  },
  {
    id: "7",
    accountId: "acc2",
    ticker: "035420",
    name: "NAVER",
    type: "buy",
    quantity: 10,
    price: 185185,
    fee: 9259,
    date: "2024-03-01",
  },
];

export const SAMPLE_PRICES: Record<string, number> = {
  NVDA: 1250000,
  "005930": 75500,
  AAPL: 198000,
  "373220": 385000,
  "000660": 158000,
  "035420": 178000,
};

export const SAMPLE_CASHFLOWS: CashFlow[] = [
  {
    id: "cf1",
    accountId: "acc1",
    type: "deposit",
    amount: 10000000,
    fee: 0,
    date: "2023-12-01",
    note: "초기 입금",
  },
  {
    id: "cf2",
    accountId: "acc2",
    type: "deposit",
    amount: 5000000,
    fee: 0,
    date: "2024-01-01",
    note: "월급 입금",
  },
  {
    id: "cf3",
    accountId: "acc2",
    type: "deposit",
    amount: 3000000,
    fee: 0,
    date: "2024-02-15",
    note: "보너스",
  },
];

export function calculateYearlyDividends(dividends: Dividend[]): Array<{ year: number; totalDividend: number }> {
  const byYear: Record<number, number> = {};

  for (const div of dividends) {
    const year = new Date(div.payDate).getFullYear();
    byYear[year] = (byYear[year] ?? 0) + div.totalDividend;
  }

  return Object.entries(byYear)
    .map(([year, total]) => ({
      year: parseInt(year),
      totalDividend: total,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * 예상 배당금 계산 - 현재 보유 주식과 최근 배당 이력 기반
 */
export interface ProjectedDividend {
  ticker: string;
  name: string;
  currentQuantity: number;
  lastDividendPerShare: number;
  projectedAnnualDividend: number;
}

export function calculateProjectedDividends(
  holdings: HoldingPosition[],
  dividends: Dividend[]
): ProjectedDividend[] {
  const result: ProjectedDividend[] = [];

  for (const holding of holdings) {
    // 해당 종목의 배당 이력 중 가장 최근 배당 찾기
    const tickerDividends = dividends.filter((d) => d.ticker === holding.ticker);
    
    if (tickerDividends.length > 0) {
      // 가장 최근 배당 (지급일 기준)
      const lastDividend = tickerDividends.reduce((latest, current) => {
        return new Date(current.payDate) > new Date(latest.payDate) ? current : latest;
      });

      // 예상 연 배당금 = 최근 배당 × 현재 보유 수량
      const projectedAnnual = lastDividend.dividendPerShare * holding.totalQuantity;

      result.push({
        ticker: holding.ticker,
        name: holding.name,
        currentQuantity: holding.totalQuantity,
        lastDividendPerShare: lastDividend.dividendPerShare,
        projectedAnnualDividend: projectedAnnual,
      });
    }
  }

  return result.sort((a, b) => b.projectedAnnualDividend - a.projectedAnnualDividend);
}

export interface ProjectedDividendSummary {
  totalProjectedDividend: number;
  projectedDividendYield: number;
  tickerCount: number;
}

export function calculateProjectedDividendSummary(
  projected: ProjectedDividend[],
  totalPortfolioValue: number
): ProjectedDividendSummary {
  const totalProjected = projected.reduce((sum, p) => sum + p.projectedAnnualDividend, 0);
  const yield_ = totalPortfolioValue > 0 ? (totalProjected / totalPortfolioValue) * 100 : 0;

  return {
    totalProjectedDividend: totalProjected,
    projectedDividendYield: yield_,
    tickerCount: projected.length,
  };
}

export interface YearlyDividend {
  year: number;
  totalDividend: number;
}
