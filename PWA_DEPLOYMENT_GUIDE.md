# 주식 포트폴리오 트래커 - PWA 배포 및 설치 가이드

## 📱 PWA (Progressive Web App) 개요

이 앱은 PWA로 업그레이드되어 다음 기능을 지원합니다:

✅ **모바일 홈화면 설치** - 네이티브 앱처럼 사용 가능  
✅ **오프라인 작동** - 인터넷 없이도 앱 실행 가능  
✅ **IndexedDB 저장소** - 50MB 이상의 대용량 데이터 저장  
✅ **자동 업데이트** - Service Worker를 통한 백그라운드 업데이트  

---

## 🚀 배포 방법

### 옵션 1: GitHub Pages (무료, 추천)

#### 1단계: GitHub 저장소 생성

```bash
# GitHub에서 새 저장소 생성
# 저장소명: stock-portfolio-tracker
# Public 선택
```

#### 2단계: 로컬에서 배포 준비

```bash
cd /home/ubuntu/stock-portfolio-tracker

# 빌드 실행
pnpm build

# dist 폴더가 생성됨
```

#### 3단계: GitHub에 배포

```bash
# Git 초기화 (이미 되어있으면 스킵)
git init
git add .
git commit -m "Initial commit: Stock Portfolio Tracker PWA"

# GitHub 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/stock-portfolio-tracker.git
git branch -M main
git push -u origin main

# GitHub Actions를 통한 자동 배포 설정
# .github/workflows/deploy.yml 파일 생성 (아래 참고)
```

#### 4단계: GitHub Pages 설정

1. GitHub 저장소 → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: /(root)
4. Save 클릭

5분 후 `https://YOUR_USERNAME.github.io/stock-portfolio-tracker` 에서 앱 접속 가능

---

### 옵션 2: Netlify (무료, 더 쉬움)

#### 1단계: Netlify 계정 생성

https://netlify.com 방문 후 GitHub으로 가입

#### 2단계: 저장소 연결

1. Netlify 대시보드 → "Add new site" → "Import an existing project"
2. GitHub 선택 → stock-portfolio-tracker 저장소 선택
3. Build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist`
4. Deploy 클릭

자동으로 배포되며, 매번 GitHub에 push할 때마다 자동 업데이트됨

---

### 옵션 3: Vercel (무료)

#### 1단계: Vercel 계정 생성

https://vercel.com 방문 후 GitHub으로 가입

#### 2단계: 프로젝트 배포

1. Vercel 대시보드 → "Add New..." → "Project"
2. GitHub 저장소 선택
3. Framework: Vite 선택
4. Deploy 클릭

---

## 📲 모바일에서 설치하기

### iOS (Safari)

1. Safari에서 앱 URL 방문
2. 공유 버튼 (↑) 클릭
3. "홈 화면에 추가" 선택
4. 앱 이름 확인 후 "추가" 클릭
5. 홈화면에 앱 아이콘 생성됨

### Android (Chrome)

1. Chrome에서 앱 URL 방문
2. 우측 상단 메뉴 (⋮) 클릭
3. "앱 설치" 또는 "홈 화면에 추가" 선택
4. 확인 클릭
5. 홈화면에 앱 아이콘 생성됨

---

## 💾 데이터 저장소

### IndexedDB 구조

```
Database: PortfolioTrackerDB
├── Object Store: portfolio-data
    ├── portfolio_users (사용자 목록)
    ├── portfolio_accounts (계좌 목록)
    ├── portfolio_trades (매매 이력)
    ├── portfolio_prices (현재가)
    ├── portfolio_dividends (배당 이력)
    ├── portfolio_current_user (현재 사용자)
    └── portfolio_current_account (현재 계좌)
```

### 저장 용량

- **localStorage**: 5-10MB (레거시, 마이그레이션됨)
- **IndexedDB**: 50MB+ (현재 사용 중)
- **Service Worker Cache**: 50MB+ (오프라인 리소스)

### 데이터 백업

```javascript
// 브라우저 콘솔에서 실행
// 1. 데이터 내보내기
const data = {
  users: localStorage.getItem('portfolio_users'),
  accounts: localStorage.getItem('portfolio_accounts'),
  trades: localStorage.getItem('portfolio_trades'),
  prices: localStorage.getItem('portfolio_prices'),
  dividends: localStorage.getItem('portfolio_dividends'),
};
console.log(JSON.stringify(data, null, 2));

