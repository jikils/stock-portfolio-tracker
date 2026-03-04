// ============================================================
// PriceUpdatePanel — Current price input for each ticker
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatKRW } from "@/lib/portfolio";
import { RefreshCw, TrendingUp } from "lucide-react";

export default function PriceUpdatePanel() {
  const { positions, currentPrices, updateCurrentPrice } = usePortfolio();
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});

  // Get unique tickers from positions
  const tickers = Array.from(new Set(positions.map((p) => p.ticker)));

  const handlePriceChange = (ticker: string, value: string) => {
    setLocalPrices((prev) => ({ ...prev, [ticker]: value }));
  };

  const handleApply = (ticker: string) => {
    const val = parseFloat(localPrices[ticker] ?? "");
    if (!isNaN(val) && val > 0) {
      updateCurrentPrice(ticker, val);
      setLocalPrices((prev) => {
        const next = { ...prev };
        delete next[ticker];
        return next;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, ticker: string) => {
    if (e.key === "Enter") handleApply(ticker);
  };

  if (tickers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>매매 이력을 추가하면 현재가를 입력할 수 있습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickers.map((ticker) => {
        const pos = positions.find((p) => p.ticker === ticker);
        const currentPrice = currentPrices[ticker] ?? 0;
        const inputVal = localPrices[ticker] ?? "";

        return (
          <div
            key={ticker}
            className="flex items-center gap-3 p-3 rounded bg-[oklch(0.18_0.02_250)] border border-[oklch(0.25_0.02_250)]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-['JetBrains_Mono'] text-[oklch(0.72_0.18_168)] font-semibold">
                  {ticker}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {pos?.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                현재가:{" "}
                <span className="font-['JetBrains_Mono'] text-foreground">
                  {currentPrice > 0 ? formatKRW(currentPrice) : "미입력"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                value={inputVal}
                onChange={(e) => handlePriceChange(ticker, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, ticker)}
                type="number"
                placeholder={currentPrice > 0 ? String(currentPrice) : "현재가"}
                className="w-28 h-8 text-xs bg-[oklch(0.13_0.02_250)] border-[oklch(0.3_0.02_250)] font-['JetBrains_Mono'] text-right"
              />
              <Button
                size="sm"
                onClick={() => handleApply(ticker)}
                className="h-8 px-2 bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
