import {
  countDemoEvents,
  filterDemoEventIds,
  planAddEventLocal,
} from './local-event.logic';

describe('planAddEventLocal', () => {
  const input = {
    type: 'manual.mood',
    source: 'manual',
    occurredAt: '2026-07-26T10:00:00.000Z',
    payload: { score: 3 },
    id: 'evt-1',
  };

  it('returns existing without insert when id already present', () => {
    const plan = planAddEventLocal({ id: 'evt-1' }, input, 'generated', 1_000);
    expect(plan).toEqual({ inserted: false, id: 'evt-1' });
  });

  it('builds pending row when id is new', () => {
    const plan = planAddEventLocal(null, input, 'generated', 1_000);
    expect(plan.inserted).toBe(true);
    if (!plan.inserted) return;
    expect(plan.row).toMatchObject({
      id: 'evt-1',
      type: 'manual.mood',
      source: 'manual',
      syncState: 'pending',
      serverId: null,
      createdAt: 1_000,
    });
    expect(JSON.parse(plan.row.payload)).toEqual({ score: 3 });
  });

  it('uses generated id when input.id omitted', () => {
    const { id: _omit, ...withoutId } = input;
    const plan = planAddEventLocal(null, withoutId, 'gen-uuid', 2_000);
    expect(plan.inserted).toBe(true);
    if (!plan.inserted) return;
    expect(plan.row.id).toBe('gen-uuid');
  });
});

describe('demo purge helpers', () => {
  const rows = [
    { id: 'a', source: 'demo' },
    { id: 'b', source: 'health_connect' },
    { id: 'c', source: 'demo' },
  ];

  it('counts only demo sources', () => {
    expect(countDemoEvents(rows)).toBe(2);
  });

  it('lists demo ids for deletion', () => {
    expect(filterDemoEventIds(rows)).toEqual(['a', 'c']);
  });
});
