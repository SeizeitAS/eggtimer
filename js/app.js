// Oppstart av Eggtimer. Egg- og bakstlogikk kommer i sprint 2.

(function () {
  'use strict';

  const i18n = window.Eggi18n;

  async function fillLanguagePicker(select, codes, current) {
    select.innerHTML = '';
    codes.forEach(function (code) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code.toUpperCase();
      if (code === current) option.selected = true;
      select.appendChild(option);
    });
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
    await fillLanguagePicker(select, codes, initial);

    select.addEventListener('change', async function () {
      try {
        await i18n.loadLanguage(select.value);
      } catch (err) {
        console.error(err);
      }
      i18n.applyTranslations();
    });
  }

  start();
})();
