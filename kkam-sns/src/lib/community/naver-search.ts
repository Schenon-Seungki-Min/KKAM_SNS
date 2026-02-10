/**
 * 네이버 검색 API 클라이언트 (블로그, 카페, 지식iN)
 *
 * API 문서: https://developers.naver.com/docs/serviceapi/search/blog/blog.md
 *
 * 필요한 API 키:
 * - NAVER_CLIENT_ID
 * - NAVER_CLIENT_SECRET
 */

import { CommunitySearchItem } from '@/types';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

type NaverSearchType = 'blog' | 'cafearticle' | 'kin';

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchItemRaw[];
}

interface NaverSearchItemRaw {
  title: string;
  link: string;
  description: string;
  bloggername?: string;
  bloggerlink?: string;
  postdate?: string; // YYYYMMDD
  cafename?: string;
  cafeurl?: string;
}

const SOURCE_MAP: Record<NaverSearchType, { source: CommunitySearchItem['source']; label: string }> = {
  blog: { source: 'naver_blog', label: '네이버 블로그' },
  cafearticle: { source: 'naver_cafe', label: '네이버 카페' },
  kin: { source: 'naver_kin', label: '네이버 지식iN' },
};

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

function formatPostDate(dateStr?: string): string {
  if (!dateStr || dateStr.length !== 8) return '';
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

/**
 * 네이버 검색 API로 키워드 검색
 */
export async function searchNaver(
  keyword: string,
  type: NaverSearchType,
  display: number = 10,
  sort: 'sim' | 'date' = 'sim'
): Promise<CommunitySearchItem[]> {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.warn(`Naver API keys not set - returning mock data for ${type}`);
    return getMockNaverSearch(keyword, type);
  }

  const url = `https://openapi.naver.com/v1/search/${type}?query=${encodeURIComponent(keyword)}&display=${display}&sort=${sort}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      console.error(`Naver Search API error (${type}):`, await response.text());
      return getMockNaverSearch(keyword, type);
    }

    const data: NaverSearchResponse = await response.json();
    const { source, label } = SOURCE_MAP[type];

    return data.items.map((item) => ({
      title: stripHtml(item.title),
      link: item.link,
      description: stripHtml(item.description),
      date: formatPostDate(item.postdate) || data.lastBuildDate?.slice(0, 10) || '',
      source,
      sourceLabel: label,
    }));
  } catch (error) {
    console.error(`Naver Search (${type}) fetch error:`, error);
    return getMockNaverSearch(keyword, type);
  }
}

/**
 * 블로그, 카페, 지식iN 동시 검색
 */
export async function searchNaverAll(
  keyword: string,
  display: number = 10,
  sort: 'sim' | 'date' = 'sim'
): Promise<CommunitySearchItem[]> {
  const types: NaverSearchType[] = ['blog', 'cafearticle', 'kin'];

  const results = await Promise.allSettled(
    types.map((type) => searchNaver(keyword, type, display, sort))
  );

  const items: CommunitySearchItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    }
  }

  return items;
}

// Mock 데이터
function getMockNaverSearch(keyword: string, type: NaverSearchType): CommunitySearchItem[] {
  const { source, label } = SOURCE_MAP[type];
  const today = new Date().toISOString().slice(0, 10);

  return Array.from({ length: 3 }, (_, i) => ({
    title: `[${label}] ${keyword} 관련 게시글 ${i + 1}`,
    link: `https://example.com/${type}/${i + 1}`,
    description: `${keyword}에 대한 ${label} 검색 결과입니다. 자세한 내용은 본문을 확인해주세요.`,
    date: today,
    source,
    sourceLabel: label,
  }));
}
