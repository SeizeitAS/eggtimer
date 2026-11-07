// Pipelyd og vibrasjon når tiden er ute.
// Lyden må startes av en brukerhandling (for eksempel knappetrykk), ellers blokkerer nettleseren den.
// Pipingen fortsetter til brukeren stopper den.

(function (root) {
  'use strict';

  let audioCtx = null;
  let beepTimer = null;
  let vibrateTimer = null;

  // Kalles fra et knappetrykk, slik at lyd er tillatt senere.
  function unlock() {
    try {
      const AudioCtor = root.AudioContext || root.webkitAudioContext;
      if (!AudioCtor) return false;
      if (!audioCtx) audioCtx = new AudioCtor();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return true;
    } catch (err) {
      return false;
    }
  }

  function beepOnce() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.25;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    osc.start(t);
    osc.stop(t + 0.35);
  }

  function vibrateOnce() {
    if (root.navigator && typeof root.navigator.vibrate === 'function') {
      root.navigator.vibrate([300, 200, 300]);
    }
  }

  function start() {
    stop();
    beepOnce();
    beepTimer = setInterval(beepOnce, 1000);
    vibrateOnce();
    vibrateTimer = setInterval(vibrateOnce, 1500);
  }

  function stop() {
    if (beepTimer !== null) clearInterval(beepTimer);
    if (vibrateTimer !== null) clearInterval(vibrateTimer);
    beepTimer = null;
    vibrateTimer = null;
    if (root.navigator && typeof root.navigator.vibrate === 'function') {
      root.navigator.vibrate(0);
    }
  }

  root.EggiAlarm = {
    unlock: unlock,
    start: start,
    stop: stop,
  };
})(typeof window !== 'undefined' ? window : globalThis);
