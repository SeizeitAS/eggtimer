// Tester for julebakst-logikken i js/bake.js.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const bake = require('../js/bake.js');

test('clampTemp keeps temperature in range and uses default for nonsense', () => {
  assert.equal(bake.clampTemp(200), 200);
  assert.equal(bake.clampTemp(20), bake.MIN_TEMP);
  assert.equal(bake.clampTemp(999), bake.MAX_TEMP);
  assert.equal(bake.clampTemp('abc'), bake.DEFAULT_TEMP);
});

test('clampMinutes keeps minutes in range and uses default for nonsense', () => {
  assert.equal(bake.clampMinutes(6), 6);
  assert.equal(bake.clampMinutes(0), bake.MIN_MINUTES);
  assert.equal(bake.clampMinutes(500), bake.MAX_MINUTES);
  assert.equal(bake.clampMinutes(undefined), bake.DEFAULT_MINUTES);
});

test('bakeSeconds converts minutes to seconds', () => {
  assert.equal(bake.bakeSeconds(6), 360);
  assert.equal(bake.bakeSeconds(0), 60);
});

test('findItem finds a standard item by id, or null', () => {
  const items = [{ id: 'a', temp: 200, minutes: 6 }, { id: 'b', temp: 180, minutes: 10 }];
  assert.equal(bake.findItem(items, 'b').minutes, 10);
  assert.equal(bake.findItem(items, 'missing'), null);
  assert.equal(bake.findItem(undefined, 'a'), null);
});
