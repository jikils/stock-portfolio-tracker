# 주식 포트폴리오 트래커 🚀

매매 이력을 입력하면 종목별 평단가와 수익률을 자동으로 계산하고, 연금 자산 비중을 그래프로 보여주는 스마트 포트폴리오 관리 앱입니다.

## ✨ 주요 기능

### 📊 포트폴리오 분석
- **종목별 평단가 자동 계산** - FIFO 방식으로 수수료 포함 평단가 산출
- **실시간 수익률 계산** - 미실현/실현 손익 분리 표시
- **자산 배분 시각화** - 종목별/계좌별 파이차트
- **포트폴리오 성과 추이** - 날짜별 누적 투자금액 vs 포트폴리오 가치 선 그래프

### 💰 배당 관리
- **배당 이력 입력** - 종목별 배당금 기록
- **연간 예상 배당금** - 현재 보유 주식 기반 자동 계산
- **배당 성장 추세** - 연도별 배당금 지급액 선 그래프
- **배당 수익률 분석** - 종목별 배당 수익률 바 차트

### 👥 다중 사용자/계좌 지원
- **여러 사람이 함께 사용** - 사용자별 독립적인 포트폴리오 관리
- **다중 계좌 관리** - 연금저축, IRP, 일반 계좌 구분
- **계좌별 성과 분석** - 계좌별 수익률 및 자산 비중 표시

### 📱 PWA (Progressive Web App)
- **모바일 홈화면 설치** - 네이티브 앱처럼 사용 가능
- **오프라인 작동** - 인터넷 없이도 앱 실행
- **IndexedDB 저장소** - 50MB 이상의 대용량 데이터 저장
- **자동 업데이트** - Service Worker를 통한 백그라운드 업데이트

## 🛠 기술 스택

- **Frontend**: React 19 + TypeScript
- **UI Framework**: Tailwind CSS 4 + shadcn/ui
- **상태 관리**: React Context API
- **차트**: Recharts
- **저장소**: IndexedDB (localStorage 마이그레이션)
- **빌드**: Vite
- **패키지 관리**: pnpm

## 🚀 빠른 시작

### 설치

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/stock-portfolio-tracker.git
cd stock-portfolio-tracker

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 `http://localhost:3000` 방문

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

## 📲 배포

### GitHub Pages (무료)

```bash
# 1. GitHub 저장소 생성
# 2. 로컬에서 배포 준비
pnpm build

# 3. GitHub에 배포
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# 4. GitHub 저장소 Settings → Pages에서 배포 설정
```

자세한 배포 가이드는 [PWA_DEPLOYMENT_GUIDE.md](./PWA_DEPLOYMENT_GUIDE.md) 참고

### Netlify (추천)

