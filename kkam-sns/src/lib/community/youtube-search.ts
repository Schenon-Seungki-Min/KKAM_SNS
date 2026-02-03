/**
 * YouTube Data API v3 검색 클라이언트 (고급 검색 + 통계)
 *
 * API 문서: https://developers.google.com/youtube/v3/docs/search/list
 *
 * 필요한 API 키:
 * - YOUTUBE_API_KEY
 */

import { CommunitySearchItem, YouTubeSearchFilters } from '@/types';

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
    channelId: string;
  };
}

interface YouTubeVideoResource {
  id: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YouTubeVideosResponse {
  items: YouTubeVideoResource[];
}

interface YouTubeChannelResource {
  id: string;
  statistics: {
    subscriberCount: string;
  };
}

interface YouTubeChannelsResponse {
  items: YouTubeChannelResource[];
}

/**
 * YouTube 검색 API로 키워드 검색 (고급 필터 + 통계 포함)
 */
export async function searchYouTube(
  keyword: string,
  maxResults: number = 50,
  filters?: YouTubeSearchFilters
): Promise<CommunitySearchItem[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not set - returning mock data');
    return getMockYouTubeSearch(keyword);
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: keyword,
    type: 'video',
    maxResults: String(Math.min(maxResults, 50)),
    order: 'date',
    relevanceLanguage: 'ko',
    key: YOUTUBE_API_KEY,
  });

  if (filters?.publishedAfter) {
    params.set('publishedAfter', filters.publishedAfter);
  }
  if (filters?.publishedBefore) {
    params.set('publishedBefore', filters.publishedBefore);
  }

  const url = `https://www.googleapis.com/youtube/v3/search?${params}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('YouTube Search API error:', await response.text());
      return getMockYouTubeSearch(keyword);
    }

    const data: YouTubeSearchResponse = await response.json();

    const videoItems = data.items.filter((item) => item.id.videoId);
    if (videoItems.length === 0) return [];

    // 2차: videos/list로 통계
    const videoIds = videoItems.map((item) => item.id.videoId!);
    const statsMap = await fetchVideoStatistics(videoIds);

    // 3차: channels/list로 구독자 수
    const channelIds = [...new Set(videoItems.map((item) => item.snippet.channelId))];
    const channelMap = await fetchChannelStatistics(channelIds);

    let results: CommunitySearchItem[] = videoItems.map((item) => {
      const stats = statsMap.get(item.id.videoId!);
      const chStats = channelMap.get(item.snippet.channelId);
      return {
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        description: item.snippet.description.slice(0, 200),
        date: item.snippet.publishedAt.slice(0, 10),
        source: 'youtube' as const,
        sourceLabel: '유튜브',
        channelTitle: item.snippet.channelTitle,
        viewCount: stats ? parseInt(stats.viewCount, 10) : undefined,
        likeCount: stats ? parseInt(stats.likeCount, 10) : undefined,
        commentCount: stats ? parseInt(stats.commentCount, 10) : undefined,
        subscriberCount: chStats ? parseInt(chStats.subscriberCount, 10) : undefined,
      };
    });

    // 조회수 범위 필터 (클라이언트 사이드)
    if (filters?.viewMin !== undefined) {
      results = results.filter((r) => (r.viewCount ?? 0) >= filters.viewMin!);
    }
    if (filters?.viewMax !== undefined) {
      results = results.filter((r) => (r.viewCount ?? 0) <= filters.viewMax!);
    }

    return results;
  } catch (error) {
    console.error('YouTube Search fetch error:', error);
    return getMockYouTubeSearch(keyword);
  }
}

async function fetchVideoStatistics(
  videoIds: string[]
): Promise<Map<string, YouTubeVideoResource['statistics']>> {
  const map = new Map<string, YouTubeVideoResource['statistics']>();
  if (!YOUTUBE_API_KEY || videoIds.length === 0) return map;

  try {
    const params = new URLSearchParams({
      part: 'statistics',
      id: videoIds.join(','),
      key: YOUTUBE_API_KEY,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!res.ok) return map;

    const data: YouTubeVideosResponse = await res.json();
    for (const v of data.items) {
      map.set(v.id, v.statistics);
    }
  } catch (error) {
    console.error('YouTube videos/list error:', error);
  }
  return map;
}

async function fetchChannelStatistics(
  channelIds: string[]
): Promise<Map<string, YouTubeChannelResource['statistics']>> {
  const map = new Map<string, YouTubeChannelResource['statistics']>();
  if (!YOUTUBE_API_KEY || channelIds.length === 0) return map;

  try {
    const params = new URLSearchParams({
      part: 'statistics',
      id: channelIds.join(','),
      key: YOUTUBE_API_KEY,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`);
    if (!res.ok) return map;

    const data: YouTubeChannelsResponse = await res.json();
    for (const ch of data.items) {
      map.set(ch.id, ch.statistics);
    }
  } catch (error) {
    console.error('YouTube channels/list error:', error);
  }
  return map;
}

function getMockYouTubeSearch(keyword: string): CommunitySearchItem[] {
  const today = new Date().toISOString().slice(0, 10);

  return Array.from({ length: 3 }, (_, i) => ({
    title: `[유튜브] ${keyword} 관련 영상 ${i + 1}`,
    link: `https://www.youtube.com/watch?v=mock${i + 1}`,
    description: `${keyword}에 대한 유튜브 검색 결과입니다.`,
    date: today,
    source: 'youtube' as const,
    sourceLabel: '유튜브',
    channelTitle: `채널 ${i + 1}`,
    viewCount: Math.floor(Math.random() * 100000),
    likeCount: Math.floor(Math.random() * 5000),
    commentCount: Math.floor(Math.random() * 500),
    subscriberCount: Math.floor(Math.random() * 50000),
  }));
}
