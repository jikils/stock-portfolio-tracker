// ============================================================
// Portfolio Context — global state management
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Trade,
  HoldingPosition,
  PortfolioSummary,
  AssetAllocation,
  calculatePositions,
  calculateSummary,
  calculateAssetAllocation,
  calculateAccountAllocation,
  SAMPLE_TRADES,
  SAMPLE_PRICES,
} from "@/lib/portfolio";
import { nanoid } from "nanoid";

interface PortfolioContextValue {
  trades: Trade[];
  currentPrices: Record<string, number>;
  positions: HoldingPosition[];
  summary: PortfolioSummary;
  assetAllocation: AssetAllocation[];
  accountAllocation: AssetAllocation[];
  addTrade: (trade: Omit<Trade, "id">) => void;
  updateTrade: (id: string, trade: Omit<Trade, "id">) => void;
  deleteTrade: (id: string) => void;
  updateCurrentPrice: (ticker: string, price: number) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

const STORAGE_KEY_TRADES = "portfolio_trades";
const STORAGE_KEY_PRICES = "portfolio_prices";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return fallback;
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() =>
    loadFromStorage(STORAGE_KEY_TRADES, [])
  );
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>(() =>
    loadFromStorage(STORAGE_KEY_PRICES, {})
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(currentPrices));
  }, [currentPrices]);

  const positions = calculatePositions(trades, currentPrices);
  const summary = calculateSummary(positions);
  const assetAllocation = calculateAssetAllocation(positions);
  const accountAllocation = calculateAccountAllocation(positions);

  const addTrade = useCallback((trade: Omit<Trade, "id">) => {
    setTrades((prev) => [...prev, { ...trade, id: nanoid() }]);
  }, []);

  const updateTrade = useCallback((id: string, trade: Omit<Trade, "id">) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...trade, id } : t))
    );
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateCurrentPrice = useCallback((ticker: string, price: number) => {
    setCurrentPrices((prev) => ({ ...prev, [ticker]: price }));
  }, []);

  const loadSampleData = useCallback(() => {
    setTrades(SAMPLE_TRADES);
    setCurrentPrices(SAMPLE_PRICES);
  }, []);

  const clearAllData = useCallback(() => {
    setTrades([]);
    setCurrentPrices({});
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        trades,
        currentPrices,
        positions,
        summary,
        assetAllocation,
        accountAllocation,
        addTrade,
        updateTrade,
        deleteTrade,
        updateCurrentPrice,
        loadSampleData,
        clearAllData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
