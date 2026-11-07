// Ren logikk for justering av egg-tider og kalibrering av kaldt vann.
// Har ingen avhengighet til nettleseren, så den kan testes med Node.
//
// Justering lagres per vanngruppe og hardhet, for eksempel "boiling.soft" eller "cold.hard".
// Verdier er i sekunder. Hver tilbakemelding flytter justeringen ett steg, innenfor en grense.

(function (root) {
  'use strict';

  const STEP_SECONDS = 30;
  const LIMIT_SECONDS = 180;

  function clamp(value) {
    return Math.max(-LIMIT_SECONDS, Math.min(LIMIT_SECONDS, value));
  }

  // Gruppe for justering: kokende vann og kaldt vann har hver sin justering.
  function waterGroup(water) {
    return water === 'boiling' ? 'boiling' : 'cold';
  }

  function adjustKey(water, hardness) {
    return waterGroup(water) + '.' + hardness;
  }

  // feedback: 'short' (for kort), 'ok' (passe) eller 'long' (for lang).
  // Returnerer en ny justeringsliste. Den gamle endres ikke.
  function applyFeedback(adjustments, key, feedback) {
    const current = adjustments[key] || 0;
    let delta = 0;
    if (feedback === 'short') delta = STEP_SECONDS;
    if (feedback === 'long') delta = -STEP_SECONDS;

    const next = clamp(current + delta);
    const out = Object.assign({}, adjustments);
    if (next === 0) {
      delete out[key];
    } else {
      out[key] = next;
    }
    return out;
  }

  // Tid i sekunder for egget, etter justering. Minst 1 sekund.
  function effectiveSeconds(baseSeconds, adjustSeconds) {
    return Math.max(1, baseSeconds + (adjustSeconds || 0));
  }

  // Tid fra vannet ble satt på til det kokte, i sekunder (avrundet).
  function boilSecondsFromMeasure(elapsedMs) {
    return Math.max(1, Math.round(elapsedMs / 1000));
  }

  const api = {
    STEP_SECONDS: STEP_SECONDS,
    LIMIT_SECONDS: LIMIT_SECONDS,
    waterGroup: waterGroup,
    adjustKey: adjustKey,
    applyFeedback: applyFeedback,
    effectiveSeconds: effectiveSeconds,
    boilSecondsFromMeasure: boilSecondsFromMeasure,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.EggiCalibration = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
