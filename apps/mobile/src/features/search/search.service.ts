import { api } from '../../lib/api';

export interface SearchResultItem {
  kind: 'event' | 'insight';
  id: string;
  score: number;
  title: string;
  snippet: string;
  type?: string;
  occurredAt?: string;
  method?: string;
}

export interface SearchResponse {
  mode: 'semantic' | 'keyword';
  query: string;
  provider: string;
  items: SearchResultItem[];
}

export async function searchMemory(
  q: string,
  mode: 'semantic' | 'keyword' = 'semantic',
  limit = 20,
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q,
    mode,
    limit: String(limit),
  });
  return api.get(`/search?${params.toString()}`);
}

export async function reindexMemory(): Promise<{
  eventsConsidered: number;
  eventsIndexed: number;
  insightsIndexed: number;
  skipped: number;
  embedded: number;
  cached: number;
}> {
  return api.post('/search/reindex');
}
