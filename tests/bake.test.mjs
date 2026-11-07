// Tester for julebakst-data i data/julebakst.json og språkteksten for den.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'julebakst.json'), 'utf8'));
const no = JSON.parse(readFileSync(join(root, 'lang', 'no.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(root, 'lang', 'en.json'), 'utf8'));

test('julebakst.json has at least one item', () => {
  assert.ok(Array.isArray(data.items) && data.items.length > 0);
});

test('every item has a unique id, a sensible temperature and whole minutes', () => {
  const ids = new Set();
  for (const item of data.items) {
    assert.match(item.id, /^[a-z_]+$/, `${item.id}: ugyldig id`);
    assert.equal(ids.has(item.id), false, `${item.id}: id finnes to ganger`);
    ids.add(item.id);
    assert.ok(Number.isInteger(item.temp) && item.temp >= 50 && item.temp <= 260, `${item.id}: temperatur`);
    assert.ok(Number.isInteger(item.minutes) && item.minutes >= 1 && item.minutes <= 120, `${item.id}: minutter`);
  }
});

test('every item has a name in both Norwegian and English', () => {
  for (const item of data.items) {
    const key = 'bake.item.' + item.id;
    assert.ok(no[key] && no[key].trim().length > 0, `no mangler ${key}`);
    assert.ok(en[key] && en[key].trim().length > 0, `en mangler ${key}`);
  }
});
