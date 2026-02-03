/**
 * 커뮤니티 분석 메인 모듈 (Type A: 키워드 탐색형)
 *
 * 네이버 블로그/카페/지식iN + 유튜브 통합 검색
 */

import { CommunitySearchItem, KeywordFrequency, YouTubeSearchFilters } from '@/types';
import { searchNaverAll } from './naver-search';
import { searchYouTube } from './youtube-search';

/**
 * 모든 소스에서 키워드 검색
 */
export async function searchCommunity(
  keyword: string,
  display: number = 50,
  youtubeFilters?: YouTubeSearchFilters
): Promise<{ results: CommunitySearchItem[]; relatedKeywords: KeywordFrequency[] }> {
  const [naverResults, youtubeResults] = await Promise.allSettled([
    searchNaverAll(keyword, display),
    searchYouTube(keyword, display, youtubeFilters),
  ]);

  const results: CommunitySearchItem[] = [];

  if (naverResults.status === 'fulfilled') {
    results.push(...naverResults.value);
  }
  if (youtubeResults.status === 'fulfilled') {
    results.push(...youtubeResults.value);
  }

  // 날짜 내림차순 정렬
  results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // 연관 키워드 추출
  const relatedKeywords = extractKeywords(results, keyword);

  return { results, relatedKeywords };
}

/**
 * 제목+설명에서 연관 키워드 빈도 추출 (워드클라우드용)
 */
function extractKeywords(
  items: CommunitySearchItem[],
  originalKeyword: string
): KeywordFrequency[] {
  const freq: Record<string, number> = {};
  const stopwords = new Set([
    '및', '등', '의', '에', '를', '을', '이', '가', '은', '는',
    '로', '으로', '와', '과', '에서', '도', '만', '까지', '부터',
    '한', '된', '인', '것', '수', '더', '그', '또', '때', '중',
    'the', 'a', 'an', 'and', 'or', 'is', 'in', 'to', 'for', 'of',
    'with', 'on', 'at', 'by', 'from', 'this', 'that', 'it', 'not',
  ]);

  const lowerOriginal = originalKeyword.toLowerCase();

  for (const item of items) {
    const text = `${item.title} ${item.description}`;
    // 한글 2글자 이상 또는 영문 3글자 이상 단어 추출
    const words = text.match(/[가-힣]{2,}|[a-zA-Z]{3,}/g) || [];

    for (const word of words) {
      const lower = word.toLowerCase();
      if (stopwords.has(lower)) continue;
      if (lower === lowerOriginal) continue;
      if (lower.length < 2) continue;
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([text, value]) => ({ text, value }));
}

export { searchNaverAll } from './naver-search';
export { searchYouTube } from './youtube-search';
