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

  const escapeHTML = (str = "") =>
    String(str).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

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
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
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
    utensils:
      '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    quote:
      '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .01-1 1.03V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
    heart:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    wheat:
      '<path d="M12 22V9"/><path d="M12 9c0-2.5 1.5-4.5 4-5-.1 2.6-1.6 4.6-4 5Zm0 0c0-2.5-1.5-4.5-4-5 .1 2.6 1.6 4.6 4 5Zm0 5c0-2.5 1.5-4.5 4-5-.1 2.6-1.6 4.6-4 5Zm0 0c0-2.5-1.5-4.5-4-5 .1 2.6 1.6 4.6 4 5Zm0 5c0-2.5 1.5-4.5 4-5-.1 2.6-1.6 4.6-4 5Zm0 0c0-2.5-1.5-4.5-4-5 .1 2.6 1.6 4.6 4 5Z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  };

  const icon = (name, extraClass = "") =>
    `<span class="icon ${extraClass}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg></span>`;

  function hydrateIcons(root = document) {
    $$("[data-icon]", root).forEach((el) => {
      const name = el.getAttribute("data-icon");
      if (!ICONS[name]) return;
      el.classList.add("icon");
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
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
  const channel = hasWhatsApp
    ? { name: "WhatsApp", icon: "whatsapp" }
    : { name: "Direct do Instagram", icon: "instagram" };

  // Origem do visitante (link da bio, anúncios, etc.) para personalizar a mensagem.
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

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }
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
    return `${h === "00" ? "00" : String(Number(h))}h${m && m !== "00" ? m : ""}`;
  };
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
      return { open: true, label: `Aberto agora · até ${fmtHour(hoursFor(day).close)}` };
    }
    const prev = span(hoursFor((day + 6) % 7));
    if (prev && prev[1] > 1440 && mins < prev[1] - 1440) {
      return { open: true, label: `Aberto agora · até ${fmtHour(hoursFor((day + 6) % 7).close)}` };
    }
    if (today && mins < today[0])
      return { open: false, label: `Fechado · abre hoje às ${fmtHour(hoursFor(day).open)}` };
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
      label:
        g.days.length === 1 ? DAY_NAMES[g.days[0]] : `${DAY_ABBR[g.days[0]]} – ${DAY_ABBR[g.days[g.days.length - 1]]}`,
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
    return `${days} · a partir das ${fmtHour(earliest)}`;
  }

  /* ------------------------------------------------------------------------
     Preenchimento de dados do negócio (config.js)
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

    $$('[data-link="tel"]').forEach((a) => (a.href = `tel:${(CFG.phone && CFG.phone.tel) || ""}`));
    $$('[data-link="instagram"]').forEach((a) => {
      a.href = igUrl;
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$('[data-link="maps"]').forEach((a) => {
      a.href = mapsUrl;
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$('[data-link="contact"]').forEach((a) => {
      a.href = contactHref(`${greeting()} e gostaria de mais informações.`);
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$('[data-link="reserve"]').forEach((a) => {
      a.href = contactHref(`${greeting()} e gostaria de reservar uma mesa.`);
      a.target = "_blank";
      a.rel = "noopener";
    });
    if (!hasWhatsApp) $$("[data-whatsapp-only]").forEach((el) => el.remove());
    $$("[data-channel-icon]").forEach((el) => {
      el.innerHTML = icon(channel.icon);
    });

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
     Imagens: fallback elegante quando a foto não carrega
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
    true,
  );
  function checkImages(root = document) {
    $$(".media img", root).forEach((img) => {
      if (img.complete && img.naturalWidth === 0) markFallback(img);
    });
  }

  /* ------------------------------------------------------------------------
     Header, menu mobile e animações de entrada
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = $("[data-header]");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = $(".nav-toggle");
    const nav = $("#site-nav");
    if (!toggle || !nav) return;
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 921px)").addEventListener("change", (mq) => mq.matches && setOpen(false));
  }

  let revealObserver = null;
  function observeReveal(root = document) {
    const items = $$(".reveal:not(.is-visible)", root);
    if (!("IntersectionObserver" in window)) {
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
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
    }
    items.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */
  let toastTimer;
  function toast(message, iconName = "check", duration = 2600) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = `${icon(iconName)}<span>${escapeHTML(message)}</span>`;
    requestAnimationFrame(() => el.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), duration);
  }

  /* ------------------------------------------------------------------------
     Renderização: cards de prato, categorias, depoimentos, Instagram
     ------------------------------------------------------------------------ */
  const TAG_INFO = {
    vegetariano: { label: "Vegetariano", icon: "leaf" },
    picante: { label: "Picante", icon: "chili" },
    assinatura: { label: "Assinatura da casa", icon: "crown" },
  };

  function dishCard(item, i = 0) {
    const badges = [];
    if (item.tags.includes("assinatura"))
      badges.push(`<span class="badge badge--red">${icon("crown")}Assinatura</span>`);
    const tags = item.tags
      .filter((t) => TAG_INFO[t])
      .map(
        (t) =>
          `<li class="diet-tag diet-tag--${t}" title="${TAG_INFO[t].label}">${icon(TAG_INFO[t].icon)}<span class="sr-only">${TAG_INFO[t].label}</span></li>`,
      )
      .join("");
    return `
      <article class="dish-card reveal" style="--delay:${Math.min(i, 6) * 0.06}s">
        <div class="media">
          <img src="${item.img}" alt="${escapeHTML(item.name)}" loading="lazy" decoding="async" width="900" height="675">
        </div>
        ${badges.length ? `<div class="dish-card__badges">${badges.join("")}</div>` : ""}
        <div class="dish-card__body">
          <div class="dish-card__head">
            <h3 class="dish-card__name">${escapeHTML(item.name)}</h3>
            <span class="dish-card__price">${formatPrice(item.price)}</span>
          </div>
          ${item.meta ? `<p class="dish-card__meta">${escapeHTML(item.meta)}</p>` : ""}
          <p class="dish-card__desc">${escapeHTML(item.desc)}</p>
          <div class="dish-card__foot">
            <ul class="diet-tags">${tags}</ul>
            <button class="btn-add" type="button" data-add="${item.id}" aria-label="Adicionar ${escapeHTML(item.name)} à minha seleção">
              ${icon("plus")}<span>Adicionar</span>
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderFeatured() {
    const grid = $("[data-featured-grid]");
    if (!grid) return;
    const items = MENU.filter((m) => m.featured).slice(0, Number(grid.dataset.limit) || 4);
    grid.innerHTML = items.map(dishCard).join("");
  }

  function renderCategories() {
    const grid = $("[data-cat-grid]");
    if (!grid) return;
    grid.innerHTML = CATEGORIES.map((c, i) => {
      const count = MENU.filter((m) => m.cat === c.id).length;
      return `
        <a class="cat-tile reveal" style="--delay:${i * 0.05}s" href="cardapio.html?cat=${c.id}">
          <div class="media"><img src="${c.img}" alt="" loading="lazy" decoding="async"></div>
          <div class="cat-tile__body">
            <div>
              <h3 class="cat-tile__name">${escapeHTML(c.label)}</h3>
              <span class="cat-tile__count">${count} ${count === 1 ? "opção" : "opções"}</span>
            </div>
            <span class="cat-tile__arrow">${icon("arrow-right")}</span>
          </div>
        </a>`;
    }).join("");
  }

  function renderTestimonials() {
    $$("[data-testimonials]").forEach((grid) => {
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
          <figure class="testimonial reveal" style="--delay:${(i % 3) * 0.08}s">
            ${icon("quote", "testimonial__quote-icon")}
            <div class="stars" aria-label="${t.rating} de 5 estrelas">${icon("star").repeat(t.rating)}</div>
            <blockquote>“${escapeHTML(t.text)}”</blockquote>
            <figcaption>
              <span class="avatar" aria-hidden="true">${escapeHTML(initials)}</span>
              <span>
                <span class="testimonial__name">${escapeHTML(t.name)}</span><br>
                <span class="testimonial__occasion">${escapeHTML(t.occasion)}</span>
              </span>
            </figcaption>
          </figure>`;
        })
        .join("");
    });
  }

  function renderInstagram() {
    const grid = $("[data-insta-grid]");
    if (!grid) return;
    const shots = [
      ["1559339352-11d035aa65de", "Salão à meia-luz"],
      ["1513104890138-7c749659a591", "Pizza recém-saída do forno"],
      ["1510812431401-41d2bd2722f3", "Brinde com vinho tinto"],
      ["1473093295043-cdd812d0e601", "Massa artesanal"],
      ["1571877227200-a0d98ea607e9", "Tiramisù da casa"],
      ["1514362545857-3bc16c4c7d1b", "Drink autoral"],
    ];
    grid.innerHTML = shots
      .map(
        ([id, alt], i) => `
        <a class="insta-tile reveal" style="--delay:${i * 0.05}s" href="${igUrl}" target="_blank" rel="noopener" aria-label="${alt} — ver no Instagram">
          <div class="media"><img src="${IMG(id, 500)}" alt="${alt}" loading="lazy" decoding="async"></div>
          <span class="insta-tile__over">${icon("instagram")}</span>
        </a>`,
      )
      .join("");
  }

  /* ------------------------------------------------------------------------
     Minha seleção (carrinho → mensagem pronta)
     ------------------------------------------------------------------------ */
  const CART_KEY = "calabouco:selecao";
  const cart = {
    items: store.get(CART_KEY, {}),
    save() {
      store.set(CART_KEY, this.items);
      updateCartUI();
    },
    add(id) {
      this.items[id] = (this.items[id] || 0) + 1;
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

  function buildCartUI() {
    const modes = (CFG.orderModes || []).map((m) => `<option>${escapeHTML(m)}</option>`).join("");
    const html = `
      <div class="fab-stack">
        <button class="fab fab--bag" type="button" data-cart-open aria-label="Abrir minha seleção" hidden>
          ${icon("bag")}<span class="fab__count" data-cart-count>0</span>
        </button>
        <a class="fab fab--contact" data-link="contact" href="contato.html" aria-label="Falar com o Calabouço pelo ${channel.name}">
          ${icon(channel.icon)}
        </a>
      </div>
      <aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">
        <div class="drawer__head">
          <h2 id="cart-title">Minha seleção</h2>
          <button class="icon-btn" type="button" data-cart-close aria-label="Fechar seleção">${icon("x")}</button>
        </div>
        <div class="drawer__body" data-cart-body></div>
        <div class="drawer__foot" data-cart-foot>
          <div class="drawer__total"><span>Total estimado</span><strong data-cart-total>R$ 0</strong></div>
          <div class="field">
            <label for="cart-mode">Como prefere?</label>
            <select id="cart-mode" class="select">${modes}</select>
          </div>
          <div class="field">
            <label for="cart-notes">Observações</label>
            <textarea id="cart-notes" class="textarea" rows="2" placeholder="Ex.: meia a meia, ponto da carne, alergias…"></textarea>
          </div>
          <button class="btn btn--primary btn--block" type="button" data-cart-send>${icon(channel.icon)}Enviar pelo ${channel.name}</button>
          <button class="link-arrow" type="button" data-cart-clear style="justify-self:center">${icon("trash")}Limpar seleção</button>
          <p class="drawer__note">${
            hasWhatsApp
              ? "Abriremos o WhatsApp com sua mensagem pronta."
              : "Copiaremos a mensagem e abriremos o Direct do Instagram — é só colar e enviar."
          } Valores sujeitos a confirmação pela equipe.</p>
        </div>
      </aside>
      <div class="drawer-backdrop" data-cart-close></div>`;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  let lastFocus = null;
  function openCart() {
    const drawer = $("#cart-drawer");
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    $(".drawer-backdrop").classList.add("is-open");
    const t = $(".toast");
    if (t) t.classList.remove("is-visible");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("[data-cart-close]", drawer).focus(), 50);
  }
  function closeCart() {
    const drawer = $("#cart-drawer");
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    $(".drawer-backdrop").classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function updateCartUI() {
    const count = cart.count();
    const fab = $("[data-cart-open]");
    if (fab) {
      fab.hidden = count === 0;
      $("[data-cart-count]", fab).textContent = count;
    }
    const body = $("[data-cart-body]");
    const foot = $("[data-cart-foot]");
    if (!body) return;
    const lines = cart.lines();
    if (!lines.length) {
      body.innerHTML = `
        <div class="drawer__empty">
          ${icon("bag")}
          <p>Sua seleção está vazia.</p>
          <p style="margin-top:12px"><a class="link-arrow" href="cardapio.html">Explorar o cardápio ${icon("arrow-right")}</a></p>
        </div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = lines
      .map(
        ({ item, qty }) => `
        <div class="cart-item">
          <div class="media"><img src="${thumb(item.img)}" alt="" loading="lazy"></div>
          <div>
            <p class="cart-item__name">${escapeHTML(item.name)}</p>
            <p class="cart-item__price">${formatPrice(item.price * qty)}</p>
          </div>
          <div class="qty" role="group" aria-label="Quantidade de ${escapeHTML(item.name)}">
            <button type="button" data-qty="${item.id}" data-delta="-1" aria-label="Diminuir">${icon("minus")}</button>
            <output aria-live="polite">${qty}</output>
            <button type="button" data-qty="${item.id}" data-delta="1" aria-label="Aumentar">${icon("plus")}</button>
          </div>
        </div>`,
      )
      .join("");
    $("[data-cart-total]").textContent = formatPrice(cart.total());
    checkImages(body);
  }

  // Miniatura leve para fotos do Unsplash; fotos locais são usadas como estão.
  function thumb(src) {
    const m = String(src).match(/images\.unsplash\.com\/photo-([\w-]+)/);
    return m ? IMG(m[1], 160) : src;
  }

  function cartMessage() {
    const lines = cart.lines().map(({ item, qty }) => `• ${qty}x ${item.name} — ${formatPrice(item.price * qty)}`);
    const mode = ($("#cart-mode") || {}).value;
    const notes = (($("#cart-notes") || {}).value || "").trim();
    const parts = [
      `${greeting()} e gostaria de fazer este pedido:`,
      "",
      ...lines,
      "",
      `Total estimado: ${formatPrice(cart.total())}`,
    ];
    if (mode) parts.push(`Preferência: ${mode}`);
    if (notes) parts.push(`Observações: ${notes}`);
    return parts.join("\n");
  }

  function initCart() {
    buildCartUI();
    updateCartUI();

    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        const item = MENU.find((m) => m.id === add.dataset.add);
        if (!item) return;
        cart.add(item.id);
        add.classList.add("is-added");
        const label = $("span:not(.icon)", add);
        if (label) label.textContent = "Adicionado";
        add.querySelector(".icon").outerHTML = icon("check");
        setTimeout(() => {
          add.classList.remove("is-added");
          if (label) label.textContent = "Adicionar";
          const ic = add.querySelector(".icon");
          if (ic) ic.outerHTML = icon("plus");
        }, 1500);
        const fab = $("[data-cart-open]");
        if (fab) {
          fab.classList.remove("bump");
          void fab.offsetWidth;
          fab.classList.add("bump");
        }
        toast(`${item.name} adicionado à sua seleção`, "check");
        return;
      }
      if (e.target.closest("[data-cart-open]")) return openCart();
      if (e.target.closest("[data-cart-close]")) return closeCart();
      const q = e.target.closest("[data-qty]");
      if (q) {
        const id = q.dataset.qty;
        cart.setQty(id, (cart.items[id] || 0) + Number(q.dataset.delta));
        return;
      }
      if (e.target.closest("[data-cart-clear]")) {
        cart.clear();
        return;
      }
      if (e.target.closest("[data-cart-send]")) {
        if (!cart.count()) return;
        sendMessage(cartMessage());
      }
    });

    document.addEventListener("keydown", (e) => {
      const drawer = $("#cart-drawer");
      if (!drawer || !drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") closeCart();
      if (e.key === "Tab") {
        const focusables = $$("button, a[href], select, textarea, input", drawer).filter(
          (el) => !el.closest("[hidden]"),
        );
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
     API pública para scripts de página (cardápio, contato)
     ------------------------------------------------------------------------ */
  window.Calabouco = {
    $,
    $$,
    icon,
    hydrateIcons,
    escapeHTML,
    formatPrice,
    dishCard,
    observeReveal,
    checkImages,
    toast,
    sendMessage,
    greeting,
    channel,
    hasWhatsApp,
    openStatus,
    hoursFor,
    toMin,
    DAY_NAMES,
    TAG_INFO,
    store,
  };

  /* ------------------------------------------------------------------------
     Inicialização
     ------------------------------------------------------------------------ */
  function init() {
    hydrateIcons();
    renderFeatured();
    renderCategories();
    renderTestimonials();
    renderInstagram();
    initCart();
    hydrateConfig();
    initHeader();
    observeReveal();
    checkImages();
    window.Calabouco.ready = true;
    document.dispatchEvent(new CustomEvent("calabouco:ready"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
