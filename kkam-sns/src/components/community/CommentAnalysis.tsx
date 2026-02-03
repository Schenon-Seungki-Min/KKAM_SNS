'use client';

import { useState, useEffect } from 'react';
import { CommentData, KeywordFrequency } from '@/types';
import WordCloud from './WordCloud';

interface Props {
  videoId: string;
  videoTitle: string;
}

interface AnalysisState {
  loading: boolean;
  topComments: CommentData[];
  keywordFrequencies: KeywordFrequency[];
  stats: { totalCount: number; avgLikes: number; maxLikes: number } | null;
  error: string | null;
}

export default function CommentAnalysis({ videoId, videoTitle }: Props) {
  const [state, setState] = useState<AnalysisState>({
    loading: true,
    topComments: [],
    keywordFrequencies: [],
    stats: null,
    error: null,
  });

  useEffect(() => {
    const fetchComments = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = new URLSearchParams({ videoId, videoTitle });
        const res = await fetch(`/api/community/comments?${params}`);
        const data = await res.json();

        if (!data.success) {
          setState((prev) => ({ ...prev, loading: false, error: data.error }));
          return;
        }

        setState({
          loading: false,
          topComments: data.topComments,
          keywordFrequencies: data.keywordFrequencies,
          stats: data.stats,
          error: null,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: '댓글을 불러올 수 없습니다.',
        }));
      }
    };
    fetchComments();
  }, [videoId, videoTitle]);

  const handleCommentCsvDownload = () => {
    if (state.topComments.length === 0) return;
    const BOM = '\uFEFF';
    const header = '작성자,댓글,좋아요 수,작성일';
    const escape = (s: string) => `"${s.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const rows = state.topComments.map((c) =>
      [escape(c.authorName), escape(c.text), c.likeCount, escape(c.publishedAt)].join(',')
    );
    const csv = BOM + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comments_${videoId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (state.loading) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-red-600 text-xs">
        {state.error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
      {/* 통계 요약 */}
      {state.stats && (
        <div className="flex gap-4 text-xs">
          <div className="bg-white rounded px-3 py-2 border border-gray-200">
            <div className="text-gray-400">총 댓글</div>
            <div className="font-bold text-gray-900">{state.stats.totalCount}</div>
          </div>
          <div className="bg-white rounded px-3 py-2 border border-gray-200">
            <div className="text-gray-400">평균 좋아요</div>
            <div className="font-bold text-gray-900">{state.stats.avgLikes}</div>
          </div>
          <div className="bg-white rounded px-3 py-2 border border-gray-200">
            <div className="text-gray-400">최대 좋아요</div>
            <div className="font-bold text-gray-900">{state.stats.maxLikes.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* 인기 댓글 TOP 10 */}
      {state.topComments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-700">인기 댓글 TOP {state.topComments.length}</h4>
            <button
              onClick={handleCommentCsvDownload}
              className="text-[10px] text-gray-400 hover:text-gray-600 border border-gray-300 rounded px-2 py-0.5"
            >
              댓글 CSV
            </button>
          </div>
          <div className="space-y-2">
            {state.topComments.map((c, i) => (
              <div key={i} className="bg-white rounded border border-gray-200 p-2.5 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500">{c.authorName}</span>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>{c.publishedAt}</span>
                    <span className="text-red-400">&#9829; {c.likeCount}</span>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line line-clamp-3">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 댓글 키워드 워드클라우드 */}
      {state.keywordFrequencies.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">댓글 키워드</h4>
          <WordCloud keywords={state.keywordFrequencies} onKeywordClick={() => {}} />
        </div>
      )}

      {state.topComments.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          댓글이 없거나 댓글이 비활성화된 영상입니다.
        </p>
      )}
    </div>
  );
}
