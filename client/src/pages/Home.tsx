// ============================================================
// Home — Main dashboard page
// Design: Bloomberg Terminal Aesthetic
// Deep navy bg, emerald accents, JetBrains Mono for numbers
// ============================================================

import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import SummaryCards from "@/components/SummaryCards";
import PositionsTable from "@/components/PositionsTable";
import AllocationCharts from "@/components/AllocationCharts";
import AccountPerformance from "@/components/AccountPerformance";
import PensionAllocationChart from "@/components/PensionAllocationChart";
import TimeseriesChart from "@/components/TimeseriesChart";
import TradeHistory from "@/components/TradeHistory";
import PriceUpdatePanel from "@/components/PriceUpdatePanel";
import TradeForm from "@/components/TradeForm";
import DividendForm from "@/components/DividendForm";
import DividendList from "@/components/DividendList";
import DividendCharts from "@/components/DividendCharts";
import { Trade, Dividend } from "@/lib/portfolio";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Database,
  Trash2,
  BarChart2,
  List,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type TabType = "dashboard" | "trades" | "prices" | "dividends";

export default function Home() {
  const { addTrade, addDividend, loadSampleData, clearAllData, trades } = usePortfolio();
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showDividendForm, setShowDividendForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const handleAddTrade = (data: Omit<Trade, "id">) => {
    addTrade(data);
    toast.success(
      `${data.name} ${data.type === "buy" ? "매수" : "매도"} 이력이 추가되었습니다`
    );
  };

  const handleAddDividend = (data: Omit<Dividend, "id">) => {
    addDividend(data);
    toast.success(`${data.name} 배당 이력이 추가되었습니다`);
  };

  const handleLoadSample = () => {
    loadSampleData();
    toast.success("샘플 데이터가 로드되었습니다");
  };

  const handleClearAll = () => {
    if (confirm("모든 데이터를 삭제하시겠습니까?")) {
      clearAllData();
      toast.success("데이터가 초기화되었습니다");
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "대시보드", icon: BarChart2 },
    { id: "trades", label: "매매이력", icon: List },
    { id: "prices", label: "현재가", icon: RefreshCw },
    { id: "dividends", label: "배당", icon: DollarSign },
  ];

  return (
    <div
      className="min-h-screen terminal-grid"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[oklch(0.22_0.02_250)] bg-[oklch(0.1_0.02_250)/0.95] backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-[oklch(0.72_0.18_168)] flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4 text-[oklch(0.1_0.02_250)]" />
              </div>
              <div className="hidden sm:block">
                <span className="font-['Sora'] font-bold text-base text-foreground tracking-tight">
                  Portfolio
                </span>
                <span className="font-['JetBrains_Mono'] text-[oklch(0.72_0.18_168)] text-base font-bold ml-1">
                  Tracker
                </span>
              </div>
              <div className="flex items-center gap-1 ml-1 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_168)] animate-pulse" />
                <span className="hidden sm:inline">LIVE</span>
              </div>
            </div>

            {/* Desktop Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-[oklch(0.15_0.02_250)] rounded-lg p-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    activeTab === id
                      ? "bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {trades.length === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLoadSample}
                  className="h-8 text-xs border-[oklch(0.3_0.02_250)] hover:bg-[oklch(0.18_0.02_250)] gap-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">샘플 데이터</span>
                </Button>
              )}
              {trades.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearAll}
                  className="h-8 text-xs border-[oklch(0.3_0.02_250)] hover:bg-[oklch(0.62_0.22_15)/0.1] hover:border-[oklch(0.62_0.22_15)/0.5] hover:text-[oklch(0.62_0.22_15)] gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">초기화</span>
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowTradeForm(true)}
                className="h-8 bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)] gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">매매 추가</span>
              </Button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden items-center gap-1 pb-2">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === id
                    ? "bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Hero Banner (empty state) ── */}
      {trades.length === 0 && (
        <div
          className="relative overflow-hidden"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663401189637/YWi8jh73gAx7dU2gqf35ac/hero-bg-fgsuygMknbqzsKXTgVE4t3.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[oklch(0.1_0.02_250)/0.78]" />
          <div className="relative container py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[oklch(0.72_0.18_168)/0.4] bg-[oklch(0.72_0.18_168)/0.1] text-[oklch(0.72_0.18_168)] text-xs font-medium mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_168)] animate-pulse" />
                주식 포트폴리오 트래커
              </div>
              <h1 className="text-3xl md:text-4xl font-['Sora'] font-bold text-white mb-3 leading-tight">
                매매 이력으로 분석하는
                <br />
                <span className="text-[oklch(0.72_0.18_168)]">스마트 포트폴리오</span>
              </h1>
              <p className="text-[oklch(0.75_0.01_220)] text-sm md:text-base mb-6 leading-relaxed">
                매수/매도 이력을 입력하면 종목별 평단가와 수익률을 자동 계산하고,
                <br className="hidden md:block" />
                연금저축·IRP·일반 계좌별 자산 비중을 시각화합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowTradeForm(true)}
                  className="bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)] font-semibold gap-2"
                >
                  <Plus className="w-4 h-4" />
                  직접 입력하기
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLoadSample}
                  className="border-[oklch(0.4_0.02_250)] text-white hover:bg-[oklch(0.18_0.02_250)] gap-2"
                >
                  <Database className="w-4 h-4" />
                  샘플 데이터 보기
                </Button>
              </div>

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { icon: "📊", label: "평단가 자동 계산", desc: "FIFO 방식 수수료 포함" },
                  { icon: "📈", label: "수익률 실시간 계산", desc: "미실현/실현 손익 분리" },
                  { icon: "🏦", label: "연금 자산 비중", desc: "연금저축·IRP·일반 분리" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-[oklch(0.13_0.02_250)/0.8] border border-[oklch(0.25_0.02_250)] rounded-lg p-3"
                  >
                    <div className="text-xl mb-1">{f.icon}</div>
                    <div className="text-xs font-semibold text-foreground">{f.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="container py-6 space-y-6">
        {/* KPI Cards */}
        <SummaryCards />

        {/* ── Dashboard Tab ── */}
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Timeseries Chart */}
            <TimeseriesChart />

            {/* Charts Row: Allocation + Pension + Account Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Asset allocation pie (종목별/계좌별) */}
              <div className="lg:col-span-5">
                <AllocationCharts />
              </div>
              {/* Pension allocation donut */}
              <div className="lg:col-span-3">
                <PensionAllocationChart />
              </div>
              {/* Account performance bar */}
              <div className="lg:col-span-4">
                <AccountPerformance />
              </div>
            </div>

            {/* Positions Table */}
            <PositionsTable />
          </motion.div>
        )}

        {/* ── Trades Tab ── */}
        {activeTab === "trades" && (
          <motion.div
            key="trades"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <TradeHistory />
          </motion.div>
        )}

        {/* ── Prices Tab ── */}
        {activeTab === "prices" && (
          <motion.div
            key="prices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="card-terminal rounded-xl p-5">
              <div className="mb-4">
                <h2 className="font-['Sora'] font-semibold text-base text-foreground">
                  현재가 입력
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  보유 종목의 현재가를 입력하면 수익률이 계산됩니다.
                </p>
              </div>
              <PriceUpdatePanel />
            </div>
          </motion.div>
        )}

        {/* ── Dividends Tab ── */}
        {activeTab === "dividends" && (
          <motion.div
            key="dividends"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-['Sora'] font-semibold text-lg text-foreground">
                  배당 관리
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  종목별 배당 이력을 기록하고 배당 성장률을 분석합니다.
                </p>
              </div>
              <Button
                onClick={() => setShowDividendForm(true)}
                className="bg-[oklch(0.72_0.18_168)] text-[oklch(0.1_0.02_250)] hover:bg-[oklch(0.65_0.18_168)] font-semibold gap-2"
              >
                <Plus className="w-4 h-4" />
                배당 추가
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <DividendCharts />
              </div>
              <div>
                <DividendList />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[oklch(0.18_0.02_250)] mt-8">
        <div className="container py-4">
          <p className="text-xs text-muted-foreground text-center">
            데이터는 브라우저 로컬 스토리지에 저장됩니다. 투자 참고용으로만 활용하세요.
          </p>
        </div>
      </footer>

      {/* ── Trade Form Modal ── */}
      <TradeForm
        open={showTradeForm}
        onClose={() => setShowTradeForm(false)}
        onSubmit={handleAddTrade}
        mode="add"
      />

      {/* ── Dividend Form Modal ── */}
      <DividendForm
        open={showDividendForm}
        onClose={() => setShowDividendForm(false)}
        onSubmit={handleAddDividend}
      />
    </div>
  );
}
