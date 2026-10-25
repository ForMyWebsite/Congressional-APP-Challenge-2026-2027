import { addDays, clock, minutesOf } from '../domain/dates';
import { TIMEZONE, type ScheduledTask } from '../domain/models';
export function download(name: string, body: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const escapeICS = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
function fold(line: string) {
  let result = '';
  let column = 0;
  for (const char of line) {
    const bytes = new TextEncoder().encode(char).length;
    if (column + bytes > 73) {
      result += '\r\n ';
      column = 1;
    }
    result += char;
    column += bytes;
  }
  return result;
}
export function calendarICS(tasks: ScheduledTask[], stamp = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Acadia Edu//Student Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-TIMEZONE:${TIMEZONE}`,
    'BEGIN:VTIMEZONE',
    `TZID:${TIMEZONE}`,
    'BEGIN:DAYLIGHT',
    'DTSTART:20070311T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'DTSTART:20071104T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];
  for (const task of tasks)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeICS(task.id)}@acadia.edu.local`,
      `DTSTAMP:${stamp.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;TZID=${TIMEZONE}:${task.date.replaceAll('-', '')}T${task.time.replace(':', '')}00`,
      `DTEND;TZID=${TIMEZONE}:${(minutesOf(task.time) + task.minutes === 1440 ? addDays(task.date, 1) : task.date).replaceAll('-', '')}T${clock((minutesOf(task.time) + task.minutes) % 1440).replace(':', '')}00`,
      `SUMMARY:${escapeICS(task.title)}`,
      `DESCRIPTION:${escapeICS(`${task.category}. Student-entered plan; not an organizer deadline or verified submission.`)}`,
      'END:VEVENT',
    );
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
