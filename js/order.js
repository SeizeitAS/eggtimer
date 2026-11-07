// Ren logikk for bestillingsmodus. Har ingen avhengighet til nettleseren, så den kan testes med Node.
//
// En bestilling er antall egg per hardhet, for eksempel { soft: 2, semi: 1, hard: 3 }.
// Alle egg i bestillingen starter samtidig. Hver hardhet får en gruppe med et klokkeslett
// for når den skal tas ut. Grupper som er klare, varsles én gang, og markeres som tatt ut av brukeren.

(function (root) {
  'use strict';

  const MAX_PER_KIND = 12;

  function clampCount(value) {
    const n = Math.floor(Number(value));
    if (!isFinite(n) || n < 0) return 0;
    return Math.min(MAX_PER_KIND, n);
  }

  function totalCount(counts) {
    return Object.keys(counts).reduce(function (sum, kind) {
      return sum + clampCount(counts[kind]);
    }, 0);
  }

  // secondsByKind: { soft: 240, semi: 360, hard: 540 } (for eksempel etter justering).
  // Grupper med 0 egg hoppes over. Sortert etter når de er klare.
  function schedule(counts, startMs, secondsByKind) {
    const groups = [];
    Object.keys(counts).forEach(function (kind) {
      const count = clampCount(counts[kind]);
      if (count > 0) {
        groups.push({
          kind: kind,
          count: count,
          dueMs: startMs + secondsByKind[kind] * 1000,
          taken: false,
          notified: false,
        });
      }
    });
    groups.sort(function (a, b) { return a.dueMs - b.dueMs; });
    return groups;
  }

  // Grupper som har blitt klare nå, og som ikke er varslet før. Markerer dem som varslet.
  function newlyDue(groups, nowMs) {
    const out = [];
    groups.forEach(function (g) {
      if (!g.taken && !g.notified && nowMs >= g.dueMs) {
        g.notified = true;
        out.push(g);
      }
    });
    return out;
  }

  function dueUntaken(groups, nowMs) {
    return groups.filter(function (g) { return !g.taken && nowMs >= g.dueMs; });
  }

  function nextUntaken(groups) {
    return groups.find(function (g) { return !g.taken; }) || null;
  }

  function allTaken(groups) {
    return groups.length > 0 && groups.every(function (g) { return g.taken; });
  }

  const api = {
    MAX_PER_KIND: MAX_PER_KIND,
    clampCount: clampCount,
    totalCount: totalCount,
    schedule: schedule,
    newlyDue: newlyDue,
    dueUntaken: dueUntaken,
    nextUntaken: nextUntaken,
    allTaken: allTaken,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.EggiOrder = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
