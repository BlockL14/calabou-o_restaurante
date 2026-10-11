/* ==========================================================================
   CALABOUÇO — Scripts compartilhados por todas as páginas
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  const CFG = window.CALABOUCO_CONFIG || {};
  const MENU = window.CALABOUCO_MENU || [];
  const CATEGORIES = window.CALABOUCO_CATEGORIES || [];
  const TESTIMONIALS = window.CALABOUCO_TESTIMONIALS || [];
  const IMG = window.CALABOUCO_IMG || ((id) => id);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const escapeHTML = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const formatPrice = (n) => money.format(n);

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* armazenamento indisponível: segue sem persistir */
      }
    },
  };

  /* ------------------------------------------------------------------------
     Ícones (SVG inline, traço 1.6)
     ------------------------------------------------------------------------ */
  const ICONS = {
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    phone:
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    instagram:
      '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/>',
    whatsapp:
      '<path d="M3.5 20.5l1.3-4.3A8.6 8.6 0 1 1 8 19.3l-4.5 1.2Z"/><path d="M9.2 8.4c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .5-.1.7l-.5.6c-.1.2-.1.4 0 .5.6 1.1 1.5 1.9 2.6 2.5.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.6v.4c0 .4-.2.8-.5 1-.6.4-1.3.6-2 .5-2.9-.6-5.3-3-5.9-5.9-.1-.9.1-1.8.6-2.6Z"/>',
    flame:
      '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    wine: '<path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/><path d="M7.3 9h9.4"/>',
    candle:
      '<path d="M9.5 10.5h5V21h-5z"/><path d="M12 3c1.2 1.4 1.8 2.5 1.8 3.4A1.8 1.8 0 0 1 12 8.2a1.8 1.8 0 0 1-1.8-1.8C10.2 5.5 10.8 4.4 12 3Z"/><path d="M6.5 21h11"/>',
    star: '<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5z" fill="currentColor" stroke="none"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    chili:
      '<path d="M17.5 7.5c.3-1.8 1.4-3 3-3.5"/><path d="M14.2 7.2c2.9-.9 5.5 1.3 4.9 4.6C18 18 10.6 21.5 3 21c.4-1.6 1.6-2.6 3.4-3.4 3.5-1.6 4.6-4.2 5-7 .2-1.6 1.1-2.9 2.8-3.4Z"/>',
    crown: '<path d="m2.5 6 3.5 11h12l3.5-11-6 5-3.5-6-3.5 6-6-5Z"/><path d="M6 20.5h12"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    pizza: '<path d="M12 21 3.2 6.6A16 16 0 0 1 20.8 6.6Z"/><path d="M4.6 8.9a13.5 13.5 0 0 1 14.8 0"/><circle cx="10" cy="11" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="12" cy="16" r=".8"/>',
    pasta: '<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M9 12V3M12 12V2M15 12V4"/>',
    plate:
      '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="4"/><path d="M2 3v6a2 2 0 0 0 2 2M3 3v18M22 3v18M22 3c-2 0-3 2-3 5s1 4 3 4"/>',
    dessert:
      '<path d="M4 20h16M5 20v-6h14v6M7 14V10h10v4M12 10V7"/><path d="M12 3c.8.9 1.2 1.6 1.2 2.2a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.3 1.2-2.2Z"/>',
    glass: '<path d="M4 3h16l-8 9Z"/><path d="M12 12v9M8 21h8"/><path d="M7 6.5h10"/>',
    wheat:
      '<path d="M12 22V9"/><path d="M12 9c0-2.5 1.5-4.5 4-5-.1 2.6-1.6 4.6-4 5Zm0 0c0-2.5-1.5-4.5-4-5 .1 2.6 1.6 4.6 4 5Zm0 5c0-2.5 1.5-4.5 4-5-.1 2.6-1.6 4.6-4 5Zm0 0c0-2.5-1.5-4.5-4-5 .1 2.6 1.6 4.6 4 5Zm0 5c0-2.5 1.5-4.5 4-5-.1 2.6-1.6 4.6-4 5Zm0 0c0-2.5-1.5-4.5-4-5 .1 2.6 1.6 4.6 4 5Z"/>',
    heart:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M6.3 17.7l2.4-2.4M15.3 8.7l2.4-2.4"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  };

  const svg = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${
      ICONS[name] || ""
    }</svg>`;
  const icon = (name, extraClass = "") => `<span class="icon ${extraClass}" aria-hidden="true">${svg(name)}</span>`;

  function hydrateIcons(root = document) {
    $$("[data-icon]", root).forEach((el) => {
      const name = el.getAttribute("data-icon");
      if (!ICONS[name]) return;
      el.classList.add("icon");
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = svg(name);
      el.removeAttribute("data-icon");
    });
  }

  /* ------------------------------------------------------------------------
     Canal de contato: WhatsApp (se configurado) ou Direct do Instagram
     ------------------------------------------------------------------------ */
  const hasWhatsApp = /^\d{12,13}$/.test(String(CFG.whatsapp || ""));
  const igUser = (CFG.instagram && CFG.instagram.user) || "";
  const igUrl = (CFG.instagram && CFG.instagram.url) || `https://www.instagram.com/${igUser}/`;
  const igDM = `https://ig.me/m/${igUser}`;
  const channel = hasWhatsApp ? { name: "WhatsApp", icon: "whatsapp" } : { name: "Direct do Instagram", icon: "instagram" };

  // Origem do visitante (link da bio, anúncios…) para personalizar a mensagem.
  const origin = (() => {
    try {
      const params = new URLSearchParams(location.search);
      const src = (params.get("utm_source") || "").toLowerCase();
      if (src) sessionStorage.setItem("calabouco:origin", src);
      const saved = src || sessionStorage.getItem("calabouco:origin") || "";
      if (saved.includes("insta") || saved === "ig" || /instagram/i.test(document.referrer)) return "Instagram";
    } catch (e) {
      if (/instagram/i.test(document.referrer)) return "Instagram";
    }
    return "site";
  })();

  const greeting = () => `Olá, ${CFG.shortName || "Calabouço"}! Vim pelo ${origin}`;
  const waLink = (text) => `https://wa.me/${CFG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  const contactHref = (text) => (hasWhatsApp ? waLink(text) : igDM);

  function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* ignora */
    }
    ta.remove();
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }

  /** Envia uma mensagem pronta pelo canal disponível. Deve ser chamada num clique. */
  function sendMessage(text) {
    if (hasWhatsApp) {
      window.open(waLink(text), "_blank", "noopener");
      return;
    }
    copyText(text);
    window.open(igDM, "_blank", "noopener");
    toast("Mensagem copiada! Cole no Direct do Instagram para enviar.", "copy", 5200);
  }

  /* ------------------------------------------------------------------------
     Horários de funcionamento
     ------------------------------------------------------------------------ */
  const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const DAY_ABBR = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

  const toMin = (hhmm) => {
    const [h, m] = String(hhmm).split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const fmtHour = (hhmm) => {
    const [h, m] = String(hhmm).split(":");
    return `${String(Number(h))}h${m && m !== "00" ? m : ""}`;
  };
  // Em frases ("até meia-noite") fica mais natural do que "até 0h"
  const fmtUntil = (hhmm) => (toMin(hhmm) === 0 ? "meia-noite" : fmtHour(hhmm));
  const hoursFor = (day) => (CFG.hours || []).find((h) => h.day === day) || { day, closed: true };
  const hoursText = (h) => (h.closed ? "Fechado" : `${fmtHour(h.open)} – ${fmtHour(h.close)}`);

  function openStatus(now = new Date()) {
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const span = (h) => {
      if (h.closed) return null;
      const o = toMin(h.open);
      let c = toMin(h.close);
      if (c <= o) c += 1440;
      return [o, c];
    };
    const today = span(hoursFor(day));
    if (today && mins >= today[0] && mins < today[1]) {
      return { open: true, label: `Aberto agora · até ${fmtUntil(hoursFor(day).close)}` };
    }
    const prevDay = (day + 6) % 7;
    const prev = span(hoursFor(prevDay));
    if (prev && prev[1] > 1440 && mins < prev[1] - 1440) {
      return { open: true, label: `Aberto agora · até ${fmtUntil(hoursFor(prevDay).close)}` };
    }
    if (today && mins < today[0]) return { open: false, label: `Fechado · abre hoje às ${fmtHour(hoursFor(day).open)}` };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      const h = hoursFor(d);
      if (!h.closed) {
        const when = i === 1 ? "amanhã" : DAY_NAMES[d].toLowerCase();
        return { open: false, label: `Fechado · abre ${when} às ${fmtHour(h.open)}` };
      }
    }
    return { open: false, label: "Fechado" };
  }

  function groupedHours() {
    const groups = [];
    WEEK_ORDER.forEach((d) => {
      const text = hoursText(hoursFor(d));
      const last = groups[groups.length - 1];
      if (last && last.text === text) last.days.push(d);
      else groups.push({ text, days: [d] });
    });
    return groups.map((g) => ({
      label: g.days.length === 1 ? DAY_NAMES[g.days[0]] : `${DAY_ABBR[g.days[0]]} – ${DAY_ABBR[g.days[g.days.length - 1]]}`,
      text: g.text,
      today: g.days.includes(new Date().getDay()),
    }));
  }

  function hoursSummary() {
    const openDays = WEEK_ORDER.filter((d) => !hoursFor(d).closed);
    if (!openDays.length) return "Consulte horários";
    const first = WEEK_ORDER.indexOf(openDays[0]);
    const contiguous = openDays.every((d, i) => WEEK_ORDER.indexOf(d) === first + i);
    const days =
      contiguous && openDays.length > 1
        ? `${DAY_ABBR[openDays[0]]} a ${DAY_ABBR[openDays[openDays.length - 1]]}`
        : openDays.map((d) => DAY_ABBR[d]).join(", ");
    const earliest = openDays.map((d) => hoursFor(d).open).sort()[0];
    return `${days}, a partir das ${fmtHour(earliest)}`;
  }

  /* ------------------------------------------------------------------------
     Dados do negócio (config.js) aplicados nas páginas
     ------------------------------------------------------------------------ */
  const addr = CFG.address || {};
  const addressLine = [addr.street, addr.district].filter(Boolean).join(" — ");
  const addressCity = `${addr.city || ""}${addr.state ? "/" + addr.state : ""}${addr.zip ? " · CEP " + addr.zip : ""}`;
  const addressFull = [addr.street, addr.district, addr.city, addr.state, addr.zip].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${CFG.name || ""}, ${addressFull}`)}`;

  function hydrateConfig() {
    const text = {
      phone: (CFG.phone && CFG.phone.display) || "",
      "address-line": addressLine,
      "address-city": addressCity,
      "address-full": addressFull,
      "instagram-handle": igUser ? `@${igUser}` : "",
      "hours-summary": hoursSummary(),
      "channel-name": channel.name,
      year: String(new Date().getFullYear()),
    };
    $$("[data-config]").forEach((el) => {
      const key = el.getAttribute("data-config");
      if (key in text && text[key]) el.textContent = text[key];
    });

    const ext = (a, href) => {
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
    };
    $$('[data-link="tel"]').forEach((a) => (a.href = `tel:${(CFG.phone && CFG.phone.tel) || ""}`));
    $$('[data-link="instagram"]').forEach((a) => ext(a, igUrl));
    $$('[data-link="maps"]').forEach((a) => ext(a, mapsUrl));
    $$('[data-link="contact"]').forEach((a) => ext(a, contactHref(`${greeting()} e gostaria de mais informações.`)));
    $$('[data-link="reserve"]').forEach((a) => ext(a, contactHref(`${greeting()} e gostaria de reservar uma mesa.`)));
    if (!hasWhatsApp) $$("[data-whatsapp-only]").forEach((el) => el.remove());
    $$("[data-channel-icon]").forEach((el) => (el.innerHTML = icon(channel.icon)));

    $$("[data-hours-list]").forEach((ul) => {
      ul.innerHTML = groupedHours()
        .map((g) => `<li class="${g.today ? "is-today" : ""}"><span>${g.label}</span><span>${g.text}</span></li>`)
        .join("");
    });
    $$("[data-hours-table]").forEach((tbody) => {
      const today = new Date().getDay();
      tbody.innerHTML = WEEK_ORDER.map((d) => {
        const h = hoursFor(d);
        return `<tr class="${d === today ? "is-today" : ""}"><td>${DAY_NAMES[d]}${d === today ? " (hoje)" : ""}</td><td>${hoursText(h)}</td></tr>`;
      }).join("");
    });
    $$("[data-open-status]").forEach((el) => {
      const s = openStatus();
      el.textContent = s.label;
      el.classList.add(s.open ? "is-open" : "is-closed");
    });
    $$("[data-map]").forEach((frame) => {
      frame.src = `https://www.google.com/maps?q=${encodeURIComponent(addressFull)}&output=embed`;
    });

    injectStructuredData();
  }

  function injectStructuredData() {
    const data = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: CFG.name,
      servesCuisine: ["Pizza", "Italiana", "Massas"],
      priceRange: "R$ 80 – R$ 180",
      url: location.origin + location.pathname.replace(/[^/]*$/, ""),
      telephone: CFG.phone && CFG.phone.tel,
      sameAs: [igUrl],
      acceptsReservations: true,
      address: {
        "@type": "PostalAddress",
        streetAddress: addr.street,
        addressLocality: addr.city,
        addressRegion: addr.state,
        postalCode: addr.zip,
        addressCountry: "BR",
      },
      openingHoursSpecification: (CFG.hours || [])
        .filter((h) => !h.closed)
        .map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][h.day],
          opens: h.open,
          closes: h.close,
        })),
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------------
     Imagens: fallback quando a foto não carrega
     ------------------------------------------------------------------------ */
  function markFallback(img) {
    const wrap = img.closest(".media");
    if (wrap) wrap.classList.add("is-fallback");
  }
  document.addEventListener(
    "error",
    (e) => {
      if (e.target && e.target.tagName === "IMG") markFallback(e.target);
    },
    true
  );
  function checkImages(root = document) {
    $$(".media img", root).forEach((img) => {
      if (img.complete && img.naturalWidth === 0) markFallback(img);
    });
  }

  /* ------------------------------------------------------------------------
     Navegação, animações de entrada e efeitos de rolagem
     ------------------------------------------------------------------------ */
  function initNav() {
    const toggle = $(".gnav__toggle");
    const links = $(".gnav__links");
    if (!toggle || !links) return;
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      links.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", links).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 834px)").addEventListener("change", (mq) => mq.matches && setOpen(false));
  }

  let revealObserver = null;
  function observeReveal(root = document) {
    const items = $$(".reveal:not(.is-visible)", root);
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
      );
    }
    items.forEach((el) => revealObserver.observe(el));
  }

  // Texto que "acende" palavra por palavra conforme a rolagem (estilo Apple)
  function initScrub() {
    const blocks = $$("[data-scrub]");
    if (!blocks.length) return;
    blocks.forEach((block) => {
      const walk = (node, accent) => {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
              else {
                const s = document.createElement("span");
                s.className = `w${accent ? " accent" : ""}`;
                s.textContent = part;
                frag.appendChild(s);
              }
            });
            child.replaceWith(frag);
          } else if (child.nodeType === 1) {
            walk(child, accent || child.classList.contains("accent"));
          }
        });
      };
      walk(block, false);
    });
    if (reduceMotion) {
      $$("[data-scrub] .w").forEach((w) => w.classList.add("is-lit"));
      return;
    }
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      blocks.forEach((block) => {
        const r = block.getBoundingClientRect();
        const start = vh * 0.85;
        const end = vh * 0.35;
        const progress = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6)));
        const words = block.querySelectorAll(".w");
        const lit = Math.round(progress * words.length);
        words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  // Zoom suave da imagem do banner conforme a rolagem
  function initParallax() {
    const items = $$("[data-parallax]");
    if (!items.length || reduceMotion) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      items.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const p = Math.min(1, Math.max(0, -r.top / r.height));
        el.style.transform = `scale(${1.08 - p * 0.06}) translateY(${p * 6}%)`;
      });
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  // Galerias horizontais com setas
  function initScrollers(root = document) {
    $$("[data-scroller]", root).forEach((sc) => {
      if (sc.dataset.ready) return;
      sc.dataset.ready = "1";
      const track = $(".scroller__track", sc);
      const prev = $("[data-scroll-prev]", sc);
      const next = $("[data-scroll-next]", sc);
      if (!track) return;
      const step = () => {
        const card = track.firstElementChild;
        return card ? card.getBoundingClientRect().width + 20 : 320;
      };
      const update = () => {
        if (prev) prev.disabled = track.scrollLeft <= 4;
        if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      };
      prev && prev.addEventListener("click", () => track.scrollBy({ left: -step() * 2, behavior: "smooth" }));
      next && next.addEventListener("click", () => track.scrollBy({ left: step() * 2, behavior: "smooth" }));
      track.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
  }

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */
  let toastTimer;
  function toast(message, iconName = "check", duration = 2600, action) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = `${icon(iconName)}<span>${escapeHTML(message)}</span>${
      action ? `<button type="button" data-toast-action>${escapeHTML(action.label)}</button>` : ""
    }`;
    if (action) $("[data-toast-action]", el).addEventListener("click", action.onClick, { once: true });
    requestAnimationFrame(() => el.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), duration);
  }
  const hideToast = () => {
    const el = $(".toast");
    if (el) el.classList.remove("is-visible");
  };

  /* ------------------------------------------------------------------------
     Renderização de produtos, avaliações e Instagram
     ------------------------------------------------------------------------ */
  const TAG_INFO = {
    vegetariano: { label: "Vegetariano", icon: "leaf" },
    picante: { label: "Picante", icon: "chili" },
    assinatura: { label: "Assinatura", icon: "crown" },
  };
  const catOf = (item) => CATEGORIES.find((c) => c.id === item.cat) || {};
  const fbClass = (item) => `fb-${catOf(item).fb || "plate"}`;
  const tagsHTML = (item) =>
    item.tags
      .filter((t) => TAG_INFO[t])
      .map((t) => `<span class="tag tag--${t}">${icon(TAG_INFO[t].icon)}${TAG_INFO[t].label}</span>`)
      .join("");

  // Miniatura leve para fotos do Unsplash; fotos locais são usadas como estão.
  function sized(src, w) {
    const m = String(src).match(/images\.unsplash\.com\/photo-([\w-]+)/);
    return m ? IMG(m[1], w) : src;
  }

  function addButton(item, extra = "") {
    return `<button class="add-btn ${extra}" type="button" data-add="${item.id}" aria-label="Adicionar ${escapeHTML(
      item.name
    )} à sacola">${icon("plus")}</button>`;
  }

  /** Cartão vertical (vitrines e grade do cardápio no desktop). */
  function productCard(item, i = 0) {
    const signature = item.tags.includes("assinatura");
    return `
      <article class="product-card reveal" style="--delay:${Math.min(i, 6) * 0.05}s" data-product="${item.id}" tabindex="0" aria-label="${escapeHTML(item.name)}, ${formatPrice(item.price)}">
        ${signature ? '<span class="badge-float">Assinatura</span>' : ""}
        <div class="media ${fbClass(item)}"><img src="${sized(item.img, 700)}" alt="${escapeHTML(item.name)}" loading="lazy" decoding="async" width="700" height="700"></div>
        <div class="product-card__body">
          <p class="product-card__eyebrow">${escapeHTML(catOf(item).short || "")}</p>
          <h3 class="product-card__name">${escapeHTML(item.name)}</h3>
          <p class="product-card__desc">${escapeHTML(item.desc)}</p>
          <div class="product-card__foot">
            <span class="price">${formatPrice(item.price)}</span>
            ${addButton(item)}
          </div>
        </div>
      </article>`;
  }

  /** Linha com miniatura à direita (cardápio no celular, estilo iFood). */
  function productRow(item) {
    return `
      <article class="product-row" data-product="${item.id}" tabindex="0" aria-label="${escapeHTML(item.name)}, ${formatPrice(item.price)}">
        <div>
          <h3 class="product-row__name">${escapeHTML(item.name)}</h3>
          <p class="product-row__desc">${escapeHTML(item.desc)}</p>
          <div class="product-row__meta"><span class="price">${formatPrice(item.price)}</span>${tagsHTML(item)}</div>
        </div>
        <div class="product-row__thumb media ${fbClass(item)}">
          <img src="${sized(item.img, 240)}" alt="" loading="lazy" decoding="async" width="104" height="104">
          ${addButton(item)}
        </div>
      </article>`;
  }

  function renderFeatured() {
    $$("[data-featured]").forEach((track) => {
      const items = MENU.filter((m) => m.featured).slice(0, Number(track.dataset.limit) || 12);
      track.innerHTML = items.map(productCard).join("");
    });
  }

  function renderReviews() {
    $$("[data-reviews]").forEach((grid) => {
      const limit = Number(grid.dataset.limit) || TESTIMONIALS.length;
      grid.innerHTML = TESTIMONIALS.slice(0, limit)
        .map((t, i) => {
          const initials = t.name
            .replace(/[^A-Za-zÀ-ú& ]/g, "")
            .split(/\s+/)
            .filter((w) => w && w !== "&")
            .slice(0, 2)
            .map((w) => w[0])
            .join("");
          return `
          <figure class="review reveal" style="--delay:${(i % 3) * 0.06}s">
            <div class="review__head">
              <span class="avatar" aria-hidden="true">${escapeHTML(initials)}</span>
              <figcaption>
                <div class="review__name">${escapeHTML(t.name)}</div>
                <div class="review__occasion">${escapeHTML(t.occasion)}</div>
              </figcaption>
            </div>
            <div class="stars" role="img" aria-label="${t.rating} de 5 estrelas">${icon("star").repeat(t.rating)}</div>
            <blockquote class="review__text">${escapeHTML(t.text)}</blockquote>
          </figure>`;
        })
        .join("");
    });
  }

  function renderInstagram() {
    $$("[data-insta-grid]").forEach((grid) => {
      const shots = [
        ["1513104890138-7c749659a591", "Pizza recém-saída do forno", "pizza"],
        ["1414235077428-338989a2e8c0", "Mesa posta para o jantar", "plate"],
        ["1510812431401-41d2bd2722f3", "Brinde com vinho tinto", "wine"],
        ["1473093295043-cdd812d0e601", "Massa artesanal", "pasta"],
        ["1571877227200-a0d98ea607e9", "Tiramisù da casa", "dessert"],
        ["1514362545857-3bc16c4c7d1b", "Drink autoral", "glass"],
      ];
      grid.innerHTML = shots
        .map(
          ([id, alt, fb], i) => `
        <a class="insta-tile reveal" style="--delay:${i * 0.04}s" href="${igUrl}" target="_blank" rel="noopener" aria-label="${alt} — ver no Instagram">
          <div class="media fb-${fb}"><img src="${IMG(id, 600)}" alt="${alt}" loading="lazy" decoding="async"></div>
          <span class="insta-tile__over">${icon("instagram")}</span>
        </a>`
        )
        .join("");
    });
  }

  /* ------------------------------------------------------------------------
     Sacola (carrinho → mensagem pronta)
     ------------------------------------------------------------------------ */
  const BAG_KEY = "calabouco:sacola";
  const bag = {
    items: store.get(BAG_KEY, {}),
    save() {
      store.set(BAG_KEY, this.items);
      updateBagUI();
    },
    add(id, qty = 1) {
      this.items[id] = Math.min((this.items[id] || 0) + qty, 50);
      this.save();
    },
    setQty(id, qty) {
      if (qty <= 0) delete this.items[id];
      else this.items[id] = Math.min(qty, 50);
      this.save();
    },
    clear() {
      this.items = {};
      this.save();
    },
    lines() {
      return Object.entries(this.items)
        .map(([id, qty]) => ({ item: MENU.find((m) => m.id === id), qty }))
        .filter((l) => l.item);
    },
    count() {
      return this.lines().reduce((s, l) => s + l.qty, 0);
    },
    total() {
      return this.lines().reduce((s, l) => s + l.qty * l.item.price, 0);
    },
  };

  function buildShell() {
    const modes = (CFG.orderModes || []).map((m) => `<option>${escapeHTML(m)}</option>`).join("");
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <a class="fab" data-link="contact" href="contato.html" aria-label="Falar com o Calabouço pelo ${channel.name}">${icon(channel.icon)}</a>

      <button class="bag-bar" type="button" data-bag-open aria-label="Ver sacola">
        <span><span class="bag-bar__count" data-bag-count>0</span>Ver sacola</span>
        <span data-bag-total class="tabular">R$ 0</span>
      </button>

      <div class="sheet-backdrop" data-sheet-close></div>
      <div class="sheet" id="product-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-name" aria-hidden="true">
        <button class="icon-btn sheet__close" type="button" data-sheet-close aria-label="Fechar">${icon("x")}</button>
        <div class="sheet__media media" data-sheet-media></div>
        <div class="sheet__body">
          <p class="product-card__eyebrow" data-sheet-cat></p>
          <h2 class="sheet__name" id="sheet-name" data-sheet-name></h2>
          <p class="sheet__meta" data-sheet-meta></p>
          <div class="tags" data-sheet-tags style="margin-top:14px"></div>
          <p class="sheet__desc" data-sheet-desc></p>
          <p class="sheet__price" data-sheet-price></p>
          <div class="sheet__actions">
            <div class="qty" role="group" aria-label="Quantidade">
              <button type="button" data-sheet-qty="-1" aria-label="Diminuir">${icon("minus")}</button>
              <output data-sheet-qty-value aria-live="polite">1</output>
              <button type="button" data-sheet-qty="1" aria-label="Aumentar">${icon("plus")}</button>
            </div>
            <button class="btn btn--primary btn--block" type="button" data-sheet-add>Adicionar</button>
          </div>
        </div>
      </div>

      <div class="drawer-backdrop" data-bag-close></div>
      <aside class="drawer" id="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" aria-hidden="true">
        <div class="drawer__head">
          <h2 id="bag-title">Sacola</h2>
          <button class="icon-btn" type="button" data-bag-close aria-label="Fechar sacola">${icon("x")}</button>
        </div>
        <div class="drawer__body" data-bag-body></div>
        <div class="drawer__foot" data-bag-foot>
          <div class="drawer__total"><span>Total estimado</span><strong data-bag-total>R$ 0</strong></div>
          <div class="field">
            <label class="label" for="bag-mode">Como prefere?</label>
            <select id="bag-mode" class="select">${modes}</select>
          </div>
          <div class="field">
            <label class="label" for="bag-notes">Observações</label>
            <textarea id="bag-notes" class="textarea" rows="2" placeholder="Meia a meia, ponto da carne, alergias…"></textarea>
          </div>
          <button class="btn btn--primary btn--lg btn--block" type="button" data-bag-send>${icon(channel.icon)}Enviar pelo ${channel.name}</button>
          <button class="text-btn" type="button" data-bag-clear>Esvaziar sacola</button>
          <p class="t-micro">${
            hasWhatsApp
              ? "Abriremos o WhatsApp com seu pedido escrito."
              : "Copiaremos o pedido e abriremos o Direct do Instagram — é só colar e enviar."
          } Valores sujeitos a confirmação.</p>
        </div>
      </aside>`
    );
  }

  /* Diálogos (ficha do produto e sacola) com foco preso e retorno de foco */
  const dialogs = { lastFocus: null, open: null };
  function openDialog(el, backdrop) {
    if (dialogs.open) closeDialog();
    dialogs.lastFocus = document.activeElement;
    dialogs.open = { el, backdrop };
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    hideToast();
    setTimeout(() => {
      const first = $("button, [href], select, textarea, input", el);
      if (first) first.focus();
    }, 60);
  }
  function closeDialog() {
    if (!dialogs.open) return;
    const { el, backdrop } = dialogs.open;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    dialogs.open = null;
    if (dialogs.lastFocus && dialogs.lastFocus.focus) dialogs.lastFocus.focus();
  }

  let sheetItem = null;
  let sheetQty = 1;
  function openSheet(id) {
    const item = MENU.find((m) => m.id === id);
    if (!item) return;
    sheetItem = item;
    sheetQty = 1;
    const sheet = $("#product-sheet");
    const media = $("[data-sheet-media]", sheet);
    media.className = `sheet__media media ${fbClass(item)}`;
    media.innerHTML = `<img src="${sized(item.img, 1100)}" alt="${escapeHTML(item.name)}" decoding="async">`;
    $("[data-sheet-cat]", sheet).textContent = catOf(item).label || "";
    $("[data-sheet-name]", sheet).textContent = item.name;
    $("[data-sheet-meta]", sheet).textContent = item.meta || "";
    $("[data-sheet-tags]", sheet).innerHTML = tagsHTML(item);
    $("[data-sheet-desc]", sheet).textContent = item.desc;
    $("[data-sheet-price]", sheet).textContent = formatPrice(item.price);
    updateSheet();
    openDialog(sheet, $(".sheet-backdrop"));
    checkImages(media);
  }
  function updateSheet() {
    if (!sheetItem) return;
    $("[data-sheet-qty-value]").textContent = sheetQty;
    $('[data-sheet-qty="-1"]').disabled = sheetQty <= 1;
    $("[data-sheet-add]").textContent = `Adicionar · ${formatPrice(sheetItem.price * sheetQty)}`;
  }

  function updateBagUI() {
    const count = bag.count();
    const total = formatPrice(bag.total());
    document.body.classList.toggle("has-bag", count > 0);
    $$("[data-bag-count]").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
    $$("[data-bag-total]").forEach((el) => (el.textContent = total));
    const barEl = $(".bag-bar");
    if (barEl) barEl.classList.toggle("is-visible", count > 0);

    const body = $("[data-bag-body]");
    const foot = $("[data-bag-foot]");
    if (!body) return;
    const lines = bag.lines();
    if (!lines.length) {
      body.innerHTML = `
        <div class="drawer__empty">
          ${icon("bag")}
          <p>Sua sacola está vazia.</p>
          <p style="margin-top:10px"><a class="link" href="cardapio.html">Ver o cardápio ${icon("chevron-right")}</a></p>
        </div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = lines
      .map(
        ({ item, qty }) => `
        <div class="bag-item">
          <div class="media ${fbClass(item)}"><img src="${sized(item.img, 160)}" alt="" loading="lazy"></div>
          <div>
            <p class="bag-item__name">${escapeHTML(item.name)}</p>
            <p class="bag-item__price">${formatPrice(item.price * qty)}</p>
          </div>
          <div class="qty qty--sm" role="group" aria-label="Quantidade de ${escapeHTML(item.name)}">
            <button type="button" data-qty="${item.id}" data-delta="-1" aria-label="Diminuir">${icon(qty === 1 ? "trash" : "minus")}</button>
            <output aria-live="polite">${qty}</output>
            <button type="button" data-qty="${item.id}" data-delta="1" aria-label="Aumentar">${icon("plus")}</button>
          </div>
        </div>`
      )
      .join("");
    checkImages(body);
  }

  function bagMessage() {
    const lines = bag.lines().map(({ item, qty }) => `• ${qty}x ${item.name} — ${formatPrice(item.price * qty)}`);
    const mode = ($("#bag-mode") || {}).value;
    const notes = (($("#bag-notes") || {}).value || "").trim();
    const parts = [`${greeting()} e gostaria de fazer este pedido:`, "", ...lines, "", `Total estimado: ${formatPrice(bag.total())}`];
    if (mode) parts.push(`Preferência: ${mode}`);
    if (notes) parts.push(`Observações: ${notes}`);
    return parts.join("\n");
  }

  function addToBag(item, qty = 1, button) {
    bag.add(item.id, qty);
    if (button) {
      button.classList.add("is-added");
      button.innerHTML = icon("check");
      setTimeout(() => {
        button.classList.remove("is-added");
        button.innerHTML = icon("plus");
      }, 1400);
    }
    toast(`${qty > 1 ? qty + "x " : ""}${item.name} na sacola`, "check", 3200, {
      label: "Ver sacola",
      onClick: openBag,
    });
  }
  function openBag() {
    openDialog($("#bag-drawer"), $(".drawer-backdrop"));
  }

  function initInteractions() {
    buildShell();
    updateBagUI();

    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        e.stopPropagation();
        const item = MENU.find((m) => m.id === add.dataset.add);
        if (item) addToBag(item, 1, add);
        return;
      }
      if (e.target.closest("[data-bag-open]")) return openBag();
      if (e.target.closest("[data-bag-close]") || e.target.closest("[data-sheet-close]")) return closeDialog();
      const q = e.target.closest("[data-qty]");
      if (q) {
        bag.setQty(q.dataset.qty, (bag.items[q.dataset.qty] || 0) + Number(q.dataset.delta));
        return;
      }
      const sq = e.target.closest("[data-sheet-qty]");
      if (sq) {
        sheetQty = Math.max(1, Math.min(50, sheetQty + Number(sq.dataset.sheetQty)));
        updateSheet();
        return;
      }
      if (e.target.closest("[data-sheet-add]")) {
        if (sheetItem) {
          const item = sheetItem;
          const qty = sheetQty;
          closeDialog();
          addToBag(item, qty);
        }
        return;
      }
      if (e.target.closest("[data-bag-clear]")) return bag.clear();
      if (e.target.closest("[data-bag-send]")) {
        if (bag.count()) sendMessage(bagMessage());
        return;
      }
      const product = e.target.closest("[data-product]");
      if (product) openSheet(product.dataset.product);
    });

    document.addEventListener("keydown", (e) => {
      const product = e.target.closest && e.target.closest("[data-product]");
      if (product && (e.key === "Enter" || e.key === " ") && e.target === product) {
        e.preventDefault();
        openSheet(product.dataset.product);
        return;
      }
      if (!dialogs.open) return;
      if (e.key === "Escape") return closeDialog();
      if (e.key === "Tab") {
        const focusables = $$("button:not([disabled]), a[href], select, textarea, input", dialogs.open.el).filter(
          (el) => !el.closest("[hidden]") && el.offsetParent !== null
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     API pública para os scripts de cada página
     ------------------------------------------------------------------------ */
  window.Calabouco = {
    $,
    $$,
    icon,
    hydrateIcons,
    escapeHTML,
    formatPrice,
    productCard,
    productRow,
    tagsHTML,
    openSheet,
    observeReveal,
    checkImages,
    initScrollers,
    toast,
    sendMessage,
    greeting,
    channel,
    hasWhatsApp,
    openStatus,
    hoursFor,
    toMin,
    fmtHour,
    DAY_NAMES,
    DAY_ABBR,
    TAG_INFO,
    store,
    bag,
  };

  /* ------------------------------------------------------------------------
     Inicialização
     ------------------------------------------------------------------------ */
  function init() {
    hydrateIcons();
    renderFeatured();
    renderReviews();
    renderInstagram();
    initInteractions();
    hydrateConfig();
    initNav();
    initScrollers();
    initScrub();
    initParallax();
    observeReveal();
    checkImages();
    window.Calabouco.ready = true;
    document.dispatchEvent(new CustomEvent("calabouco:ready"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
