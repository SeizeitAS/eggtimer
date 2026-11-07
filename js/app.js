// Oppstart og visning for Eggtimer.
// Logikk ligger i: timer.js (nedtelling), alarm.js (pipe), calibration.js (justering og kalibrering),
// order.js (bestillingsmodus), store.js (lagring).

(function () {
  'use strict';

  const i18n = window.Eggi18n;
  const timer = window.EggiTimer;
  const alarm = window.EggiAlarm;
  const cal = window.EggiCalibration;
  const order = window.EggiOrder;
  const store = window.EggiStore;

  const HARDNESS = ['soft', 'semi', 'hard'];
  const WATER = ['boiling', 'cold-button', 'cold-estimate'];
  const WATER_LABEL_KEYS = {
    'boiling': 'water.boiling',
    'cold-button': 'water.coldButton',
    'cold-estimate': 'water.coldEstimate',
  };
  const TICK_MS = 250;

  // phase: idle | heating | calibrating | running | done | orderRunning | orderDone
  const state = {
    times: null,            // sekunder per hardhet for kokende vann, fra data/egg-times.json
    mode: 'single',         // single | order
    hardness: 'soft',
    water: 'boiling',
    phase: 'idle',
    heatingStartMs: null,   // når vannet ble satt på
    running: null,          // egg-timer (enkeltegg)
    lastEgg: null,          // { water, hardness } for egget som sist ble startet
    order: { soft: 0, semi: 0, hard: 0 },   // antall egg per hardhet i bestillingen
    orderGroups: null,      // grupper for den startede bestillingen
    orderRows: [],          // DOM-rader for grupper
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

  function isOrder() {
    return state.mode === 'order';
  }

  function estimateAvailable() {
    return state.boilSeconds !== null;
  }

  function eggSeconds(hardness, water) {
    const key = cal.adjustKey(water || state.water, hardness);
    return cal.effectiveSeconds(state.times[hardness], state.adjustments[key]);
  }

  function orderTotal() {
    return order.totalCount(state.order);
  }

  function startEgg(startMs) {
    state.phase = 'running';
    state.heatingStartMs = null;
    state.lastEgg = { water: state.water, hardness: state.hardness };
    state.running = timer.createTimer(eggSeconds(state.hardness) * 1000, startMs);
  }

  // Alle egg i bestillingen starter samtidig, når vannet koker.
  function startOrder(boilStartMs) {
    const secondsByKind = {};
    HARDNESS.forEach(function (h) { secondsByKind[h] = eggSeconds(h); });
    state.orderGroups = order.schedule(state.order, boilStartMs, secondsByKind);
    state.phase = 'orderRunning';
    state.heatingStartMs = null;
    buildOrderList();
  }

  function resetToIdle() {
    state.phase = 'idle';
    state.running = null;
    state.heatingStartMs = null;
    state.orderGroups = null;
    state.orderRows = [];
    el.orderList.innerHTML = '';
  }

  function beginBoil(now) {
    if (isOrder()) {
      startOrder(now);
    } else {
      startEgg(now);
    }
  }

  // ---- Handlinger fra knappene ----

  function onStart() {
    alarm.unlock();
    const now = Date.now();
    if (state.phase === 'calibrating') {
      state.heatingStartMs = now;
    } else if (isOrder()) {
      if (orderTotal() === 0) return;
      if (state.water === 'boiling') {
        startOrder(now);
      } else {
        state.phase = 'heating';
        state.heatingStartMs = now;
      }
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
      beginBoil(now);
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

  // Brukeren har tatt ut en gruppe.
  function onTaken(index) {
    const groups = state.orderGroups;
    if (!groups || !groups[index]) return;
    groups[index].taken = true;
    if (order.allTaken(groups)) {
      alarm.stop();
      state.alarmOn = false;
      state.phase = 'orderDone';
    } else if (order.dueUntaken(groups, Date.now()).length === 0) {
      alarm.stop();
      state.alarmOn = false;
    }
    render();
  }

  // ---- Visning: valg ----

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

    renderGroup(
      el.mode,
      'mode',
      [
        { value: 'single', label: i18n.t('mode.single') },
        { value: 'order', label: i18n.t('mode.order') },
      ],
      state.mode,
      locked,
      function (value) {
        state.mode = value;
        render();
      }
    );
  }

  // ---- Visning: bestilling ----

  function buildOrderInputs() {
    el.orderInputs.innerHTML = '';
    HARDNESS.forEach(function (kind) {
      const row = document.createElement('label');
      row.className = 'choice';

      const name = document.createElement('span');
      name.dataset.kind = kind;
      name.textContent = i18n.t('egg.' + kind);

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = String(order.MAX_PER_KIND);
      input.step = '1';
      input.inputMode = 'numeric';
      input.className = 'count';
      input.value = String(state.order[kind]);
      input.setAttribute('aria-label', i18n.t('egg.' + kind));
      input.addEventListener('change', function () {
        state.order[kind] = order.clampCount(input.value);
        input.value = String(state.order[kind]);
        render();
      });

      const spacer = document.createElement('span');
      spacer.className = 'muted';
      spacer.textContent = '';

      row.append(input, name, spacer);
      el.orderInputs.appendChild(row);
      el.orderInputEls[kind] = input;
    });
  }

  function updateOrderInputs(locked) {
    HARDNESS.forEach(function (kind) {
      const input = el.orderInputEls[kind];
      if (!input) return;
      input.disabled = locked;
      if (document.activeElement !== input) input.value = String(state.order[kind]);
      const name = input.parentElement.querySelector('[data-kind]');
      if (name) name.textContent = i18n.t('egg.' + kind);
    });
  }

  // Bygger radene for de startede gruppene. Knappene må ikke byttes ut mens brukeren trykker.
  function buildOrderList() {
    el.orderList.innerHTML = '';
    state.orderRows = [];
    state.orderGroups.forEach(function (group, index) {
      const row = document.createElement('div');
      row.className = 'order-row';

      const label = document.createElement('span');
      label.className = 'order-label';

      const status = document.createElement('span');
      status.className = 'order-status muted';

      const countdown = document.createElement('span');
      countdown.className = 'order-countdown';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'primary order-take';
      button.addEventListener('click', function () { onTaken(index); });

      row.append(label, status, countdown, button);
      el.orderList.appendChild(row);
      state.orderRows.push({ root: row, label: label, status: status, countdown: countdown, button: button });
    });
  }

  function updateOrderList(now) {
    if (!state.orderGroups) return;
    state.orderGroups.forEach(function (group, index) {
      const r = state.orderRows[index];
      if (!r) return;
      const due = !group.taken && now >= group.dueMs;
      r.label.textContent = group.count + ' × ' + i18n.t('egg.' + group.kind);
      r.root.className = 'order-row' + (group.taken ? ' taken' : due ? ' due' : '');
      if (group.taken) {
        r.status.textContent = i18n.t('order.done');
        r.countdown.textContent = '';
        r.button.hidden = true;
      } else if (due) {
        r.status.textContent = i18n.t('order.dueNow');
        r.countdown.textContent = '';
        r.button.hidden = false;
        r.button.textContent = i18n.t('order.takeOut');
      } else {
        r.status.textContent = i18n.t('order.waiting');
        r.countdown.textContent = timer.formatMs(group.dueMs - now);
        r.button.hidden = true;
      }
    });
  }

  function adjustText() {
    const key = cal.adjustKey(state.water, state.hardness);
    const value = state.adjustments[key];
    if (!value) return i18n.t('egg.adjust.none');
    const sign = value > 0 ? '+' : '−';
    return i18n.t('egg.adjust.label') + ': ' + sign + timer.formatMs(Math.abs(value) * 1000);
  }

  // ---- Hovedvisning ----

  function render() {
    const now = Date.now();
    const phase = state.phase;
    const idle = phase === 'idle';
    const single = !isOrder();

    el.modeHeading.textContent = i18n.t('mode.label');
    el.hardnessHeading.textContent = i18n.t('egg.hardness.label');
    el.waterHeading.textContent = i18n.t('water.label');
    el.hint.textContent = i18n.t('egg.hint');

    renderChoices(!idle);

    el.hardnessCard.hidden = !single;
    el.orderCard.hidden = single;
    el.orderHeading.textContent = i18n.t('order.heading');
    el.orderNote.textContent = i18n.t('order.note');
    updateOrderInputs(!idle);
    el.orderTotal.textContent = orderTotal() === 0
      ? i18n.t('order.empty')
      : i18n.t('order.total').replace('{count}', String(orderTotal()));

    // Kalibrering: vises for kaldt vann.
    el.calibrationInfo.hidden = !isCold();
    el.calibrationInfo.textContent = estimateAvailable()
      ? i18n.t('water.calibrated').replace('{time}', timer.formatMs(state.boilSeconds * 1000))
      : i18n.t('water.noCalibration');
    el.calibrate.hidden = !(isCold() && idle);
    el.calibrate.textContent = i18n.t('water.calibrate');

    // Status og nedtelling.
    el.status.className = 'status';
    if (phase === 'done') {
      el.status.textContent = i18n.t('egg.done');
      el.status.className = 'status done';
      el.countdown.textContent = '0:00';
    } else if (phase === 'orderDone') {
      el.status.textContent = i18n.t('order.allTaken');
      el.status.className = 'status done';
      el.countdown.textContent = '0:00';
    } else if (phase === 'running') {
      el.status.textContent = i18n.t('egg.remaining');
      el.countdown.textContent = timer.formatMs(timer.remainingMs(state.running, now));
    } else if (phase === 'orderRunning') {
      const next = order.nextUntaken(state.orderGroups);
      const due = order.dueUntaken(state.orderGroups, now);
      el.status.textContent = due.length > 0 ? i18n.t('order.dueNow') : i18n.t('egg.remaining');
      el.countdown.textContent = next ? timer.formatMs(Math.max(0, next.dueMs - now)) : '0:00';
    } else if (phase === 'heating') {
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
      el.countdown.textContent = state.heatingStartMs === null
        ? '0:00'
        : timer.formatMs(now - state.heatingStartMs);
    } else if (single) {
      el.status.textContent = i18n.t('egg.ready');
      el.countdown.textContent = timer.formatMs(eggSeconds(state.hardness) * 1000);
    } else {
      el.status.textContent = i18n.t('order.ready');
      const longest = HARDNESS
        .filter(function (h) { return state.order[h] > 0; })
        .reduce(function (max, h) { return Math.max(max, eggSeconds(h)); }, 0);
      el.countdown.textContent = timer.formatMs(longest * 1000);
    }

    // Bestillingsliste.
    const showList = !!state.orderGroups && (phase === 'orderRunning' || phase === 'orderDone');
    el.orderList.hidden = !showList;
    if (showList) updateOrderList(now);

    // Knapper.
    const orderIdle = isOrder() && idle;
    const canStart = (phase === 'idle' || (phase === 'calibrating' && state.heatingStartMs === null))
      && (!isOrder() || orderTotal() > 0);
    const canBoil = phase === 'heating' || (phase === 'calibrating' && state.heatingStartMs !== null);
    const canCancel = phase === 'heating' || phase === 'running' || phase === 'calibrating' || phase === 'orderRunning';

    el.start.hidden = !canStart;
    el.start.disabled = isOrder() && orderTotal() === 0;
    el.start.textContent = i18n.t(orderIdle ? 'order.start' : 'egg.start');
    el.boil.hidden = !canBoil;
    el.boil.textContent = i18n.t('egg.boilNow');
    el.cancel.hidden = !canCancel;
    el.cancel.textContent = i18n.t('egg.cancel');
    el.silence.hidden = !state.alarmOn;
    el.silence.textContent = i18n.t('egg.silence');

    // Tilbakemelding og justering gjelder enkeltegg.
    el.feedback.hidden = phase !== 'done';
    el.feedbackLabel.textContent = i18n.t('egg.feedback.label');
    el.feedbackShort.textContent = i18n.t('egg.feedback.short');
    el.feedbackOk.textContent = i18n.t('egg.feedback.ok');
    el.feedbackLong.textContent = i18n.t('egg.feedback.long');

    el.adjustBlock.hidden = !single;
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
    } else if (state.phase === 'orderRunning') {
      const fresh = order.newlyDue(state.orderGroups, now);
      if (fresh.length > 0) {
        alarm.start();
        state.alarmOn = true;
      }
      if (order.allTaken(state.orderGroups)) {
        alarm.stop();
        state.alarmOn = false;
        state.phase = 'orderDone';
      }
    } else if (state.phase === 'heating' && state.water === 'cold-estimate' && estimateAvailable()) {
      const boilMs = state.boilSeconds * 1000;
      if (now - state.heatingStartMs >= boilMs) {
        // Estimatet er nådd: tiden regnes fra beregnet kok.
        beginBoil(state.heatingStartMs + boilMs);
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
    el.modeHeading = byId('mode-heading');
    el.mode = byId('mode');
    el.hardnessCard = byId('hardness-card');
    el.hardnessHeading = byId('hardness-heading');
    el.hardness = byId('hardness');
    el.orderCard = byId('order-card');
    el.orderHeading = byId('order-heading');
    el.orderInputs = byId('order-inputs');
    el.orderInputEls = {};
    el.orderTotal = byId('order-total');
    el.orderNote = byId('order-note');
    el.waterHeading = byId('water-heading');
    el.water = byId('water');
    el.calibrationInfo = byId('calibration-info');
    el.calibrate = byId('calibrate');
    el.hint = byId('hint');
    el.countdown = byId('countdown');
    el.status = byId('status');
    el.orderList = byId('order-list');
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
    el.adjustBlock = byId('adjust-block');
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
    buildOrderInputs();
    bindEvents();
    render();
    setInterval(tick, TICK_MS);
  }

  start().catch(function (err) {
    console.error(err);
    document.getElementById('status').textContent = String(err.message || err);
  });
})();
