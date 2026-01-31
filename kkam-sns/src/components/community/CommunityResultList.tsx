'use client';

import { CommunitySearchItem } from '@/types';

interface Props {
  results: CommunitySearchItem[];
}

const SOURCE_COLORS: Record<string, string> = {
  naver_blog: 'bg-green-100 text-green-700',
  naver_cafe: 'bg-orange-100 text-orange-700',
  naver_kin: 'bg-blue-100 text-blue-700',
  youtube: 'bg-red-100 text-red-700',
};

export default function CommunityResultList({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        해당 소스에서 검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((item, index) => (
        <a
          key={`${item.source}-${index}`}
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
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>
            <span className="text-gray-300 text-xs shrink-0">&#8599;</span>
          </div>
        </a>
      ))}
    </div>
  );
}
