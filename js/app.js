// Oppstart og visning for Eggtimer.
// Nedtellingslogikken ligger i timer.js, pipingen i alarm.js, justering og kalibrering i calibration.js.

(function () {
  'use strict';

  const i18n = window.Eggi18n;
  const timer = window.EggiTimer;
  const alarm = window.EggiAlarm;
  const cal = window.EggiCalibration;
  const store = window.EggiStore;

  const HARDNESS = ['soft', 'semi', 'hard'];
  const WATER = ['boiling', 'cold-button', 'cold-estimate'];
  const WATER_LABEL_KEYS = {
    'boiling': 'water.boiling',
    'cold-button': 'water.coldButton',
    'cold-estimate': 'water.coldEstimate',
  };
  const TICK_MS = 250;

  // phase: idle | heating (venter på kok) | calibrating | running (egg) | done (tiden er ute)
  const state = {
    times: null,            // sekunder per hardhet for kokende vann, fra data/egg-times.json
    hardness: 'soft',
    water: 'boiling',
    phase: 'idle',
    heatingStartMs: null,   // når vannet ble satt på
    running: null,          // egg-timer
    lastEgg: null,          // { water, hardness } for egget som sist ble startet
    adjustments: {},        // justering i sekunder, per gruppe og hardhet
    boilSeconds: null,      // kalibrert tid til kok, i sekunder
    alarmOn: false,
  };

  const el = {};

  async function loadTimes() {
    const response = await fetch('data/egg-times.json');
    if (!response.ok) throw new Error('Kunne ikke laste data/egg-times.json');
    const data = await response.json();
    return data.water.boiling;
  }

  function loadStored() {
    const boil = store.readJson(store.KEYS.boilSeconds, null);
    state.boilSeconds = typeof boil === 'number' && boil > 0 ? boil : null;
    const adj = store.readJson(store.KEYS.adjustments, {});
    state.adjustments = adj && typeof adj === 'object' && !Array.isArray(adj) ? adj : {};
  }

  function isCold() {
    return state.water !== 'boiling';
  }

  function estimateAvailable() {
    return state.boilSeconds !== null;
  }

  function eggSeconds(hardness, water) {
    const key = cal.adjustKey(water || state.water, hardness);
    return cal.effectiveSeconds(state.times[hardness], state.adjustments[key]);
  }

  function startEgg(startMs) {
    state.phase = 'running';
    state.heatingStartMs = null;
    state.lastEgg = { water: state.water, hardness: state.hardness };
    state.running = timer.createTimer(eggSeconds(state.hardness) * 1000, startMs);
  }

  function resetToIdle() {
    state.phase = 'idle';
    state.running = null;
    state.heatingStartMs = null;
  }

  // ---- Handlinger fra knappene ----

  function onStart() {
    alarm.unlock();
    const now = Date.now();
    if (state.phase === 'calibrating') {
      state.heatingStartMs = now;
    } else if (state.water === 'boiling') {
      startEgg(now);
    } else {
      state.phase = 'heating';
      state.heatingStartMs = now;
    }
    render();
  }

  function onBoil() {
    const now = Date.now();
    if (state.phase === 'calibrating' && state.heatingStartMs !== null) {
      state.boilSeconds = cal.boilSecondsFromMeasure(now - state.heatingStartMs);
      store.writeJson(store.KEYS.boilSeconds, state.boilSeconds);
      resetToIdle();
    } else if (state.phase === 'heating') {
      startEgg(now);
    }
    render();
  }

  function onCancel() {
    alarm.stop();
    state.alarmOn = false;
    resetToIdle();
    render();
  }

  function onCalibrate() {
    resetToIdle();
    state.phase = 'calibrating';
    render();
  }

  function onSilence() {
    alarm.stop();
    state.alarmOn = false;
    render();
  }

  function onFeedback(choice) {
    if (state.lastEgg) {
      const key = cal.adjustKey(state.lastEgg.water, state.lastEgg.hardness);
      state.adjustments = cal.applyFeedback(state.adjustments, key, choice);
      store.writeJson(store.KEYS.adjustments, state.adjustments);
    }
    alarm.stop();
    state.alarmOn = false;
    state.lastEgg = null;
    resetToIdle();
    render();
  }

  function onResetAdjustments() {
    state.adjustments = {};
    store.writeJson(store.KEYS.adjustments, state.adjustments);
    render();
  }

  // ---- Tegning ----

  function renderGroup(container, name, options, selected, locked, onChange) {
    container.innerHTML = '';
    options.forEach(function (opt) {
      const label = document.createElement('label');
      label.className = 'choice' + (opt.disabled ? ' disabled' : '');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = opt.value;
      input.checked = opt.value === selected;
      input.disabled = locked || !!opt.disabled;
      input.addEventListener('change', function () {
        onChange(opt.value);
      });

      const text = document.createElement('span');
      text.textContent = opt.label;

      const detail = document.createElement('span');
      detail.className = 'muted';
      detail.textContent = opt.detail || '';

      label.append(input, text, detail);
      container.appendChild(label);
    });
  }

  function renderChoices(locked) {
    renderGroup(
      el.hardness,
      'hardness',
      HARDNESS.map(function (key) {
        return {
          value: key,
          label: i18n.t('egg.' + key),
          detail: timer.formatMs(eggSeconds(key) * 1000),
        };
      }),
      state.hardness,
      locked,
      function (value) {
        state.hardness = value;
        render();
      }
    );

    renderGroup(
      el.water,
      'water',
      WATER.map(function (key) {
        const isEstimate = key === 'cold-estimate';
        let detail = '';
        if (isEstimate) {
          detail = estimateAvailable()
            ? i18n.t('water.boilTime').replace('{time}', timer.formatMs(state.boilSeconds * 1000))
            : i18n.t('water.notCalibrated');
        }
        return {
          value: key,
          label: i18n.t(WATER_LABEL_KEYS[key]),
          detail: detail,
          disabled: isEstimate && !estimateAvailable(),
        };
      }),
      state.water,
      locked,
      function (value) {
        state.water = value;
        render();
      }
    );
  }

  function adjustText() {
    const key = cal.adjustKey(state.water, state.hardness);
    const value = state.adjustments[key];
    if (!value) return i18n.t('egg.adjust.none');
    const sign = value > 0 ? '+' : '−';
    return i18n.t('egg.adjust.label') + ': ' + sign + timer.formatMs(Math.abs(value) * 1000);
  }

  function render() {
    const now = Date.now();
    const phase = state.phase;

    el.hardnessHeading.textContent = i18n.t('egg.hardness.label');
    el.waterHeading.textContent = i18n.t('water.label');
    el.hint.textContent = i18n.t('egg.hint');

    renderChoices(phase !== 'idle');

    // Kalibrering: vises for kaldt vann.
    el.calibrationInfo.hidden = !isCold();
    el.calibrationInfo.textContent = estimateAvailable()
      ? i18n.t('water.calibrated').replace('{time}', timer.formatMs(state.boilSeconds * 1000))
      : i18n.t('water.noCalibration');
    el.calibrate.hidden = !(isCold() && phase === 'idle');
    el.calibrate.textContent = i18n.t('water.calibrate');

    // Status og nedtelling.
    if (phase === 'done') {
      el.status.textContent = i18n.t('egg.done');
      el.status.className = 'status done';
      el.countdown.textContent = '0:00';
    } else if (phase === 'running') {
      el.status.textContent = i18n.t('egg.remaining');
      el.status.className = 'status';
      el.countdown.textContent = timer.formatMs(timer.remainingMs(state.running, now));
    } else if (phase === 'heating') {
      el.status.className = 'status';
      if (state.water === 'cold-estimate' && estimateAvailable()) {
        const boilMs = state.boilSeconds * 1000;
        el.status.textContent = i18n.t('egg.heatingEstimate');
        el.countdown.textContent = timer.formatMs(Math.max(0, boilMs - (now - state.heatingStartMs)));
      } else {
        el.status.textContent = i18n.t('egg.heating');
        el.countdown.textContent = timer.formatMs(now - state.heatingStartMs);
      }
    } else if (phase === 'calibrating') {
      el.status.textContent = i18n.t('egg.calibrating');
      el.status.className = 'status';
      el.countdown.textContent = state.heatingStartMs === null
        ? '0:00'
        : timer.formatMs(now - state.heatingStartMs);
    } else {
      el.status.textContent = i18n.t('egg.ready');
      el.status.className = 'status';
      el.countdown.textContent = timer.formatMs(eggSeconds(state.hardness) * 1000);
    }

    // Knapper.
    const canStart = phase === 'idle' || (phase === 'calibrating' && state.heatingStartMs === null);
    const canBoil = phase === 'heating' || (phase === 'calibrating' && state.heatingStartMs !== null);
    const canCancel = phase === 'heating' || phase === 'running' || phase === 'calibrating';

    el.start.hidden = !canStart;
    el.start.textContent = i18n.t('egg.start');
    el.boil.hidden = !canBoil;
    el.boil.textContent = i18n.t('egg.boilNow');
    el.cancel.hidden = !canCancel;
    el.cancel.textContent = i18n.t('egg.cancel');
    el.silence.hidden = !state.alarmOn;
    el.silence.textContent = i18n.t('egg.silence');

    // Tilbakemelding etter ferdig egg.
    el.feedback.hidden = phase !== 'done';
    el.feedbackLabel.textContent = i18n.t('egg.feedback.label');
    el.feedbackShort.textContent = i18n.t('egg.feedback.short');
    el.feedbackOk.textContent = i18n.t('egg.feedback.ok');
    el.feedbackLong.textContent = i18n.t('egg.feedback.long');

    // Justering og nullstilling.
    el.adjustInfo.textContent = adjustText();
    el.resetAdjust.hidden = Object.keys(state.adjustments).length === 0;
    el.resetAdjust.textContent = i18n.t('egg.adjust.reset');
  }

  function tick() {
    const now = Date.now();
    if (state.phase === 'running' && timer.isDone(state.running, now)) {
      state.running = null;
      state.phase = 'done';
      state.alarmOn = true;
      alarm.start();
    } else if (state.phase === 'heating' && state.water === 'cold-estimate' && estimateAvailable()) {
      const boilMs = state.boilSeconds * 1000;
      if (now - state.heatingStartMs >= boilMs) {
        // Estimatet er nådd: eggtiden regnes fra beregnet kok.
        startEgg(state.heatingStartMs + boilMs);
      }
    }
    render();
  }

  function bindEvents() {
    el.start.addEventListener('click', onStart);
    el.boil.addEventListener('click', onBoil);
    el.cancel.addEventListener('click', onCancel);
    el.silence.addEventListener('click', onSilence);
    el.calibrate.addEventListener('click', onCalibrate);
    el.resetAdjust.addEventListener('click', onResetAdjustments);
    el.feedbackButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        onFeedback(btn.getAttribute('data-feedback'));
      });
    });

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

  function grabElements() {
    const byId = function (id) { return document.getElementById(id); };
    el.hardnessHeading = byId('hardness-heading');
    el.hardness = byId('hardness');
    el.waterHeading = byId('water-heading');
    el.water = byId('water');
    el.calibrationInfo = byId('calibration-info');
    el.calibrate = byId('calibrate');
    el.hint = byId('hint');
    el.countdown = byId('countdown');
    el.status = byId('status');
    el.start = byId('start');
    el.boil = byId('boil');
    el.cancel = byId('cancel');
    el.silence = byId('silence');
    el.feedback = byId('feedback');
    el.feedbackLabel = byId('feedback-label');
    el.feedbackShort = byId('feedback-short');
    el.feedbackOk = byId('feedback-ok');
    el.feedbackLong = byId('feedback-long');
    el.feedbackButtons = [el.feedbackShort, el.feedbackOk, el.feedbackLong];
    el.adjustInfo = byId('adjust-info');
    el.resetAdjust = byId('reset-adjust');
    el.languageSelect = byId('language-select');
  }

  async function start() {
    grabElements();

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
    loadStored();
    bindEvents();
    render();
    setInterval(tick, TICK_MS);
  }

  start().catch(function (err) {
    console.error(err);
    document.getElementById('status').textContent = String(err.message || err);
  });
})();
