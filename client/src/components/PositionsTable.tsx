// ============================================================
// PositionsTable — Holdings positions with avg cost & P&L
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatKRW, formatPercent, formatPnL } from "@/lib/portfolio";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACCOUNT_BADGE: Record<string, string> = {
  "연금저축": "bg-[oklch(0.72_0.18_168)/0.15] text-[oklch(0.72_0.18_168)] border-[oklch(0.72_0.18_168)/0.3]",
  "IRP": "bg-[oklch(0.72_0.18_60)/0.15] text-[oklch(0.72_0.18_60)] border-[oklch(0.72_0.18_60)/0.3]",
  "일반": "bg-[oklch(0.65_0.16_200)/0.15] text-[oklch(0.65_0.16_200)] border-[oklch(0.65_0.16_200)/0.3]",
};

export default function PositionsTable() {
  const { positions } = usePortfolio();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (positions.length === 0) {
    return (
      <div className="card-terminal rounded-xl p-6">
        <h2 className="font-['Sora'] font-semibold text-base text-foreground mb-4">
          보유 종목
        </h2>
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-3 opacity-20">📊</div>
          <p className="text-sm">매매 이력을 추가하면 보유 종목이 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-terminal rounded-xl overflow-hidden">
      <div className="p-5 pb-3">
        <h2 className="font-['Sora'] font-semibold text-base text-foreground">
          보유 종목
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {positions.length}개
          </span>
        </h2>
      </div>

      {/* Table Header */}
      <div className="px-5 pb-2">
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-[oklch(0.22_0.02_250)] pb-2">
          <div className="col-span-3">종목</div>
          <div className="col-span-2 text-right">평단가</div>
          <div className="col-span-2 text-right">현재가</div>
          <div className="col-span-2 text-right">평가금액</div>
          <div className="col-span-2 text-right">수익률</div>
          <div className="col-span-1 text-right">수량</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[oklch(0.18_0.02_250)]">
        {positions.map((pos, i) => {
          const isExpanded = expandedRow === `${pos.ticker}__${pos.accountId}`;
          const pnlPositive = pos.unrealizedPnLPct >= 0;
          const pnlColor = pnlPositive
            ? "text-[oklch(0.72_0.18_168)]"
            : "text-[oklch(0.62_0.22_15)]";
          const hasCurrentPrice = pos.currentPrice > 0;

          return (
            <motion.div
              key={`${pos.ticker}__${pos.accountId}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                className="px-5 py-3 hover:bg-[oklch(0.16_0.02_250)] cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedRow(
                    isExpanded ? null : `${pos.ticker}__${pos.accountId}`
                  )
                }
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* 종목 */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-['JetBrains_Mono'] text-sm font-semibold text-[oklch(0.72_0.18_168)]">
                          {pos.ticker}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {pos.name}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                        ACCOUNT_BADGE[pos.accountType] ??
                        "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {pos.accountType}
                    </span>
                  </div>

                  {/* 평단가 */}
                  <div className="col-span-2 text-right font-['JetBrains_Mono'] text-sm">
                    {formatKRW(pos.avgCost)}
                  </div>

                  {/* 현재가 */}
                  <div className="col-span-2 text-right font-['JetBrains_Mono'] text-sm">
                    {hasCurrentPrice ? (
                      formatKRW(pos.currentPrice)
                    ) : (
                      <span className="text-muted-foreground text-xs">미입력</span>
                    )}
                  </div>

                  {/* 평가금액 */}
                  <div className="col-span-2 text-right font-['JetBrains_Mono'] text-sm">
                    {hasCurrentPrice ? (
                      formatKRW(pos.currentValue)
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>

                  {/* 수익률 */}
                  <div className={`col-span-2 text-right font-['JetBrains_Mono'] text-sm ${hasCurrentPrice ? pnlColor : "text-muted-foreground"}`}>
                    {hasCurrentPrice ? (
                      <div className="flex items-center justify-end gap-1">
                        {pnlPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatPercent(pos.unrealizedPnLPct)}
                      </div>
                    ) : (
                      <Minus className="w-3 h-3 ml-auto" />
                    )}
                  </div>

                  {/* 수량 */}
                  <div className="col-span-1 text-right font-['JetBrains_Mono'] text-sm text-muted-foreground">
                    {pos.totalQuantity}
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 bg-[oklch(0.11_0.02_250)]">
                      <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-[oklch(0.15_0.02_250)] rounded p-3">
                          <div className="text-xs text-muted-foreground mb-1">총 매수금액</div>
                          <div className="font-['JetBrains_Mono'] text-sm font-semibold">
                            {formatKRW(pos.totalCost)}
                          </div>
                        </div>
                        <div className="bg-[oklch(0.15_0.02_250)] rounded p-3">
                          <div className="text-xs text-muted-foreground mb-1">미실현 손익</div>
                          <div className={`font-['JetBrains_Mono'] text-sm font-semibold ${hasCurrentPrice ? pnlColor : "text-muted-foreground"}`}>
                            {hasCurrentPrice ? formatPnL(pos.unrealizedPnL) : "—"}
                          </div>
                        </div>
                        <div className="bg-[oklch(0.15_0.02_250)] rounded p-3">
                          <div className="text-xs text-muted-foreground mb-1">실현 손익</div>
                          <div className={`font-['JetBrains_Mono'] text-sm font-semibold ${pos.realizedPnL >= 0 ? "text-[oklch(0.72_0.18_168)]" : "text-[oklch(0.62_0.22_15)]"}`}>
                            {formatPnL(pos.realizedPnL)}
                          </div>
                        </div>
                        <div className="bg-[oklch(0.15_0.02_250)] rounded p-3">
                          <div className="text-xs text-muted-foreground mb-1">보유 수량</div>
                          <div className="font-['JetBrains_Mono'] text-sm font-semibold">
                            {pos.totalQuantity}주
                          </div>
                        </div>
                      </div>

                      {/* Trade history */}
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        매매 이력
                      </div>
                      <div className="space-y-1">
                        {pos.trades.map((trade) => (
                          <div
                            key={trade.id}
                            className="flex items-center justify-between text-xs py-1.5 px-3 rounded bg-[oklch(0.13_0.02_250)]"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-['JetBrains_Mono'] font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                                  trade.type === "buy"
                                    ? "bg-[oklch(0.72_0.18_168)/0.15] text-[oklch(0.72_0.18_168)]"
                                    : "bg-[oklch(0.62_0.22_15)/0.15] text-[oklch(0.62_0.22_15)]"
                                }`}
                              >
                                {trade.type === "buy" ? "매수" : "매도"}
                              </span>
                              <span className="text-muted-foreground font-['JetBrains_Mono']">
                                {trade.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 font-['JetBrains_Mono']">
                              <span className="text-muted-foreground">
                                {trade.quantity}주
                              </span>
                              <span className="text-foreground">
                                @{formatKRW(trade.price)}
                              </span>
                              <span className="text-muted-foreground">
                                수수료 {formatKRW(trade.fee)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
