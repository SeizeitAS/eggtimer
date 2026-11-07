// Ren logikk for julebakst-timeren. Har ingen avhengighet til nettleseren, så den kan testes med Node.

(function (root) {
  'use strict';

  const MIN_TEMP = 50;
  const MAX_TEMP = 260;
  const MIN_MINUTES = 1;
  const MAX_MINUTES = 120;
  const DEFAULT_TEMP = 200;
  const DEFAULT_MINUTES = 10;

  function clampTemp(value) {
    const n = Math.round(Number(value));
    if (!isFinite(n)) return DEFAULT_TEMP;
    return Math.min(MAX_TEMP, Math.max(MIN_TEMP, n));
  }

  function clampMinutes(value) {
    const n = Math.round(Number(value));
    if (!isFinite(n)) return DEFAULT_MINUTES;
    return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, n));
  }

  function bakeSeconds(minutes) {
    return clampMinutes(minutes) * 60;
  }

  function findItem(items, id) {
    return (items || []).find(function (item) { return item.id === id; }) || null;
  }

  const api = {
    MIN_TEMP: MIN_TEMP,
    MAX_TEMP: MAX_TEMP,
    MIN_MINUTES: MIN_MINUTES,
    MAX_MINUTES: MAX_MINUTES,
    DEFAULT_TEMP: DEFAULT_TEMP,
    DEFAULT_MINUTES: DEFAULT_MINUTES,
    clampTemp: clampTemp,
    clampMinutes: clampMinutes,
    bakeSeconds: bakeSeconds,
    findItem: findItem,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.EggiBake = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
