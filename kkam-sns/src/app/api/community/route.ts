/**
 * 커뮤니티 분석 API 엔드포인트
 * GET /api/community?platform=naver|youtube&keyword=검색어&...
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchNaverCommunity, searchYouTubeCommunity } from '@/lib/community';
import { YouTubeSearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform') || 'youtube';
    const keyword = searchParams.get('keyword');
    const display = parseInt(searchParams.get('display') || '50');

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'keyword parameter required' },
        { status: 400 }
      );
    }

    if (platform === 'naver') {
      // 네이버 검색
      const naverSort = (searchParams.get('naverSort') || 'sim') as 'sim' | 'date';

      const { results, relatedKeywords } = await searchNaverCommunity(
        keyword.trim(),
        display,
        naverSort
      );

      return NextResponse.json({
        success: true,
        platform: 'naver',
        keyword: keyword.trim(),
        results,
        relatedKeywords,
        totalCount: results.length,
        timestamp: new Date().toISOString(),
      });
    } else {
      // 유튜브 검색
      const publishedAfter = searchParams.get('publishedAfter');
      const publishedBefore = searchParams.get('publishedBefore');
      const viewMin = searchParams.get('viewMin');
      const viewMax = searchParams.get('viewMax');

      const youtubeFilters: YouTubeSearchFilters = {};
      if (publishedAfter) youtubeFilters.publishedAfter = publishedAfter;
      if (publishedBefore) youtubeFilters.publishedBefore = publishedBefore;
      if (viewMin) youtubeFilters.viewMin = parseInt(viewMin, 10);
      if (viewMax) youtubeFilters.viewMax = parseInt(viewMax, 10);

      const hasFilters = Object.keys(youtubeFilters).length > 0;

      const { results, relatedKeywords } = await searchYouTubeCommunity(
        keyword.trim(),
        display,
        hasFilters ? youtubeFilters : undefined
      );

      return NextResponse.json({
        success: true,
        platform: 'youtube',
        keyword: keyword.trim(),
        results,
        relatedKeywords,
        totalCount: results.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Community API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search community',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
