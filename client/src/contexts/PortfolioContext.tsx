// ============================================================
// Portfolio Context — global state management
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Trade,
  Dividend,
  User,
  Account,
  HoldingPosition,
  PortfolioSummary,
  AssetAllocation,
  calculatePositions,
  calculateSummary,
  calculateAssetAllocation,
  calculateAccountAllocation,
  SAMPLE_TRADES,
  SAMPLE_PRICES,
  SAMPLE_USERS,
  SAMPLE_ACCOUNTS,
} from "@/lib/portfolio";
import { nanoid } from "nanoid";

interface PortfolioContextValue {
  users: User[];
  accounts: Account[];
  currentUserId: string;
  currentAccountId: string;
  trades: Trade[];
  dividends: Dividend[];
  currentPrices: Record<string, number>;
  positions: HoldingPosition[];
  summary: PortfolioSummary;
  assetAllocation: AssetAllocation[];
  accountAllocation: AssetAllocation[];
  setCurrentUser: (userId: string) => void;
  setCurrentAccount: (accountId: string) => void;
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  addAccount: (account: Omit<Account, "id" | "createdAt">) => void;
  addTrade: (trade: Omit<Trade, "id">) => void;
  updateTrade: (id: string, trade: Omit<Trade, "id">) => void;
  deleteTrade: (id: string) => void;
  addDividend: (dividend: Omit<Dividend, "id">) => void;
  updateDividend: (id: string, dividend: Omit<Dividend, "id">) => void;
  deleteDividend: (id: string) => void;
  updateCurrentPrice: (ticker: string, price: number) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

const STORAGE_KEY_USERS = "portfolio_users";
const STORAGE_KEY_ACCOUNTS = "portfolio_accounts";
const STORAGE_KEY_TRADES = "portfolio_trades";
const STORAGE_KEY_PRICES = "portfolio_prices";
const STORAGE_KEY_DIVIDENDS = "portfolio_dividends";
const STORAGE_KEY_CURRENT_USER = "portfolio_current_user";
const STORAGE_KEY_CURRENT_ACCOUNT = "portfolio_current_account";

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
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage(STORAGE_KEY_USERS, SAMPLE_USERS)
  );
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadFromStorage(STORAGE_KEY_ACCOUNTS, SAMPLE_ACCOUNTS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadFromStorage(STORAGE_KEY_CURRENT_USER, SAMPLE_USERS[0]?.id || "")
  );
  const [currentAccountId, setCurrentAccountId] = useState<string>(() =>
    loadFromStorage(STORAGE_KEY_CURRENT_ACCOUNT, SAMPLE_ACCOUNTS[0]?.id || "")
  );
  const [trades, setTrades] = useState<Trade[]>(() =>
    loadFromStorage(STORAGE_KEY_TRADES, SAMPLE_TRADES)
  );
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>(() =>
    loadFromStorage(STORAGE_KEY_PRICES, SAMPLE_PRICES)
  );
  const [dividends, setDividends] = useState<Dividend[]>(() =>
    loadFromStorage(STORAGE_KEY_DIVIDENDS, [])
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_ACCOUNT, currentAccountId);
  }, [currentAccountId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(currentPrices));
  }, [currentPrices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIVIDENDS, JSON.stringify(dividends));
  }, [dividends]);

  // Calculate positions for all accounts
  const allPositions = calculatePositions(trades, currentPrices, accounts);
  
  // Filter data by current account
  const accountTrades = trades.filter(t => t.accountId === currentAccountId);
  const accountDividends = dividends.filter(d => d.accountId === currentAccountId);
  const accountPositions = allPositions.filter(p => p.accountId === currentAccountId);

  const summary = calculateSummary(accountPositions);
  const assetAllocation = calculateAssetAllocation(accountPositions);
  const accountAllocation = calculateAccountAllocation(accountPositions);

  const setCurrentUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    // 선택한 사용자의 첫 번째 계좌로 자동 전환
    const userAccounts = accounts.filter(a => a.userId === userId);
    if (userAccounts.length > 0) {
      setCurrentAccountId(userAccounts[0].id);
    }
  }, [accounts]);

  const setCurrentAccount = useCallback((accountId: string) => {
    setCurrentAccountId(accountId);
  }, []);

  const addUser = useCallback((user: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...user,
      id: nanoid(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
  }, []);

  const addAccount = useCallback((account: Omit<Account, "id" | "createdAt">) => {
    const newAccount: Account = {
      ...account,
      id: nanoid(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAccounts((prev) => [...prev, newAccount]);
  }, []);

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

  const addDividend = useCallback((dividend: Omit<Dividend, "id">) => {
    setDividends((prev) => [...prev, { ...dividend, id: nanoid() }]);
  }, []);

  const updateDividend = useCallback((id: string, dividend: Omit<Dividend, "id">) => {
    setDividends((prev) =>
      prev.map((d) => (d.id === id ? { ...dividend, id } : d))
    );
  }, []);

  const deleteDividend = useCallback((id: string) => {
    setDividends((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateCurrentPrice = useCallback((ticker: string, price: number) => {
    setCurrentPrices((prev) => ({ ...prev, [ticker]: price }));
  }, []);

  const loadSampleData = useCallback(() => {
    setUsers(SAMPLE_USERS);
    setAccounts(SAMPLE_ACCOUNTS);
    setTrades(SAMPLE_TRADES);
    setCurrentPrices(SAMPLE_PRICES);
    setCurrentUserId(SAMPLE_USERS[0].id);
    setCurrentAccountId(SAMPLE_ACCOUNTS[0].id);
  }, []);

  const clearAllData = useCallback(() => {
    setTrades([]);
    setCurrentPrices({});
    setDividends([]);
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        users,
        accounts,
        currentUserId,
        currentAccountId,
        trades: accountTrades,
        dividends: accountDividends,
        currentPrices,
        positions: accountPositions,
        summary,
        assetAllocation,
        accountAllocation,
        setCurrentUser,
        setCurrentAccount,
        addUser,
        addAccount,
        addTrade,
        updateTrade,
        deleteTrade,
        addDividend,
        updateDividend,
        deleteDividend,
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
