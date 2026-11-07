// Tester for tidsdata i data/egg-times.json.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, '..', 'data', 'egg-times.json'), 'utf8'));

test('egg-times.json has boiling-water times for all hardness levels', () => {
  const boiling = data.water.boiling;
  for (const key of ['soft', 'semi', 'hard']) {
    assert.ok(Number.isInteger(boiling[key]), `${key} må være et heltall i sekunder`);
    assert.ok(boiling[key] > 0, `${key} må være positiv`);
  }
});

test('hardness times increase from soft to hard', () => {
  const { soft, semi, hard } = data.water.boiling;
  assert.ok(soft < semi, 'bløtkokt skal være kortere enn smilende');
  assert.ok(semi < hard, 'smilende skal være kortere enn hardkokt');
});
