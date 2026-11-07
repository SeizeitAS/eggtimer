// Lagring i nettleseren (localStorage). Alle lesinger og skrivinger er i try/catch,
// fordi lagring kan være blokkert (privat modus, avslått lagring). Appen fungerer uten.

(function (root) {
  'use strict';

  function readJson(key, fallback) {
    try {
      const raw = root.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      root.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  root.EggiStore = {
    readJson: readJson,
    writeJson: writeJson,
    KEYS: {
      adjustments: 'eggtimer.adjustments',
      boilSeconds: 'eggtimer.boilSeconds',
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
