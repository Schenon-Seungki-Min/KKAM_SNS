/**
 * 커뮤니티 분석 API 엔드포인트
 * GET /api/community?keyword=검색어&display=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchCommunity } from '@/lib/community';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const display = parseInt(searchParams.get('display') || '10');

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'keyword parameter required' },
        { status: 400 }
      );
    }

    const { results, relatedKeywords } = await searchCommunity(keyword.trim(), display);

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
