# GitHub Pages 배포 가이드

주식 포트폴리오 트래커를 GitHub Pages에 배포하여 인터넷에서 접속하고 스마트폰에 설치할 수 있습니다.

## 1단계: GitHub 저장소 생성

1. [GitHub](https://github.com) 로그인
2. **New Repository** 클릭
3. 저장소 이름: `stock-portfolio-tracker` (또는 원하는 이름)
4. **Public** 선택 (GitHub Pages는 public 저장소 필요)
5. **Create repository** 클릭

## 2단계: 로컬 저장소 설정

```bash
cd /home/ubuntu/stock-portfolio-tracker

# 기존 git 설정 확인
git remote -v

# 원격 저장소 추가 (YOUR_USERNAME을 자신의 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/stock-portfolio-tracker.git

# 또는 기존 origin 업데이트
git remote set-url origin https://github.com/YOUR_USERNAME/stock-portfolio-tracker.git
```

## 3단계: 빌드 및 배포

```bash
# 프로젝트 디렉토리로 이동
cd /home/ubuntu/stock-portfolio-tracker

# 의존성 설치
pnpm install

# 프로덕션 빌드
pnpm build

# 빌드된 파일을 dist 디렉토리에 생성됨
ls -la dist/public/
```

## 4단계: GitHub에 푸시

```bash
# 모든 변경사항 스테이징
git add .

# 커밋
git commit -m "Deploy to GitHub Pages"

# GitHub에 푸시 (main 브랜치)
git push -u origin main
```

## 5단계: GitHub Pages 설정

1. GitHub 저장소 페이지 접속
2. **Settings** 클릭
3. 좌측 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서 **Deploy from a branch** 선택
5. **Branch**: `main` 선택
6. **Folder**: `/ (root)` 선택 (또는 `/docs` 폴더 사용 시 해당 선택)
7. **Save** 클릭

## 6단계: 배포 확인

- 약 1-2분 후 `https://YOUR_USERNAME.github.io/stock-portfolio-tracker` 에서 접속 가능
- 저장소 Settings → Pages에서 배포 상태 확인

## 7단계: 스마트폰에 설치

### iOS (iPhone/iPad)

1. Safari 브라우저에서 `https://YOUR_USERNAME.github.io/stock-portfolio-tracker` 접속
2. 하단 공유 버튼 (↑) 클릭
3. **홈 화면에 추가** 선택
4. 앱 이름 확인 후 **추가** 클릭
5. 홈화면에 설치됨

### Android (Chrome)

1. Chrome 브라우저에서 `https://YOUR_USERNAME.github.io/stock-portfolio-tracker` 접속
2. 우측 상단 메뉴 (⋮) 클릭
3. **앱 설치** 또는 **홈 화면에 추가** 선택
4. 확인하면 홈화면에 설치됨

## 8단계: 오프라인 사용

- 설치 후 인터넷 없이도 앱 실행 가능
- 로컬에 저장된 데이터 사용
- 인터넷 복구 시 자동 동기화

## 업데이트 배포

앱을 수정한 후 다시 배포하려면:

```bash
# 변경사항 커밋
git add .
git commit -m "Update: 기능 설명"

# GitHub에 푸시
git push origin main

# 약 1-2분 후 자동으로 업데이트됨
```

## 문제 해결

### 배포 후 빈 페이지 표시

- GitHub Pages 설정에서 Branch와 Folder 확인
- 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

### 스마트폰에서 설치 버튼 없음

- HTTPS 프로토콜 확인 (http:// 아님)
- 브라우저에서 주소창 우측 메뉴 확인

### 데이터가 저장되지 않음

- 브라우저 저장소 설정 확인
- 개인정보 보호 모드 비활성화

## 커스텀 도메인 (선택사항)

GitHub Pages에서 커스텀 도메인을 사용하려면:

1. 도메인 등록 (GoDaddy, Namecheap 등)
2. DNS 설정에서 GitHub Pages IP 주소 추가
3. GitHub 저장소 Settings → Pages에서 Custom domain 설정

자세한 내용: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
