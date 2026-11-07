// Språkstøtte for Eggtimer.
//
// Språkfiler ligger i lang/<kode>.json. Tilgjengelige språk listes i lang/languages.json.
// Nytt språk legges til ved å lage en ny språkfil med samme nøkler og føye koden til listen.
// Standardspråket er norsk. Manglende nøkler faller tilbake til engelsk, og deretter til nøkkelen selv.

(function (global) {
  'use strict';

  const DEFAULT_LANGUAGE = 'no';
  const FALLBACK_LANGUAGE = 'en';
  const STORAGE_KEY = 'eggtimer.language';

  const state = {
    language: DEFAULT_LANGUAGE,
    strings: {},
    fallback: {},
  };

  function readStoredLanguage() {
    try {
      return global.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      // Privat modus eller blokkert lagring: bruk standardspråk.
      return null;
    }
  }

  function storeLanguage(code) {
    try {
      global.localStorage.setItem(STORAGE_KEY, code);
    } catch (err) {
      // Lagring er ikke tilgjengelig. Språket gjelder da bare denne økten.
    }
  }

  async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error('Kunne ikke laste ' + path + ' (' + response.status + ')');
    }
    return response.json();
  }

  async function listLanguages() {
    return fetchJson('lang/languages.json');
  }

  async function loadLanguage(code) {
    const [strings, fallback] = await Promise.all([
      fetchJson('lang/' + code + '.json'),
      code === FALLBACK_LANGUAGE ? null : fetchJson('lang/' + FALLBACK_LANGUAGE + '.json'),
    ]);
    state.language = code;
    state.strings = strings;
    state.fallback = fallback || strings;
    storeLanguage(code);
    return code;
  }

  function t(key) {
    if (Object.prototype.hasOwnProperty.call(state.strings, key)) {
      return state.strings[key];
    }
    if (Object.prototype.hasOwnProperty.call(state.fallback, key)) {
      return state.fallback[key];
    }
    return key;
  }

  function applyTranslations(root) {
    const scope = root || global.document;
    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    global.document.documentElement.lang = state.language;
  }

  global.Eggi18n = {
    DEFAULT_LANGUAGE: DEFAULT_LANGUAGE,
    FALLBACK_LANGUAGE: FALLBACK_LANGUAGE,
    STORAGE_KEY: STORAGE_KEY,
    readStoredLanguage: readStoredLanguage,
    listLanguages: listLanguages,
    loadLanguage: loadLanguage,
    t: t,
    applyTranslations: applyTranslations,
  };
})(typeof window !== 'undefined' ? window : globalThis);
