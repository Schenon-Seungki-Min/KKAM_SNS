/**
 * 트렌드 분석 통합 모듈
 * 
 * Google Trends + 네이버 Lab + PubMed를 통합하여
 * 하나의 트렌드 대시보드로 제공
 * 
 * 이 모듈은 KKAM_BIZ에서도 재활용 예정
 */

import { TrendData, DashboardSummary } from '@/types';
import { fetchGoogleTrends, fetchTrendingSearches, HEALTH_KEYWORDS, HEALTH_KEYWORDS_KR } from './google-trends';
import { fetchNaverTrends, SLEEP_KEYWORD_GROUPS } from './naver-trends';
import { fetchPubMedTrends, SLEEP_SEARCH_QUERIES } from './pubmed';

export interface TrendAnalysisOptions {
  includeGoogle?: boolean;
  includeNaver?: boolean;
  includePubMed?: boolean;
  category?: 'health' | 'sleep' | 'all';
  limit?: number;
}

/**
 * 모든 소스에서 트렌드 수집 및 통합
 */
export async function fetchAllTrends(
  options: TrendAnalysisOptions = {}
): Promise<TrendData[]> {
  const {
    includeGoogle = true,
    includeNaver = true,
    includePubMed = true,
    limit = 20,
  } = options;

  const allTrends: TrendData[] = [];
  const promises: Promise<TrendData[]>[] = [];

  // 병렬로 모든 소스에서 데이터 수집
  if (includeGoogle) {
    promises.push(fetchGoogleTrends(HEALTH_KEYWORDS, 'US'));
    promises.push(fetchGoogleTrends(HEALTH_KEYWORDS_KR, 'KR'));
  }

  if (includeNaver) {
    promises.push(fetchNaverTrends(SLEEP_KEYWORD_GROUPS, 30));
  }

  if (includePubMed) {
    promises.push(fetchPubMedTrends(SLEEP_SEARCH_QUERIES.slice(0, 5), 30));
  }

  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allTrends.push(...result.value);
    } else {
      console.error('Trend fetch failed:', result.reason);
    }
  }

  // 점수 정규화 및 중복 제거
  const normalized = normalizeTrends(allTrends);
  const deduplicated = deduplicateTrends(normalized);

  return deduplicated
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 트렌드 점수 정규화 (0-100 스케일)
 */
function normalizeTrends(trends: TrendData[]): TrendData[] {
  // 소스별로 그룹핑
  const bySource: Record<string, TrendData[]> = {};
  
  for (const trend of trends) {
    if (!bySource[trend.source]) {
      bySource[trend.source] = [];
    }
    bySource[trend.source].push(trend);
  }

  const normalized: TrendData[] = [];

  // 각 소스 내에서 정규화
  for (const [source, sourceTrends] of Object.entries(bySource)) {
    const maxScore = Math.max(...sourceTrends.map(t => t.score));
    const minScore = Math.min(...sourceTrends.map(t => t.score));
    const range = maxScore - minScore || 1;

    for (const trend of sourceTrends) {
      normalized.push({
        ...trend,
        score: Math.round(((trend.score - minScore) / range) * 100),
      });
    }
  }

  return normalized;
}

/**
 * 유사 키워드 중복 제거
 */
function deduplicateTrends(trends: TrendData[]): TrendData[] {
  const seen = new Map<string, TrendData>();

  for (const trend of trends) {
    const key = normalizeKeyword(trend.keyword);
    
    if (!seen.has(key)) {
      seen.set(key, trend);
    } else {
      // 더 높은 점수 유지
      const existing = seen.get(key)!;
      if (trend.score > existing.score) {
        seen.set(key, trend);
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * 키워드 정규화 (중복 체크용)
 */
function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '')
    .trim();
}

/**
 * 트렌드 기반 콘텐츠 아이디어 생성
 */
export function generateContentIdeas(trends: TrendData[]): string[] {
  const ideas: string[] = [];

  for (const trend of trends.slice(0, 5)) {
    const templates = getContentTemplates(trend);
    ideas.push(...templates);
  }

  return ideas;
}

/**
 * 트렌드별 콘텐츠 템플릿
 */
function getContentTemplates(trend: TrendData): string[] {
  const { keyword, source } = trend;
  
  const templates: string[] = [];

  // 기본 템플릿
  templates.push(`"${keyword}"에 대해 알아야 할 3가지`);
  templates.push(`${keyword}: 전문가가 말하는 진실`);

  // 소스별 특화 템플릿
  if (source === 'pubmed') {
    templates.push(`최신 연구로 밝혀진 ${keyword}의 비밀`);
    templates.push(`📊 ${keyword} 관련 새로운 연구 결과`);
  }

  if (source === 'google' || source === 'naver') {
    templates.push(`요즘 사람들이 많이 찾는 ${keyword}, 왜?`);
    templates.push(`${keyword} 검색이 급증한 이유`);
  }

  return templates;
}

/**
 * 대시보드 요약 데이터 생성
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const trends = await fetchAllTrends({ limit: 10 });

  return {
    topTrends: trends,
    suggestions: [], // 2단계에서 구현
    recentContent: [], // 4단계에서 구현
    lastUpdated: new Date(),
  };
}

// Re-export for convenience
export { fetchGoogleTrends, fetchNaverTrends, fetchPubMedTrends };
