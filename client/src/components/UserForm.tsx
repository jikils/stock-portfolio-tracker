import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/portfolio";
import { userFormSchema, type UserFormData } from "@/lib/schemas";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<User, "id" | "createdAt">) => void;
}

export default function UserForm({ open, onClose, onSubmit }: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<UserFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(userFormSchema) as any,
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ name: "" });
    }
  }, [open, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit({ name: data.name });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-[oklch(0.13_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground">
        <DialogHeader>
          <DialogTitle className="font-['Sora'] text-lg font-semibold text-foreground">
            새 사용자 추가
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 사용자명 */}
          <div className="space-y-1.5">
            <Label htmlFor="user-name" className="text-xs text-muted-foreground uppercase tracking-wide">
              사용자명
            </Label>
            <Input
              id="user-name"
              {...register("name")}
              placeholder="예: 김철수"
              className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-foreground"
            />
            {errors.name && (
              <p className="text-xs text-[oklch(0.62_0.22_15)]">{errors.name.message}</p>
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
