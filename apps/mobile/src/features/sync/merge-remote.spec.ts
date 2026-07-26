import { decideMerge } from './merge-remote';

describe('decideMerge', () => {
  const remote = {
    id: 'srv-1',
    type: 'manual.mood',
    source: 'manual',
    externalId: 'local-1',
    occurredAt: '2026-07-26T12:00:00.000Z',
    payload: { score: 4 },
  };

  it('links when local id matches externalId and needs update', () => {
    const decision = decideMerge(
      remote,
      { id: 'local-1', serverId: null, syncState: 'pending' },
      null,
    );
    expect(decision).toEqual({
      action: 'link',
      localId: 'local-1',
      needsUpdate: true,
    });
  });

  it('links without update when already synced to same server id', () => {
    const decision = decideMerge(
      remote,
      { id: 'local-1', serverId: 'srv-1', syncState: 'synced' },
      null,
    );
    expect(decision).toEqual({
      action: 'link',
      localId: 'local-1',
      needsUpdate: false,
    });
  });

  it('skips when serverId already present locally', () => {
    const decision = decideMerge(
      { ...remote, externalId: null },
      null,
      { id: 'other', serverId: 'srv-1', syncState: 'synced' },
    );
    expect(decision).toEqual({ action: 'skip' });
  });

  it('inserts new remote event using externalId as local id', () => {
    const decision = decideMerge(remote, null, null);
    expect(decision.action).toBe('insert');
    if (decision.action !== 'insert') return;
    expect(decision.id).toBe('local-1');
    expect(decision.serverId).toBe('srv-1');
    expect(decision.payloadJson).toBe(JSON.stringify({ score: 4 }));
  });

  it('inserts with server id when externalId is null', () => {
    const decision = decideMerge({ ...remote, externalId: null }, null, null);
    expect(decision.action).toBe('insert');
    if (decision.action !== 'insert') return;
    expect(decision.id).toBe('srv-1');
  });
});
