import { calculateElapsedTime, formatElapsedTime } from '../timeCalculator';

describe('calculateElapsedTime', () => {
  it('returns years, months, days for dates > 1 year ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2018-01-30T10:00:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.years).toBe(8);
    expect(result.months).toBe(1);
    expect(result.days).toBe(17);
  });

  it('returns months, days for dates < 1 year ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2025-11-01T12:00:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.years).toBe(0);
    expect(result.months).toBe(4);
    expect(result.days).toBe(18);
  });

  it('returns days, hours for dates < 30 days ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-10T08:00:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.days).toBe(9);
    expect(result.hours).toBe(4);
  });

  it('returns hours, minutes for dates < 24 hours ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-19T03:30:00Z');
    const result = calculateElapsedTime(past, now);
    expect(result.hours).toBe(8);
    expect(result.minutes).toBe(30);
  });

  it('returns minutes, seconds for dates < 1 hour ago', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-19T11:45:30Z');
    const result = calculateElapsedTime(past, now);
    expect(result.minutes).toBe(14);
    expect(result.seconds).toBe(30);
  });
});

describe('formatElapsedTime', () => {
  it('formats >= 1 year as "X years X months X days ago"', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2018-01-30T10:00:00Z');
    const result = formatElapsedTime(past, now);
    expect(result).toContain('years');
    expect(result).toContain('months');
    expect(result).toContain('days');
    expect(result).toContain('ago');
  });

  it('formats < 1 hour as "X minutes X seconds ago"', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2026-03-19T11:45:30Z');
    const result = formatElapsedTime(past, now);
    expect(result).toBe('14 minutes 30 seconds ago');
  });

  it('uses singular for 1 unit', () => {
    const now = new Date('2026-03-19T12:00:00Z');
    const past = new Date('2025-03-19T12:00:00Z');
    const result = formatElapsedTime(past, now);
    expect(result).toContain('1 year');
    expect(result).not.toContain('1 years');
  });
});
