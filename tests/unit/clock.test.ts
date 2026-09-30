import { describe, expect, it } from 'vitest';

import {
  addLocalDays,
  daysBetween,
  formatMinutes,
  localDayNumber,
  startOfLocalDay,
} from '../../src/lib/domain/clock';

const at = (y: number, m: number, d: number, ...time: number[]): number =>
  new Date(y, m, d, ...time).getTime();

describe('startOfLocalDay', () => {
  it('strips the time of day', () => {
    const day = new Date(at(2026, 2, 14, 23, 59, 59, 999));
    expect(new Date(startOfLocalDay(day.getTime())).getHours()).toBe(0);
    expect(new Date(startOfLocalDay(day.getTime())).getDate()).toBe(14);
  });

  it('is idempotent', () => {
    const once = startOfLocalDay(at(2026, 0, 1, 5));
    expect(startOfLocalDay(once)).toBe(once);
  });
});

describe('localDayNumber', () => {
  it('gives the same number for every instant of one local day', () => {
    expect(localDayNumber(at(2026, 5, 1, 0, 0, 0))).toBe(localDayNumber(at(2026, 5, 1, 23, 59)));
  });

  it('increments by one across midnight', () => {
    expect(localDayNumber(at(2026, 5, 2, 0, 0)) - localDayNumber(at(2026, 5, 1, 23, 59))).toBe(1);
  });

  it('advances across a month boundary', () => {
    expect(localDayNumber(at(2026, 2, 1)) - localDayNumber(at(2026, 1, 28))).toBe(1);
  });
});

describe('addLocalDays across a DST change', () => {
  // The host timezone matters here. Pick the transition this machine is in, so
  // the assertion is about calendar arithmetic rather than about a zone.
  const march = (y: number): number => new Date(y, 2, 8).getTimezoneOffset();
  const november = (y: number): number => new Date(y, 10, 1).getTimezoneOffset();
  const observingDst = march(2026) !== november(2026);

  it.runIf(observingDst)('spring forward: one calendar day is 23 elapsed hours', () => {
    const beforeChange = at(2026, 2, 13, 12);
    const afterChange = addLocalDays(beforeChange, 1);
    const hours = (afterChange - beforeChange) / 3_600_000;
    expect(localDayNumber(afterChange) - localDayNumber(beforeChange)).toBe(1);
    expect([hours]).toContain(23);
  });

  it('never adds or removes a calendar day, whatever the zone does', () => {
    for (const month of [0, 2, 3, 9, 10]) {
      for (const day of [1, 15, 28]) {
        const from = at(2026, month, day, 12);
        const to = addLocalDays(from, 30);
        expect(localDayNumber(to) - localDayNumber(from)).toBe(30);
      }
    }
  });
});

describe('daysBetween', () => {
  it('counts calendar days, not elapsed hours', () => {
    expect(daysBetween(at(2026, 6, 1, 23), at(2026, 6, 2, 1))).toBe(1);
  });

  it('is negative going backwards', () => {
    expect(daysBetween(at(2026, 6, 2), at(2026, 6, 1))).toBe(-1);
  });
});

describe('formatMinutes', () => {
  it('leaves sub-hour values in minutes', () => {
    expect(formatMinutes(45)).toBe('45 min');
  });

  it('drops a zero minute remainder', () => {
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(120)).toBe('2 h');
  });

  it('keeps a non-zero remainder', () => {
    expect(formatMinutes(95)).toBe('1 h 35 min');
  });
});
