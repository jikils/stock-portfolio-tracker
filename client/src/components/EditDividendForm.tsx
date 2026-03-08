// ============================================================
// EditDividendForm — Edit dividend record dialog
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Dividend } from "@/lib/portfolio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface EditDividendFormProps {
  dividend: Dividend;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDividendForm({
  dividend,
  open,
  onOpenChange,
}: EditDividendFormProps) {
  const { updateDividend } = usePortfolio();
  const [formData, setFormData] = useState({
    ticker: dividend.ticker,
    name: dividend.name,
    exDate: dividend.exDate,
    payDate: dividend.payDate,
    dividendPerShare: dividend.dividendPerShare.toString(),
    quantity: dividend.quantity.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dps = parseFloat(formData.dividendPerShare);
    const qty = parseInt(formData.quantity);
    const totalDiv = dps * qty;
    updateDividend(dividend.id, {
      accountId: dividend.accountId,
      ticker: formData.ticker,
      name: formData.name,
      exDate: formData.exDate,
      payDate: formData.payDate,
      dividendPerShare: dps,
      quantity: qty,
      totalDividend: totalDiv,
      dividendYield: 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.25_0.02_250)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">배당 이력 수정</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            배당 정보를 수정하고 저장하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-ticker" className="text-xs text-muted-foreground">
                종목 코드
              </Label>
              <Input
                id="edit-ticker"
                value={formData.ticker}
                onChange={(e) =>
                  setFormData({ ...formData, ticker: e.target.value })
                }
                className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
                placeholder="NVDA"
              />
            </div>
            <div>
              <Label htmlFor="edit-name" className="text-xs text-muted-foreground">
                종목명
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
                placeholder="NVIDIA Corp."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-exDate" className="text-xs text-muted-foreground">
                배당락일
              </Label>
              <Input
                id="edit-exDate"
                type="date"
                value={formData.exDate}
                onChange={(e) =>
                  setFormData({ ...formData, exDate: e.target.value })
                }
                className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-payDate" className="text-xs text-muted-foreground">
                지급일
              </Label>
              <Input
                id="edit-payDate"
                type="date"
                value={formData.payDate}
                onChange={(e) =>
                  setFormData({ ...formData, payDate: e.target.value })
                }
                className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="edit-dividendPerShare"
                className="text-xs text-muted-foreground"
              >
                주당배당금
              </Label>
              <Input
                id="edit-dividendPerShare"
                type="number"
                step="0.01"
                value={formData.dividendPerShare}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dividendPerShare: e.target.value,
                  })
                }
                className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
                placeholder="1500"
              />
            </div>
            <div>
              <Label htmlFor="edit-quantity" className="text-xs text-muted-foreground">
                수량
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="mt-1 bg-[oklch(0.1_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[oklch(0.25_0.02_250)] text-foreground hover:bg-[oklch(0.2_0.02_250)]"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              type="submit"
              className="bg-[oklch(0.72_0.18_168)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.68_0.18_168)]"
            >
              저장
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
