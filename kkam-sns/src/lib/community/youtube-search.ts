/**
 * YouTube Data API v3 검색 클라이언트
 *
 * API 문서: https://developers.google.com/youtube/v3/docs/search/list
 *
 * 필요한 API 키:
 * - YOUTUBE_API_KEY
 */

import { CommunitySearchItem } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface YouTubeSearchResponse {
  items: YouTubeSearchItemRaw[];
  pageInfo: { totalResults: number; resultsPerPage: number };
}

interface YouTubeSearchItemRaw {
  id: { kind: string; videoId?: string };
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    channelTitle: string;
  };
}

/**
 * YouTube 검색 API로 키워드 검색
 */
export async function searchYouTube(
  keyword: string,
  maxResults: number = 10
): Promise<CommunitySearchItem[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not set - returning mock data');
    return getMockYouTubeSearch(keyword);
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: keyword,
    type: 'video',
    maxResults: String(maxResults),
    order: 'date',
    relevanceLanguage: 'ko',
    key: YOUTUBE_API_KEY,
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('YouTube Search API error:', await response.text());
      return getMockYouTubeSearch(keyword);
    }

    const data: YouTubeSearchResponse = await response.json();

    return data.items
      .filter((item) => item.id.videoId)
      .map((item) => ({
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        description: item.snippet.description.slice(0, 200),
        date: item.snippet.publishedAt.slice(0, 10),
        source: 'youtube' as const,
        sourceLabel: '유튜브',
      }));
  } catch (error) {
    console.error('YouTube Search fetch error:', error);
    return getMockYouTubeSearch(keyword);
  }
}

// Mock 데이터
function getMockYouTubeSearch(keyword: string): CommunitySearchItem[] {
  const today = new Date().toISOString().slice(0, 10);

  return Array.from({ length: 3 }, (_, i) => ({
    title: `[유튜브] ${keyword} 관련 영상 ${i + 1}`,
    link: `https://www.youtube.com/watch?v=mock${i + 1}`,
    description: `${keyword}에 대한 유튜브 검색 결과입니다.`,
    date: today,
    source: 'youtube' as const,
    sourceLabel: '유튜브',
  }));
}
