# 주식 포트폴리오 트래커 - 디자인 아이디어

## Approach A: 금융 데이터 대시보드 (Bloomberg Terminal 감성)
<response>
<text>
**Design Movement**: 프로페셔널 금융 데이터 터미널 미학 (Bloomberg/Reuters 영감)

**Core Principles**:
- 데이터 밀도와 가독성의 균형 — 많은 정보를 압축하되 혼잡하지 않게
- 모노스페이스 + 세리프 혼용으로 숫자 데이터 강조
- 어두운 배경에 밝은 데이터 포인트로 집중도 극대화
- 그리드 기반 레이아웃으로 정보 계층 명확화

**Color Philosophy**:
- 배경: 딥 네이비 (#0A0E1A) — 집중과 신뢰감
- 주 강조: 에메랄드 그린 (#00D4AA) — 수익/긍정 신호
- 보조 강조: 앰버 (#F59E0B) — 경고/중립
- 손실: 코랄 레드 (#FF4D6D)
- 텍스트: 차가운 화이트 (#E8EDF5)

**Layout Paradigm**: 좌측 사이드바 네비게이션 + 우측 메인 대시보드 그리드. 상단에 요약 KPI 카드, 하단에 상세 테이블과 차트 분리

**Signature Elements**:
- 숫자 데이터에 모노스페이스 폰트 (JetBrains Mono)
- 미세한 그리드 라인과 구분선
- 수익률 변동 시 숫자 카운트업 애니메이션

**Interaction Philosophy**: 키보드 친화적, 데이터 입력 최소화, 빠른 조회

**Animation**: 데이터 로드 시 숫자 카운트업, 차트 드로잉 애니메이션, 행 호버 시 하이라이트

**Typography System**: JetBrains Mono (숫자/코드) + Sora (제목) + Inter (본문)
</text>
<probability>0.08</probability>
</response>

## Approach B: 클린 모던 핀테크 앱 (Robinhood/토스 감성)
<response>
<text>
**Design Movement**: 미니멀리스트 핀테크 — 복잡함을 숨기고 본질만 노출

**Core Principles**:
- 흰 배경 + 강한 타이포그래피 계층으로 정보 전달
- 카드 기반 컴포넌트로 정보 모듈화
- 색상을 최소화하고 수익/손실에만 강렬한 색 사용
- 여백을 적극 활용한 호흡감 있는 레이아웃

**Color Philosophy**:
- 배경: 순백 (#FFFFFF) + 연회색 섹션 (#F8FAFC)
- 주 색상: 인디고 (#4F46E5) — 신뢰와 기술
- 수익: 에메랄드 (#10B981)
- 손실: 로즈 (#F43F5E)
- 텍스트: 슬레이트 (#1E293B)

**Layout Paradigm**: 단일 페이지 스크롤 + 상단 탭 네비게이션. 모바일 퍼스트 카드 레이아웃

**Signature Elements**:
- 수익률 표시 시 색상 변화 + 화살표 아이콘
- 부드러운 그라데이션 차트 영역
- 글래스모피즘 카드 효과

**Interaction Philosophy**: 터치 친화적, 직관적 입력 폼, 즉각적 피드백

**Animation**: 페이지 전환 슬라이드, 숫자 변경 시 플립 애니메이션, 차트 부드러운 진입

**Typography System**: Pretendard (한국어 최적화) + 숫자에 Tabular Nums 설정
</text>
<probability>0.07</probability>
</response>

## Approach C: 에디토리얼 금융 저널 (The Economist 감성)
<response>
<text>
**Design Movement**: 에디토리얼 타이포그래피 + 데이터 저널리즘 미학

**Core Principles**:
- 강한 타이포그래피 계층이 디자인의 주인공
- 비대칭 레이아웃으로 시선 흐름 유도
- 데이터 시각화를 인포그래픽처럼 처리
- 절제된 색상 팔레트로 전문성 표현

**Color Philosophy**:
- 배경: 따뜻한 오프화이트 (#FAFAF8) — 종이 질감
- 주 색상: 딥 포레스트 그린 (#1A3A2A) — 안정과 성장
- 강조: 골드 (#C9A84C) — 가치와 품격
- 수익: 포레스트 그린 (#2D6A4F)
- 손실: 버건디 (#7D1E2A)
- 텍스트: 차콜 (#2C2C2C)

**Layout Paradigm**: 비대칭 2-3 컬럼 그리드. 좌측에 데이터 입력, 우측에 시각화. 상단 헤더는 신문 마스트헤드 스타일

**Signature Elements**:
- 세리프 폰트 헤딩 (Playfair Display)
- 두꺼운 보더 라인 구분자
- 인포그래픽 스타일 차트 레이블

**Interaction Philosophy**: 데스크탑 퍼스트, 정보 밀도 높음, 인쇄 가능한 레이아웃

**Animation**: 스크롤 기반 차트 진입, 섹션 페이드인, 데이터 업데이트 시 부드러운 전환

**Typography System**: Playfair Display (헤딩) + Noto Serif KR (한국어 본문) + JetBrains Mono (숫자)
</text>
<probability>0.06</probability>
</response>

---

## 선택: Approach A — 금융 데이터 터미널 미학

딥 네이비 배경, 에메랄드 그린 강조, 모노스페이스 숫자 폰트로 전문적인 금융 대시보드 느낌을 구현한다.
