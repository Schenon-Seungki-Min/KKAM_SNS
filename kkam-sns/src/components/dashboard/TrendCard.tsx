'use client';

import { TrendData } from '@/types';

interface TrendCardProps {
  trend: TrendData;
  rank: number;
  onClick?: () => void;
}

export default function TrendCard({ trend, rank, onClick }: TrendCardProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google':
        return '🔍';
      case 'naver':
        return '🇰🇷';
      case 'pubmed':
        return '🔬';
      default:
        return '📊';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'google':
        return 'bg-blue-100 text-blue-800';
      case 'naver':
        return 'bg-green-100 text-green-800';
      case 'pubmed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 순위 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
          {rank}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getSourceIcon(trend.source)}</span>
            <h3 className="font-medium text-gray-900 truncate">
              {trend.keyword}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSourceColor(trend.source)}`}>
              {trend.source.toUpperCase()}
            </span>
            {trend.category && (
              <span className="text-gray-500">
                #{trend.category}
              </span>
            )}
          </div>
        </div>

        {/* 점수 */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-2xl font-bold ${getScoreColor(trend.score)}`}>
            {trend.score}
          </div>
          <div className="text-xs text-gray-400">score</div>
        </div>
      </div>

      {/* 연관 검색어 */}
      {trend.relatedQueries && trend.relatedQueries.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {trend.relatedQueries.slice(0, 3).map((query, i) => (
              <span 
                key={i}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
