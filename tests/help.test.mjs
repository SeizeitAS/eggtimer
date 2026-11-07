// Tester for brukerhåndboken i hjelp/.
// Kjøres med: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const languages = JSON.parse(readFileSync(join(root, 'lang', 'languages.json'), 'utf8'));

test('a help file exists for every language, or the English fallback exists', () => {
  assert.ok(existsSync(join(root, 'help', 'en.html')), 'help/en.html mangler');
  for (const code of languages) {
    const file = join(root, 'help', code + '.html');
    if (!existsSync(file)) {
      assert.ok(existsSync(join(root, 'help', 'en.html')), `${code} har ingen hjelpefil`);
    }
  }
});

for (const code of ['no', 'en']) {
  test(`help/${code}.html has sections and no empty headings`, () => {
    const html = readFileSync(join(root, 'help', code + '.html'), 'utf8');
    const headings = [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map(m => m[1]);
    assert.ok(headings.length >= 8, 'for få avsnitt');
    for (const h of headings) assert.ok(h.trim().length > 0);
  });
}

test('the Norwegian and English help cover the same sections', () => {
  const headings = (code) => [...readFileSync(join(root, 'help', code + '.html'), 'utf8')
    .matchAll(/<h2>(.*?)<\/h2>/g)].length;
  assert.equal(headings('no'), headings('en'));
});

test('help pages do not contain script tags', () => {
  for (const code of ['no', 'en']) {
    const html = readFileSync(join(root, 'help', code + '.html'), 'utf8');
    assert.equal(/<script/i.test(html), false, `${code}: script-tag i hjelp`);
  }
});
