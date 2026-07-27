import { isCrossDomainKind } from '@atlas/shared';

/** Rótulo curto de tipo de evento (padrão da timeline). */
export function eventKindLabel(type: string): string {
  switch (type) {
    case 'manual.note':
      return 'Nota';
    case 'manual.mood':
      return 'Humor';
    case 'manual.expense':
      return 'Gasto';
    case 'sleep.recorded':
      return 'Sono';
    case 'activity.steps':
      return 'Passos';
    case 'activity.workout':
      return 'Treino';
    case 'location.visited':
      return 'Visita';
    case 'calendar.event':
      return 'Agenda';
    default:
      return 'Registro';
  }
}

export function formatSleep(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

/** Resumo legível do payload — nunca JSON cru. */
export function summarizeEvent(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'manual.note':
      return String(payload.text ?? 'Nota');
    case 'manual.mood': {
      const score = payload.score;
      const note = typeof payload.note === 'string' && payload.note.trim() ? payload.note.trim() : null;
      const base = `${score}/5`;
      return note ? `${base} · ${note}` : base;
    }
    case 'manual.expense': {
      const amount = payload.amount;
      const formatted =
        typeof amount === 'number' && Number.isFinite(amount)
          ? amount.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '—';
      const note = typeof payload.note === 'string' && payload.note.trim() ? payload.note.trim() : null;
      const category =
        typeof payload.category === 'string' && payload.category.trim()
          ? payload.category.trim()
          : null;
      const extra = note ?? category;
      return extra ? `R$ ${formatted} · ${extra}` : `R$ ${formatted}`;
    }
    case 'sleep.recorded': {
      const min = Number(payload.durationMin);
      if (!Number.isFinite(min)) return 'Sono';
      return formatSleep(min);
    }
    case 'activity.steps':
      return `${Number(payload.steps).toLocaleString('pt-BR')} passos`;
    case 'activity.workout':
      return `${String(payload.kind ?? 'atividade')} · ${payload.durationMin} min`;
    case 'location.visited':
      return String(payload.label ?? 'Fora de casa');
    case 'calendar.event': {
      const title = String(payload.title ?? 'Evento');
      const attendees = Number(payload.attendees);
      if (Number.isFinite(attendees) && attendees > 0) {
        return `${title} · ${attendees} pessoa${attendees === 1 ? '' : 's'}`;
      }
      return title;
    }
    default: {
      const title = payload.title ?? payload.text ?? payload.note ?? payload.label;
      if (typeof title === 'string' && title.trim()) return title.trim();
      return 'Registro';
    }
  }
}

export function formatEventWhen(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} · ${time}`;
}

/** Tema do insight em linguagem humana (em vez de kind técnico). */
export function insightThemeLabel(kind: string): string {
  switch (kind) {
    case 'cross.spend_on_busy_calendar':
      return 'Gastos e agenda';
    case 'cross.mood_when_away':
      return 'Humor e lugares';
    case 'cross.sleep_after_late_workout':
      return 'Sono e treino';
    case 'activity.steps_trend':
    case 'activity.steps_avg_summary':
    case 'activity.low_steps_streak':
      return 'Passos';
    case 'sleep.avg_summary':
    case 'sleep.last_vs_avg':
    case 'sleep.short_streak':
    case 'sleep.below_baseline':
      return 'Sono';
    default:
      if (kind.startsWith('cross.')) return 'Entre áreas';
      if (kind.startsWith('activity.')) return 'Atividade';
      if (kind.startsWith('sleep.')) return 'Sono';
      return 'Observação';
  }
}

/** Como o Atlas chegou na observação — sem jargão. */
export function insightHowLabel(method: string, kind: string): string {
  if (isCrossDomainKind(kind)) return 'comparando áreas diferentes';
  if (method === 'rule') return 'padrão repetido nos seus dados';
  if (method === 'stats') return 'tendência nos últimos dias';
  return 'observação a partir dos seus dados';
}

export function insightListMeta(evidenceCount: number, confidence: number | null | undefined): string {
  const signals =
    evidenceCount === 1 ? '1 sinal' : `${evidenceCount} sinais`;
  if (confidence == null) return signals;
  return `${signals} · ${(confidence * 100).toFixed(0)}%`;
}
