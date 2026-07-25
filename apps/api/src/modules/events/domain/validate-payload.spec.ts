import { validatePayload, EVENT_TYPES } from '@atlas/shared';

describe('validatePayload (shared)', () => {
  it('valida humor 1..5', () => {
    expect(
      validatePayload(EVENT_TYPES.MANUAL_MOOD, { score: 3, note: 'ok' }),
    ).toMatchObject({ score: 3 });
  });

  it('rejeita humor fora da escala', () => {
    expect(() =>
      validatePayload(EVENT_TYPES.MANUAL_MOOD, { score: 9 }),
    ).toThrow();
  });

  it('valida gasto com currency default BRL', () => {
    const p = validatePayload(EVENT_TYPES.MANUAL_EXPENSE, { amount: 12.5 });
    expect(p).toMatchObject({ amount: 12.5, currency: 'BRL' });
  });

  it('valida sleep.recorded', () => {
    expect(
      validatePayload(EVENT_TYPES.SLEEP_RECORDED, { durationMin: 420 }),
    ).toMatchObject({ durationMin: 420 });
  });

  it('valida activity.steps', () => {
    expect(
      validatePayload(EVENT_TYPES.ACTIVITY_STEPS, { steps: 8000 }),
    ).toMatchObject({ steps: 8000 });
  });

  it('rejeita tipo desconhecido', () => {
    expect(() => validatePayload('foo.bar', {})).toThrow(/desconhecido/);
  });

  it('valida location.visited com lat/lng', () => {
    expect(
      validatePayload(EVENT_TYPES.LOCATION_VISITED, {
        lat: -23.5,
        lng: -46.6,
        label: 'casa',
      }),
    ).toMatchObject({ label: 'casa' });
  });

  it('valida calendar.event', () => {
    expect(
      validatePayload(EVENT_TYPES.CALENDAR_EVENT, {
        title: 'Reunião',
        startsAt: '2026-07-25T15:00:00.000Z',
      }),
    ).toMatchObject({ title: 'Reunião' });
  });
});
