import { dayKeyUtc, parseDayKey } from './day-key';

describe('dayKeyUtc', () => {
  it('extrai YYYY-MM-DD em UTC', () => {
    expect(dayKeyUtc(new Date('2026-07-22T23:30:00.000Z'))).toBe('2026-07-22');
    expect(dayKeyUtc(new Date('2026-07-22T00:00:00.000Z'))).toBe('2026-07-22');
  });

  it('parseDayKey volta à meia-noite UTC', () => {
    const d = parseDayKey('2026-07-22');
    expect(d.toISOString()).toBe('2026-07-22T00:00:00.000Z');
  });
});
