export interface ElapsedTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function calculateElapsedTime(past: Date, now: Date = new Date()): ElapsedTime {
  const totalMs = now.getTime() - past.getTime();

  let years = now.getFullYear() - past.getFullYear();
  let months = now.getMonth() - past.getMonth();
  let days = now.getDate() - past.getDate();
  let hours = now.getHours() - past.getHours();
  let minutes = now.getMinutes() - past.getMinutes();
  let seconds = now.getSeconds() - past.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }

  return { years, months, days, hours, minutes, seconds, totalMs };
}

type Tier = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';

export function getDisplayTier(elapsed: ElapsedTime): Tier {
  const { totalMs, years } = elapsed;
  const ONE_HOUR = 3_600_000;
  const ONE_DAY = 86_400_000;
  const THIRTY_DAYS = 30 * ONE_DAY;

  if (years >= 1) return 'years';
  if (totalMs < ONE_HOUR) return 'seconds';
  if (totalMs < ONE_DAY) return 'minutes';
  if (totalMs < THIRTY_DAYS) return 'hours';
  return 'days';
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function formatElapsedTime(past: Date, now: Date = new Date()): string {
  const e = calculateElapsedTime(past, now);
  const tier = getDisplayTier(e);

  switch (tier) {
    case 'seconds':
      return `${plural(e.minutes, 'minute')} ${plural(e.seconds, 'second')} ago`;
    case 'minutes':
      return `${plural(e.hours, 'hour')} ${plural(e.minutes, 'minute')} ago`;
    case 'hours':
      return `${plural(e.days, 'day')} ${plural(e.hours, 'hour')} ago`;
    case 'months':
    case 'days':
      return `${plural(e.months, 'month')} ${plural(e.days, 'day')} ago`;
    case 'years':
      return `${plural(e.years, 'year')} ${e.months} months ${plural(e.days, 'day')} ago`;
  }
}

export function getRefreshInterval(elapsed: ElapsedTime): number {
  const tier = getDisplayTier(elapsed);
  return tier === 'seconds' ? 1000 : 60_000;
}
