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
