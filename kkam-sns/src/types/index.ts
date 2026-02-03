// KKAM_SNS 타입 정의

// 트렌드 데이터 타입
export interface TrendData {
  keyword: string;
  score: number; // 0-100 상대적 인기도
  source: 'google' | 'naver' | 'pubmed';
  category?: string;
  timestamp: Date;
  relatedQueries?: string[];
}

// Google Trends 응답
export interface GoogleTrendResult {
  keyword: string;
  value: number;
  formattedValue: string;
  relatedQueries: string[];
}

// 네이버 검색어 Lab 응답
export interface NaverTrendResult {
  title: string;
  keywords: string[];
  data: {
    period: string;
    ratio: number;
  }[];
}

// PubMed 논문 데이터
export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  publishDate: string;
  journal: string;
  keywords: string[];
}

// 콘텐츠 추천
export interface ContentSuggestion {
  id: string;
  trend: TrendData;
  title: string;
  hook: string; // 첫 문장 (훅)
  body: string;
  hashtags: string[];
  platform: 'threads' | 'instagram' | 'both';
  createdAt: Date;
}

// 생성된 콘텐츠
export interface GeneratedContent {
  id: string;
  suggestion: ContentSuggestion;
  text: string;
  imageUrl?: string;
  status: 'draft' | 'ready' | 'posted';
  postedAt?: Date;
}

// 대시보드 요약
export interface DashboardSummary {
  topTrends: TrendData[];
  suggestions: ContentSuggestion[];
  recentContent: GeneratedContent[];
  lastUpdated: Date;
}

// ===== 커뮤니티 분석 (Type A: 키워드 탐색형) =====

// 커뮤니티 검색 결과 아이템
export interface CommunitySearchItem {
  title: string;
  link: string;
  description: string;
  date: string; // YYYY-MM-DD or display string
  source: 'naver_blog' | 'naver_cafe' | 'naver_kin' | 'youtube';
  sourceLabel: string;
  // YouTube-only statistics
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  channelTitle?: string;
  subscriberCount?: number;
}

// 커뮤니티 검색 응답
export interface CommunitySearchResponse {
  success: boolean;
  keyword: string;
  results: CommunitySearchItem[];
  relatedKeywords: string[];
  totalCount: number;
  timestamp: string;
  error?: string;
}

// 키워드 빈도 (워드클라우드용)
export interface KeywordFrequency {
  text: string;
  value: number;
}

// ===== YouTube 댓글 분석 =====

export interface CommentData {
  text: string;
  likeCount: number;
  authorName: string;
  publishedAt: string;
}

export interface CommentAnalysisResult {
  videoId: string;
  videoTitle: string;
  topComments: CommentData[];
  keywordFrequencies: KeywordFrequency[];
  stats: {
    totalCount: number;
    avgLikes: number;
    maxLikes: number;
  };
}

// YouTube 고급 검색 필터
export interface YouTubeSearchFilters {
  publishedAfter?: string;
  publishedBefore?: string;
  viewMin?: number;
  viewMax?: number;
}
