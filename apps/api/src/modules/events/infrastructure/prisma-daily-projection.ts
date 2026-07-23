import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EVENT_TYPES } from '@atlas/shared';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { EventRepository } from '../domain/event.repository';
import {
  DailyProjectionPort,
  DailySummary,
} from '../domain/daily-projection.port';
import { dayKeyUtc, parseDayKey } from '../domain/day-key';
import { rangeMinutes } from '../domain/range-minutes';

/**
 * Projeções diárias em Postgres (docs/10 §8, docs/11 §5.1).
 * M4: location.visited + calendar.event → rm_daily_places / rm_daily_calendar.
 */
@Injectable()
export class PrismaDailyProjection extends DailyProjectionPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventRepository,
  ) {
    super();
  }

  async applyEvent(input: {
    userId: string;
    type: string;
    occurredAt: Date;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const day = dayKeyUtc(input.occurredAt);
    const dayDate = parseDayKey(day);

    if (input.type === EVENT_TYPES.MANUAL_MOOD) {
      const score = Number(input.payload.score);
      if (!Number.isFinite(score)) return;
      await this.prisma.rmDailyMood.upsert({
        where: { userId_day: { userId: input.userId, day: dayDate } },
        create: {
          userId: input.userId,
          day: dayDate,
          count: 1,
          sumScore: Math.round(score),
        },
        update: {
          count: { increment: 1 },
          sumScore: { increment: Math.round(score) },
        },
      });
      return;
    }

    if (input.type === EVENT_TYPES.MANUAL_EXPENSE) {
      const amount = Number(input.payload.amount);
      if (!Number.isFinite(amount) || amount < 0) return;
      const currency =
        typeof input.payload.currency === 'string' && input.payload.currency.length === 3
          ? input.payload.currency
          : 'BRL';

      const existing = await this.prisma.rmDailyExpense.findUnique({
        where: { userId_day: { userId: input.userId, day: dayDate } },
      });

      if (!existing) {
        await this.prisma.rmDailyExpense.create({
          data: {
            userId: input.userId,
            day: dayDate,
            count: 1,
            totalAmount: new Prisma.Decimal(amount),
            currency,
          },
        });
      } else {
        await this.prisma.rmDailyExpense.update({
          where: { userId_day: { userId: input.userId, day: dayDate } },
          data: {
            count: { increment: 1 },
            totalAmount: existing.totalAmount.add(new Prisma.Decimal(amount)),
          },
        });
      }
      return;
    }

    if (input.type === EVENT_TYPES.SLEEP_RECORDED) {
      const durationMin = Number(input.payload.durationMin);
      if (!Number.isFinite(durationMin) || durationMin < 0) return;
      await this.prisma.rmDailySleep.upsert({
        where: { userId_day: { userId: input.userId, day: dayDate } },
        create: {
          userId: input.userId,
          day: dayDate,
          count: 1,
          totalDurationMin: Math.round(durationMin),
        },
        update: {
          count: { increment: 1 },
          totalDurationMin: { increment: Math.round(durationMin) },
        },
      });
      return;
    }

    if (input.type === EVENT_TYPES.ACTIVITY_STEPS) {
      const steps = Number(input.payload.steps);
      if (!Number.isFinite(steps) || steps < 0) return;
      await this.prisma.rmDailyActivity.upsert({
        where: { userId_day: { userId: input.userId, day: dayDate } },
        create: {
          userId: input.userId,
          day: dayDate,
          totalSteps: Math.round(steps),
          workoutCount: 0,
        },
        update: {
          totalSteps: { increment: Math.round(steps) },
        },
      });
      return;
    }

    if (input.type === EVENT_TYPES.ACTIVITY_WORKOUT) {
      await this.prisma.rmDailyActivity.upsert({
        where: { userId_day: { userId: input.userId, day: dayDate } },
        create: {
          userId: input.userId,
          day: dayDate,
          totalSteps: 0,
          workoutCount: 1,
        },
        update: {
          workoutCount: { increment: 1 },
        },
      });
      return;
    }

    if (input.type === EVENT_TYPES.LOCATION_VISITED) {
      const mins = rangeMinutes(input.payload.arrivedAt, input.payload.leftAt);
      await this.prisma.rmDailyPlaces.upsert({
        where: { userId_day: { userId: input.userId, day: dayDate } },
        create: {
          userId: input.userId,
          day: dayDate,
          visitCount: 1,
          totalDurationMin: mins,
        },
        update: {
          visitCount: { increment: 1 },
          totalDurationMin: { increment: mins },
        },
      });
      return;
    }

    if (input.type === EVENT_TYPES.CALENDAR_EVENT) {
      const mins = rangeMinutes(input.payload.startsAt, input.payload.endsAt);
      await this.prisma.rmDailyCalendar.upsert({
        where: { userId_day: { userId: input.userId, day: dayDate } },
        create: {
          userId: input.userId,
          day: dayDate,
          eventCount: 1,
          totalDurationMin: mins,
        },
        update: {
          eventCount: { increment: 1 },
          totalDurationMin: { increment: mins },
        },
      });
    }
  }

  async rebuildDay(userId: string, day: string): Promise<void> {
    const dayDate = parseDayKey(day);
    const events = await this.events.listByUserAndDay(userId, day);

    let moodCount = 0;
    let moodSum = 0;
    let expenseCount = 0;
    let expenseTotal = new Prisma.Decimal(0);
    let currency = 'BRL';
    let sleepCount = 0;
    let sleepTotal = 0;
    let totalSteps = 0;
    let workoutCount = 0;
    let visitCount = 0;
    let placesMin = 0;
    let calCount = 0;
    let calMin = 0;

    for (const ev of events) {
      if (ev.type === EVENT_TYPES.MANUAL_MOOD) {
        const score = Number(ev.payload.score);
        if (Number.isFinite(score)) {
          moodCount += 1;
          moodSum += Math.round(score);
        }
      } else if (ev.type === EVENT_TYPES.MANUAL_EXPENSE) {
        const amount = Number(ev.payload.amount);
        if (Number.isFinite(amount) && amount >= 0) {
          expenseCount += 1;
          expenseTotal = expenseTotal.add(new Prisma.Decimal(amount));
          if (typeof ev.payload.currency === 'string' && ev.payload.currency.length === 3) {
            currency = ev.payload.currency;
          }
        }
      } else if (ev.type === EVENT_TYPES.SLEEP_RECORDED) {
        const durationMin = Number(ev.payload.durationMin);
        if (Number.isFinite(durationMin) && durationMin >= 0) {
          sleepCount += 1;
          sleepTotal += Math.round(durationMin);
        }
      } else if (ev.type === EVENT_TYPES.ACTIVITY_STEPS) {
        const steps = Number(ev.payload.steps);
        if (Number.isFinite(steps) && steps >= 0) {
          totalSteps += Math.round(steps);
        }
      } else if (ev.type === EVENT_TYPES.ACTIVITY_WORKOUT) {
        workoutCount += 1;
      } else if (ev.type === EVENT_TYPES.LOCATION_VISITED) {
        visitCount += 1;
        placesMin += rangeMinutes(ev.payload.arrivedAt, ev.payload.leftAt);
      } else if (ev.type === EVENT_TYPES.CALENDAR_EVENT) {
        calCount += 1;
        calMin += rangeMinutes(ev.payload.startsAt, ev.payload.endsAt);
      }
    }

    await this.prisma.$transaction([
      this.prisma.rmDailyMood.deleteMany({ where: { userId, day: dayDate } }),
      this.prisma.rmDailyExpense.deleteMany({ where: { userId, day: dayDate } }),
      this.prisma.rmDailySleep.deleteMany({ where: { userId, day: dayDate } }),
      this.prisma.rmDailyActivity.deleteMany({ where: { userId, day: dayDate } }),
      this.prisma.rmDailyPlaces.deleteMany({ where: { userId, day: dayDate } }),
      this.prisma.rmDailyCalendar.deleteMany({ where: { userId, day: dayDate } }),
      ...(moodCount > 0
        ? [
            this.prisma.rmDailyMood.create({
              data: { userId, day: dayDate, count: moodCount, sumScore: moodSum },
            }),
          ]
        : []),
      ...(expenseCount > 0
        ? [
            this.prisma.rmDailyExpense.create({
              data: {
                userId,
                day: dayDate,
                count: expenseCount,
                totalAmount: expenseTotal,
                currency,
              },
            }),
          ]
        : []),
      ...(sleepCount > 0
        ? [
            this.prisma.rmDailySleep.create({
              data: {
                userId,
                day: dayDate,
                count: sleepCount,
                totalDurationMin: sleepTotal,
              },
            }),
          ]
        : []),
      ...(totalSteps > 0 || workoutCount > 0
        ? [
            this.prisma.rmDailyActivity.create({
              data: { userId, day: dayDate, totalSteps, workoutCount },
            }),
          ]
        : []),
      ...(visitCount > 0
        ? [
            this.prisma.rmDailyPlaces.create({
              data: {
                userId,
                day: dayDate,
                visitCount,
                totalDurationMin: placesMin,
              },
            }),
          ]
        : []),
      ...(calCount > 0
        ? [
            this.prisma.rmDailyCalendar.create({
              data: {
                userId,
                day: dayDate,
                eventCount: calCount,
                totalDurationMin: calMin,
              },
            }),
          ]
        : []),
    ]);
  }

  async getDailySummary(userId: string, day: string): Promise<DailySummary> {
    const dayDate = parseDayKey(day);
    const [mood, expense, sleep, activity, places, calendar] = await Promise.all([
      this.prisma.rmDailyMood.findUnique({
        where: { userId_day: { userId, day: dayDate } },
      }),
      this.prisma.rmDailyExpense.findUnique({
        where: { userId_day: { userId, day: dayDate } },
      }),
      this.prisma.rmDailySleep.findUnique({
        where: { userId_day: { userId, day: dayDate } },
      }),
      this.prisma.rmDailyActivity.findUnique({
        where: { userId_day: { userId, day: dayDate } },
      }),
      this.prisma.rmDailyPlaces.findUnique({
        where: { userId_day: { userId, day: dayDate } },
      }),
      this.prisma.rmDailyCalendar.findUnique({
        where: { userId_day: { userId, day: dayDate } },
      }),
    ]);

    if (!mood && !expense && !sleep && !activity && !places && !calendar) {
      const events = await this.events.listByUserAndDay(userId, day);
      if (events.length > 0) {
        await this.rebuildDay(userId, day);
        return this.getDailySummary(userId, day);
      }
    }

    return {
      day,
      mood: mood
        ? {
            day,
            count: mood.count,
            avgScore: mood.count > 0 ? mood.sumScore / mood.count : null,
          }
        : null,
      expense: expense
        ? {
            day,
            count: expense.count,
            totalAmount: Number(expense.totalAmount),
            currency: expense.currency,
          }
        : null,
      sleep: sleep
        ? {
            day,
            count: sleep.count,
            totalDurationMin: sleep.totalDurationMin,
          }
        : null,
      activity: activity
        ? {
            day,
            totalSteps: activity.totalSteps,
            workoutCount: activity.workoutCount,
          }
        : null,
      places: places
        ? {
            day,
            visitCount: places.visitCount,
            totalDurationMin: places.totalDurationMin,
          }
        : null,
      calendar: calendar
        ? {
            day,
            eventCount: calendar.eventCount,
            totalDurationMin: calendar.totalDurationMin,
          }
        : null,
    };
  }
}
