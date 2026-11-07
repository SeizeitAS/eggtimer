// Oppstart og visning for Eggtimer. Nedtellingslogikken ligger i timer.js og pipingen i alarm.js.

(function () {
  'use strict';

  const i18n = window.Eggi18n;
  const timer = window.EggiTimer;
  const alarm = window.EggiAlarm;

  const HARDNESS = ['soft', 'semi', 'hard'];
  const TICK_MS = 250;

  const state = {
    times: null,       // sekunder per hardhet, fra data/egg-times.json
    hardness: 'soft',
    running: null,     // { durationMs, startedAtMs } når nedtelling pågår
    done: false,       // true når tiden er ute og pipingen går
  };

  const el = {};

  async function loadTimes() {
    const response = await fetch('data/egg-times.json');
    if (!response.ok) throw new Error('Kunne ikke laste data/egg-times.json');
    const data = await response.json();
    return data.water.boiling;
  }

  function renderHardnessChoices() {
    const group = el.hardness;
    group.innerHTML = '';
    HARDNESS.forEach(function (key) {
      const label = document.createElement('label');
      label.className = 'choice';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'hardness';
      input.value = key;
      input.checked = key === state.hardness;
      input.disabled = !!state.running;
      input.addEventListener('change', function () {
        state.hardness = key;
        render();
      });

      const name = document.createElement('span');
      name.textContent = i18n.t('egg.' + key);

      const time = document.createElement('span');
      time.className = 'muted';
      time.textContent = timer.formatMs(state.times[key] * 1000);

      label.append(input, name, time);
      group.appendChild(label);
    });
  }

  function render() {
    const now = Date.now();
    const running = !!state.running;

    el.hardnessHeading.textContent = i18n.t('egg.hardness.label');
    renderHardnessChoices();

    el.hint.textContent = i18n.t('egg.hint');

    if (state.done) {
      el.status.textContent = i18n.t('egg.done');
      el.status.className = 'status done';
      el.countdown.textContent = '0:00';
    } else if (running) {
      const remaining = timer.remainingMs(state.running, now);
      el.status.textContent = i18n.t('egg.remaining');
      el.status.className = 'status';
      el.countdown.textContent = timer.formatMs(remaining);
    } else {
      el.status.textContent = i18n.t('egg.ready');
      el.status.className = 'status';
      el.countdown.textContent = timer.formatMs(state.times[state.hardness] * 1000);
    }

    el.start.hidden = running || state.done;
    el.start.textContent = i18n.t('egg.start');
    el.cancel.hidden = !running;
    el.cancel.textContent = i18n.t('egg.cancel');
    el.silence.hidden = !state.done;
    el.silence.textContent = i18n.t('egg.silence');
  }

  function startTimer() {
    alarm.unlock();
    state.done = false;
    state.running = timer.createTimer(state.times[state.hardness] * 1000, Date.now());
    render();
  }

  function cancelTimer() {
    state.running = null;
    render();
  }

  function silence() {
    alarm.stop();
    state.done = false;
    render();
  }

  function tick() {
    if (state.running && timer.isDone(state.running, Date.now())) {
      state.running = null;
      state.done = true;
      alarm.start();
    }
    render();
  }

  function bindEvents() {
    el.start.addEventListener('click', startTimer);
    el.cancel.addEventListener('click', cancelTimer);
    el.silence.addEventListener('click', silence);

    el.languageSelect.addEventListener('change', async function () {
      try {
        await i18n.loadLanguage(el.languageSelect.value);
      } catch (err) {
        console.error(err);
      }
      i18n.applyTranslations();
      render();
    });
  }

  async function fillLanguagePicker(codes, current) {
    el.languageSelect.innerHTML = '';
    codes.forEach(function (code) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code.toUpperCase();
      if (code === current) option.selected = true;
      el.languageSelect.appendChild(option);
    });
  }

  async function start() {
    el.hardnessHeading = document.getElementById('hardness-heading');
    el.hardness = document.getElementById('hardness');
    el.countdown = document.getElementById('countdown');
    el.status = document.getElementById('status');
    el.hint = document.getElementById('hint');
    el.start = document.getElementById('start');
    el.cancel = document.getElementById('cancel');
    el.silence = document.getElementById('silence');
    el.languageSelect = document.getElementById('language-select');

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
    await fillLanguagePicker(codes, initial);

    state.times = await loadTimes();
    bindEvents();
    render();
    setInterval(tick, TICK_MS);
  }

  start().catch(function (err) {
    console.error(err);
    document.getElementById('status').textContent = String(err.message || err);
  });
})();
