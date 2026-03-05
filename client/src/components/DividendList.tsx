// ============================================================
// DividendList — Dividend history list component
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatKRW, formatPercent } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
import { Trash2, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DividendList() {
  const { dividends, deleteDividend } = usePortfolio();

  if (dividends.length === 0) {
    return (
      <div className="card-terminal rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
          <h2 className="font-['Sora'] font-semibold text-base text-foreground">
            배당 이력
          </h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">배당 이력이 없습니다</p>
        </div>
      </div>
    );
  }

  // Group by ticker
  const byTicker: Record<string, typeof dividends> = {};
  for (const div of dividends) {
    if (!byTicker[div.ticker]) byTicker[div.ticker] = [];
    byTicker[div.ticker].push(div);
  }

  // Sort by pay date descending
  const sortedTickers = Object.keys(byTicker).sort();

  const totalDividends = dividends.reduce((sum, d) => sum + d.totalDividend, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="card-terminal rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[oklch(0.72_0.18_168)]" />
          <h2 className="font-['Sora'] font-semibold text-base text-foreground">
            배당 이력
          </h2>
        </div>
        <div className="text-right">
          <div className="font-['JetBrains_Mono'] text-sm font-semibold text-[oklch(0.72_0.18_168)]">
            {formatKRW(totalDividends)}
          </div>
          <div className="text-xs text-muted-foreground">총 배당금</div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTickers.map((ticker) => {
          const divs = byTicker[ticker];
          const tickerTotal = divs.reduce((sum, d) => sum + d.totalDividend, 0);
          const avgYield =
            divs.reduce((sum, d) => sum + d.dividendYield, 0) / divs.length;

          // Sort by pay date descending
          const sorted = [...divs].sort(
            (a, b) =>
              new Date(b.payDate).getTime() - new Date(a.payDate).getTime()
          );

          return (
            <div
              key={ticker}
              className="bg-[oklch(0.18_0.02_250)] border border-[oklch(0.22_0.02_250)] rounded-lg p-3 space-y-2"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-['JetBrains_Mono'] font-bold text-foreground">
                    {ticker}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {divs[0].name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-['JetBrains_Mono'] text-sm font-semibold text-[oklch(0.72_0.18_168)]">
                    {formatKRW(tickerTotal)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    평균 수익률 {avgYield.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Dividend records */}
              <div className="space-y-1.5 border-t border-[oklch(0.22_0.02_250)] pt-2">
                {sorted.map((div) => (
                  <div
                    key={div.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-muted-foreground">
                        {new Date(div.payDate).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-muted-foreground">
                        {div.quantity}주
                      </div>
                      <div className="font-['JetBrains_Mono'] text-muted-foreground">
                        @{formatKRW(div.dividendPerShare)}/주
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-['JetBrains_Mono'] text-foreground font-medium">
                        {formatKRW(div.totalDividend)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteDividend(div.id);
                          toast.success("배당 이력이 삭제되었습니다");
                        }}
                        className="h-6 w-6 p-0 hover:bg-[oklch(0.62_0.22_15)/0.2] hover:text-[oklch(0.62_0.22_15)]"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
