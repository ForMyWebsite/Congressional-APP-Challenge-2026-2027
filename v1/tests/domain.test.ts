import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeDemoState,
  rankOpportunities,
  getGuidance,
  dateKey,
  addDays,
  stateSchema,
} from '../src/domain.js';

test('demo creates current dates without sharing mutable student state', () => {
  const first = makeDemoState();
  const second = makeDemoState();
  assert.equal(first.tasks[0].date, dateKey(new Date()));
  first.tasks[0].done = true;
  assert.equal(second.tasks[0].done, false);
  assert.equal(dateKey(addDays(new Date(2026, 9, 31), 1)), '2026-11-01');
});
test('interest matches are explained and do not invent eligibility or deadlines', () => {
  const ranked = rankOpportunities(['Computer science']);
  assert.equal(ranked[0].id, 'congress');
  assert.match(ranked[0].reason, /Computer science/);
  assert.ok(ranked.every((item) => item.deadline === 'Check provider'));
});
test('guide uses the student goal, admits missing school data and does not invent dates', () => {
  const state = makeDemoState();
  assert.match(getGuidance('what classes should I take?', state), /counselor/i);
  assert.match(getGuidance('when is my PSAT?', state), /confirm/i);
  assert.match(getGuidance('plan my day', state), /biology/i);
});
test('stored profile and planner boundaries reject malformed data', () => {
  assert.equal(stateSchema.safeParse(makeDemoState()).success, true);
  assert.equal(
    stateSchema.safeParse({ ...makeDemoState(), tasks: [{ title: '' }] }).success,
    false,
  );
  assert.equal(
    stateSchema.safeParse({ ...makeDemoState(), profile: { name: 'x' } }).success,
    false,
  );
});
