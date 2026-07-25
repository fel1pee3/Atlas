import { api } from '../../lib/api';

/**
 * Cliente de Insights (docs/19 §7–8, docs/12 §7).
 */

export interface InsightListItem {
  id: string;
  kind: string;
  fingerprint: string;
  title: string;
  body: string;
  confidence: number | null;
  method: string;
  status: string;
  createdAt: string;
  evidence: Array<{ eventId: string; weight: number }>;
}

export interface InsightDetail extends InsightListItem {
  evidenceEvents: Array<{
    id: string;
    type: string;
    source: string;
    occurredAt: string;
    payload: Record<string, unknown>;
  }>;
}

export async function generateInsights(): Promise<{ generated: number; items: InsightListItem[] }> {
  // Generate pode passar de 20s com muitos eventos — timeout curto virava "fetch canceled".
  return api.post('/insights/generate', undefined, { timeoutMs: api.timeouts.long });
}

export async function listInsights(): Promise<InsightListItem[]> {
  const res = await api.get<{ items: InsightListItem[] }>('/insights', {
    timeoutMs: api.timeouts.default,
  });
  return res.items;
}

export async function getInsight(id: string): Promise<InsightDetail> {
  return api.get(`/insights/${id}`);
}

export async function sendInsightFeedback(
  id: string,
  action: 'useful' | 'dismiss' | 'reactivate',
): Promise<InsightListItem> {
  return api.post(`/insights/${id}/feedback`, { action });
}