1. [Netlify](https://netlify.com) 방문
2. GitHub 저장소 연결
3. Build command: `pnpm build`
4. Publish directory: `dist`
5. Deploy 클릭

### Vercel

1. [Vercel](https://vercel.com) 방문
2. GitHub 저장소 연결
3. Framework: Vite 선택
4. Deploy 클릭

## 📱 모바일 설치

### iOS (Safari)
1. Safari에서 앱 URL 방문
2. 공유 버튼 (↑) 클릭
3. "홈 화면에 추가" 선택

### Android (Chrome)
1. Chrome에서 앱 URL 방문
2. 우측 상단 메뉴 (⋮) 클릭
3. "앱 설치" 선택

## 💾 데이터 관리

### 로컬 저장소
- 모든 데이터는 브라우저의 IndexedDB에 저장됩니다
- 50MB 이상의 대용량 데이터 저장 가능
- 서버에 데이터가 전송되지 않습니다

### 데이터 백업
```javascript
// 브라우저 콘솔에서 실행하여 데이터 내보내기
const data = {
  users: localStorage.getItem('portfolio_users'),
  accounts: localStorage.getItem('portfolio_accounts'),
  trades: localStorage.getItem('portfolio_trades'),
  prices: localStorage.getItem('portfolio_prices'),
  dividends: localStorage.getItem('portfolio_dividends'),
};
console.log(JSON.stringify(data, null, 2));
```

## 🎨 UI/UX

### 디자인 철학
- **금융 터미널 미학** - Bloomberg Terminal 감성의 다크 테마
- **전문적 시각화** - Recharts를 활용한 고급 차트
- **직관적 네비게이션** - 탭 기반 깔끔한 인터페이스

### 색상 팔레트
- **배경**: 딥 네이비 (#0A0E1A)
- **강조색**: 에메랄드 그린 (#00D4AA)
- **수익**: 그린 (#10B981)
- **손실**: 코랄 레드 (#FF6B6B)

## 📊 데이터 구조

### User (사용자)
```typescript
interface User {
  id: string;
  name: string;
  createdAt: string;
}
```

### Account (계좌)
```typescript
interface Account {
  id: string;
  userId: string;
  type: 'general' | 'pension' | 'irp';
  name: string;
  createdAt: string;
}
```

### Trade (매매 이력)
```typescript
interface Trade {
  id: string;
  accountId: string;
  ticker: string;
  tickerName: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  date: string;
}
```

### Dividend (배당 이력)
```typescript
interface Dividend {
  id: string;
  accountId: string;
  ticker: string;
  tickerName: string;
  exDate: string;
  payDate: string;
  dividendPerShare: number;
  quantity: number;
}
```

## 🔧 개발 가이드

### 프로젝트 구조
```
client/
├── public/
│   ├── manifest.json      # PWA 메니페스트
│   └── sw.js              # Service Worker
├── src/
│   ├── components/        # React 컴포넌트
│   ├── contexts/          # Context API
│   ├── lib/               # 유틸리티 함수
│   ├── pages/             # 페이지 컴포넌트
│   ├── App.tsx            # 라우터
│   ├── main.tsx           # 진입점
│   └── index.css          # 글로벌 스타일
└── index.html             # HTML 템플릿
```

### 주요 파일

- `client/src/lib/portfolio.ts` - 포트폴리오 계산 로직
- `client/src/lib/storage.ts` - IndexedDB 저장소 관리
- `client/src/contexts/PortfolioContext.tsx` - 전역 상태 관리
- `client/public/sw.js` - Service Worker (오프라인 지원)
- `client/public/manifest.json` - PWA 설정

### 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 타입 체크
pnpm check

# 코드 포매팅
pnpm format

# 빌드
pnpm build

# 프로덕션 미리보기
pnpm preview
```

## 🐛 알려진 제한사항

1. **실시간 주가 데이터 미지원** - 수동으로 현재가 입력 필요
2. **세금 계산 미지원** - 양도소득세 등 자동 계산 안 함
3. **배당금 자동 조회 미지원** - 수동으로 배당 이력 입력 필요
4. **다기기 동기화 미지원** - 각 기기에서 독립적으로 관리

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🤝 기여

버그 리포트, 기능 제안, Pull Request를 환영합니다!

## 📞 지원

문제가 발생하면:

1. [GitHub Issues](https://github.com/YOUR_USERNAME/stock-portfolio-tracker/issues) 확인
2. 브라우저 개발자 도구 (F12)에서 오류 메시지 확인
3. [PWA_DEPLOYMENT_GUIDE.md](./PWA_DEPLOYMENT_GUIDE.md)의 문제 해결 섹션 참고

## 🎯 향후 계획

- [ ] CSV 가져오기/내보내기
- [ ] 목표 비중 설정 및 리밸런싱 계산
- [ ] 배당 성장률 지표 (YoY)
- [ ] 월별 누적 배당금 예상액 차트
- [ ] 다기기 동기화 (클라우드 백업)
- [ ] 실시간 주가 API 연동
- [ ] 세금 계산 기능
- [ ] 다국어 지원

---

**마지막 업데이트**: 2026-05-24  
**버전**: 1.0.0  
**상태**: 🟢 Production Ready
