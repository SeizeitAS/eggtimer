// Tester for nedtellingslogikken i js/timer.js.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const timer = require('../js/timer.js');

test('remainingMs counts down from the duration', () => {
  const t = timer.createTimer(60_000, 1_000_000);
  assert.equal(timer.remainingMs(t, 1_000_000), 60_000);
  assert.equal(timer.remainingMs(t, 1_030_000), 30_000);
});

test('remainingMs never goes below zero', () => {
  const t = timer.createTimer(60_000, 1_000_000);
  assert.equal(timer.remainingMs(t, 1_120_000), 0);
});

test('isDone is false before the duration and true at the end', () => {
  const t = timer.createTimer(60_000, 0);
  assert.equal(timer.isDone(t, 59_999), false);
  assert.equal(timer.isDone(t, 60_000), true);
  assert.equal(timer.isDone(t, 90_000), true);
});

test('formatMs shows minutes and zero-padded seconds', () => {
  assert.equal(timer.formatMs(240_000), '4:00');
  assert.equal(timer.formatMs(65_000), '1:05');
  assert.equal(timer.formatMs(9_000), '0:09');
});

test('formatMs rounds up so 0:01 shows until the last second', () => {
  assert.equal(timer.formatMs(1), '0:01');
  assert.equal(timer.formatMs(1_000), '0:01');
  assert.equal(timer.formatMs(1_001), '0:02');
});

test('formatMs shows 0:00 when done', () => {
  assert.equal(timer.formatMs(0), '0:00');
});
