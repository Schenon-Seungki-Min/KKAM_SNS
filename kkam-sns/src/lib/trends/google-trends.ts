/**
 * Google Trends API 클라이언트
 * 
 * Note: Google Trends는 공식 API가 없어서 비공식 라이브러리 사용
 * 대안: SerpAPI의 Google Trends API (유료) 또는 크롤링
 */

import { GoogleTrendResult, TrendData } from '@/types';

// 환경변수에서 API 키 (SerpAPI 사용 시)
const SERPAPI_KEY = process.env.SERPAPI_KEY;

// 건강/수면 관련 기본 키워드
export const HEALTH_KEYWORDS = [
  'sleep',
  'insomnia', 
  'sleep quality',
  'circadian rhythm',
  'sleep apnea',
  'melatonin',
  'sleep hygiene',
  'REM sleep',
  'deep sleep',
  'sleep tracker'
];

export const HEALTH_KEYWORDS_KR = [
  '수면',
  '불면증',
  '수면 부족',
  '숙면',
  '수면 장애',
  '멜라토닌',
  '생체 리듬',
  '수면 무호흡',
  '렘수면',
  '수면 앱'
];

/**
 * Google Trends 데이터 가져오기 (SerpAPI 사용)
 */
export async function fetchGoogleTrends(
  keywords: string[] = HEALTH_KEYWORDS,
  geo: string = 'US'
): Promise<TrendData[]> {
  
  if (!SERPAPI_KEY) {
    console.warn('SERPAPI_KEY not set - returning mock data');
    return getMockGoogleTrends(keywords);
  }

  try {
    const results: TrendData[] = [];
    
    for (const keyword of keywords) {
      const params = new URLSearchParams({
        engine: 'google_trends',
        q: keyword,
        geo: geo,
        api_key: SERPAPI_KEY,
        data_type: 'TIMESERIES'
      });

      const response = await fetch(
        `https://serpapi.com/search?${params.toString()}`
      );
      
      if (!response.ok) {
        console.error(`Google Trends API error for ${keyword}`);
        continue;
      }

      const data = await response.json();
      
      // 최신 트렌드 점수 추출
      const timelineData = data.interest_over_time?.timeline_data;
      const latestScore = timelineData?.[timelineData.length - 1]?.values?.[0]?.value || 0;
      
      results.push({
        keyword,
        score: parseInt(latestScore),
        source: 'google',
        category: 'health',
        timestamp: new Date(),
        relatedQueries: data.related_queries?.top?.map((q: any) => q.query) || []
      });
    }

    return results.sort((a, b) => b.score - a.score);
    
  } catch (error) {
    console.error('Google Trends fetch error:', error);
    return getMockGoogleTrends(keywords);
  }
}

/**
 * 실시간 급상승 검색어 가져오기
 */
export async function fetchTrendingSearches(geo: string = 'KR'): Promise<TrendData[]> {
  if (!SERPAPI_KEY) {
    return getMockTrendingSearches();
  }

  try {
    const params = new URLSearchParams({
      engine: 'google_trends_trending_now',
      geo: geo,
      api_key: SERPAPI_KEY
    });

    const response = await fetch(
      `https://serpapi.com/search?${params.toString()}`
    );

    if (!response.ok) {
      return getMockTrendingSearches();
    }

    const data = await response.json();
    
    return data.trending_searches?.map((item: any) => ({
      keyword: item.query,
      score: 100, // 급상승은 모두 높은 점수
      source: 'google' as const,
      category: 'trending',
      timestamp: new Date(),
      relatedQueries: item.related_queries || []
    })) || [];

  } catch (error) {
    console.error('Trending searches fetch error:', error);
    return getMockTrendingSearches();
  }
}

// Mock 데이터 (API 키 없을 때 테스트용)
function getMockGoogleTrends(keywords: string[]): TrendData[] {
  return keywords.map((keyword, index) => ({
    keyword,
    score: Math.max(20, 100 - index * 10 + Math.random() * 20),
    source: 'google' as const,
    category: 'health',
    timestamp: new Date(),
    relatedQueries: [`${keyword} tips`, `${keyword} benefits`, `how to ${keyword}`]
  }));
}

function getMockTrendingSearches(): TrendData[] {
  return [
    { keyword: '수면 건강', score: 95, source: 'google', category: 'trending', timestamp: new Date() },
    { keyword: '불면증 해결법', score: 88, source: 'google', category: 'trending', timestamp: new Date() },
    { keyword: '수면 앱 추천', score: 82, source: 'google', category: 'trending', timestamp: new Date() },
  ];
}
