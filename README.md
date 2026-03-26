# 대한민국 잠수함 승조원 무사귀환 응원 사이트

태평양 횡단 임무 중인 대한민국 해군 잠수함 승조원들의 무사귀환을 응원하는 공개 웹사이트입니다.

**Live:** https://dosan-phi.vercel.app

## 주요 기능

- **D+ 카운터** - 출항일(2026.03.25) 기준 경과일 표시
- **방문자 카운터** - IP 기반 일별 고유 방문자 집계
- **응원 방명록** - 닉네임 + 국적 + 메시지, Supabase Realtime 실시간 표시
- **개인정보 필터링** - 실명, 위치정보, 연락처 서버사이드 차단
- **다국어(i18n)** - 한국어 / 영어
- **반응형** - 모바일 / 데스크톱

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 15, React 19, Tailwind CSS 4, Framer Motion |
| 백엔드 | Next.js API Routes |
| 데이터베이스 | Supabase (PostgreSQL + Realtime) |
| 배포 | Vercel |
| 언어 | TypeScript |

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

[Supabase](https://supabase.com)에서 프로젝트 생성 후 `.env.local` 파일 생성:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. DB 테이블 생성

Supabase SQL Editor에서 `supabase/migrations/001_init.sql` 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

### PowerShell 사용자

`dev.ps1` 스크립트로 편리하게 관리:

```powershell
.\dev.ps1 setup     # 의존성 설치 + 환경 확인
.\dev.ps1 supabase  # Supabase 키 설정 (대화형)
.\dev.ps1 dev       # 개발 서버
.\dev.ps1 build     # 프로덕션 빌드
.\dev.ps1 test      # 테스트 실행
.\dev.ps1 deploy    # Vercel 배포
```

## 배포

```bash
npx vercel --prod
```

Vercel 대시보드에서 환경변수 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 등록 필요

## 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/          # 다국어 라우팅 (ko, en)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── messages/route.ts   # 응원 메시지 API
│   │   └── visitors/route.ts   # 방문자 API
│   ├── layout.tsx
│   └── page.tsx           # / → /ko 리다이렉트
├── components/            # UI 컴포넌트
├── lib/                   # 유틸리티
│   ├── privacy-filter.ts  # 개인정보 필터링
│   ├── supabase-*.ts      # Supabase 클라이언트
│   ├── constants.ts
│   ├── countries.ts
│   └── i18n.ts
├── messages/              # 번역 파일 (ko.json, en.json)
└── types/
```

## 라이선스

MIT
