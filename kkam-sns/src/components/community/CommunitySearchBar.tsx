'use client';

import { useState, FormEvent } from 'react';

interface Props {
  onSearch: (keyword: string) => void;
  loading: boolean;
}

export default function CommunitySearchBar({ onSearch, loading }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    onSearch(trimmed);
  };

  const suggestions = ['수면', '불면증', '멜라토닌', '코골이', '수면무호흡'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="키워드를 입력하세요 (예: 수면, 불면증)"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-gray-400">추천:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setInput(s);
              onSearch(s);
            }}
            disabled={loading}
            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
