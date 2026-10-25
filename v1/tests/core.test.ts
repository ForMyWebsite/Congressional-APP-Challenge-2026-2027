import { deleteWorkspace } from '../src/lib/storage';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogue } from '../src/data/catalogue';
import {
  emptyWorkspace,
  workspaceSchema,
  type Opportunity,
  type SavedPathway,
  type ScheduledTask,
} from '../src/domain/models';
import { explainMatch } from '../src/domain/matching';
import { addDays, effectiveStatus, minutesOf, todayKey } from '../src/domain/dates';
import { completeStep, createPathway, setStepCompletion } from '../src/domain/pathways';
import { preparationOrderConflict, previewSchedule, taskConflicts } from '../src/domain/scheduling';
import { importWorkspace, restoreWorkspace, saveWorkspace, STORAGE_KEY } from '../src/lib/storage';
import { calendarICS } from '../src/lib/exports';
const example = catalogue.find((item) => item.id === 'demo-engineering')!;
function student() {
  const state = emptyWorkspace();
  state.profile = {
    ...state.profile,
    grade: '10',
    region: 'Pennsylvania',
    interests: ['Engineering'],
    preferFree: true,
    availableMinutes: 60,
    weekdays: [0, 1, 2, 3, 4, 5, 6],
  };
  return state;
}
function path(): SavedPathway {
  return { ...createPathway(example, 'path-1'), targetDate: '2026-11-05' };
}
function task(values: Partial<ScheduledTask> = {}): ScheduledTask {
  return {
    id: 'school',
    title: 'Physics homework',
    date: '2026-11-01',
    time: '16:00',
    minutes: 30,
    category: 'Assignment',
    done: false,
    pathwayId: null,
    stepId: null,
    ...values,
  };
}
function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) || null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

