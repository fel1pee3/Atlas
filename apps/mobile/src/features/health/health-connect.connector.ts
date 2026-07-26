import { Platform } from 'react-native';
import type {
  HealthConnector,
  HealthPermission,
  HealthPullResult,
  HealthSample,
} from './health.connector';

/**
 * Health Connect (Android) — docs/08 §10.3.
 * Requer development build (expo-dev-client); não roda no Expo Go.
 */
export class HealthConnectConnector implements HealthConnector {
  readonly id = 'health_connect' as const;
  readonly label = 'Health Connect';

  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      const hc = await import('react-native-health-connect');
      const status = await hc.getSdkStatus();
      return status === hc.SdkAvailabilityStatus.SDK_AVAILABLE;
    } catch {
      return false;
    }
  }

  async requestPermissions(kinds: HealthPermission[]): Promise<{ granted: boolean }> {
    if (!(await this.isAvailable())) return { granted: false };
    const hc = await import('react-native-health-connect');
    const ok = await hc.initialize();
    if (!ok) return { granted: false };

    const permissions: Array<{ accessType: 'read'; recordType: 'SleepSession' | 'Steps' | 'ExerciseSession' }> =
      [];
    if (kinds.includes('sleep')) {
      permissions.push({ accessType: 'read', recordType: 'SleepSession' });
    }
    if (kinds.includes('steps')) {
      permissions.push(
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ExerciseSession' },
      );
    }

    const granted = await hc.requestPermission(permissions);
    const allowed = new Set(
      granted.filter((p) => p.accessType === 'read').map((p) => p.recordType),
    );
    const needSleep = kinds.includes('sleep');
    const needSteps = kinds.includes('steps');
    const sleepOk = !needSleep || allowed.has('SleepSession');
    const stepsOk = !needSteps || allowed.has('Steps');
    return { granted: sleepOk && stepsOk };
  }

  async pullSince(since: string, until?: string): Promise<HealthPullResult> {
    if (!(await this.isAvailable())) {
      throw new Error(
        'Health Connect indisponível. Instale o app Health Connect e use um development build (não Expo Go).',
      );
    }

    const hc = await import('react-native-health-connect');
    await hc.initialize();

    const endTime = until ?? new Date().toISOString();
    const startTime = since;
    const samples: HealthSample[] = [];

    const sleep = await hc.readRecords('SleepSession', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    });
    for (const r of sleep.records) {
      const startMs = Date.parse(r.startTime);
      const endMs = Date.parse(r.endTime);
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) continue;
      const durationMin = Math.max(1, Math.round((endMs - startMs) / 60_000));
      const id = r.metadata?.id ?? `${r.startTime}:${r.endTime}`;
      samples.push({
        externalId: `hc:sleep:${id}`,
        type: 'sleep.recorded',
        occurredAt: r.endTime,
        payload: { durationMin },
      });
    }

    const steps = await hc.readRecords('Steps', {
      timeRangeFilter: { operator: 'between', startTime, endTime },
    });
    const stepsByDay = new Map<string, { steps: number; occurredAt: string; ids: string[] }>();
    for (const r of steps.records) {
      const day = r.endTime.slice(0, 10);
      const count = typeof r.count === 'number' ? r.count : 0;
      const prev = stepsByDay.get(day);
      const id = r.metadata?.id ?? r.endTime;
      if (prev) {
        prev.steps += count;
        prev.ids.push(id);
        if (r.endTime > prev.occurredAt) prev.occurredAt = r.endTime;
      } else {
        stepsByDay.set(day, { steps: count, occurredAt: r.endTime, ids: [id] });
      }
    }
    for (const [day, agg] of stepsByDay) {
      if (agg.steps <= 0) continue;
      samples.push({
        externalId: `hc:steps:${day}`,
        type: 'activity.steps',
        occurredAt: agg.occurredAt,
        payload: { steps: Math.round(agg.steps) },
      });
    }

    try {
      const workouts = await hc.readRecords('ExerciseSession', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
      });
      for (const r of workouts.records) {
        const startMs = Date.parse(r.startTime);
        const endMs = Date.parse(r.endTime);
        if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) continue;
        const durationMin = Math.max(1, Math.round((endMs - startMs) / 60_000));
        const id = r.metadata?.id ?? `${r.startTime}:${r.endTime}`;
        samples.push({
          externalId: `hc:workout:${id}`,
          type: 'activity.workout',
          occurredAt: r.endTime,
          payload: {
            durationMin,
            sport: typeof r.exerciseType === 'number' ? String(r.exerciseType) : 'workout',
          },
        });
      }
    } catch {
      // Exercise permission may be denied — sleep/steps still useful.
    }

    samples.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    return { samples, nextCursor: endTime };
  }
}
