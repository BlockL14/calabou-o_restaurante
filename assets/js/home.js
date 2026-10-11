/* ==========================================================================
   CALABOUÇO — Home
   - Cardápio com abas e paginação (padrão da Best Pizza)
   - Destaques da casa montados a partir do data.js
   - Carrossel de depoimentos com cartão central em destaque
   - Faixa rolante com botão de pausa e luz que segue o cursor no banner
   ========================================================================== */

(function () {
  "use strict";

  function onReady(fn) {
    if (window.Calabouco && window.Calabouco.ready) fn();
    else document.addEventListener("calabouco:ready", fn, { once: true });
  }

  onReady(() => {
    const C = window.Calabouco;
    const MENU = window.CALABOUCO_MENU || [];
    const CATEGORIES = window.CALABOUCO_CATEGORIES || [];
    const TESTIMONIALS = window.CALABOUCO_TESTIMONIALS || [];
    const IMG = window.CALABOUCO_IMG || ((id) => id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const esc = C.escapeHTML;

    const catOf = (item) => CATEGORIES.find((c) => c.id === item.cat) || {};
    const fbClass = (item) => `fb-${catOf(item).fb || "plate"}`;
    // Miniatura leve para fotos do Unsplash; fotos locais são usadas como estão.
    const sized = (src, w) => {
      const m = String(src).match(/images\.unsplash\.com\/photo-([\w-]+)/);
      return m ? IMG(m[1], w) : src;
    };

    /* ----------------------------------------------------------------------
       Cardápio: abas + paginação
       ---------------------------------------------------------------------- */
    const GROUPS = [
      { id: "pizzas", label: "Pizzas", cats: ["pizzas-da-casa", "pizzas-tradicionais"] },
      { id: "entradas", label: "Entradas", cats: ["entradas"] },
      { id: "massas", label: "Massas", cats: ["massas"] },
      { id: "pratos", label: "Pratos", cats: ["pratos-principais"] },
      { id: "sobremesas", label: "Sobremesas", cats: ["sobremesas"] },
      { id: "bebidas", label: "Bebidas", cats: ["bebidas"] },
    ]
      .map((g) => ({
        ...g,
        // Pratos marcados como "featured" aparecem primeiro na aba
        items: MENU.filter((m) => g.cats.includes(m.cat)).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)),
      }))
      .filter((g) => g.items.length);

    const PER_PAGE = 6;

    function menuCard(item, i, animate) {
      const signature = item.tags.includes("assinatura");
      const price = C.formatPrice(item.price);
      return `
        <article class="menu-card${animate ? " menu-card--in" : ""}" style="--i:${i}" data-product="${item.id}">
          ${signature ? `<span class="tag tag--assinatura">${C.icon("crown")}Assinatura</span>` : ""}
          <div class="menu-card__img media ${fbClass(item)}"><img src="${sized(item.img, 420)}" alt="" loading="lazy" decoding="async" width="420" height="420"></div>
          <div class="menu-card__body">
            <h3 class="menu-card__name"><button class="menu-card__open" type="button" aria-label="${esc(item.name)}, ${price} — ver detalhes">${esc(item.name)}</button></h3>
            <p class="menu-card__desc">${esc(item.desc)}</p>
            <p class="menu-card__price">${price}</p>
            <button class="btn btn--primary btn--sm" type="button" data-add="${item.id}" aria-label="Adicionar ${esc(item.name)} à sacola">Adicionar</button>
          </div>
        </article>`;
    }

    function initMenu() {
      const tablist = C.$("[data-menu-tabs]");
      const grid = C.$("[data-menu-grid]");
      const pager = C.$("[data-menu-pager]");
      if (!tablist || !grid || !GROUPS.length) return;

      let group = GROUPS[0];
      let page = 0;
      let firstRender = true;

      tablist.innerHTML = GROUPS.map(
        (g, i) =>
          `<button class="tab" type="button" role="tab" id="tab-${g.id}" aria-controls="menu-panel" aria-selected="${
            i === 0
          }" tabindex="${i === 0 ? 0 : -1}" data-group="${g.id}">${esc(g.label)}</button>`
      ).join("");
      const tabs = C.$$(".tab", tablist);

      const pages = () => Math.ceil(group.items.length / PER_PAGE);

      function render() {
        const items = group.items.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
        const animate = !firstRender && !reduceMotion;
        grid.setAttribute("aria-labelledby", `tab-${group.id}`);
        grid.innerHTML = items.map((item, i) => menuCard(item, i, animate)).join("");
        if (firstRender) {
          C.$$(".menu-card", grid).forEach((el, i) => {
            el.classList.add("reveal");
            el.style.setProperty("--delay", `${(i % 2) * 0.06 + Math.floor(i / 2) * 0.05}s`);
          });
          C.observeReveal(grid);
          firstRender = false;
        }
        C.checkImages(grid);

        const total = pages();
        if (pager) {
          pager.hidden = total < 2;
          C.$("[data-page-current]", pager).textContent = page + 1;
          C.$("[data-page-total]", pager).textContent = total;
          const prev = C.$('[data-page="-1"]', pager);
          const next = C.$('[data-page="1"]', pager);
          const atStart = page === 0;
          const atEnd = page >= total - 1;
          // Habilita primeiro e move o foco antes de desabilitar, para ele não cair no <body>
          if (!atStart) prev.disabled = false;
          if (!atEnd) next.disabled = false;
          if (atEnd && !atStart && document.activeElement === next) prev.focus();
          if (atStart && !atEnd && document.activeElement === prev) next.focus();
          prev.disabled = atStart;
          next.disabled = atEnd;
        }
      }

      function select(tab, focus) {
        const g = GROUPS.find((x) => x.id === tab.dataset.group);
        if (!g) return;
        tabs.forEach((t) => {
          const on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
        });
        if (focus) tab.focus();
        tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
        if (g === group) return;
        group = g;
        page = 0;
        render();
      }

      tablist.addEventListener("click", (e) => {
        const tab = e.target.closest(".tab");
        if (tab) select(tab, false);
      });
      // Teclado: setas, Home e End percorrem as abas (padrão WAI-ARIA)
      tablist.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        let next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });

      if (pager) {
        pager.addEventListener("click", (e) => {
          const b = e.target.closest("[data-page]");
          if (!b || b.disabled) return;
          page = Math.min(pages() - 1, Math.max(0, page + Number(b.dataset.page)));
          render();
          C.$("[data-page-status]", pager).textContent = `Página ${page + 1} de ${pages()}`;
        });
      }

      render();
    }

    /* ----------------------------------------------------------------------
       Destaques da casa
       ---------------------------------------------------------------------- */
    function initPromos() {
      C.$$("[data-promo]").forEach((el) => {
        const item = MENU.find((m) => m.id === el.dataset.promo);
        if (!item) {
          el.remove();
          return;
        }
        el.setAttribute("aria-label", item.name);
        el.innerHTML = `
          <div class="promo__media media ${fbClass(item)}"><img src="${sized(item.img, 900)}" alt="" loading="lazy" decoding="async"></div>
          <div class="promo__body">
            <p class="promo__kicker">${esc(el.dataset.kicker || catOf(item).label || "")}</p>
            <p class="promo__price">${C.formatPrice(item.price)}</p>
            <h3 class="promo__name">${esc(item.name)}</h3>
            <p class="promo__desc">${esc(item.desc)}</p>
            <div class="promo__actions">
              <button class="btn btn--primary btn--sm" type="button" data-add="${item.id}" aria-label="Adicionar ${esc(item.name)} à sacola">Adicionar</button>
              <button class="link" type="button" data-product="${item.id}" aria-label="Ver detalhes de ${esc(item.name)}">Ver detalhes ${C.icon("chevron-right")}</button>
            </div>
          </div>`;
        C.checkImages(el);
      });
    }

    /* ----------------------------------------------------------------------
       Depoimentos: carrossel com cartão central em destaque
       ---------------------------------------------------------------------- */
    function initReviews() {
      const root = C.$("[data-rv]");
      const stage = root && C.$("[data-rv-stage]", root);
      if (!stage || !TESTIMONIALS.length) return;
      const n = TESTIMONIALS.length;
      let current = 0;

      const initials = (name) =>
        name
          .replace(/[^A-Za-zÀ-ú& ]/g, "")
          .split(/\s+/)
          .filter((w) => w && w !== "&")
          .slice(0, 2)
          .map((w) => w[0])
          .join("");

      stage.innerHTML = TESTIMONIALS.map(
        (t, i) => `
        <figure class="rv-card" role="group" aria-roledescription="depoimento" aria-label="${i + 1} de ${n}" data-rv-card="${i}">
          <span class="avatar rv-card__avatar" aria-hidden="true">${esc(initials(t.name))}</span>
          <div class="stars" role="img" aria-label="${t.rating} de 5 estrelas">${C.icon("star").repeat(t.rating)}</div>
          <blockquote class="rv-card__text">${esc(t.text)}</blockquote>
          <figcaption><span class="rv-card__name">${esc(t.name)}</span><span class="rv-card__occasion">${esc(t.occasion)}</span></figcaption>
        </figure>`
      ).join("");
      const cards = C.$$(".rv-card", stage);

      function update() {
        cards.forEach((card, i) => {
          let o = (i - current + n) % n;
          if (o > n / 2) o -= n;
          card.classList.toggle("is-current", o === 0);
          card.classList.toggle("is-prev", o === -1 && n > 2);
          card.classList.toggle("is-next", o === 1 && n > 1);
          card.classList.toggle("is-off", Math.abs(o) > 1 || (n === 2 && o === -1));
          card.setAttribute("aria-hidden", String(o !== 0));
        });
      }
      const go = (delta) => {
        current = (current + delta + n) % n;
        update();
      };

      root.querySelector("[data-rv-prev]").addEventListener("click", () => go(-1));
      root.querySelector("[data-rv-next]").addEventListener("click", () => go(1));
      // Clicar no cartão lateral traz ele para o centro
      stage.addEventListener("click", (e) => {
        const card = e.target.closest(".rv-card");
        if (!card) return;
        if (card.classList.contains("is-prev")) go(-1);
        else if (card.classList.contains("is-next")) go(1);
      });
      root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") go(-1);
        else if (e.key === "ArrowRight") go(1);
      });
      // Arrastar no celular
      let startX = null;
      stage.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse") startX = e.clientX;
      });
      stage.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      });
      stage.addEventListener("pointercancel", () => (startX = null));

      if (n < 2) C.$$(".arrow-btn", root).forEach((b) => (b.hidden = true));
      update();
    }

    /* ----------------------------------------------------------------------
       Faixa rolante: pausa por botão (acessível por teclado)
       ---------------------------------------------------------------------- */
    function initMarquee() {
      const m = C.$("[data-marquee]");
      const btn = m && C.$("[data-marquee-toggle]", m);
      if (!btn) return;
      btn.addEventListener("click", () => {
        const paused = m.classList.toggle("is-paused");
        btn.setAttribute("aria-pressed", String(paused));
        btn.setAttribute("aria-label", paused ? "Retomar a faixa animada" : "Pausar a faixa animada");
        btn.innerHTML = C.icon(paused ? "play" : "pause");
      });
    }

    /* ----------------------------------------------------------------------
       Banner: luz que acompanha o cursor (RedSun), só com mouse
       ---------------------------------------------------------------------- */
    function initHeroLight() {
      const hero = C.$("[data-hero]");
      if (!hero || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
      let frame = 0;
      hero.addEventListener("pointermove", (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const r = hero.getBoundingClientRect();
          hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
          hero.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
      });
    }

    initMenu();
    initPromos();
    initReviews();
    initMarquee();
    initHeroLight();
  });
})();
