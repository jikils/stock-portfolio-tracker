// ============================================================
// TradeHistory — Full trade log with edit/delete
// Design: Bloomberg Terminal Aesthetic
// ============================================================

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Trade, formatKRW, formatNumber } from "@/lib/portfolio";
import TradeForm from "./TradeForm";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TradeHistory() {
  const { trades, addTrade, updateTrade, deleteTrade } = usePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [search, setSearch] = useState("");

  const filtered = trades.filter(
    (t) =>
      t.ticker.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.account.includes(search)
  );

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    deleteTrade(id);
    toast.success("매매 이력이 삭제되었습니다");
  };

  const handleEdit = (trade: Trade) => {
    setEditTrade(trade);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditTrade(null);
  };

  const handleFormSubmit = (data: Omit<Trade, "id">) => {
    if (editTrade) {
      updateTrade(editTrade.id, data);
      toast.success("매매 이력이 수정되었습니다");
    } else {
      addTrade(data);
      toast.success("매매 이력이 추가되었습니다");
    }
  };

  return (
    <div className="card-terminal rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between gap-3">
        <h2 className="font-['Sora'] font-semibold text-base text-foreground shrink-0">
          매매 이력
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {trades.length}건
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색..."
              className="pl-8 h-8 text-xs w-36 bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.02_250)]"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="h-8 bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)] gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </Button>
        </div>
      </div>

      {/* Column headers */}
      <div className="px-5 pb-2">
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-[oklch(0.22_0.02_250)] pb-2">
          <div className="col-span-1">구분</div>
          <div className="col-span-2">종목</div>
          <div className="col-span-2">계좌</div>
          <div className="col-span-1 text-right">수량</div>
          <div className="col-span-2 text-right">단가</div>
          <div className="col-span-2 text-right">거래금액</div>
          <div className="col-span-1 text-right">날짜</div>
          <div className="col-span-1 text-right">작업</div>
        </div>
      </div>

      {/* Rows */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-3 opacity-20">📋</div>
          <p className="text-sm">
            {trades.length === 0
              ? "매매 이력이 없습니다. 추가 버튼을 눌러 시작하세요."
              : "검색 결과가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[oklch(0.18_0.02_250)] max-h-96 overflow-y-auto">
          {sorted.map((trade, i) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="px-5 py-2.5 hover:bg-[oklch(0.16_0.02_250)] transition-colors"
            >
              <div className="grid grid-cols-12 gap-2 items-center text-sm">
                {/* 구분 */}
                <div className="col-span-1">
                  <span
                    className={`text-[10px] font-['JetBrains_Mono'] font-semibold px-1.5 py-0.5 rounded ${
                      trade.type === "buy"
                        ? "bg-[oklch(0.72_0.18_168)/0.15] text-[oklch(0.72_0.18_168)]"
                        : "bg-[oklch(0.62_0.22_15)/0.15] text-[oklch(0.62_0.22_15)]"
                    }`}
                  >
                    {trade.type === "buy" ? "매수" : "매도"}
                  </span>
                </div>

                {/* 종목 */}
                <div className="col-span-2">
                  <div className="font-['JetBrains_Mono'] text-xs font-semibold text-[oklch(0.72_0.18_168)]">
                    {trade.ticker}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{trade.name}</div>
                </div>

                {/* 계좌 */}
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground">{trade.account}</span>
                </div>

                {/* 수량 */}
                <div className="col-span-1 text-right font-['JetBrains_Mono'] text-xs">
                  {formatNumber(trade.quantity)}
                </div>

                {/* 단가 */}
                <div className="col-span-2 text-right font-['JetBrains_Mono'] text-xs">
                  {formatKRW(trade.price)}
                </div>

                {/* 거래금액 */}
                <div className="col-span-2 text-right font-['JetBrains_Mono'] text-xs">
                  {formatKRW(trade.price * trade.quantity)}
                </div>

                {/* 날짜 */}
                <div className="col-span-1 text-right font-['JetBrains_Mono'] text-xs text-muted-foreground">
                  {trade.date.slice(5)}
                </div>

                {/* 작업 */}
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleEdit(trade)}
                    className="p-1 rounded hover:bg-[oklch(0.22_0.02_250)] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(trade.id)}
                    className="p-1 rounded hover:bg-[oklch(0.62_0.22_15)/0.15] text-muted-foreground hover:text-[oklch(0.62_0.22_15)] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <TradeForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editTrade ?? undefined}
        mode={editTrade ? "edit" : "add"}
      />
    </div>
  );
}
