// ============================================================
// CSV Parser for Trade History Import
// Supports various securities company formats
// ============================================================

import { Trade } from "./portfolio";
import { nanoid } from "nanoid";

export interface CSVParseResult {
  success: boolean;
  trades: Trade[];
  errors: string[];
  warnings: string[];
}

export interface CSVRow {
  [key: string]: string;
}

/**
 * Parse CSV content and return rows
 */
export function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV 파일이 비어있습니다');
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: CSVRow = {};

    headers.forEach((header, index) => {
      row[header.toLowerCase().trim()] = values[index]?.trim() || '';
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Detect CSV format and convert to Trade objects
 */
export function convertCSVToTrades(
  rows: CSVRow[],
  accountId: string
): CSVParseResult {
  const trades: Trade[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rows.length === 0) {
    return {
      success: false,
      trades: [],
      errors: ['CSV 파일에 데이터가 없습니다'],
      warnings: [],
    };
  }

  // Detect format based on headers
  const headers = Object.keys(rows[0]).map(h => h.toLowerCase());
  const format = detectFormat(headers);

  if (!format) {
    return {
      success: false,
      trades: [],
      errors: ['지원하지 않는 CSV 형식입니다. 아래 형식 중 하나를 사용하세요:\n- 종목명, 매매구분, 수량, 단가, 수수료, 거래일\n- ticker, type, quantity, price, fee, date'],
      warnings: [],
    };
  }

  // Convert rows to trades
  rows.forEach((row, index) => {
    try {
      const trade = convertRowToTrade(row, format, accountId);
      if (trade) {
        trades.push(trade);
      }
    } catch (error) {
      errors.push(`행 ${index + 2}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  });

  if (trades.length === 0 && errors.length === 0) {
    errors.push('변환할 수 있는 거래 기록이 없습니다');
  }

  return {
    success: errors.length === 0,
    trades,
    errors,
    warnings,
  };
}

/**
 * Detect CSV format based on headers
 */
function detectFormat(headers: string[]): string | null {
  // Format 1: Korean headers (종목명, 매매구분, 수량, 단가, 수수료, 거래일)
  if (
    headers.some(h => h.includes('종목')) &&
    headers.some(h => h.includes('매매')) &&
    headers.some(h => h.includes('수량'))
  ) {
    return 'korean';
  }

  // Format 2: English headers (ticker, type, quantity, price, fee, date)
  if (
    headers.some(h => h.includes('ticker') || h.includes('symbol')) &&
    headers.some(h => h.includes('type') || h.includes('side')) &&
    headers.some(h => h.includes('quantity') || h.includes('qty'))
  ) {
    return 'english';
  }

  // Format 3: Broker-specific (증권사별 형식)
  if (
    headers.some(h => h.includes('종목코드')) ||
    headers.some(h => h.includes('거래일자'))
  ) {
    return 'broker';
  }

  return null;
}

/**
 * Convert a single CSV row to Trade object
 */
function convertRowToTrade(
  row: CSVRow,
  format: string,
  accountId: string
): Trade | null {
  let ticker = '';
  let tickerName = '';
  let type: 'buy' | 'sell' = 'buy';
  let quantity = 0;
  let price = 0;
  let fee = 0;
  let date = '';

  if (format === 'korean') {
    // Korean format: 종목명, 매매구분, 수량, 단가, 수수료, 거래일
    ticker = extractValue(row, ['종목코드', 'ticker', 'symbol']) || 'UNKNOWN';
    tickerName = extractValue(row, ['종목명', '종목', 'name']) || ticker;
    
    const typeStr = extractValue(row, ['매매구분', 'type', '거래유형']) || '';
    type = typeStr.includes('매도') || typeStr.includes('sell') ? 'sell' : 'buy';
    
    quantity = parseNumber(extractValue(row, ['수량', 'quantity', 'qty']));
    price = parseNumber(extractValue(row, ['단가', '가격', 'price', 'unit price']));
    fee = parseNumber(extractValue(row, ['수수료', '수량료', 'fee', 'commission']));
    date = parseDate(extractValue(row, ['거래일', '거래일자', 'date', '일자']));
  } else if (format === 'english') {
    // English format
    ticker = extractValue(row, ['ticker', 'symbol', 'code']) || 'UNKNOWN';
    tickerName = extractValue(row, ['name', 'ticker name']) || ticker;
    
    const typeStr = extractValue(row, ['type', 'side', 'direction']) || '';
    type = typeStr.toLowerCase().includes('sell') ? 'sell' : 'buy';
    
    quantity = parseNumber(extractValue(row, ['quantity', 'qty', 'shares']));
    price = parseNumber(extractValue(row, ['price', 'unit price', 'price per share']));
    fee = parseNumber(extractValue(row, ['fee', 'commission', 'charges']));
    date = parseDate(extractValue(row, ['date', 'trade date', 'transaction date']));
  } else if (format === 'broker') {
    // Broker format
    ticker = extractValue(row, ['종목코드', 'ticker', 'symbol']) || 'UNKNOWN';
    tickerName = extractValue(row, ['종목명', 'name']) || ticker;
    
    const typeStr = extractValue(row, ['거래유형', 'type', '매매구분']) || '';
    type = typeStr.includes('매도') || typeStr.includes('sell') ? 'sell' : 'buy';
    
    quantity = parseNumber(extractValue(row, ['수량', 'qty', 'quantity']));
    price = parseNumber(extractValue(row, ['단가', 'price', '가격']));
    fee = parseNumber(extractValue(row, ['수수료', 'fee', 'commission']));
    date = parseDate(extractValue(row, ['거래일자', 'date', '거래일']));
  }

  // Validate required fields
  if (!ticker || quantity === 0 || price === 0 || !date) {
    return null;
  }

  return {
    id: nanoid(),
    accountId,
    ticker,
    name: tickerName,
    type,
    quantity,
    price,
    fee,
    date,
  };
}

/**
 * Extract value from row by multiple possible keys
 */
function extractValue(row: CSVRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key.toLowerCase()];
    if (value) return value;
  }
  return '';
}

/**
 * Parse number from string, handling Korean number format
 */
function parseNumber(value: string): number {
  if (!value) return 0;

  // Remove whitespace and Korean currency
  let cleaned = value.trim().replace(/[₩,\s]/g, '');

  // Handle Korean number format (e.g., "1,234.56" or "1.234,56")
  const number = parseFloat(cleaned);

  return isNaN(number) ? 0 : number;
}

/**
 * Parse date string in various formats
 */
function parseDate(value: string): string {
  if (!value) return new Date().toISOString().split('T')[0];

  const cleaned = value.trim();

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Format: YYYYMMDD
  if (/^\d{8}$/.test(cleaned)) {
    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  // Format: DD/MM/YYYY or MM/DD/YYYY
  const parts = cleaned.split('/');
  if (parts.length === 3) {
    const nums = parts.map(p => parseInt(p, 10));
    // Assume MM/DD/YYYY if first part <= 12
    if (nums[0] <= 12) {
      return `${nums[2]}-${String(nums[0]).padStart(2, '0')}-${String(nums[1]).padStart(2, '0')}`;
    } else {
      return `${nums[2]}-${String(nums[1]).padStart(2, '0')}-${String(nums[0]).padStart(2, '0')}`;
    }
  }

  // Fallback: today
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate sample CSV content
 */
export function generateSampleCSV(): string {
  return `종목코드,종목명,매매구분,수량,단가,수수료,거래일
005930,삼성전자,매수,10,70000,1000,2025-01-15
005930,삼성전자,매도,5,75000,750,2025-02-20
000660,SK하이닉스,매수,20,50000,2000,2025-01-20
AAPL,Apple Inc.,매수,10,150000,1500,2025-01-25
MSFT,Microsoft Corp.,매수,5,300000,1500,2025-02-01`;
}
