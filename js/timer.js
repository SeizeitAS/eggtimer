// Ren logikk for nedtelling. Har ingen avhengighet til nettleseren, så den kan testes med Node.
// Tiden er alltid et klokkeslett (ms), ikke en teller, så nedtellingen fortsetter riktig
// selv om fanen har vært i bakgrunnen.

(function (root) {
  'use strict';

  function createTimer(durationMs, startedAtMs) {
    return { durationMs: durationMs, startedAtMs: startedAtMs };
  }

  function remainingMs(timer, nowMs) {
    const elapsed = nowMs - timer.startedAtMs;
    return Math.max(0, timer.durationMs - elapsed);
  }

  function isDone(timer, nowMs) {
    return remainingMs(timer, nowMs) === 0;
  }

  // Viser gjenstående tid som m:ss. Runder opp, slik at 0:01 vises til siste sekund.
  function formatMs(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes + ':' + String(seconds).padStart(2, '0');
  }

  const api = {
    createTimer: createTimer,
    remainingMs: remainingMs,
    isDone: isDone,
    formatMs: formatMs,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.EggiTimer = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
