import { TIMEZONE } from './models';
export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}
export const weekday = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();
export const minutesOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export function prettyDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  });
}
export function effectiveStatus(opportunity: import('./models').Opportunity, today: string) {
  if (opportunity.type === 'Learning resource') return 'not-applicable';
  if (opportunity.deadline && opportunity.deadline.date < today) return 'closed';
  return opportunity.applicationStatus;
}
