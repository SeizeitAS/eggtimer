// Tester for bestillingslogikken i js/order.js.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const order = require('../js/order.js');

const SECS = { soft: 240, semi: 360, hard: 540 };

test('clampCount keeps counts whole, non-negative and capped', () => {
  assert.equal(order.clampCount(2), 2);
  assert.equal(order.clampCount(2.7), 2);
  assert.equal(order.clampCount(-3), 0);
  assert.equal(order.clampCount('abc'), 0);
  assert.equal(order.clampCount(99), order.MAX_PER_KIND);
});

test('totalCount sums all kinds', () => {
  assert.equal(order.totalCount({ soft: 2, semi: 1, hard: 3 }), 6);
  assert.equal(order.totalCount({ soft: 0, semi: 0, hard: 0 }), 0);
});

test('schedule skips kinds with zero eggs and sorts by ready time', () => {
  const groups = order.schedule({ soft: 2, semi: 0, hard: 3 }, 1_000, SECS);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].kind, 'soft');
  assert.equal(groups[0].dueMs, 1_000 + 240_000);
  assert.equal(groups[1].kind, 'hard');
  assert.equal(groups[1].dueMs, 1_000 + 540_000);
});

test('schedule uses the given times, including adjusted ones', () => {
  const groups = order.schedule({ soft: 1 }, 0, { soft: 270 });
  assert.equal(groups[0].dueMs, 270_000);
});

test('newlyDue returns each group once, when it becomes ready', () => {
  const groups = order.schedule({ soft: 1, hard: 1 }, 0, SECS);
  assert.equal(order.newlyDue(groups, 239_999).length, 0);
  const first = order.newlyDue(groups, 240_000);
  assert.deepEqual(first.map(g => g.kind), ['soft']);
  assert.equal(order.newlyDue(groups, 300_000).length, 0);
  assert.deepEqual(order.newlyDue(groups, 540_000).map(g => g.kind), ['hard']);
});

test('a taken group is not reported as newly due', () => {
  const groups = order.schedule({ soft: 1 }, 0, SECS);
  groups[0].taken = true;
  assert.equal(order.newlyDue(groups, 240_000).length, 0);
});

test('dueUntaken lists ready groups that are not taken', () => {
  const groups = order.schedule({ soft: 1, semi: 1, hard: 1 }, 0, SECS);
  groups[0].taken = true;
  assert.deepEqual(order.dueUntaken(groups, 400_000).map(g => g.kind), ['semi']);
});

test('nextUntaken returns the first group not yet taken, or null', () => {
  const groups = order.schedule({ soft: 1, hard: 1 }, 0, SECS);
  assert.equal(order.nextUntaken(groups).kind, 'soft');
  groups[0].taken = true;
  assert.equal(order.nextUntaken(groups).kind, 'hard');
  groups[1].taken = true;
  assert.equal(order.nextUntaken(groups), null);
});

test('allTaken is true only when every group is taken', () => {
  const groups = order.schedule({ soft: 1, hard: 1 }, 0, SECS);
  assert.equal(order.allTaken(groups), false);
  groups[0].taken = true;
  assert.equal(order.allTaken(groups), false);
  groups[1].taken = true;
  assert.equal(order.allTaken(groups), true);
});

test('an empty order is never all taken', () => {
  assert.equal(order.allTaken(order.schedule({}, 0, SECS)), false);
});
