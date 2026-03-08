// ============================================================
// UserAccountSelector — User and account selection dropdown
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Briefcase } from "lucide-react";

export default function UserAccountSelector() {
  const { users, accounts, currentUserId, currentAccountId, setCurrentUser, setCurrentAccount } =
    usePortfolio();

  const currentUser = users.find((u) => u.id === currentUserId);
  const userAccounts = accounts.filter((a) => a.userId === currentUserId);
  const currentAccount = accounts.find((a) => a.id === currentAccountId);

  return (
    <div className="flex items-center gap-3">
      {/* 사용자 선택 */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <Select value={currentUserId} onValueChange={setCurrentUser}>
          <SelectTrigger className="w-40 bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-xs">
            <SelectValue placeholder="사용자 선택" />
          </SelectTrigger>
          <SelectContent className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.25_0.02_250)]">
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 계좌 선택 */}
      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-muted-foreground" />
        <Select value={currentAccountId} onValueChange={setCurrentAccount}>
          <SelectTrigger className="w-40 bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)] text-xs">
            <SelectValue placeholder="계좌 선택" />
          </SelectTrigger>
          <SelectContent className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.25_0.02_250)]">
            {userAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 현재 선택 정보 표시 */}
      <div className="text-xs text-muted-foreground ml-2">
        {currentUser?.name} / {currentAccount?.name}
      </div>
    </div>
  );
}
