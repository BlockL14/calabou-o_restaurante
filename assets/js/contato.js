/* ==========================================================================
   CALABOUÇO — Reservas e contato
   Widget de reserva em passos (referência: OpenTable/Resy): pessoas, data em
   chips roláveis, horários em chips, dados e resumo ao vivo. O envio monta a
   mensagem e abre o WhatsApp (ou copia e abre o Direct do Instagram).
   ========================================================================== */

(function () {
  "use strict";

  function onReady(fn) {
    if (window.Calabouco && window.Calabouco.ready) fn();
    else document.addEventListener("calabouco:ready", fn, { once: true });
  }

  onReady(() => {
    const C = window.Calabouco;
    const CFG = window.CALABOUCO_CONFIG || {};
    const form = C.$("#reserva-form");
    if (!form) return;

    const DAYS_AHEAD = 21;
    const MAX_PEOPLE = 12;
    const NO_OCCASION = "Sem ocasião especial";
    const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const MONTHS_LONG = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
    ];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pad = (n) => String(n).padStart(2, "0");
    const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    // Data ao meio-dia: evita que o fuso horário "pule" o dia.
    const fromISO = (s) => {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d, 12);
    };
    const fromMin = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
    const nowMinutes = () => {
      const n = new Date();
      return n.getHours() * 60 + n.getMinutes();
    };

    const el = {
      party: C.$("[data-party]", form),
      minus: C.$('[data-people="-1"]', form),
      plus: C.$('[data-people="1"]', form),
      value: C.$("[data-people-value]", form),
      unit: C.$("[data-people-unit]", form),
      more: C.$("[data-people-more]", form),
      datesWrap: C.$("[data-dates-wrap]", form),
      dates: C.$("[data-dates]", form),
      prev: C.$("[data-dates-prev]", form),
      next: C.$("[data-dates-next]", form),
      times: C.$("[data-times]", form),
      timesEmpty: C.$("[data-times-empty]", form),
      dayHours: C.$("[data-day-hours]", form),
      summary: C.$("[data-summary]", form),
      note: C.$("[data-rsv-note]", form),
      nome: C.$("#r-nome", form),
      tel: C.$("#r-telefone", form),
      obs: C.$("#r-obs", form),
      errData: C.$("#r-data-erro", form),
      errHora: C.$("#r-horario-erro", form),
      errNome: C.$("#r-nome-erro", form),
      steps: C.$$("[data-step]", form),
    };

    const state = {
      people: 2,
      more: false,
      date: null,
      time: null,
      occasion: NO_OCCASION,
      tried: false,
    };

    const todayISO = toISO(new Date());

    /* Barra de resumo (CTA): estado de visibilidade compartilhado com update() */
    const bar = C.$("[data-summary-bar]", form);
    const seen = { step: true, dock: false, form: true };

    /* ---------------------------------------------------------------------
       Horários disponíveis para um dia
       --------------------------------------------------------------------- */
    function slotsFor(iso) {
      const day = fromISO(iso).getDay();
      const h = C.hoursFor(day);
      if (h.closed) return [];
      const cfg = CFG.reservationSlots || { start: "18:00", end: "22:30", step: 30 };
      const step = Number(cfg.step) > 0 ? Number(cfg.step) : 30;
      const start = C.toMin(cfg.start);
      let end = C.toMin(cfg.end);
      if (end < start) end += 1440;
      const open = C.toMin(h.open);
      let close = C.toMin(h.close);
      if (close <= open) close += 1440; // "00:00" = meia-noite
      const lo = Math.max(start, open);
      const hi = Math.min(end, close - 30);
      const earliest = iso === todayISO ? nowMinutes() + 30 : -Infinity;
      const out = [];
      for (let m = start; m <= end; m += step) {
        if (m >= lo && m <= hi && m >= earliest) out.push(fromMin(m));
      }
      return out;
    }

    // Retorna HTML: "meia-noite" não pode quebrar no hífen em telas estreitas.
    function dayHoursHTML(iso) {
      const d = fromISO(iso);
      const h = C.hoursFor(d.getDay());
      if (h.closed) return `${C.DAY_NAMES[d.getDay()]}: fechado.`;
      const close =
        h.close === "00:00" ? 'à <span class="rsv-nowrap">meia-noite.</span>' : `às <span class="rsv-nowrap">${C.fmtHour(h.close)}.</span>`;
      return `${C.DAY_NAMES[d.getDay()]}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]} · das ${C.fmtHour(h.open)} ${close}`;
    }

    /* ---------------------------------------------------------------------
       Passo 1 — Pessoas
       --------------------------------------------------------------------- */
    const peopleLabel = () =>
      state.more ? "Mais de 12 (evento)" : `${state.people} ${state.people === 1 ? "pessoa" : "pessoas"}`;

    function renderPeople(bump) {
      el.value.textContent = state.more ? "12+" : String(state.people);
      el.unit.textContent = state.more ? "evento" : state.people === 1 ? "pessoa" : "pessoas";
      const lockMinus = !state.more && state.people <= 1;
      if (lockMinus && document.activeElement === el.minus) el.plus.focus();
      if (state.more && document.activeElement === el.plus) el.minus.focus();
      el.minus.disabled = lockMinus;
      el.plus.disabled = state.more;
      el.plus.setAttribute("aria-label", state.people >= MAX_PEOPLE ? "Mais de 12 pessoas (evento)" : "Adicionar uma pessoa");
      el.more.setAttribute("aria-pressed", String(state.more));
      if (bump && !reduceMotion) {
        el.value.classList.remove("is-bump");
        void el.value.offsetWidth;
        el.value.classList.add("is-bump");
      }
      update();
    }

    function setMore(on) {
      state.more = on;
      if (on) {
        state.people = MAX_PEOPLE;
        if (state.occasion === NO_OCCASION) setOccasion("Grupo/evento");
      }
      renderPeople(true);
    }

    el.minus.addEventListener("click", () => {
      if (state.more) state.more = false;
      else state.people = Math.max(1, state.people - 1);
      renderPeople(true);
    });
    el.plus.addEventListener("click", () => {
      if (state.people >= MAX_PEOPLE) return setMore(true);
      state.people += 1;
      renderPeople(true);
    });
    el.more.addEventListener("click", () => setMore(!state.more));

    /* ---------------------------------------------------------------------
       Passo 2 — Datas (chips roláveis, próximos 21 dias)
       --------------------------------------------------------------------- */
    const base = new Date();
    const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, 12);
      const iso = toISO(d);
      const closed = !!C.hoursFor(d.getDay()).closed;
      // Hoje, com a casa aberta mas sem horários restantes (ex.: depois das 22h): esmaecido, como no OpenTable.
      const ended = !closed && i === 0 && !slotsFor(iso).length;
      const label = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : C.DAY_ABBR[d.getDay()];
      const spoken = `${i === 0 ? "Hoje, " : i === 1 ? "Amanhã, " : ""}${C.DAY_NAMES[d.getDay()].toLowerCase()}, ${d.getDate()} de ${
        MONTHS_LONG[d.getMonth()]
      }${closed ? " — fechado" : ended ? " — reservas encerradas" : ""}`;
      return { iso, d, closed, ended, label, spoken };
    });

    el.dates.innerHTML = days
      .map(
        (x) => `
        <button class="date-chip${x.ended ? " is-ended" : ""}" type="button" role="radio" data-date="${x.iso}" aria-checked="false" tabindex="-1" aria-label="${C.escapeHTML(x.spoken)}"${
          x.closed ? ' disabled title="Fechado"' : x.ended ? ' disabled title="Reservas encerradas por hoje"' : ""
        }>
          <span class="date-chip__dow">${x.label}</span>
          <span class="date-chip__day">${x.d.getDate()}</span>
          <span class="date-chip__mon">${x.closed ? "fechado" : x.ended ? "encerrado" : MONTHS[x.d.getMonth()]}</span>
        </button>`
      )
      .join("");

    const dateChips = () => C.$$("[data-date]", el.dates);
    const enabledDateChips = () => dateChips().filter((b) => !b.disabled);

    function scrollChipIntoView(chip) {
      const track = el.dates;
      const padPx = 44;
      const left = chip.offsetLeft - track.offsetLeft;
      const right = left + chip.offsetWidth;
      const behavior = reduceMotion ? "auto" : "smooth";
      if (left - padPx < track.scrollLeft) track.scrollTo({ left: Math.max(0, left - padPx), behavior });
      else if (right + padPx > track.scrollLeft + track.clientWidth)
        track.scrollTo({ left: right + padPx - track.clientWidth, behavior });
    }

    function selectDate(iso, { focus = false, scroll = true } = {}) {
      state.date = iso;
      let selected = null;
      dateChips().forEach((b) => {
        const on = b.dataset.date === iso;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
        if (on) selected = b;
      });
      if (selected) {
        if (scroll) scrollChipIntoView(selected);
        if (focus) selected.focus({ preventScroll: true });
      }
      renderTimes(true);
      update();
    }

    el.dates.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-date]");
      if (chip && !chip.disabled) selectDate(chip.dataset.date);
    });

    function updateDateArrows() {
      const t = el.dates;
      const max = t.scrollWidth - t.clientWidth;
      const atStart = t.scrollLeft <= 4;
      const atEnd = t.scrollLeft >= max - 4;
      if (el.prev) el.prev.disabled = atStart;
      if (el.next) el.next.disabled = atEnd;
      el.datesWrap.classList.toggle("can-prev", !atStart);
      el.datesWrap.classList.toggle("can-next", !atEnd);
    }
    const pageBy = (dir) =>
      el.dates.scrollBy({ left: dir * el.dates.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
    if (el.prev) el.prev.addEventListener("click", () => pageBy(-1));
    if (el.next) el.next.addEventListener("click", () => pageBy(1));
    el.dates.addEventListener("scroll", updateDateArrows, { passive: true });
    window.addEventListener("resize", updateDateArrows);

    /* ---------------------------------------------------------------------
       Passo 3 — Horários
       --------------------------------------------------------------------- */
    function renderTimes(animate) {
      const slots = state.date ? slotsFor(state.date) : [];
      if (!slots.includes(state.time)) state.time = null;
      el.times.innerHTML = slots
        .map(
          (t, i) =>
            `<button class="time-chip" type="button" role="radio" data-time="${t}" aria-checked="${t === state.time}" tabindex="${
              t === state.time || (!state.time && i === 0) ? 0 : -1
            }" style="--i:${i}">${t}</button>`
        )
        .join("");
      el.times.hidden = slots.length === 0;
      el.timesEmpty.hidden = !state.date || slots.length > 0;
      el.dayHours.innerHTML = state.date ? dayHoursHTML(state.date) : "Escolha uma data para ver os horários.";
      if (animate && !reduceMotion) {
        el.times.classList.remove("is-in");
        void el.times.offsetWidth;
        el.times.classList.add("is-in");
      }
    }

    function selectTime(t, { focus = false } = {}) {
      state.time = t;
      C.$$("[data-time]", el.times).forEach((b) => {
        const on = b.dataset.time === t;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      update();
    }

    el.times.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-time]");
      if (chip) selectTime(chip.dataset.time);
    });

    /* Setas do teclado nos grupos de rádio (padrão WAI-ARIA, foco itinerante) */
    function radioKeys(group, selector, onPick) {
      group.addEventListener("keydown", (e) => {
        const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
        const fwd = e.key === "ArrowRight" || e.key === "ArrowDown";
        if (!back && !fwd && e.key !== "Home" && e.key !== "End") return;
        const items = C.$$(selector, group).filter((b) => !b.disabled);
        const i = items.indexOf(document.activeElement);
        if (i < 0 || !items.length) return;
        e.preventDefault();
        let n = i;
        if (back) n = (i - 1 + items.length) % items.length;
        if (fwd) n = (i + 1) % items.length;
        if (e.key === "Home") n = 0;
        if (e.key === "End") n = items.length - 1;
        onPick(items[n]);
      });
    }
    radioKeys(el.dates, "[data-date]", (b) => selectDate(b.dataset.date, { focus: true }));
    radioKeys(el.times, "[data-time]", (b) => selectTime(b.dataset.time, { focus: true }));

    /* ---------------------------------------------------------------------
       Passo 4 — Dados
       --------------------------------------------------------------------- */
    function setOccasion(value) {
      state.occasion = value;
      C.$$("[data-occasion]", form).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.occasion === value)));
    }
    form.addEventListener("click", (e) => {
      const b = e.target.closest("[data-occasion]");
      if (b) setOccasion(b.dataset.occasion);
    });

    // Máscara de telefone: (41) 99999-8888 ou (41) 3254-6112
    function maskPhone(v) {
      let dg = v.replace(/\D/g, "");
      if (dg.length > 11 && dg.startsWith("55")) dg = dg.slice(2); // +55 do autopreenchimento
      dg = dg.replace(/^0+/, "").slice(0, 11); // 0 de tronco (041…)
      if (!dg) return "";
      let out = `(${dg.slice(0, 2)}`;
      if (dg.length > 2) {
        const rest = dg.slice(2);
        const split = dg.length === 11 ? 5 : 4;
        out += `) ${rest.length > split ? `${rest.slice(0, split)}-${rest.slice(split)}` : rest}`;
      }
      return out;
    }
    el.tel.addEventListener("input", () => {
      const v = el.tel.value;
      const pos = el.tel.selectionStart == null ? v.length : el.tel.selectionStart;
      const digitsBefore = v.slice(0, pos).replace(/\D/g, "").length;
      const masked = maskPhone(v);
      if (masked === v) return;
      el.tel.value = masked;
      // Mantém o cursor depois do mesmo número de dígitos
      let caret = masked.length;
      if (pos < v.length) {
        let seen = 0;
        for (let i = 0; i < masked.length; i++) {
          if (/\d/.test(masked[i])) seen++;
          if (seen >= digitsBefore) {
            caret = i + 1;
            break;
          }
        }
      }
      el.tel.setSelectionRange(caret, caret);
    });

    el.nome.addEventListener("input", update);

    /* ---------------------------------------------------------------------
       Resumo, progresso e validação
       --------------------------------------------------------------------- */
    const missing = (text) => `<span class="is-missing">${text}</span>`;
    const SEP = '<span class="rsv-summary__sep"> · </span>';

    let lastSummary = "";
    function renderSummary() {
      const parts = [];
      if (state.date) {
        const d = fromISO(state.date);
        parts.push(`${C.DAY_ABBR[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`);
      } else parts.push(missing("Escolha a data"));
      parts.push(state.time ? state.time : missing(state.date ? "Escolha o horário" : "Horário"));
      parts.push(C.escapeHTML(peopleLabel()));
      const html = parts.join(SEP);
      if (html !== lastSummary) {
        el.summary.innerHTML = html;
        lastSummary = html;
      }
    }

    const nameOK = () => el.nome.value.trim().length >= 2;

    function setError(node, msg) {
      msg = msg || "";
      if (node.textContent !== msg) node.textContent = msg;
    }

    function checkDate(show) {
      const ok = !!state.date;
      if (show) setError(el.errData, ok ? "" : "Escolha uma data para a reserva.");
      return ok;
    }
    function checkTime(show) {
      const ok = !!state.time;
      if (show) {
        // Dia sem horários: a própria caixa "Sem horários disponíveis…" vira o alerta (sem mensagem duplicada).
        const none = !!state.date && !slotsFor(state.date).length;
        setError(el.errHora, ok || none ? "" : "Escolha um horário.");
        el.timesEmpty.classList.toggle("is-error", !ok && none);
        const invalid = String(!ok && !none);
        if (el.times.getAttribute("aria-invalid") !== invalid) el.times.setAttribute("aria-invalid", invalid);
      }
      return ok;
    }
    function checkName(show) {
      const ok = nameOK();
      if (show) {
        el.nome.setAttribute("aria-invalid", String(!ok));
        setError(el.errNome, ok ? "" : el.nome.value.trim() ? "Digite pelo menos 2 caracteres." : "Informe seu nome para a reserva.");
      }
      return ok;
    }

    function update() {
      renderSummary();
      const done = { 1: true, 2: !!state.date, 3: !!state.time, 4: nameOK() };
      el.steps.forEach((s) => s.classList.toggle("is-done", !!done[s.dataset.step]));
      if (state.tried) {
        checkDate(true);
        checkTime(true);
        checkName(true);
      }
      syncBar();
    }

    /* Barra de resumo/CTA: recolhida só enquanto a pessoa ainda está no começo (stepper de pessoas à vista),
       sem horário escolhido e sem tentativa de envio. Depois disso, o botão "Solicitar reserva" fica sempre à mão. */
    function syncBar() {
      if (!bar) return;
      const tucked = seen.step && !seen.dock && !state.time && !state.tried;
      bar.classList.toggle("is-tucked", tucked);
      // Com a barra à vista, a barra "Ver sacola" (celular) se recolhe para não haver dois CTAs vermelhos empilhados.
      const live = seen.form && (!tucked || bar.contains(document.activeElement));
      document.body.classList.toggle("rsv-bar-live", live);
    }

    function focusTarget(node) {
      node.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      node.focus({ preventScroll: true });
    }

    /* ---------------------------------------------------------------------
       Envio
       --------------------------------------------------------------------- */
    function buildMessage() {
      const d = fromISO(state.date);
      const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
      const lines = [`${C.greeting()} e gostaria de reservar uma mesa:`, "", `Nome: ${el.nome.value.trim()}`];
      const tel = el.tel.value.trim();
      if (tel) lines.push(`Telefone: ${tel}`);
      lines.push(`Data: ${weekday}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`);
      lines.push(`Horário: ${state.time}`);
      lines.push(`Pessoas: ${peopleLabel()}`);
      if (state.occasion && state.occasion !== NO_OCCASION) lines.push(`Ocasião: ${state.occasion}`);
      const obs = el.obs.value.trim();
      if (obs) lines.push(`Observações: ${obs}`);
      return lines.join("\n");
    }

    // Aba retomada depois da virada do dia: recarrega para atualizar as datas
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && toISO(new Date()) !== todayISO && !el.nome.value.trim()) location.reload();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nowIso = toISO(new Date());
      if (state.date && (state.date < nowIso || (state.date === nowIso && state.time && C.toMin(state.time) < nowMinutes()))) {
        C.toast("O horário escolhido já passou. Atualizamos as opções.", "clock", 4200);
        setTimeout(() => location.reload(), 1200);
        return;
      }
      state.tried = true;
      syncBar();
      const okDate = checkDate(true);
      const okTime = checkTime(true);
      const okName = checkName(true);

      if (!okDate) {
        const first = enabledDateChips()[0];
        if (first) focusTarget(first);
        return;
      }
      if (!okTime) {
        const firstTime = C.$("[data-time]", el.times);
        const selectedDate = C.$('[data-date][aria-checked="true"]', el.dates);
        focusTarget(firstTime || selectedDate || el.dates);
        return;
      }
      if (!okName) {
        focusTarget(el.nome);
        return;
      }

      C.sendMessage(buildMessage());
      C.toast(
        C.hasWhatsApp ? "Abrimos o WhatsApp com sua reserva. É só enviar!" : "Reserva copiada! Cole no Direct e envie.",
        "check",
        5200
      );
    });

    /* ---------------------------------------------------------------------
       Inicialização
       --------------------------------------------------------------------- */
    if (el.note) {
      el.note.textContent = C.hasWhatsApp
        ? "Abriremos o WhatsApp com sua solicitação pronta. A reserva é garantida após a confirmação da nossa equipe."
        : "Copiaremos sua solicitação e abriremos o Direct do Instagram — é só colar e enviar. A reserva é garantida após a confirmação da nossa equipe.";
    }

    renderPeople(false);
    // Pré-seleciona o primeiro dia aberto que ainda tenha horários (hoje pode já ter passado).
    const firstOpen = days.find((x) => !x.closed && slotsFor(x.iso).length) || days.find((x) => !x.closed);
    if (firstOpen) selectDate(firstOpen.iso, { scroll: false });
    else {
      renderTimes(false);
      update();
    }
    const firstEnabled = enabledDateChips()[0];
    if (!state.date && firstEnabled) firstEnabled.tabIndex = 0;
    updateDateArrows();

    /* Cartão "Visite-nos": fixo na rolagem (desktop). Se for mais alto que a tela,
       o ponto de fixação sobe para que a base do cartão (horários) continue visível. */
    const visit = C.$(".visit");
    if (visit) {
      C.checkImages(visit);
      const fitVisit = () => {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 52;
        const wide = window.innerWidth >= 1024;
        visit.classList.toggle("is-sticky", wide);
        if (wide) {
          const top = Math.min(navH + 24, window.innerHeight - visit.offsetHeight - 24);
          visit.style.setProperty("--visit-top", `${Math.round(top)}px`);
        }
      };
      fitVisit();
      window.addEventListener("resize", fitVisit);
      window.addEventListener("load", fitVisit);
    }

    /* Barra de resumo: observa o stepper de pessoas (passo 1), o fim do formulário e o próprio formulário. */
    const dock = C.$("[data-summary-dock]", form);
    const firstStep = C.$(".party", form) || el.steps[0];
    if (bar && dock && firstStep && "IntersectionObserver" in window) {
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 52;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.target === firstStep) seen.step = en.isIntersecting;
            if (en.target === dock) seen.dock = en.isIntersecting;
            if (en.target === form) seen.form = en.isIntersecting;
          });
          syncBar();
        },
        { rootMargin: `-${navH}px 0px 0px 0px` }
      );
      io.observe(firstStep);
      io.observe(dock);
      io.observe(form);
      // Tab até o botão revela a barra recolhida (:focus-within) — mantém a sacola fora do caminho também.
      bar.addEventListener("focusin", syncBar);
      bar.addEventListener("focusout", () => setTimeout(syncBar, 0));
    } else if (bar) {
      seen.step = false;
    }
    syncBar();

    /* Canais: sem WhatsApp, os cartões 1 e 3 levariam ambos ao Instagram — deixe claro o que cada um faz. */
    if (!C.hasWhatsApp) {
      const reserveCard = C.$('.channel[data-link="reserve"] .channel__value');
      if (reserveCard) reserveCard.textContent = "Enviar mensagem no Direct";
      const igLabel = C.$('.channel[data-link="instagram"] .channel__label');
      if (igLabel) igLabel.textContent = "Instagram · ver perfil";
    }

    /* "00h" soa estranho em pt-BR: "18h – 0h" na tabela e "até meia-noite" na pílula (pedido registrado para o main.js). */
    C.$$("[data-hours-table] td").forEach((n) => {
      if (/\b00h\b/.test(n.textContent)) n.textContent = n.textContent.replace(/\b00h\b/g, "0h");
    });
    C.$$("[data-open-status]").forEach((n) => {
      if (/\b00h\b/.test(n.textContent)) n.textContent = n.textContent.replace(/até 00h\b/, "até meia-noite").replace(/\b00h\b/g, "0h");
    });
  });
})();
