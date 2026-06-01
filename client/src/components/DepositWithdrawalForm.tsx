import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CashFlow } from "@/lib/portfolio";
import { cashFlowFormSchema, type CashFlowFormData } from "@/lib/schemas";
import { usePortfolio } from "@/contexts/PortfolioContext";

interface DepositWithdrawalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CashFlow, "id">) => void;
}

export default function DepositWithdrawalForm({ open, onClose, onSubmit }: DepositWithdrawalFormProps) {
  const { accounts, currentAccountId } = usePortfolio();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<CashFlowFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(cashFlowFormSchema) as any,
    defaultValues: {
      accountId: currentAccountId,
      type: "deposit",
      amount: 0,
      fee: 0,
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  const selectedType = watch("type");
  const selectedAccountId = watch("accountId");

  useEffect(() => {
    if (open) {
      reset({
        accountId: currentAccountId,
        type: "deposit",
        amount: 0,
        fee: 0,
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
    }
  }, [open, currentAccountId, reset]);

  const handleFormSubmit = (data: CashFlowFormData) => {
    onSubmit({
      accountId: data.accountId,
      type: data.type,
      amount: data.amount,
      fee: data.fee,
      date: data.date,
      note: data.note || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[oklch(0.13_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground">
        <DialogHeader>
          <DialogTitle className="font-['Sora'] text-lg font-semibold text-foreground">
            입출금 추가
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 입금/출금 선택 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("type", "deposit")}
              className={`py-2.5 rounded text-sm font-semibold transition-all ${
                selectedType === "deposit"
                  ? "bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)]"
                  : "bg-[oklch(0.18_0.02_250)] text-muted-foreground hover:bg-[oklch(0.22_0.02_250)]"
              }`}
            >
              입금
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "withdrawal")}
              className={`py-2.5 rounded text-sm font-semibold transition-all ${
                selectedType === "withdrawal"
                  ? "bg-[oklch(0.62_0.22_15)] text-white"
                  : "bg-[oklch(0.18_0.02_250)] text-muted-foreground hover:bg-[oklch(0.22_0.02_250)]"
              }`}
            >
              출금
            </button>
          </div>

          {/* 계좌 선택 */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-account" className="text-xs text-muted-foreground uppercase tracking-wide">
              계좌
            </Label>
            <Select value={selectedAccountId} onValueChange={(value) => setValue("accountId", value)}>
              <SelectTrigger
                id="cf-account"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
              >
                <SelectValue placeholder="계좌를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)]">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} className="text-foreground">
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.accountId.message}</p>
            )}
          </div>

          {/* 금액 */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-amount" className="text-xs text-muted-foreground uppercase tracking-wide">
              금액
            </Label>
            <Input
              id="cf-amount"
              {...register("amount")}
              type="number"
              placeholder="0"
              className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground font-['JetBrains_Mono']"
            />
            {errors.amount && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.amount.message}</p>
            )}
          </div>

          {/* 수수료 */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-fee" className="text-xs text-muted-foreground uppercase tracking-wide">
              수수료
            </Label>
            <Input
              id="cf-fee"
              {...register("fee")}
              type="number"
              placeholder="0"
              className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground font-['JetBrains_Mono']"
            />
            {errors.fee && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.fee.message}</p>
            )}
          </div>

          {/* 날짜 */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-date" className="text-xs text-muted-foreground uppercase tracking-wide">
              날짜
            </Label>
            <Input
              id="cf-date"
              {...register("date")}
              type="date"
              className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
            />
            {errors.date && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.date.message}</p>
            )}
          </div>

          {/* 메모 (선택사항) */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-note" className="text-xs text-muted-foreground uppercase tracking-wide">
              메모 (선택사항)
            </Label>
            <Input
              id="cf-note"
              {...register("note")}
              placeholder="예: 월급, 보너스 등"
              className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground text-sm"
            />
            {errors.note && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[oklch(0.3_0.02_250)] hover:bg-[oklch(0.18_0.02_250)]"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)]"
            >
              추가
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
