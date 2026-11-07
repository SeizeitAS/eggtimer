// Tester at språkfilene er gyldige og har samme nøkler.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const langDir = join(here, '..', 'lang');

const readJson = (name) => JSON.parse(readFileSync(join(langDir, name), 'utf8'));

const languages = readJson('languages.json');
const reference = readJson('en.json');
const referenceKeys = Object.keys(reference).sort();

test('languages.json lists at least one language', () => {
  assert.ok(Array.isArray(languages));
  assert.ok(languages.length >= 1);
});

test('languages.json includes the default language en', () => {
  assert.ok(languages.includes('en'));
});

for (const code of languages) {
  test(`${code}.json exists and has the same keys as en.json`, () => {
    const strings = readJson(`${code}.json`);
    assert.deepEqual(Object.keys(strings).sort(), referenceKeys);
  });

  test(`${code}.json has no empty strings`, () => {
    const strings = readJson(`${code}.json`);
    for (const [key, value] of Object.entries(strings)) {
      assert.equal(typeof value, 'string', `${code}: ${key} er ikke tekst`);
      assert.ok(value.trim().length > 0, `${code}: ${key} er tom`);
    }
  });
}
