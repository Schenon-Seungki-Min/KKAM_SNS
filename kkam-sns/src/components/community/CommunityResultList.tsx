'use client';

import { useState } from 'react';
import { CommunitySearchItem } from '@/types';
import CommentAnalysis from './CommentAnalysis';

interface Props {
  results: CommunitySearchItem[];
}

const SOURCE_COLORS: Record<string, string> = {
  naver_blog: 'bg-green-100 text-green-700',
  naver_cafe: 'bg-orange-100 text-orange-700',
  naver_kin: 'bg-blue-100 text-blue-700',
  youtube: 'bg-red-100 text-red-700',
};

function formatNumber(n?: number | null): string {
  if (n == null) return '-';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toLocaleString();
}

function extractVideoId(link: string): string | null {
  const match = link.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

export default function CommunityResultList({ results }: Props) {
  const [expandedComment, setExpandedComment] = useState<string | null>(null);

  if (results.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        해당 소스에서 검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((item, index) => {
        const videoId = item.source === 'youtube' ? extractVideoId(item.link) : null;
        const isExpanded = expandedComment === videoId;

        return (
          <div key={`${item.source}-${index}`}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-gray-300 text-xs font-mono mt-0.5 w-5 text-right shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SOURCE_COLORS[item.source] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {item.sourceLabel}
                    </span>
                    {item.date && (
                      <span className="text-xs text-gray-400">{item.date}</span>
                    )}
                    {item.channelTitle && (
                      <span className="text-xs text-gray-400">{item.channelTitle}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>

                  {/* YouTube 통계 */}
                  {item.source === 'youtube' && item.viewCount !== undefined && (
                    <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-gray-400">
                      <span>조회수 {formatNumber(item.viewCount)}</span>
                      {item.likeCount !== undefined && (
                        <span>좋아요 {formatNumber(item.likeCount)}</span>
                      )}
                      {item.commentCount !== undefined && (
                        <span>댓글 {formatNumber(item.commentCount)}</span>
                      )}
                      {item.subscriberCount !== undefined && (
                        <span>구독자 {formatNumber(item.subscriberCount)}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-gray-300 text-xs shrink-0">&#8599;</span>
              </div>
            </a>

            {/* 댓글 분석 버튼 (YouTube만) */}
            {item.source === 'youtube' && videoId && (
              <>
                <button
                  onClick={() => setExpandedComment(isExpanded ? null : videoId)}
                  className="mt-1 ml-8 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? '댓글 분석 닫기 \u25B2' : '댓글 분석 \u25BC'}
                </button>
                {isExpanded && (
                  <div className="mt-2 ml-8">
                    <CommentAnalysis videoId={videoId} videoTitle={item.title} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
