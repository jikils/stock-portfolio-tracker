// ============================================================
// DividendForm — Dividend record input dialog
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Dividend } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface DividendFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Dividend, "id">) => void;
}

export default function DividendForm({ open, onClose, onSubmit }: DividendFormProps) {
  const { positions, currentAccountId } = usePortfolio();
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [exDate, setExDate] = useState("");
  const [payDate, setPayDate] = useState("");
  const [dividendPerShare, setDividendPerShare] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticker || !name || !exDate || !payDate || !dividendPerShare || !quantity) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }

    const dps = parseFloat(dividendPerShare);
    const qty = parseInt(quantity);

    if (isNaN(dps) || isNaN(qty) || dps <= 0 || qty <= 0) {
      toast.error("올바른 숫자를 입력해주세요");
      return;
    }

    const totalDiv = dps * qty;

    // Find current price for dividend yield calculation
    const position = positions.find((p) => p.ticker === ticker);
    const currentPrice = position?.currentPrice || 0;
    const dividendYield =
      currentPrice > 0 ? ((dps / currentPrice) * 100) : 0;

    onSubmit({
      accountId: currentAccountId,
      ticker,
      name,
      exDate,
      payDate,
      dividendPerShare: dps,
      totalDividend: totalDiv,
      quantity: qty,
      dividendYield,
    });

    toast.success(`${name} 배당 이력이 추가되었습니다`);
    
    setTicker("");
    setName("");
    setExDate("");
    setPayDate("");
    setDividendPerShare("");
    setQuantity("");
    onClose();
  };

  const handleClose = () => {
    setTicker("");
    setName("");
    setExDate("");
    setPayDate("");
    setDividendPerShare("");
    setQuantity("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose(); }}>
      <DialogContent className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Sora'] text-lg">배당 이력 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ticker */}
          <div>
            <Label className="text-xs text-muted-foreground">종목 코드</Label>
            <Input
              placeholder="005930"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.22_0.02_250)] text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Name */}
          <div>
            <Label className="text-xs text-muted-foreground">종목명</Label>
            <Input
              placeholder="삼성전자"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.22_0.02_250)] text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Ex-Date */}
          <div>
            <Label className="text-xs text-muted-foreground">배당락일</Label>
            <Input
              type="date"
              value={exDate}
              onChange={(e) => setExDate(e.target.value)}
              className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.22_0.02_250)] text-foreground"
            />
          </div>

          {/* Pay Date */}
          <div>
            <Label className="text-xs text-muted-foreground">지급일</Label>
            <Input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.22_0.02_250)] text-foreground"
            />
          </div>

          {/* Dividend Per Share */}
          <div>
            <Label className="text-xs text-muted-foreground">주당 배당금</Label>
            <Input
              type="number"
              placeholder="2500"
              value={dividendPerShare}
              onChange={(e) => setDividendPerShare(e.target.value)}
              className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.22_0.02_250)] text-foreground placeholder:text-muted-foreground font-['JetBrains_Mono']"
            />
          </div>

          {/* Quantity */}
          <div>
            <Label className="text-xs text-muted-foreground">배당 기준 수량</Label>
            <Input
              type="number"
              placeholder="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.22_0.02_250)] text-foreground placeholder:text-muted-foreground font-['JetBrains_Mono']"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-[oklch(0.3_0.02_250)] hover:bg-[oklch(0.18_0.02_250)]"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)] font-semibold gap-1"
            >
              <Plus className="w-4 h-4" />
              추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