// 2. 데이터 복원
// 위의 JSON을 복사해서 다른 기기의 콘솔에서:
localStorage.setItem('portfolio_users', data.users);
localStorage.setItem('portfolio_accounts', data.accounts);
// ... 나머지도 동일
```

---

## 🔧 Service Worker 관리

### Service Worker 확인

```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('등록된 Service Worker:', registrations.length);
  registrations.forEach(reg => {
    console.log('Scope:', reg.scope);
    console.log('Active:', reg.active ? 'Yes' : 'No');
  });
});
```

### Service Worker 업데이트

1. `client/public/sw.js` 파일 수정
2. 버전 번호 변경: `CACHE_NAME = 'portfolio-tracker-v2'`
3. 배포 후 앱 새로고침 (Ctrl+Shift+R)

### Service Worker 삭제

```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

---

## 🌐 커스텀 도메인 설정

### GitHub Pages + 커스텀 도메인

1. 도메인 등록 (예: portfolio-tracker.com)
2. DNS 설정:
   - A 레코드: 185.199.108.153
   - A 레코드: 185.199.109.153
   - A 레코드: 185.199.110.153
   - A 레코드: 185.199.111.153
3. GitHub 저장소 Settings → Pages → Custom domain 입력
4. DNS 확인 완료 후 HTTPS 자동 활성화

### Netlify + 커스텀 도메인

1. Netlify 대시보드 → Site settings → Domain management
2. "Add custom domain" 클릭
3. 도메인 입력 후 확인
4. DNS 설정 지침 따르기

---

## 📊 성능 최적화

### 캐싱 전략

- **HTML/JS/CSS**: Network First (온라인 우선, 오프라인 시 캐시)
- **이미지/폰트**: Cache First (캐시 우선, 없으면 네트워크)
- **외부 리소스**: Network Only (항상 네트워크 사용)

### 번들 크기 최적화

```bash
# 현재 번들 크기 확인
pnpm build

# dist 폴더 크기 확인
du -sh dist/

# 목표: < 500KB (gzip)
```

---

## 🐛 문제 해결

### 앱이 설치되지 않음

1. HTTPS 사용 확인 (필수)
2. manifest.json 파일 확인
3. 브라우저 캐시 삭제 후 재시도
4. 개발자 도구 → Application → Manifest 확인

### 오프라인에서 작동하지 않음

1. Service Worker 등록 확인
2. 개발자 도구 → Application → Service Workers 확인
3. 캐시 상태 확인: Application → Cache Storage

### 데이터가 저장되지 않음

1. IndexedDB 상태 확인: Application → IndexedDB
2. localStorage 마이그레이션 확인
3. 브라우저 저장소 용량 확인

---

## 📝 배포 체크리스트

- [ ] `pnpm build` 성공
- [ ] dist 폴더 생성 확인
- [ ] manifest.json 파일 확인
- [ ] sw.js 파일 확인
- [ ] GitHub/Netlify/Vercel 배포 완료
- [ ] 배포된 URL에서 앱 로드 확인
- [ ] 모바일에서 설치 테스트
- [ ] 오프라인 모드에서 작동 테스트
- [ ] 데이터 저장 확인
- [ ] HTTPS 활성화 확인

---

## 🔐 보안 주의사항

1. **민감한 정보 저장 금지**
   - 비밀번호, API 키 등은 IndexedDB에 저장하지 마세요
   - 모든 데이터는 로컬에만 저장되므로 백업 필수

2. **HTTPS 필수**
   - PWA는 HTTPS 환경에서만 작동합니다
   - GitHub Pages, Netlify, Vercel은 자동 HTTPS 제공

3. **Service Worker 업데이트**
   - 정기적으로 Service Worker 업데이트하여 보안 유지

---

## 📞 지원

문제가 발생하면:

1. 브라우저 개발자 도구 (F12) 확인
2. Console 탭에서 오류 메시지 확인
3. Application 탭에서 Service Worker/IndexedDB 상태 확인
4. GitHub Issues에 문제 보고

---

**마지막 업데이트**: 2026-05-24  
**PWA 버전**: v1.0  
**지원 브라우저**: Chrome 40+, Firefox 44+, Safari 11.1+, Edge 17+
