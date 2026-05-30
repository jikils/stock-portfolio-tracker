import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Account, AccountType } from "@/lib/portfolio";
import { accountFormSchema, type AccountFormData } from "@/lib/schemas";
import { usePortfolio } from "@/contexts/PortfolioContext";

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Account, "id" | "createdAt">) => void;
}

const ACCOUNT_TYPES: AccountType[] = ["연금저축", "IRP", "일반"];

export default function AccountForm({ open, onClose, onSubmit }: AccountFormProps) {
  const { users, currentUserId } = usePortfolio();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<AccountFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(accountFormSchema) as any,
    defaultValues: {
      userId: currentUserId,
      name: "",
      type: "일반",
    },
  });

  const selectedUserId = watch("userId");
  const selectedType = watch("type");

  useEffect(() => {
    if (open) {
      reset({
        userId: currentUserId,
        name: "",
        type: "일반",
      });
    }
  }, [open, currentUserId, reset]);

  const handleFormSubmit = (data: AccountFormData) => {
    onSubmit({
      userId: data.userId,
      name: data.name,
      type: data.type,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-[oklch(0.13_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground">
        <DialogHeader>
          <DialogTitle className="font-['Sora'] text-lg font-semibold text-foreground">
            새 계좌 추가
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 사용자 선택 */}
          <div className="space-y-1.5">
            <Label htmlFor="account-user" className="text-xs text-muted-foreground uppercase tracking-wide">
              사용자
            </Label>
            <Select value={selectedUserId} onValueChange={(value) => setValue("userId", value)}>
              <SelectTrigger
                id="account-user"
                className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
              >
                <SelectValue placeholder="사용자를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)]">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-foreground">
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.userId.message}</p>
            )}
          </div>

          {/* 계좌명 */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name" className="text-xs text-muted-foreground uppercase tracking-wide">
              계좌명
            </Label>
            <Input
              id="account-name"
              {...register("name")}
              placeholder="예: 일반 계좌"
              className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
            />
            {errors.name && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.name.message}</p>
            )}
          </div>

          {/* 계좌 유형 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">계좌 유형</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue("type", type)}
                  className={`py-2 rounded text-sm font-semibold transition-all ${
                    selectedType === type
                      ? "bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)]"
                      : "bg-[oklch(0.18_0.02_250)] text-muted-foreground hover:bg-[oklch(0.22_0.02_250)]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.type.message}</p>
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
