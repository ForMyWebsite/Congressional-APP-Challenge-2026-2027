import { addDays, weekday } from './dates';
import type { ScheduledTask, Workspace } from './models';
export function recurringTasks(workspace: Workspace, start: string, end: string): ScheduledTask[] {
  const result: ScheduledTask[] = [];
  for (let date = start, count = 0; date <= end && count < 370; date = addDays(date, 1), count++)
    for (const item of workspace.school.commitments) {
      if (date < item.startDate || date > item.endDate || !item.weekdays.includes(weekday(date)))
        continue;
      result.push({
        id: `rec-${item.id}-${date}`,
        title: item.title,
        date,
        time: item.time,
        minutes: item.minutes,
        category: item.category === 'Club' ? 'Club' : 'Personal',
        done: false,
        pathwayId: null,
        stepId: null,
      });
    }
  return result;
}
export function allTasks(workspace: Workspace, start: string, end: string) {
  return [
    ...workspace.tasks.filter((t) => t.date >= start && t.date <= end),
    ...recurringTasks(workspace, start, end),
  ];
}