test('new guest planner contains no invented assignments or achievements', () => {
  const state = emptyWorkspace();
  assert.equal(state.version, 2);
  assert.equal(state.profile.grade, null);
  assert.deepEqual(state.tasks, []);
  assert.deepEqual(state.pathways, []);
  assert.equal(workspaceSchema.safeParse(state).success, true);
});
test('engineering/free matching separates alignment, known fit, unknowns and questions', () => {
  const result = explainMatch(student().profile, example, '2026-11-01');
  assert.deepEqual(result.interests, ['Engineering']);
  assert.ok(result.consistent.some((text) => text.includes('Grade 10')));
  assert.ok(result.consistent.some((text) => text.includes('free')));
  assert.ok(result.missing.some((text) => text.includes('deadline is unknown')));
  assert.ok(result.missing.some((text) => text.includes('Fictional')));
  assert.equal(result.mismatches.length, 0);
});
test('grade, geography, cost and remote preferences produce explicit mismatches', () => {
  const profile = {
    ...student().profile,
    grade: '9' as const,
    region: 'Other US state' as const,
    preferRemote: true,
  };
  const result = explainMatch(
    profile,
    catalogue.find((o) => o.id === 'demo-design')!,
    '2026-11-01',
  );
  assert.equal(result.mismatches.length, 4);
});
test('unknown cost is not free and absent student answers are not inferred', () => {
  const result = explainMatch(emptyWorkspace().profile, catalogue[0], '2026-11-01');
  assert.ok(result.missing.some((t) => t.includes('cost is unknown')));
  assert.ok(result.missing.some((t) => t.includes('not been source-reviewed')));
  assert.equal(result.consistent.length, 0);
});
test('expired and closed programs never appear open', () => {
  const closed = {
    ...example,
    demo: false,
    applicationStatus: 'open',
    deadline: { date: '2026-10-01', time: '23:59', timezone: 'America/New_York' },
  } as Opportunity;
  assert.equal(effectiveStatus(closed, '2026-11-01'), 'closed');
  assert.ok(
    explainMatch(student().profile, closed, '2026-11-01').mismatches.some((t) =>
      t.includes('closed'),
    ),
  );
  assert.equal(
    effectiveStatus({ ...closed, deadline: null, applicationStatus: 'closed' }, '2026-11-01'),
    'closed',
  );
  assert.equal(effectiveStatus(catalogue[2], '2026-11-01'), 'not-applicable');
});
test('pathway requirements have citations; suggestions and questions remain distinct', () => {
  const plan = path();
  assert.ok(
    plan.steps
      .filter((s) => s.kind === 'requirement')
      .every((s) => example.sources.some((source) => source.id === s.sourceId)),
  );
  assert.ok(plan.steps.some((s) => s.kind === 'question'));
  assert.ok(plan.steps.some((s) => s.kind === 'suggestion'));
  assert.equal(plan.applicationStatus, 'Exploring');
});
test('prerequisites block completion; reversing a step resets all transitive dependents', () => {
  let plan = path();
  assert.match(setStepCompletion(plan, 'prepare', true).error!, /prerequisite/);
  for (const step of plan.steps) plan = setStepCompletion(plan, step.id, true).pathway;
  assert.ok(plan.steps.every((s) => s.done));
  plan = setStepCompletion(plan, 'review', false).pathway;
  assert.ok(plan.steps.every((s) => !s.done));
});
test('reopening pathway steps reconciles completed scheduled sessions', () => {
  let state = student();
  let plan = path();
  for (const step of plan.steps) plan = setStepCompletion(plan, step.id, true).pathway;
  state = {
    ...state,
    pathways: [plan],
    tasks: [
      task({
        id: 'prep',
        category: 'Preparation',
        pathwayId: plan.id,
        stepId: 'prepare',
        done: true,
      }),
    ],
  };
  const result = completeStep(state, plan.id, 'review', false);
  assert.equal(result.workspace.tasks[0].done, false);
  assert.equal(
    result.workspace.pathways[0].steps.every((s) => !s.done),
    true,
  );
});
test('schedule preview avoids schoolwork, respects dependencies and never mutates the planner', () => {
  const state = student();
  state.pathways = [path()];
  state.tasks = [task()];
  const before = JSON.stringify(state);
  const result = previewSchedule(state.pathways[0], state.profile, state.tasks, '2026-11-01');
  assert.equal(result.conflicts.length, 0);
  assert.equal(JSON.stringify(state), before);
  assert.ok(
    result.tasks.every((t) => taskConflicts(t, [...state.tasks, ...result.tasks]).length === 0),
  );
  assert.equal(result.tasks[0].time, '16:30');
  for (const session of result.tasks)
    assert.equal(
      preparationOrderConflict(session, path(), [...state.tasks, ...result.tasks]),
      null,
    );
  for (const date of new Set(result.tasks.map((t) => t.date)))
    assert.ok(
      result.tasks.filter((t) => t.date === date).reduce((sum, t) => sum + t.minutes, 0) <= 60,
    );
});
test('insufficient capacity, a past target and missing time settings explain conflicts', () => {
  const profile = { ...student().profile, availableMinutes: 15 };
  assert.equal(previewSchedule(path(), profile, [], '2026-11-01').tasks.length, 0);
  assert.match(previewSchedule(path(), profile, [], '2026-11-01').conflicts[0], /do not fit/);
  assert.match(
    previewSchedule({ ...path(), targetDate: '2026-10-01' }, student().profile, [], '2026-11-01')
      .conflicts[0],
    /past/,
  );
  assert.match(
    previewSchedule(path(), { ...profile, availableMinutes: 0 }, [], '2026-11-01').conflicts[0],
    /time/,
  );
});
test('schedule conflict checks stop moving sessions ahead of prerequisites', () => {
  const plan = path();
  const prereq = task({
    id: 'prereq',
    pathwayId: plan.id,
    stepId: 'review',
    date: '2026-11-03',
    time: '16:00',
  });
  const dependent = task({ id: 'dep', pathwayId: plan.id, stepId: 'confirm', date: '2026-11-02' });
  assert.match(preparationOrderConflict(dependent, plan, [prereq])!, /after/);
  assert.equal(taskConflicts(task(), [task({ id: 'other', time: '16:20' })]).length, 1);
});
test('repeated previews do not duplicate already scheduled steps', () => {
  const profile = student().profile;
  const first = previewSchedule(path(), profile, [], '2026-11-01');
  const again = previewSchedule(path(), profile, first.tasks, '2026-11-01');
  assert.equal(again.tasks.length, 0);
});
test('schema recovery preserves corrupt data and reports unavailable storage', () => {
  const storage = memory();
  storage.setItem(STORAGE_KEY, '{broken');
  const restored = restoreWorkspace(storage);
  assert.equal(restored.recovery, '{broken');
  assert.ok(restored.warning);
  assert.equal(storage.getItem(STORAGE_KEY), '{broken');
  const unavailable = {
    ...storage,
    getItem: () => {
      throw new Error('disabled');
    },
  };
  assert.match(restoreWorkspace(unavailable).warning!, /unavailable/);
  assert.match(
    saveWorkspace(
      {
        ...storage,
        setItem: () => {
          throw new Error('full');
        },
      },
      student(),
    )!,
    /could not save/,
  );
});
test('valid planner round-trips through storage and import; invalid versions and dependencies fail', () => {
  const storage = memory();
  const state = student();
  state.pathways = [path()];
  assert.equal(saveWorkspace(storage, state), null);
  assert.deepEqual(restoreWorkspace(storage).workspace, state);
  assert.deepEqual(importWorkspace(JSON.stringify(state)), state);
  assert.throws(() => importWorkspace(JSON.stringify({ ...state, version: 1 })));
  const invalid = structuredClone(state);
  invalid.pathways[0].steps[0].dependsOn = ['next'];
  assert.equal(workspaceSchema.safeParse(invalid).success, false);
});
test('calendar export escapes text, uses Eastern timezone and includes DST rules', () => {
  const ics = calendarICS(
    [task({ title: 'Review, plan; then\nprepare' })],
    new Date('2026-10-25T15:00:00Z'),
  );
  assert.match(ics, /TZID:America\/New_York/);
  assert.match(ics, /BYMONTH=3/);
  assert.match(ics, /SUMMARY:Review\\, plan\\; then\\nprepare/);
  assert.match(ics, /DTSTART;TZID=America\/New_York:20261101T160000/);
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
});
test('Eastern dates remain stable across UTC midnight and DST boundaries', () => {
  assert.equal(todayKey(new Date('2026-11-01T02:00:00Z')), '2026-10-31');
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(minutesOf('16:30'), 990);
});
test('central profile-to-pathway-to-approved-schedule journey persists progress', () => {
  const state = student();
  const explanation = explainMatch(state.profile, example, '2026-11-01');
  assert.ok(explanation.interests.length);
  state.pathways = [path()];
  const preview = previewSchedule(state.pathways[0], state.profile, [task()], '2026-11-01');
  assert.ok(preview.tasks.length);
  state.tasks = [task(), ...preview.tasks];
  const result = completeStep(state, 'path-1', 'review', true);
  assert.equal(result.error, null);
  const storage = memory();
  saveWorkspace(storage, result.workspace);
  assert.equal(restoreWorkspace(storage).workspace.pathways[0].steps[0].done, true);
  assert.equal(restoreWorkspace(storage).workspace.tasks.length, preview.tasks.length + 1);
});

test('deletion reports failures instead of claiming data was removed', () => {
  const storage = memory();
  storage.setItem(STORAGE_KEY, JSON.stringify(student()));
  assert.equal(deleteWorkspace(storage), null);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  storage.setItem(STORAGE_KEY, 'keep');
  assert.match(
    deleteWorkspace({
      ...storage,
      removeItem: () => {
        throw new Error('blocked');
      },
    })!,
    /could not delete/,
  );
  assert.equal(storage.getItem(STORAGE_KEY), 'keep');
});
