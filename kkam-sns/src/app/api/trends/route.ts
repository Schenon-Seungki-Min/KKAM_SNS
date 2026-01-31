/**
 * 트렌드 API 엔드포인트
 * GET /api/trends - 모든 트렌드 데이터 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllTrends, TrendAnalysisOptions } from '@/lib/trends';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const options: TrendAnalysisOptions = {
      includeGoogle: searchParams.get('google') !== 'false',
      includeNaver: searchParams.get('naver') !== 'false',
      includePubMed: searchParams.get('pubmed') !== 'false',
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const trends = await fetchAllTrends(options);

    return NextResponse.json({
      success: true,
      data: trends,
      count: trends.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Trends API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trends',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - 특정 키워드로 트렌드 검색
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, sources } = body;

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { success: false, error: 'keywords array required' },
        { status: 400 }
      );
    }

    // 커스텀 키워드로 트렌드 조회 (추후 구현)
    const trends = await fetchAllTrends({
      includeGoogle: sources?.includes('google') ?? true,
      includeNaver: sources?.includes('naver') ?? true,
      includePubMed: sources?.includes('pubmed') ?? true,
    });

    // 키워드 필터링
    const filtered = trends.filter(t => 
      keywords.some((k: string) => 
        t.keyword.toLowerCase().includes(k.toLowerCase())
      )
    );

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Trends API POST error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to search trends' },
      { status: 500 }
    );
  }
}
