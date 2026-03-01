# Stock Analyzer - 주식 투자 분석 웹사이트

유명 투자자 전략(그레이엄, 린치, 버핏, 그린블랫, 오닐, 초우더)을 활용한 주식 분석 서비스입니다.

## 기능

- **오늘의 추천**: 전략별 스크리닝된 종목
- **종목 상세**: 차트, 목표가/손절가, P/E, PEG, ROE, RSI 등
- **검색**: 미국/한국 종목 검색
- **포트폴리오**: 로그인 후 보유 종목 관리 (인증 필요)
- **로그인/회원가입**: JWT 기반 인증

## 실행 방법

### 1. 의존성 설치

> npm 캐시 권한 오류가 나면: `sudo chown -R $(whoami) ~/.npm` 실행 후 재시도

```bash
# 루트
npm install

# 서버
cd server && npm install

# 클라이언트
cd client && npm install
```

### 2. 환경 변수 (선택)

```bash
cp .env.example .env
# .env에서 JWT_SECRET 등 수정
```

### 3. 개발 서버 실행

```bash
# 서버와 클라이언트 동시 실행
npm run dev
```

- 백엔드: http://localhost:3001
- 프론트엔드: http://localhost:5173

### 4. 또는 각각 실행

```bash
# 터미널 1 - 서버
cd server && npm run dev

# 터미널 2 - 클라이언트
cd client && npm run dev
```

## 기술 스택

- **Frontend**: React, Vite, React Router, Lightweight Charts
- **Backend**: Node.js, Express
- **DB**: SQLite (better-sqlite3)
- **Auth**: JWT, bcrypt
- **Data**: yahoo-finance2

## 주의사항

- 투자 참고용이며, 실제 투자 책임은 본인에게 있습니다.
- 주가 데이터는 15~20분 지연될 수 있습니다.
