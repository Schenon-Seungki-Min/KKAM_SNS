'use client';

import { KeywordFrequency } from '@/types';

interface Props {
  keywords: KeywordFrequency[];
  onKeywordClick: (keyword: string) => void;
}

export default function WordCloud({ keywords, onKeywordClick }: Props) {
  if (keywords.length === 0) return null;

  const maxVal = Math.max(...keywords.map((k) => k.value));
  const minVal = Math.min(...keywords.map((k) => k.value));
  const range = maxVal - minVal || 1;

  // 크기를 5단계로 매핑
  const getSize = (value: number): string => {
    const ratio = (value - minVal) / range;
    if (ratio > 0.8) return 'text-xl font-bold';
    if (ratio > 0.6) return 'text-lg font-semibold';
    if (ratio > 0.4) return 'text-base font-medium';
    if (ratio > 0.2) return 'text-sm';
    return 'text-xs';
  };

  const COLORS = [
    'text-blue-600',
    'text-green-600',
    'text-purple-600',
    'text-orange-600',
    'text-pink-600',
    'text-teal-600',
    'text-indigo-600',
    'text-red-500',
    'text-cyan-600',
    'text-amber-600',
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">연관 키워드</h3>
      <div className="flex flex-wrap gap-2 items-center justify-center min-h-[200px]">
        {keywords.map((kw, i) => (
          <button
            key={kw.text}
            onClick={() => onKeywordClick(kw.text)}
            title={`${kw.text} (${kw.value})`}
            className={`${getSize(kw.value)} ${COLORS[i % COLORS.length]} hover:opacity-70 transition-opacity cursor-pointer`}
          >
            {kw.text}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        클릭하면 해당 키워드로 재검색합니다
      </p>
    </div>
  );
}
