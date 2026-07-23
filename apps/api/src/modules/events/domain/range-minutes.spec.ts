import { rangeMinutes } from './range-minutes';

describe('rangeMinutes', () => {
  it('calcula duração entre ISO', () => {
    expect(
      rangeMinutes('2026-07-22T10:00:00.000Z', '2026-07-22T11:30:00.000Z'),
    ).toBe(90);
  });

  it('retorna 0 se inválido', () => {
    expect(rangeMinutes(undefined, '2026-07-22T11:00:00.000Z')).toBe(0);
    expect(rangeMinutes('2026-07-22T12:00:00.000Z', '2026-07-22T11:00:00.000Z')).toBe(0);
  });
});
