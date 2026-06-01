import { z } from "zod";

export const userFormSchema = z.object({
  name: z
    .string()
    .min(1, "사용자명을 입력하세요")
    .max(50, "사용자명은 50자 이내여야 합니다"),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const accountFormSchema = z.object({
  userId: z.string().min(1, "사용자를 선택하세요"),
  name: z
    .string()
    .min(1, "계좌명을 입력하세요")
    .max(50, "계좌명은 50자 이내여야 합니다"),
  type: z.enum(["연금저축", "IRP", "일반"]),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;

export const cashFlowFormSchema = z.object({
  accountId: z.string().min(1, "계좌를 선택하세요"),
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.preprocess(
    (v) => Number(v),
    z.number().positive("금액은 0보다 커야 합니다")
  ),
  fee: z.preprocess(
    (v) => Number(v),
    z.number().min(0, "수수료는 0 이상이어야 합니다")
  ),
  date: z.string().min(1, "날짜를 입력하세요"),
  note: z.string().max(100, "메모는 100자 이내여야 합니다").optional(),
});

export type CashFlowFormData = z.infer<typeof cashFlowFormSchema>;

