/**
 * YouTube 댓글 분석 모듈
 *
 * API 문서: https://developers.google.com/youtube/v3/docs/commentThreads/list
 */

import { CommentData, CommentAnalysisResult, KeywordFrequency } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface YouTubeCommentThreadResponse {
  items: {
    snippet: {
      topLevelComment: {
        snippet: {
          textDisplay: string;
          textOriginal: string;
          likeCount: number;
          authorDisplayName: string;
          publishedAt: string;
        };
      };
    };
  }[];
  pageInfo: { totalResults: number };
}

/**
 * 영상의 댓글 가져오기
 */
export async function fetchVideoComments(
  videoId: string,
  maxResults: number = 100
): Promise<CommentData[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not set - returning mock comments');
    return getMockComments();
  }

  const params = new URLSearchParams({
    part: 'snippet',
    videoId,
    maxResults: String(Math.min(maxResults, 100)),
    order: 'relevance',
    textFormat: 'plainText',
    key: YOUTUBE_API_KEY,
  });

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?${params}`
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('YouTube commentThreads error:', errText);
      // 댓글이 비활성화된 영상일 수 있음
      if (errText.includes('disabled')) {
        return [];
      }
      return getMockComments();
    }

    const data: YouTubeCommentThreadResponse = await res.json();

    return data.items.map((item) => {
      const c = item.snippet.topLevelComment.snippet;
      return {
        text: c.textOriginal || c.textDisplay,
        likeCount: c.likeCount,
        authorName: c.authorDisplayName,
        publishedAt: c.publishedAt.slice(0, 10),
      };
    });
  } catch (error) {
    console.error('YouTube comments fetch error:', error);
    return getMockComments();
  }
}

/**
 * 댓글 분석
 */
export function analyzeComments(
  comments: CommentData[],
  videoId: string,
  videoTitle: string
): CommentAnalysisResult {
  // 인기 댓글 TOP 10 (좋아요 순)
  const topComments = [...comments]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 10);

  // 키워드 빈출 분석
  const keywordFrequencies = extractCommentKeywords(comments);

  // 기본 통계
  const totalCount = comments.length;
  const totalLikes = comments.reduce((sum, c) => sum + c.likeCount, 0);
  const avgLikes = totalCount > 0 ? Math.round(totalLikes / totalCount) : 0;
  const maxLikes = totalCount > 0 ? Math.max(...comments.map((c) => c.likeCount)) : 0;

  return {
    videoId,
    videoTitle,
    topComments,
    keywordFrequencies,
    stats: { totalCount, avgLikes, maxLikes },
  };
}

/**
 * 댓글에서 키워드 빈도 추출
 */
function extractCommentKeywords(comments: CommentData[]): KeywordFrequency[] {
  const freq: Record<string, number> = {};
  const stopwords = new Set([
    '및', '등', '의', '에', '를', '을', '이', '가', '은', '는',
    '로', '으로', '와', '과', '에서', '도', '만', '까지', '부터',
    '한', '된', '인', '것', '수', '더', '그', '또', '때', '중',
    '정말', '진짜', '너무', '감사', '좋아', '합니다', '있는', '없는',
    '하는', '해서', '그래서', '근데', '저도', '제가', '영상',
    'the', 'a', 'an', 'and', 'or', 'is', 'in', 'to', 'for', 'of',
    'with', 'on', 'at', 'by', 'from', 'this', 'that', 'it', 'not',
  ]);

  for (const comment of comments) {
    const words = comment.text.match(/[가-힣]{2,}|[a-zA-Z]{3,}/g) || [];
    for (const word of words) {
      const lower = word.toLowerCase();
      if (stopwords.has(lower)) continue;
      if (lower.length < 2) continue;
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([text, value]) => ({ text, value }));
}

function getMockComments(): CommentData[] {
  return Array.from({ length: 5 }, (_, i) => ({
    text: `샘플 댓글 ${i + 1}입니다. 좋은 영상 감사합니다.`,
    likeCount: Math.floor(Math.random() * 100),
    authorName: `사용자${i + 1}`,
    publishedAt: new Date().toISOString().slice(0, 10),
  }));
}
