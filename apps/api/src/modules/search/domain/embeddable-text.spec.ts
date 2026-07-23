import { EVENT_TYPES, eventToEmbeddableText, insightToEmbeddableText } from '@atlas/shared';

describe('eventToEmbeddableText (M6)', () => {
  it('extrai nota manual com tags', () => {
    expect(
      eventToEmbeddableText(EVENT_TYPES.MANUAL_NOTE, {
        text: 'Ansiedade antes da prova',
        tags: ['estudo'],
      }),
    ).toBe('Ansiedade antes da prova\nTags: estudo');
  });

  it('ignora humor sem nota e sono numérico', () => {
    expect(eventToEmbeddableText(EVENT_TYPES.MANUAL_MOOD, { score: 3 })).toBeNull();
    expect(eventToEmbeddableText(EVENT_TYPES.SLEEP_RECORDED, { durationMin: 420 })).toBeNull();
  });

  it('monta texto de calendário', () => {
    expect(
      eventToEmbeddableText(EVENT_TYPES.CALENDAR_EVENT, {
        title: 'Daily standup',
        startsAt: '2026-07-21T12:00:00.000Z',
        location: 'Sala 2',
      }),
    ).toBe('Daily standup · Sala 2');
  });
});

describe('insightToEmbeddableText', () => {
  it('junta título e corpo', () => {
    expect(insightToEmbeddableText('Sono curto', 'Você dormiu pouco.')).toBe(
      'Sono curto\nVocê dormiu pouco.',
    );
  });
});
