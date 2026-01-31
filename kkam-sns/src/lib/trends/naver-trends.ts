/**
 * 네이버 검색어 Lab (DataLab) API 클라이언트
 * 
 * API 문서: https://developers.naver.com/docs/serviceapi/datalab/search/search.md
 * 
 * 필요한 API 키:
 * - NAVER_CLIENT_ID
 * - NAVER_CLIENT_SECRET
 */

import { NaverTrendResult, TrendData } from '@/types';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

const NAVER_DATALAB_URL = 'https://openapi.naver.com/v1/datalab/search';

// 수면/건강 관련 검색어 그룹
export const SLEEP_KEYWORD_GROUPS = [
  { groupName: '수면', keywords: ['수면', '숙면', '잠'] },
  { groupName: '불면증', keywords: ['불면증', '잠이 안와', '수면제'] },
  { groupName: '수면 건강', keywords: ['수면 건강', '수면의 질', '깊은 잠'] },
  { groupName: '수면 장애', keywords: ['수면 장애', '수면 무호흡', '코골이'] },
  { groupName: '수면 앱', keywords: ['수면 앱', '수면 트래커', '수면 측정'] },
];

interface NaverDatalabRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  timeUnit: 'date' | 'week' | 'month';
  keywordGroups: {
    groupName: string;
    keywords: string[];
  }[];
  device?: 'pc' | 'mo' | '';
  ages?: string[];
  gender?: 'm' | 'f' | '';
}

/**
 * 네이버 DataLab 검색어 트렌드 조회
 */
export async function fetchNaverTrends(
  keywordGroups = SLEEP_KEYWORD_GROUPS,
  days: number = 30
): Promise<TrendData[]> {
  
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.warn('Naver API keys not set - returning mock data');
    return getMockNaverTrends();
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const requestBody: NaverDatalabRequest = {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    timeUnit: 'date',
    keywordGroups: keywordGroups.slice(0, 5), // 최대 5개 그룹
  };

  try {
    const response = await fetch(NAVER_DATALAB_URL, {
      method: 'POST',
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Naver API error:', error);
      return getMockNaverTrends();
    }

    const data = await response.json();
    
    return parseNaverResponse(data);

  } catch (error) {
    console.error('Naver Trends fetch error:', error);
    return getMockNaverTrends();
  }
}

/**
 * 네이버 실시간 검색어 (비공식 - 웹 크롤링 필요)
 * Note: 네이버는 실시간 검색어 API를 제공하지 않음
 */
export async function fetchNaverRealtime(): Promise<TrendData[]> {
  // 실시간 검색어는 크롤링이 필요하므로 mock 반환
  // 추후 Puppeteer 등으로 구현 가능
  console.warn('Naver realtime search requires web scraping');
  return getMockNaverRealtime();
}

// 응답 파싱
function parseNaverResponse(data: any): TrendData[] {
  const results: TrendData[] = [];
  
  if (!data.results) return results;

  for (const result of data.results) {
    // 최근 데이터 포인트의 평균 계산
    const recentData = result.data?.slice(-7) || [];
    const avgRatio = recentData.reduce((sum: number, d: any) => sum + d.ratio, 0) / recentData.length;
    
    results.push({
      keyword: result.title,
      score: Math.round(avgRatio),
      source: 'naver',
      category: 'health',
      timestamp: new Date(),
      relatedQueries: result.keywords || [],
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

// 날짜 포맷 (YYYY-MM-DD)
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Mock 데이터
function getMockNaverTrends(): TrendData[] {
  return SLEEP_KEYWORD_GROUPS.map((group, index) => ({
    keyword: group.groupName,
    score: Math.max(30, 90 - index * 12 + Math.random() * 15),
    source: 'naver' as const,
    category: 'health',
    timestamp: new Date(),
    relatedQueries: group.keywords,
  }));
}

function getMockNaverRealtime(): TrendData[] {
  return [
    { keyword: '수면 부족 증상', score: 100, source: 'naver', category: 'realtime', timestamp: new Date() },
    { keyword: '불면증 원인', score: 95, source: 'naver', category: 'realtime', timestamp: new Date() },
    { keyword: '숙면 방법', score: 88, source: 'naver', category: 'realtime', timestamp: new Date() },
  ];
}
