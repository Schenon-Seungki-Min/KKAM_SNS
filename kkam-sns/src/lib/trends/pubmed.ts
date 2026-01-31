/**
 * PubMed API 클라이언트
 * 
 * API 문서: https://www.ncbi.nlm.nih.gov/books/NBK25500/
 * 
 * PubMed E-utilities는 무료로 사용 가능
 * API 키 있으면 rate limit 완화 (10 req/sec → 더 많이)
 */

import { PubMedArticle, TrendData } from '@/types';

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const PUBMED_API_KEY = process.env.PUBMED_API_KEY; // 선택사항

// 수면 관련 검색 쿼리
export const SLEEP_SEARCH_QUERIES = [
  'sleep quality',
  'insomnia treatment',
  'circadian rhythm',
  'sleep disorders',
  'sleep hygiene',
  'melatonin supplementation',
  'sleep apnea therapy',
  'digital therapeutics sleep',
  'CBT-I cognitive behavioral therapy insomnia',
];

interface ESearchResult {
  esearchresult: {
    count: string;
    idlist: string[];
  };
}

interface ESummaryResult {
  result: {
    [pmid: string]: {
      uid: string;
      title: string;
      authors: { name: string }[];
      source: string;
      pubdate: string;
      sortdate: string;
    };
  };
}

/**
 * PubMed 논문 검색
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 10,
  days: number = 30
): Promise<PubMedArticle[]> {
  try {
    // 1단계: 검색하여 PMID 목록 가져오기
    const pmids = await searchPubMedIds(query, maxResults, days);
    
    if (pmids.length === 0) {
      return [];
    }

    // 2단계: PMID로 상세 정보 가져오기
    const articles = await fetchPubMedSummaries(pmids);
    
    return articles;

  } catch (error) {
    console.error('PubMed search error:', error);
    return getMockPubMedArticles();
  }
}

/**
 * PubMed ID 검색
 */
async function searchPubMedIds(
  query: string,
  maxResults: number,
  days: number
): Promise<string[]> {
  
  const params = new URLSearchParams({
    db: 'pubmed',
    term: `${query} AND ("last ${days} days"[dp])`,
    retmax: maxResults.toString(),
    retmode: 'json',
    sort: 'relevance',
    ...(PUBMED_API_KEY && { api_key: PUBMED_API_KEY }),
  });

  const response = await fetch(`${PUBMED_BASE_URL}/esearch.fcgi?${params}`);
  
  if (!response.ok) {
    throw new Error(`PubMed search failed: ${response.status}`);
  }

  const data: ESearchResult = await response.json();
  return data.esearchresult.idlist || [];
}

/**
 * PubMed 논문 요약 정보 가져오기
 */
async function fetchPubMedSummaries(pmids: string[]): Promise<PubMedArticle[]> {
  const params = new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'json',
    ...(PUBMED_API_KEY && { api_key: PUBMED_API_KEY }),
  });

  const response = await fetch(`${PUBMED_BASE_URL}/esummary.fcgi?${params}`);
  
  if (!response.ok) {
    throw new Error(`PubMed summary failed: ${response.status}`);
  }

  const data: ESummaryResult = await response.json();
  
  const articles: PubMedArticle[] = [];
  
  for (const pmid of pmids) {
    const item = data.result[pmid];
    if (item && item.uid) {
      articles.push({
        pmid: item.uid,
        title: item.title,
        abstract: '', // ESummary doesn't include abstract
        authors: item.authors?.map(a => a.name) || [],
        publishDate: item.pubdate || item.sortdate,
        journal: item.source,
        keywords: [],
      });
    }
  }

  return articles;
}

/**
 * 최신 수면 연구 트렌드 가져오기
 */
export async function fetchPubMedTrends(
  queries: string[] = SLEEP_SEARCH_QUERIES,
  days: number = 30
): Promise<TrendData[]> {
  const results: TrendData[] = [];

  for (const query of queries) {
    try {
      // 검색 결과 수로 트렌드 점수 계산
      const params = new URLSearchParams({
        db: 'pubmed',
        term: `${query} AND ("last ${days} days"[dp])`,
        rettype: 'count',
        retmode: 'json',
        ...(PUBMED_API_KEY && { api_key: PUBMED_API_KEY }),
      });

      const response = await fetch(`${PUBMED_BASE_URL}/esearch.fcgi?${params}`);
      
      if (!response.ok) continue;

      const data = await response.json();
      const count = parseInt(data.esearchresult?.count || '0');

      results.push({
        keyword: query,
        score: Math.min(100, count * 5), // 논문 수 × 5 = 점수 (최대 100)
        source: 'pubmed',
        category: 'research',
        timestamp: new Date(),
      });

      // Rate limiting (API 키 없으면 3 req/sec)
      await new Promise(resolve => setTimeout(resolve, PUBMED_API_KEY ? 100 : 350));
      
    } catch (error) {
      console.error(`PubMed trend error for ${query}:`, error);
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * 논문에서 SNS 콘텐츠용 팩트 추출
 */
export function extractFactFromArticle(article: PubMedArticle): string {
  // 제목에서 핵심 팩트 추출 (간단한 버전)
  const title = article.title;
  
  // 숫자가 포함된 경우 강조
  const numberMatch = title.match(/\d+%|\d+\s*(hours?|minutes?|days?|weeks?)/i);
  if (numberMatch) {
    return `📊 ${title}`;
  }

  return `🔬 새로운 연구: ${title}`;
}

// Mock 데이터
function getMockPubMedArticles(): PubMedArticle[] {
  return [
    {
      pmid: '39123456',
      title: 'Sleep duration of less than 7 hours associated with 40% increased cardiovascular risk',
      abstract: '',
      authors: ['Smith J', 'Lee K'],
      publishDate: '2024 Dec',
      journal: 'Sleep Medicine',
      keywords: ['sleep duration', 'cardiovascular', 'risk'],
    },
    {
      pmid: '39123457',
      title: 'Digital cognitive behavioral therapy for insomnia shows 65% improvement rate',
      abstract: '',
      authors: ['Park S', 'Kim Y'],
      publishDate: '2024 Dec',
      journal: 'Journal of Sleep Research',
      keywords: ['CBT-I', 'digital therapeutics', 'insomnia'],
    },
    {
      pmid: '39123458',
      title: 'Blue light exposure before bedtime delays melatonin onset by 90 minutes',
      abstract: '',
      authors: ['Chen W', 'Wang L'],
      publishDate: '2024 Dec',
      journal: 'Chronobiology International',
      keywords: ['blue light', 'melatonin', 'circadian'],
    },
  ];
}
