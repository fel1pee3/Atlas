import { EVENT_TYPES } from '../events/event-types';

/**
 * Extrai texto buscável de um evento para embeddings (docs/14, docs/20 M6).
 * Retorna null quando o tipo não tem conteúdo semântico útil (números puros).
 */
export function eventToEmbeddableText(
  type: string,
  payload: Record<string, unknown>,
): string | null {
  switch (type) {
    case EVENT_TYPES.MANUAL_NOTE: {
      const text = String(payload.text ?? '').trim();
      if (!text) return null;
      const tags = Array.isArray(payload.tags)
        ? payload.tags.filter((t): t is string => typeof t === 'string').join(', ')
        : '';
      return tags ? `${text}\nTags: ${tags}` : text;
    }
    case EVENT_TYPES.MANUAL_MOOD: {
      const note = typeof payload.note === 'string' ? payload.note.trim() : '';
      if (!note) return null;
      return `Humor ${payload.score}/5: ${note}`;
    }
    case EVENT_TYPES.MANUAL_EXPENSE: {
      const parts: string[] = ['Gasto'];
      if (typeof payload.amount === 'number') {
        parts.push(`${payload.amount} ${String(payload.currency ?? 'BRL')}`);
      }
      if (typeof payload.category === 'string' && payload.category.trim()) {
        parts.push(payload.category.trim());
      }
      if (typeof payload.merchant === 'string' && payload.merchant.trim()) {
        parts.push(payload.merchant.trim());
      }
      if (typeof payload.note === 'string' && payload.note.trim()) {
        parts.push(payload.note.trim());
      }
      // Só amount sem texto → pouco valor semântico; exige ao menos um rótulo.
      if (parts.length <= 2 && typeof payload.amount === 'number') {
        const hasLabel =
          (typeof payload.category === 'string' && payload.category.trim()) ||
          (typeof payload.merchant === 'string' && payload.merchant.trim()) ||
          (typeof payload.note === 'string' && payload.note.trim());
        if (!hasLabel) return null;
      }
      return parts.join(' · ');
    }
    case EVENT_TYPES.ACTIVITY_WORKOUT: {
      const kind = typeof payload.kind === 'string' ? payload.kind.trim() : '';
      if (!kind) return null;
      const min = typeof payload.durationMin === 'number' ? payload.durationMin : null;
      return min != null ? `Treino: ${kind} (${min} min)` : `Treino: ${kind}`;
    }
    case EVENT_TYPES.LOCATION_VISITED: {
      const label = typeof payload.label === 'string' ? payload.label.trim() : '';
      return label || null;
    }
    case EVENT_TYPES.CALENDAR_EVENT: {
      const title = typeof payload.title === 'string' ? payload.title.trim() : '';
      if (!title) return null;
      const location = typeof payload.location === 'string' ? payload.location.trim() : '';
      return location ? `${title} · ${location}` : title;
    }
    case EVENT_TYPES.EVENT_CORRECTED: {
      const reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';
      return reason || null;
    }
    default:
      return null;
  }
}

/** Texto de insight para índice semântico. */
export function insightToEmbeddableText(title: string, body: string): string {
  return `${title.trim()}\n${body.trim()}`.trim();
}
