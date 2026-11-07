// Viser brukerhåndboken på riktig språk.
// Hjelpeteksten ligger i help/<kode>.html. Mangler språket en hjelpefil, brukes engelsk.

(function () {
  'use strict';

  const i18n = window.Eggi18n;
  const FALLBACK_HELP = 'en';

  async function loadHelp(code) {
    const response = await fetch('help/' + code + '.html');
    if (!response.ok) throw new Error('Mangler hjelpefil for ' + code);
    return response.text();
  }

  async function renderHelp(code) {
    const target = document.getElementById('help-content');
    try {
      target.innerHTML = await loadHelp(code);
    } catch (err) {
      target.innerHTML = await loadHelp(FALLBACK_HELP);
    }
  }

  async function start() {
    const select = document.getElementById('language-select');
    let codes = [i18n.DEFAULT_LANGUAGE];
    try {
      codes = await i18n.listLanguages();
    } catch (err) {
      console.error(err);
    }
    const stored = i18n.readStoredLanguage();
    const initial = codes.includes(stored) ? stored : i18n.DEFAULT_LANGUAGE;

    try {
      await i18n.loadLanguage(initial);
    } catch (err) {
      console.error(err);
    }
    i18n.applyTranslations();

    select.innerHTML = '';
    codes.forEach(function (code) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code.toUpperCase();
      if (code === initial) option.selected = true;
      select.appendChild(option);
    });

    await renderHelp(initial);

    select.addEventListener('change', async function () {
      try {
        await i18n.loadLanguage(select.value);
      } catch (err) {
        console.error(err);
      }
      i18n.applyTranslations();
      await renderHelp(select.value);
    });
  }

  start().catch(function (err) {
    console.error(err);
  });
})();
