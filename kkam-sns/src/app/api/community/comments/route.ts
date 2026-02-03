/**
 * YouTube 댓글 분석 API 엔드포인트
 * GET /api/community/comments?videoId=xxx&videoTitle=yyy
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoComments, analyzeComments } from '@/lib/community/youtube-comments';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');
    const videoTitle = searchParams.get('videoTitle') || '';

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'videoId parameter required' },
        { status: 400 }
      );
    }

    const comments = await fetchVideoComments(videoId);
    const analysis = analyzeComments(comments, videoId, videoTitle);

    return NextResponse.json({
      success: true,
      ...analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Comment analysis API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze comments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
