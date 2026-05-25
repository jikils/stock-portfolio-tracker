import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { parseCSV, convertCSVToTrades, generateSampleCSV, CSVParseResult } from "@/lib/csv-parser";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { toast } from "sonner";

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCSVDialog({ open, onOpenChange }: ImportCSVDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addTrade, currentAccountId } = usePortfolio();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);

    try {
      const content = await selectedFile.text();
      const rows = parseCSV(content);
      const result = convertCSVToTrades(rows, currentAccountId);
      setParseResult(result);
    } catch (error) {
      toast.error(`파일 읽기 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setFile(null);
      setParseResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!parseResult || parseResult.trades.length === 0) {
      toast.error("가져올 거래 기록이 없습니다");
      return;
    }

    let importedCount = 0;
    parseResult.trades.forEach(trade => {
      try {
        addTrade(trade);
        importedCount++;
      } catch (error) {
        console.error("Error importing trade:", error);
      }
    });

    toast.success(`${importedCount}개의 거래 기록이 가져왔습니다`);
    setFile(null);
    setParseResult(null);
    onOpenChange(false);
  };

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_trades.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("샘플 CSV 파일이 다운로드되었습니다");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            CSV 파일로 거래 기록 가져오기
          </DialogTitle>
          <DialogDescription>
            증권사 거래내역 CSV 파일을 업로드하여 대량의 매매 이력을 한 번에 입력하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">파일 업로드</TabsTrigger>
            <TabsTrigger value="format">형식 안내</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">CSV 파일을 여기에 드래그하거나 클릭하여 선택</p>
              <p className="text-xs text-muted-foreground">지원 형식: .csv</p>
              {file && <p className="text-xs text-primary mt-2">선택됨: {file.name}</p>}
            </div>

            {/* Parse Result */}
            {parseResult && (
              <div className="space-y-3">
                {parseResult.success ? (
                  <Alert className="border-green-500/50 bg-green-500/5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      {parseResult.trades.length}개의 거래 기록을 성공적으로 읽었습니다
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-500/50 bg-red-500/5">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      파일을 읽는 중 오류가 발생했습니다
                    </AlertDescription>
                  </Alert>
                )}

                {/* Errors */}
                {parseResult.errors.length > 0 && (
                  <Alert className="border-red-500/50 bg-red-500/5">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <div className="text-sm space-y-1">
                        {parseResult.errors.slice(0, 3).map((error, i) => (
                          <div key={i}>• {error}</div>
                        ))}
                        {parseResult.errors.length > 3 && (
                          <div>• 외 {parseResult.errors.length - 3}개 오류</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {parseResult.warnings.length > 0 && (
                  <Alert className="border-yellow-500/50 bg-yellow-500/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      <div className="text-sm space-y-1">
                        {parseResult.warnings.map((warning, i) => (
                          <div key={i}>• {warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Trade Preview */}
                {parseResult.trades.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="text-sm font-medium mb-3">가져올 거래 기록 미리보기</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {parseResult.trades.slice(0, 5).map((trade, i) => (
                        <div key={i} className="text-xs text-muted-foreground border-b pb-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-foreground">{trade.name}</span>
                            <span className={trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                              {trade.type === 'buy' ? '매수' : '매도'} {trade.quantity}주
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>₩{trade.price.toLocaleString()}</span>
                            <span>{trade.date}</span>
                          </div>
                        </div>
                      ))}
                      {parseResult.trades.length > 5 && (
                        <div className="text-xs text-muted-foreground pt-2">
                          외 {parseResult.trades.length - 5}개 거래 기록...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => handleDownloadSample()}>
                <Download className="w-4 h-4 mr-2" />
                샘플 다운로드
              </Button>
              <Button
                onClick={handleImport}
                disabled={!parseResult || parseResult.trades.length === 0 || isLoading}
              >
                {isLoading ? "처리 중..." : "가져오기"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="format" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">지원하는 CSV 형식</h4>
                <p className="text-sm text-muted-foreground mb-3">다음 중 하나의 형식으로 CSV 파일을 준비하세요:</p>

                <div className="space-y-3">
                  {/* Format 1 */}
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <h5 className="text-sm font-medium mb-2">형식 1: 한글 헤더</h5>
                    <div className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto">
                      종목코드,종목명,매매구분,수량,단가,수수료,거래일
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">예:</p>
                    <div className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto mt-1">
                      005930,삼성전자,매수,10,70000,1000,2025-01-15
                    </div>
                  </div>

                  {/* Format 2 */}
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <h5 className="text-sm font-medium mb-2">형식 2: 영문 헤더</h5>
                    <div className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto">
                      ticker,name,type,quantity,price,fee,date
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">예:</p>
                    <div className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto mt-1">
                      AAPL,Apple Inc.,buy,10,150000,1500,2025-01-25
                    </div>
                  </div>

                  {/* Format 3 */}
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <h5 className="text-sm font-medium mb-2">형식 3: 증권사 형식</h5>
                    <div className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto">
                      종목코드,종목명,거래유형,수량,단가,수수료,거래일자
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">대부분의 증권사 거래내역 형식과 호환됩니다</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">주의사항</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 헤더 행은 필수입니다</li>
                  <li>• 날짜 형식: YYYY-MM-DD 또는 YYYYMMDD</li>
                  <li>• 매매구분: 매수/buy 또는 매도/sell</li>
                  <li>• 수수료가 없으면 0을 입력하세요</li>
                  <li>• 빈 행은 자동으로 무시됩니다</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">샘플 파일</h4>
                <p className="text-sm text-muted-foreground mb-2">아래 버튼을 클릭하여 샘플 CSV 파일을 다운로드하고 참고하세요</p>
                <Button variant="outline" onClick={handleDownloadSample} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  샘플 CSV 다운로드
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
