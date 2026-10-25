import type { SavedPathway, ScheduledTask, StudentProfile } from './models';
import { addDays, clock, minutesOf, weekday } from './dates';
export type SchedulePreview = {
  tasks: ScheduledTask[];
  conflicts: string[];
  remainingSteps: string[];
};
export function previewSchedule(
  path: SavedPathway,
  profile: StudentProfile,
  existing: ScheduledTask[],
  startDate: string,
): SchedulePreview {
  const result: SchedulePreview = { tasks: [], conflicts: [], remainingSteps: [] };
  if (!path.targetDate)
    return {
      ...result,
      conflicts: ['Choose your own target date first. It is not an official deadline.'],
    };
  if (path.targetDate < startDate)
    return { ...result, conflicts: ['Your target date is in the past. Choose a later date.'] };
  if (!profile.availableMinutes || !profile.weekdays.length)
    return {
      ...result,
      conflicts: ['Add preparation time and at least one available day in your profile.'],
    };
  if (addDays(startDate, 90) < path.targetDate)
    return { ...result, conflicts: ['Choose a target within the next 90 days for this preview.'] };
  const pending = path.steps.filter((s) => !s.done);
  const ordered: typeof pending = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) throw new Error('Circular dependencies cannot be scheduled.');
    if (visited.has(id)) return;
    visiting.add(id);
    const step = path.steps.find((s) => s.id === id);
    if (!step) throw new Error('A prerequisite is missing.');
    for (const dep of step.dependsOn) visit(dep);
    visiting.delete(id);
    visited.add(id);
    if (!step.done) ordered.push(step);
  }
  try {
    pending.forEach((s) => visit(s.id));
  } catch (error) {
    return { ...result, conflicts: [(error as Error).message] };
  }
  const endByStep = new Map<string, string>();
  for (const task of existing.filter((t) => t.pathwayId === path.id && t.stepId)) {
    const end = `${task.date}T${clock(minutesOf(task.time) + task.minutes)}`;
    if (!endByStep.has(task.stepId!) || end > endByStep.get(task.stepId!)!)
      endByStep.set(task.stepId!, end);
  }
  const start = minutesOf(profile.startTime);
  const windowEnd = Math.min(start + profile.availableMinutes, 1440);
  for (const step of ordered) {
    if (existing.some((t) => t.pathwayId === path.id && t.stepId === step.id)) continue;
    if (
      step.dependsOn.some(
        (dep) => !path.steps.find((s) => s.id === dep)?.done && !endByStep.has(dep),
      )
    ) {
      result.remainingSteps.push(step.title);
      continue;
    }
    const after =
      step.dependsOn
        .map((dep) => endByStep.get(dep) || '')
        .sort()
        .at(-1) || '';
    let placed = false;
    for (let date = startDate; date <= path.targetDate && !placed; date = addDays(date, 1)) {
      if (!profile.weekdays.includes(weekday(date))) continue;
      const dayTasks = [...existing, ...result.tasks].filter((t) => t.date === date);
      const prepUsed = dayTasks
        .filter((t) => t.category === 'Preparation')
        .reduce((sum, t) => sum + t.minutes, 0);
      if (prepUsed + step.minutes > profile.availableMinutes) continue;
      for (let at = start; at + step.minutes <= windowEnd; at += 5) {
        if (`${date}T${clock(at)}` < after) continue;
        if (
          dayTasks.some(
            (t) => at < minutesOf(t.time) + t.minutes && at + step.minutes > minutesOf(t.time),
          )
        )
          continue;
        result.tasks.push({
          id: `${path.id}-${step.id}-${date}`,
          title: step.title,
          date,
          time: clock(at),
          minutes: step.minutes,
          category: 'Preparation',
          done: false,
          pathwayId: path.id,
          stepId: step.id,
        });
        endByStep.set(step.id, `${date}T${clock(at + step.minutes)}`);
        placed = true;
        break;
      }
    }
    if (!placed) result.remainingSteps.push(step.title);
  }
  if (result.remainingSteps.length)
    result.conflicts.push(
      `${result.remainingSteps.length} step(s) do not fit around your commitments and chosen time budget. Move your target, change available days/time, or edit schoolwork. Nothing is saved until you approve.`,
    );
  if (!result.tasks.length && !result.conflicts.length)
    result.conflicts.push(
      'These steps are already complete or scheduled. Edit their sessions in Calendar.',
    );
  return result;
}
export function taskConflicts(task: ScheduledTask, all: ScheduledTask[]): string[] {
  const collisions = all.filter(
    (other) =>
      other.id !== task.id &&
      other.date === task.date &&
      minutesOf(task.time) < minutesOf(other.time) + other.minutes &&
      minutesOf(task.time) + task.minutes > minutesOf(other.time),
  );
  return collisions.map((other) => `Overlaps “${other.title}” at ${other.time}.`);
}
export function preparationOrderConflict(
  task: ScheduledTask,
  path: SavedPathway | undefined,
  all: ScheduledTask[],
): string | null {
  if (!path || !task.stepId) return null;
  const step = path.steps.find((s) => s.id === task.stepId);
  if (!step) return 'This preparation step no longer exists.';
  for (const dep of step.dependsOn) {
    if (path.steps.find((s) => s.id === dep)?.done) continue;
    const prerequisite = all.find((t) => t.pathwayId === path.id && t.stepId === dep);
    if (
      !prerequisite ||
      `${prerequisite.date}T${clock(minutesOf(prerequisite.time) + prerequisite.minutes)}` >
        `${task.date}T${task.time}`
    )
      return 'Schedule this session after its unfinished prerequisites.';
  }
  for (const dependent of path.steps.filter((s) => s.dependsOn.includes(step.id))) {
    const session = all.find(
      (t) => t.id !== task.id && t.pathwayId === path.id && t.stepId === dependent.id,
    );
    if (
      session &&
      `${session.date}T${session.time}` <
        `${task.date}T${clock(minutesOf(task.time) + task.minutes)}`
    )
      return 'Move dependent sessions later before moving this prerequisite.';
  }
  return null;
}
