/**
 * Candidatos a insight produzidos pelo motor heurístico (docs/12 §7).
 * Ainda sem id — o repositório persiste com fingerprint idempotente.
 */

export interface InsightEvidenceRef {
  eventId: string;
  weight: number;
}

export interface InsightCandidate {
  fingerprint: string;
  kind: string;
  title: string;
  body: string;
  confidence: number;
  method: 'rule' | 'stats';
  evidence: InsightEvidenceRef[];
}

export interface InsightRecord {
  id: string;
  userId: string;
  kind: string;
  fingerprint: string;
  title: string;
  body: string;
  confidence: number | null;
  method: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  evidence: InsightEvidenceRef[];
}

export interface InsightDetail extends InsightRecord {
  evidenceEvents: Array<{
    id: string;
    type: string;
    source: string;
    occurredAt: Date;
    payload: Record<string, unknown>;
  }>;
}

export abstract class InsightRepository {
  abstract upsertCandidate(userId: string, candidate: InsightCandidate): Promise<InsightRecord>;
  abstract listByUser(userId: string, status?: string): Promise<InsightRecord[]>;
  abstract findById(userId: string, id: string): Promise<InsightDetail | null>;
  abstract updateStatus(userId: string, id: string, status: string): Promise<InsightRecord | null>;
}
