# KKAM_SNS

> SNS 트렌드 분석 & 콘텐츠 자동화 시스템

## 📌 개요

수면/건강 인플루언서를 위한 트렌드 자동 분석 및 콘텐츠 추천, 자동 제작 관리 시스템

**첫 번째 사용자:** Coree (직접 써보면서 개선)

## 🎯 타겟 플랫폼

| 플랫폼 | 우선순위 | 콘텐츠 형태 |
|--------|----------|-------------|
| 쓰레드 | 🥇 메인 | 텍스트 (짧은 팩트) |
| 인스타그램 | 🥈 연동 | 이미지 + 텍스트 |

## 🔧 기술 스택

- **Framework:** Next.js 15 + TypeScript
- **Styling:** Tailwind CSS
- **APIs:** 
  - Google Trends (via SerpAPI)
  - 네이버 검색어 Lab
  - PubMed E-utilities
- **AI (추후):** Claude API, DALL-E/Midjourney
- **Deployment:** Vercel

## 📊 트렌드 데이터 소스

| 소스 | 설명 | 상태 |
|------|------|------|
| Google Trends | 글로벌 검색 트렌드 | ✅ 구현 |
| 네이버 Lab | 국내 검색 트렌드 | ✅ 구현 |
| PubMed | 최신 수면 연구 논문 | ✅ 구현 |

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 API 키 입력

# 개발 서버 실행
npm run dev
```

## 📁 프로젝트 구조

```
kkam-sns/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── trends/     # 트렌드 API
│   │   └── page.tsx        # 메인 페이지
│   ├── components/
│   │   └── dashboard/      # 대시보드 컴포넌트
│   ├── lib/
│   │   ├── trends/         # 트렌드 수집 모듈
│   │   └── ai/             # AI 생성 모듈 (추후)
│   └── types/              # TypeScript 타입
├── .env.example            # 환경변수 템플릿
└── README.md
```

## 🗺️ MVP 로드맵

```
[✅] 1단계: 트렌드 수집
     - Google Trends API 연동
     - 네이버 검색어 Lab API 연동
     - PubMed 연동

[⏳] 2단계: 콘텐츠 추천
     - 트렌드 → 콘텐츠 아이디어 AI 생성

[⏳] 3단계: 해시태그 최적화
     - 인스타/쓰레드 인기 해시태그 분석

[⏳] 4단계: 자동 제작
     - Claude API (텍스트)
     - DALL-E (이미지)
```

## 🔗 시너지 구조

```
              KKAM_SNS
             (콘텐츠)
                 │
    ┌────────────┼────────────┐
    ↓            ↓            ↓
DHC_SLP      KKAM_SLP     KKAM_BIZ
(슬립큐       (수면앱       (트렌드
마케팅)       홍보)        모듈 공유)
```

## 📋 API 키 발급 가이드

### Google Trends (SerpAPI)
1. https://serpapi.com/ 가입
2. API Key 발급
3. `.env.local`에 `SERPAPI_KEY` 추가

### 네이버 검색어 Lab
1. https://developers.naver.com/ 가입
2. 애플리케이션 등록 (검색어 트렌드 API)
3. Client ID, Secret 발급
4. `.env.local`에 추가

### PubMed (선택)
1. https://www.ncbi.nlm.nih.gov/account/ 가입
2. Settings > API Key 발급
3. `.env.local`에 추가 (없어도 동작함)

## 📝 참고

- **Notion 컨트롤타워:** KKAM > KKAM_SNS
- **총괄 Agent:** Doner (PM의 PM)
- **GitHub:** Schenon-Seungki-Min

---

**상태:** 🆕 MVP 1단계 (2026.01)
