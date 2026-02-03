/**
 * 커뮤니티 분석 API 엔드포인트
 * GET /api/community?keyword=검색어&display=50&publishedAfter=...&viewMin=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCommunity } from '@/lib/community';
import { YouTubeSearchFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const display = parseInt(searchParams.get('display') || '50');

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'keyword parameter required' },
        { status: 400 }
      );
    }

    // YouTube 고급 필터
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

    const { results, relatedKeywords } = await searchCommunity(
      keyword.trim(),
      display,
      hasFilters ? youtubeFilters : undefined
    );

    return NextResponse.json({
      success: true,
      keyword: keyword.trim(),
      results,
      relatedKeywords,
      totalCount: results.length,
      timestamp: new Date().toISOString(),
    });
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
