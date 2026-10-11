/* ==========================================================================
   CALABOUÇO — Contato: formulário de reserva → mensagem pronta
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

    const f = {
      nome: C.$("#r-nome"),
      telefone: C.$("#r-telefone"),
      data: C.$("#r-data"),
      horario: C.$("#r-horario"),
      pessoas: C.$("#r-pessoas"),
      ocasiao: C.$("#r-ocasiao"),
      obs: C.$("#r-obs"),
    };

    const pad = (n) => String(n).padStart(2, "0");
    const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const fromMin = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

    // Data mínima = hoje; máxima = 90 dias.
    const today = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 90);
    f.data.min = toISO(today);
    f.data.max = toISO(max);

    // Pessoas
    f.pessoas.innerHTML =
      Array.from(
        { length: 12 },
        (_, i) => `<option value="${i + 1}">${i + 1} ${i ? "pessoas" : "pessoa"}</option>`,
      ).join("") + '<option value="Mais de 12">Mais de 12 (evento)</option>';
    f.pessoas.value = "2";

    // Horários disponíveis conforme o dia escolhido
    function fillSlots() {
      const slots = CFG.reservationSlots || { start: "18:00", end: "22:30", step: 30 };
      let start = C.toMin(slots.start);
      let end = C.toMin(slots.end);
      if (end <= start) end += 1440;

      if (f.data.value) {
        const day = new Date(`${f.data.value}T12:00:00`).getDay();
        const h = C.hoursFor(day);
        if (h.closed) {
          f.horario.innerHTML = '<option value="">Fechado neste dia</option>';
          return;
        }
        const open = C.toMin(h.open);
        let close = C.toMin(h.close);
        if (close <= open) close += 1440;
        start = Math.max(start, open);
        end = Math.min(end, close - 30);
      }

      const prev = f.horario.value;
      const opts = [];
      for (let m = start; m <= end; m += slots.step || 30) opts.push(fromMin(m));
      f.horario.innerHTML =
        '<option value="">Selecione</option>' + opts.map((o) => `<option value="${o}">${o}</option>`).join("");
      if (opts.includes(prev)) f.horario.value = prev;
    }
    fillSlots();

    // Validação
    function setError(input, msg) {
      const err = C.$(`#${input.id}-erro`);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    }

    function validateDate() {
      if (!f.data.value) return (setError(f.data, "Escolha uma data."), false);
      if (f.data.value < f.data.min) return (setError(f.data, "Escolha uma data a partir de hoje."), false);
      const day = new Date(`${f.data.value}T12:00:00`).getDay();
      if (C.hoursFor(day).closed) {
        setError(f.data, `Não abrimos às ${C.DAY_NAMES[day].toLowerCase()}s. Escolha outra data.`);
        return false;
      }
      setError(f.data, "");
      return true;
    }

    f.data.addEventListener("change", () => {
      validateDate();
      fillSlots();
    });
    f.nome.addEventListener("input", () => f.nome.value.trim().length >= 2 && setError(f.nome, ""));
    f.horario.addEventListener("change", () => f.horario.value && setError(f.horario, ""));

    // Máscara simples de telefone
    f.telefone.addEventListener("input", () => {
      const d = f.telefone.value.replace(/\D/g, "").slice(0, 11);
      let out = d;
      if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      f.telefone.value = out;
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      if (f.nome.value.trim().length < 2) {
        setError(f.nome, "Informe seu nome.");
        ok = false;
      }
      if (!validateDate()) ok = false;
      if (!f.horario.value) {
        setError(f.horario, "Escolha um horário.");
        ok = false;
      }
      if (!ok) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const dateLabel = new Date(`${f.data.value}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const pessoas = /^\d+$/.test(f.pessoas.value)
        ? `${f.pessoas.value} ${f.pessoas.value === "1" ? "pessoa" : "pessoas"}`
        : f.pessoas.value;

      const lines = [
        `${C.greeting()} e gostaria de reservar uma mesa:`,
        "",
        `Nome: ${f.nome.value.trim()}`,
        f.telefone.value ? `Telefone: ${f.telefone.value}` : "",
        `Data: ${dateLabel}`,
        `Horário: ${f.horario.value}`,
        `Pessoas: ${pessoas}`,
        f.ocasiao.value ? `Ocasião: ${f.ocasiao.value}` : "",
        f.obs.value.trim() ? `Observações: ${f.obs.value.trim()}` : "",
      ].filter((l, i) => l !== "" || i === 1);

      C.sendMessage(lines.join("\n"));
      C.toast(
        C.hasWhatsApp ? "Abrimos o WhatsApp com sua reserva. É só enviar!" : "Reserva copiada! Cole no Direct e envie.",
        "check",
        5200,
      );
    });
  });
})();
