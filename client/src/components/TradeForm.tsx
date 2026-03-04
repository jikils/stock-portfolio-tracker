// ============================================================
// TradeForm — Add/Edit trade dialog
// Design: Bloomberg Terminal Aesthetic — deep navy, emerald accents
// ============================================================

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trade, TradeType, AccountType } from "@/lib/portfolio";

const tradeSchema = z.object({
  ticker: z.string().min(1, "종목 코드를 입력하세요").max(20),
  name: z.string().min(1, "종목명을 입력하세요").max(50),
  type: z.enum(["buy", "sell"]),
  quantity: z.preprocess((v) => Number(v), z.number().positive("수량은 0보다 커야 합니다")),
  price: z.preprocess((v) => Number(v), z.number().positive("단가는 0보다 커야 합니다")),
  fee: z.preprocess((v) => Number(v), z.number().min(0, "수수료는 0 이상이어야 합니다")),
  date: z.string().min(1, "거래일을 입력하세요"),
  account: z.string().min(1, "계좌를 선택하세요"),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Trade, "id">) => void;
  initialData?: Trade;
  mode?: "add" | "edit";
}

const ACCOUNT_OPTIONS: AccountType[] = ["연금저축", "IRP", "일반"];

export default function TradeForm({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}: TradeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<TradeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: {
      type: "buy",
      fee: 0,
      date: new Date().toISOString().split("T")[0],
      account: "연금저축",
    },
  });

  const tradeType = watch("type");
  const quantity = watch("quantity") || 0;
  const price = watch("price") || 0;
  const fee = watch("fee") || 0;
  const totalAmount = quantity * price + (tradeType === "buy" ? fee : -fee);

  useEffect(() => {
    if (initialData && open) {
      reset({
        ticker: initialData.ticker,
        name: initialData.name,
        type: initialData.type,
        quantity: initialData.quantity,
        price: initialData.price,
        fee: initialData.fee,
        date: initialData.date,
        account: initialData.account,
      });
    } else if (!initialData && open) {
      reset({
        type: "buy",
        fee: 0,
        date: new Date().toISOString().split("T")[0],
        account: "연금저축",
      });
    }
  }, [initialData, open, reset]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = (data: any) => {
    onSubmit({
      ticker: data.ticker.toUpperCase(),
      name: data.name,
      type: data.type as TradeType,
      quantity: data.quantity,
      price: data.price,
      fee: data.fee,
      date: data.date,
      account: data.account,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[oklch(0.13_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground">
        <DialogHeader>
          <DialogTitle className="font-['Sora'] text-lg font-semibold text-foreground">
            {mode === "add" ? "매매 이력 추가" : "매매 이력 수정"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 매수/매도 선택 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("type", "buy")}
              className={`py-2.5 rounded text-sm font-semibold font-['JetBrains_Mono'] transition-all ${
                tradeType === "buy"
                  ? "bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)]"
                  : "bg-[oklch(0.18_0.02_250)] text-muted-foreground hover:bg-[oklch(0.22_0.02_250)]"
              }`}
            >
              매수 (BUY)
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "sell")}
              className={`py-2.5 rounded text-sm font-semibold font-['JetBrains_Mono'] transition-all ${
                tradeType === "sell"
                  ? "bg-[oklch(0.62_0.22_15)] text-white"
                  : "bg-[oklch(0.18_0.02_250)] text-muted-foreground hover:bg-[oklch(0.22_0.02_250)]"
              }`}
            >
              매도 (SELL)
            </button>
          </div>

          {/* 종목 코드 + 종목명 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">종목 코드</Label>
              <Input
                {...register("ticker")}
                placeholder="005930"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] font-['JetBrains_Mono'] uppercase"
              />
              {errors.ticker && (
                <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.ticker.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">종목명</Label>
              <Input
                {...register("name")}
                placeholder="삼성전자"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)]"
              />
              {errors.name && (
                <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* 수량 + 단가 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">수량 (주)</Label>
              <Input
                {...register("quantity")}
                type="number"
                placeholder="100"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] font-['JetBrains_Mono']"
              />
              {errors.quantity && (
                <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">단가 (원)</Label>
              <Input
                {...register("price")}
                type="number"
                placeholder="72000"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] font-['JetBrains_Mono']"
              />
              {errors.price && (
                <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* 수수료 + 거래일 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">수수료 (원)</Label>
              <Input
                {...register("fee")}
                type="number"
                placeholder="0"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] font-['JetBrains_Mono']"
              />
              {errors.fee && (
                <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.fee.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">거래일</Label>
              <Input
                {...register("date")}
                type="date"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] font-['JetBrains_Mono']"
              />
              {errors.date && (
                <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* 계좌 선택 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">계좌 유형</Label>
            <Select
              defaultValue={initialData?.account ?? "연금저축"}
              onValueChange={(v) => setValue("account", v)}
            >
              <SelectTrigger className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)]">
                <SelectValue placeholder="계좌 선택" />
              </SelectTrigger>
              <SelectContent className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.25_0.02_250)]">
                {ACCOUNT_OPTIONS.map((acc) => (
                  <SelectItem key={acc} value={acc}>
                    {acc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 거래 금액 미리보기 */}
          <div className="rounded bg-[oklch(0.18_0.02_250)] border border-[oklch(0.25_0.02_250)] p-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>거래 금액</span>
              <span className="font-['JetBrains_Mono']">
                {(quantity * price).toLocaleString("ko-KR")}원
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>수수료</span>
              <span className="font-['JetBrains_Mono']">{fee.toLocaleString("ko-KR")}원</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-[oklch(0.25_0.02_250)] pt-1 mt-1">
              <span>총 {tradeType === "buy" ? "매수" : "매도"} 금액</span>
              <span
                className={`font-['JetBrains_Mono'] ${
                  tradeType === "buy" ? "text-[oklch(0.72_0.18_168)]" : "text-[oklch(0.62_0.22_15)]"
                }`}
              >
                {totalAmount.toLocaleString("ko-KR")}원
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[oklch(0.25_0.02_250)] hover:bg-[oklch(0.18_0.02_250)]"
            >
              취소
            </Button>
            <Button
              type="submit"
              className={`font-semibold ${
                tradeType === "buy"
                  ? "bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)]"
                  : "bg-[oklch(0.62_0.22_15)] text-white hover:bg-[oklch(0.55_0.22_15)]"
              }`}
            >
              {mode === "add" ? "추가" : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
