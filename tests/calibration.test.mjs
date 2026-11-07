// Tester for justering og kalibrering i js/calibration.js.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cal = require('../js/calibration.js');

test('waterGroup puts both cold modes in the same group', () => {
  assert.equal(cal.waterGroup('boiling'), 'boiling');
  assert.equal(cal.waterGroup('cold-button'), 'cold');
  assert.equal(cal.waterGroup('cold-estimate'), 'cold');
});

test('adjustKey combines group and hardness', () => {
  assert.equal(cal.adjustKey('boiling', 'soft'), 'boiling.soft');
  assert.equal(cal.adjustKey('cold-estimate', 'hard'), 'cold.hard');
});

test('"for kort" adds one step, "for lang" removes one step', () => {
  const up = cal.applyFeedback({}, 'boiling.soft', 'short');
  assert.equal(up['boiling.soft'], 30);
  const down = cal.applyFeedback({}, 'boiling.soft', 'long');
  assert.equal(down['boiling.soft'], -30);
});

test('"passe" leaves the adjustment unchanged', () => {
  const before = { 'boiling.soft': 60 };
  const after = cal.applyFeedback(before, 'boiling.soft', 'ok');
  assert.deepEqual(after, { 'boiling.soft': 60 });
});

test('adjustment is capped at the limit in both directions', () => {
  let adj = {};
  for (let i = 0; i < 20; i++) adj = cal.applyFeedback(adj, 'cold.hard', 'short');
  assert.equal(adj['cold.hard'], cal.LIMIT_SECONDS);
  for (let i = 0; i < 40; i++) adj = cal.applyFeedback(adj, 'cold.hard', 'long');
  assert.equal(adj['cold.hard'], -cal.LIMIT_SECONDS);
});

test('an adjustment that returns to zero is removed', () => {
  const adj = cal.applyFeedback({ 'boiling.semi': 30 }, 'boiling.semi', 'long');
  assert.equal('boiling.semi' in adj, false);
});

test('applyFeedback does not modify the input object', () => {
  const before = { 'boiling.soft': 30 };
  cal.applyFeedback(before, 'boiling.soft', 'short');
  assert.deepEqual(before, { 'boiling.soft': 30 });
});

test('effectiveSeconds adds the adjustment and never goes below 1', () => {
  assert.equal(cal.effectiveSeconds(240, 30), 270);
  assert.equal(cal.effectiveSeconds(240, undefined), 240);
  assert.equal(cal.effectiveSeconds(10, -180), 1);
});

test('boilSecondsFromMeasure rounds to whole seconds, at least 1', () => {
  assert.equal(cal.boilSecondsFromMeasure(312_400), 312);
  assert.equal(cal.boilSecondsFromMeasure(312_600), 313);
  assert.equal(cal.boilSecondsFromMeasure(0), 1);
});
