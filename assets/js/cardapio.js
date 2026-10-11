/* ==========================================================================
   CALABOUÇO — Cardápio
   Desktop (≥1024px): barra lateral fixa com categorias e filtros (Starbucks)
   e grade de cartões. Celular/tablet: abas de categoria fixas, busca e
   bottom sheet de filtros, itens em linha (iFood/Domino's).
   Estado espelhado na URL: ?cat=&q=&preco=&tag=&ordem=
   ========================================================================== */

(function () {
  "use strict";

  function onReady(fn) {
    if (window.Calabouco && window.Calabouco.ready) fn();
    else document.addEventListener("calabouco:ready", fn, { once: true });
  }

  onReady(() => {
    const C = window.Calabouco;
    const { $, $$, icon, escapeHTML } = C;
    const MENU = window.CALABOUCO_MENU || [];
    const CATS = window.CALABOUCO_CATEGORIES || [];

    const root = $("[data-menu]");
    const results = $("[data-menu-results]");
    if (!root || !results) return;

    const desktopMQ = window.matchMedia("(min-width: 1024px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------------------
       Definições
       --------------------------------------------------------------------- */
    const PRICES = {
      all: { label: "Todos", test: () => true },
      "ate-50": { label: "Até R$ 50", test: (p) => p <= 50 },
      "50-100": { label: "R$ 50 a R$ 100", test: (p) => p > 50 && p <= 100 },
      "acima-100": { label: "Acima de R$ 100", test: (p) => p > 100 },
    };
    const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });
    const SORTS = {
      recomendados: { label: "Recomendados", note: "", fn: (a, b) => a.order - b.order },
      "menor-preco": { label: "Menor preço", note: "Do menor ao maior preço.", fn: (a, b) => a.item.price - b.item.price || a.order - b.order },
      "maior-preco": { label: "Maior preço", note: "Do maior ao menor preço.", fn: (a, b) => b.item.price - a.item.price || a.order - b.order },
      az: { label: "Nome A–Z", note: "Em ordem alfabética.", fn: (a, b) => collator.compare(a.item.name, b.item.name) },
    };
    const TAGS = {
      vegetariano: { label: "Vegetariano", icon: "leaf" },
      picante: { label: "Picante", icon: "chili" },
      assinatura: { label: "Assinatura da casa", icon: "crown" },
    };
    // Frases curtas para os títulos de cada categoria (padrão Apple Store:
    // "Nome. Complemento em cinza."). Categorias novas funcionam sem frase.
    const TAGLINES = {
      entradas: "Para abrir a noite.",
      "pizzas-tradicionais": "Os clássicos, do jeito certo.",
      "pizzas-da-casa": "Receitas que só existem aqui.",
      massas: "Feitas na casa, servidas no ponto.",
      "pratos-principais": "Carnes nobres e risotos cremosos.",
      sobremesas: "O final que a noite merece.",
      bebidas: "Da taça à garrafa, para cada sabor.",
    };
    const DEFAULTS = { cat: "todos", q: "", price: "all", tags: [], sort: "recomendados" };

    const norm = (s) =>
      String(s || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const catById = {};
    CATS.forEach((c) => (catById[c.id] = c));
    const itemById = {};
    const catRank = (id) => {
      const i = CATS.findIndex((c) => c.id === id);
      return i === -1 ? CATS.length : i;
    };
    // Ordem "recomendada" = ordem das categorias; dentro de cada uma, primeiro
    // o que é destaque e assinatura da casa (vira o cartão largo da seção),
    // depois a ordem do data.js.
    const highlight = (item) => (item.featured ? 0 : 1) + ((item.tags || []).includes("assinatura") ? 0 : 1);
    const INDEX = MENU.map((item, i) => {
      itemById[item.id] = item;
      const cat = catById[item.cat] || {};
      return {
        item,
        order: catRank(item.cat) * 1000 + highlight(item) * 100 + i,
        hay: norm([item.name, item.desc, cat.label, cat.short].join(" ")),
      };
    });
    // Porção só aparece quando informa algo ("Individual" é o padrão).
    const portion = (item) => (item && item.meta && !/^individual$/i.test(item.meta.trim()) ? item.meta : "");
    // Ícones da lista lateral sem repetição (data.js usa "plate" duas vezes).
    const CAT_ICON = { entradas: "wheat" };

    /* ---------------------------------------------------------------------
       Estado (lido da URL)
       --------------------------------------------------------------------- */
    function readURL() {
      const p = new URLSearchParams(location.search);
      const cat = p.get("cat");
      const price = p.get("preco");
      const sort = p.get("ordem");
      const tags = (p.get("tag") || "")
        .split(",")
        .map((t) => t.trim())
        .filter((t, i, arr) => TAGS[t] && arr.indexOf(t) === i);
      return {
        cat: cat && catById[cat] ? cat : DEFAULTS.cat,
        q: (p.get("q") || "").slice(0, 80),
        price: price && PRICES[price] ? price : DEFAULTS.price,
        tags,
        sort: sort && SORTS[sort] ? sort : DEFAULTS.sort,
      };
    }
    const state = readURL();

    function writeURL() {
      const params = new URLSearchParams(location.search);
      ["cat", "q", "preco", "tag", "ordem"].forEach((k) => params.delete(k));
      const own = [];
      if (state.cat !== DEFAULTS.cat) own.push(`cat=${encodeURIComponent(state.cat)}`);
      if (state.q.trim()) own.push(`q=${encodeURIComponent(state.q.trim())}`);
      if (state.price !== DEFAULTS.price) own.push(`preco=${state.price}`);
      if (state.tags.length) own.push(`tag=${state.tags.join(",")}`);
      if (state.sort !== DEFAULTS.sort) own.push(`ordem=${state.sort}`);
      const rest = params.toString();
      const qs = [own.join("&"), rest].filter(Boolean).join("&");
      const url = location.pathname + (qs ? `?${qs}` : "") + location.hash;
      if (url !== location.pathname + location.search + location.hash) {
        try {
          history.replaceState(history.state, "", url);
        } catch (e) {
          /* file:// ou ambiente sem history: segue sem atualizar a URL */
        }
      }
    }

    const filtersActive = () =>
      state.cat !== DEFAULTS.cat ||
      !!state.q.trim() ||
      state.price !== DEFAULTS.price ||
      state.tags.length > 0 ||
      state.sort !== DEFAULTS.sort;

    /* ---------------------------------------------------------------------
       Elementos
       --------------------------------------------------------------------- */
    const catNav = $("[data-cat-nav]", root);
    const search = $("#menu-search");
    const searchClear = $("[data-search-clear]", root);
    const countEl = $("[data-results-count]", root);
    const activeEl = $("[data-active-filters]", root);
    const filtersPanel = $("[data-filters-panel]");
    const filtersHome = $("[data-filters-home]");
    const sortBox = $("[data-sortbox]");
    const sortHome = $("[data-sort-home]");
    const side = $(".menu-side", root);
    const tools = $(".menu-tools", root);
    const summary = $(".menu-summary", root);
    const mainCol = $(".menu-main", root);
    const filtersBtn = $("[data-fsheet-open]");
    const filtersBadge = $("[data-filters-badge]");
    const sheet = $("#menu-filtros");
    const sheetBody = $("[data-fsheet-body]");
    const sheetBackdrop = $(".fsheet-backdrop");
    const sheetApply = $("[data-fsheet-apply]");
    const sheetReset = $("[data-fsheet-reset]");
    const sheetHead = $(".fsheet__head", sheet);

    // Categorias (Todos + as do data.js) — um único conjunto de botões:
    // lista vertical na barra lateral (desktop) e chips roláveis (celular).
    catNav.innerHTML = [{ id: "todos", label: "Todos", icon: "flame" }, ...CATS]
      .map(
        (c) => `
        <button type="button" class="cat-btn" data-cat="${escapeHTML(c.id)}" aria-pressed="false">
          ${icon(CAT_ICON[c.id] || c.icon || "plate")}<span class="cat-btn__label">${escapeHTML(c.label)}</span><span class="cat-btn__count tabular" aria-hidden="true"></span>
        </button>`
      )
      .join("");

    /* ---------------------------------------------------------------------
       Filtro, ordenação e renderização
       --------------------------------------------------------------------- */
    function matches(entry, ignoreCat) {
      const it = entry.item;
      if (!ignoreCat && state.cat !== "todos" && it.cat !== state.cat) return false;
      if (!PRICES[state.price].test(it.price)) return false;
      if (state.tags.length && !state.tags.every((t) => (it.tags || []).includes(t))) return false;
      const tokens = norm(state.q).split(" ").filter(Boolean);
      if (tokens.length && !tokens.every((t) => entry.hay.includes(t))) return false;
      return true;
    }

    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

    function headingHTML(label, tagline, count, headingId) {
      return `
        <div class="menu-group__head">
          <h2 class="t-title menu-group__title" id="${headingId}">${escapeHTML(label)}${
            tagline ? ` <span class="muted">${escapeHTML(tagline)}</span>` : ""
          }</h2>
          <span class="menu-group__count tabular">${plural(count, "item", "itens")}</span>
        </div>`;
    }

    function itemsHTML(list, desktop) {
      return desktop
        ? `<div class="menu-grid">${list.map((e, i) => C.productCard(e.item, i)).join("")}</div>`
        : `<div class="menu-list">${list.map((e) => C.productRow(e.item)).join("")}</div>`;
    }

    function groupHTML(cat, list, desktop) {
      const label = cat.label.replace(/[.!?]$/, "") + ".";
      return `
        <section class="menu-group" aria-labelledby="cat-${escapeHTML(cat.id)}" data-group="${escapeHTML(cat.id)}">
          ${headingHTML(label, TAGLINES[cat.id] || "", list.length, `cat-${escapeHTML(cat.id)}`)}
          ${itemsHTML(list, desktop)}
        </section>`;
    }

    function emptyHTML() {
      const q = state.q.trim();
      return `
        <div class="menu-empty">
          ${icon("search")}
          <h2 class="menu-empty__title">Nada por aqui.</h2>
          <p class="menu-empty__text">${
            q
              ? `Não encontramos “${escapeHTML(q)}” com os filtros escolhidos.`
              : "Nenhum item combina com os filtros escolhidos."
          } ${q ? "Tente outra busca ou veja o cardápio completo." : "Remova algum filtro ou veja o cardápio completo."}</p>
          <button type="button" class="btn btn--light" data-clear-filters>Limpar filtros</button>
        </div>`;
    }

    // Complementos locais aos componentes compartilhados: tamanho/porção e selos.
    // Na grade única (todas as categorias, ordenadas por preço/nome) a
    // categoria vira contexto útil; nas seções por categoria ela seria repetição.
    function metaFor(item, mixed) {
      const cat = catById[item.cat] || {};
      return [mixed ? cat.short : "", portion(item)].filter(Boolean).join(" · ");
    }

    function enhance(desktop) {
      const mixed = state.cat === "todos" && state.sort !== "recomendados";
      if (desktop) {
        $$(".menu-grid", results).forEach((grid) => {
          const cards = $$(".product-card", grid);
          const metas = cards.map((card) => {
            const item = itemById[card.dataset.product];
            return item ? metaFor(item, mixed) : "";
          });
          const anyMeta = metas.some(Boolean);
          cards.forEach((card, i) => {
            const item = itemById[card.dataset.product];
            if (!item) return;
            const eyebrow = $(".product-card__eyebrow", card);
            if (eyebrow) {
              if (!anyMeta) eyebrow.remove();
              else if (metas[i]) eyebrow.textContent = metas[i];
              else {
                // Mantém a linha (invisível) para alinhar nomes e preços na fileira.
                eyebrow.textContent = " ";
                eyebrow.classList.add("is-blank");
                eyebrow.setAttribute("aria-hidden", "true");
              }
            }
            const tags = (item.tags || []).filter((t) => t !== "assinatura" && C.TAG_INFO[t]);
            const foot = $(".product-card__foot", card);
            if (tags.length && foot) foot.insertAdjacentHTML("beforebegin", `<div class="tags menu-card-tags">${C.tagsHTML({ tags })}</div>`);
          });
        });
      } else {
        $$(".product-row", results).forEach((row) => {
          const item = itemById[row.dataset.product];
          if (!item) return;
          const name = $(".product-row__name", row);
          const meta = metaFor(item, mixed);
          if (meta && name) name.insertAdjacentHTML("afterend", `<p class="menu-row-meta">${escapeHTML(meta)}</p>`);
          // "Assinatura" vira selo sobre a foto, como no cartão do desktop,
          // e a linha de preço fica com no máximo um selo ao lado.
          if ((item.tags || []).includes("assinatura")) {
            const tag = $(".product-row__meta .tag--assinatura", row);
            const thumb = $(".product-row__thumb", row);
            if (tag && thumb) {
              tag.remove();
              thumb.insertAdjacentHTML(
                "afterbegin",
                `<span class="badge-float menu-row-badge" role="img" aria-label="Assinatura da casa" title="Assinatura da casa">${icon("crown")}</span>`
              );
            }
          }
        });
      }
    }

    let lastCount = -1;
    let booted = false;
    function render() {
      const desktop = desktopMQ.matches;
      const pool = INDEX.filter((e) => matches(e, true));
      const list = pool.filter((e) => state.cat === "todos" || e.item.cat === state.cat).sort(SORTS[state.sort].fn);

      // Contagens por categoria consideram busca, preço e preferências.
      $$("[data-cat]", catNav).forEach((btn) => {
        const id = btn.dataset.cat;
        const n = id === "todos" ? pool.length : pool.filter((e) => e.item.cat === id).length;
        $(".cat-btn__count", btn).textContent = n;
        btn.classList.toggle("is-empty", n === 0);
      });

      let html;
      if (!list.length) {
        html = emptyHTML();
      } else if (state.cat === "todos" && state.sort === "recomendados") {
        html = CATS.map((cat) => {
          const items = list.filter((e) => e.item.cat === cat.id);
          return items.length ? groupHTML(cat, items, desktop) : "";
        }).join("");
        const orphans = list.filter((e) => !catById[e.item.cat]);
        if (orphans.length) html += groupHTML({ id: "outros", label: "Outros" }, orphans, desktop);
      } else if (state.cat !== "todos") {
        html = groupHTML(catById[state.cat], list, desktop);
      } else {
        html = `
          <section class="menu-group" aria-labelledby="menu-all-title">
            ${headingHTML("Todo o cardápio.", SORTS[state.sort].note, list.length, "menu-all-title")}
            ${itemsHTML(list, desktop)}
          </section>`;
      }

      results.innerHTML = html;
      results.setAttribute("aria-busy", "false");
      results.dataset.layout = desktop ? "grid" : "list";
      enhance(desktop);
      // A entrada animada só acontece na primeira renderização; filtros,
      // busca e ordenação atualizam na hora (como Starbucks e iFood).
      if (booted) {
        $$(".reveal", results).forEach((el) => el.classList.add("is-visible"));
        if (!reduceMotion && results.animate) {
          results.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
        }
      }
      C.observeReveal(results);
      C.checkImages(results);
      booted = true;

      const n = list.length;
      if (n !== lastCount || countEl.textContent === "") {
        countEl.textContent = n ? plural(n, "item", "itens") : "Nenhum item encontrado";
        lastCount = n;
      }
      sheetApply.textContent = n ? `Ver ${plural(n, "resultado", "resultados")}` : "Nenhum resultado";
      sheetApply.disabled = n === 0;

      syncControls();
      renderActive();
      writeURL();
      updateSideFade();
    }

    function syncControls() {
      $$("[data-cat]", catNav).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)));
      $$("[data-tag-filter]").forEach((b) => b.setAttribute("aria-pressed", String(state.tags.includes(b.dataset.tagFilter))));
      $$("[data-price]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.price === state.price)));
      $$(".menu-sort").forEach((s) => {
        if (s.value !== state.sort) s.value = state.sort;
      });
      if (search.value !== state.q) search.value = state.q;
      searchClear.hidden = !search.value;
      search.parentElement.classList.toggle("has-value", !!search.value);

      const extra = state.tags.length + (state.price !== "all" ? 1 : 0) + (state.sort !== "recomendados" ? 1 : 0);
      filtersBadge.hidden = extra === 0;
      filtersBadge.textContent = extra;
      filtersBtn.classList.toggle("is-active", extra > 0);
      filtersBtn.setAttribute("aria-label", extra ? `Filtros, ${extra} ${extra === 1 ? "ativo" : "ativos"}` : "Filtros");
      // "Limpar" do sheet só zera o que está dentro dele (como iFood/Domino's).
      if (sheetReset) sheetReset.disabled = extra === 0;
      $$("[data-clear-filters]", root).forEach((b) => {
        if (!b.closest(".menu-empty")) b.hidden = !filtersActive();
      });
    }

    // Filtros ativos como pílulas removíveis (resumo acima dos resultados).
    // A categoria não vira pílula: os chips e a barra lateral já a mostram.
    function renderActive() {
      const pills = [];
      if (state.q.trim()) pills.push(["q", `“${state.q.trim()}”`]);
      state.tags.forEach((t) => pills.push([`tag:${t}`, TAGS[t].label]));
      if (state.price !== "all") pills.push(["price", PRICES[state.price].label]);
      if (state.sort !== "recomendados") pills.push(["sort", SORTS[state.sort].label]);
      activeEl.innerHTML = pills
        .map(
          ([key, label]) =>
            `<button type="button" class="menu-pill" data-remove="${escapeHTML(key)}" aria-label="Remover filtro: ${escapeHTML(label)}">${escapeHTML(
              label
            )}${icon("x")}</button>`
        )
        .join("");
    }

    /* ---------------------------------------------------------------------
       Layout: os mesmos controles mudam de lugar entre desktop e celular
       (barra lateral/barra de ferramentas ↔ bottom sheet), sem duplicação.
       --------------------------------------------------------------------- */
    function place() {
      if (desktopMQ.matches) {
        if (sheetOpen) closeSheet(false);
        if (filtersPanel.parentElement !== filtersHome) filtersHome.insertBefore(filtersPanel, filtersHome.firstChild);
        if (sortBox.parentElement !== sortHome) sortHome.appendChild(sortBox);
      } else {
        if (filtersPanel.parentElement !== sheetBody) sheetBody.appendChild(filtersPanel);
        if (sortBox.parentElement !== sheetBody) sheetBody.appendChild(sortBox);
      }
    }

    const navHeight = () => {
      const nav = $(".gnav");
      return nav ? nav.getBoundingClientRect().height : 52;
    };

    // Ao trocar de categoria/filtro com a página rolada, volta ao início da lista.
    function scrollToResults() {
      const desktop = desktopMQ.matches;
      const offset = desktop ? navHeight() + 20 : navHeight() + side.offsetHeight + tools.offsetHeight + 4;
      // No desktop a barra de ferramentas usa display: contents (sem caixa
      // própria), então a referência é a coluna principal.
      const target = desktop ? mainCol : summary.offsetHeight > 2 ? summary : results;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      if (window.scrollY > top + 2) window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }

    function revealActiveChip(smooth) {
      if (desktopMQ.matches) return;
      const btn = $(`[data-cat="${state.cat}"]`, catNav);
      if (!btn) return;
      const left = btn.offsetLeft - (catNav.clientWidth - btn.offsetWidth) / 2;
      catNav.scrollTo({ left: Math.max(0, left), behavior: smooth && !reduceMotion ? "smooth" : "auto" });
    }

    /* ---------------------------------------------------------------------
       Bottom sheet de filtros (celular/tablet)
       --------------------------------------------------------------------- */
    let sheetOpen = false;
    let sheetLastFocus = null;
    const focusables = () =>
      $$("button:not([disabled]), a[href], select, input, textarea, [tabindex]:not([tabindex='-1'])", sheet).filter(
        (el) => !el.closest("[hidden]") && el.offsetParent !== null
      );

    function openSheet() {
      if (sheetOpen || desktopMQ.matches) return;
      sheetOpen = true;
      sheetLastFocus = document.activeElement;
      sheet.classList.add("is-open");
      sheetBackdrop.classList.add("is-open");
      sheet.setAttribute("aria-hidden", "false");
      filtersBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        const first = $(".fsheet__close", sheet);
        if (first) first.focus();
      }, 60);
    }

    function closeSheet(restoreFocus = true) {
      if (!sheetOpen) return;
      sheetOpen = false;
      sheet.classList.remove("is-open");
      sheetBackdrop.classList.remove("is-open");
      sheet.setAttribute("aria-hidden", "true");
      filtersBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (restoreFocus && sheetLastFocus && sheetLastFocus.focus) sheetLastFocus.focus();
    }

    // Arrastar para baixo pela alça/cabeçalho fecha o sheet (padrão iOS).
    let dragY0 = null;
    let dragDy = 0;
    sheet.addEventListener(
      "touchstart",
      (e) => {
        if (!sheetOpen || e.touches.length !== 1) return;
        const t = e.target instanceof Element ? e.target : null;
        const onHandle = t && (t === sheet || sheetHead.contains(t)) && !t.closest("button");
        if (!onHandle) return;
        dragY0 = e.touches[0].clientY;
        dragDy = 0;
        sheet.style.transition = "none";
      },
      { passive: true }
    );
    sheet.addEventListener(
      "touchmove",
      (e) => {
        if (dragY0 === null) return;
        dragDy = Math.max(0, e.touches[0].clientY - dragY0);
        sheet.style.transform = `translateY(${dragDy}px)`;
      },
      { passive: true }
    );
    const endDrag = () => {
      if (dragY0 === null) return;
      dragY0 = null;
      sheet.style.transition = "";
      sheet.style.transform = "";
      if (dragDy > 80) closeSheet();
      dragDy = 0;
    };
    sheet.addEventListener("touchend", endDrag);
    sheet.addEventListener("touchcancel", endDrag);

    // Barra lateral (desktop): esmaece a borda inferior quando ainda há
    // filtros escondidos abaixo, para não parecerem inexistentes.
    function updateSideFade() {
      if (!desktopMQ.matches) {
        side.classList.remove("has-more");
        return;
      }
      const more = side.scrollHeight - side.clientHeight - side.scrollTop > 4;
      side.classList.toggle("has-more", more);
    }
    side.addEventListener("scroll", updateSideFade, { passive: true });
    window.addEventListener("resize", updateSideFade, { passive: true });

    /* ---------------------------------------------------------------------
       Ações
       --------------------------------------------------------------------- */
    function update(changes, opts = {}) {
      Object.assign(state, changes);
      render();
      if (opts.scroll) scrollToResults();
      if (opts.chip) revealActiveChip(true);
    }

    function clearAll() {
      update({ ...DEFAULTS, tags: [] }, { scroll: true, chip: true });
    }

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;

      const catBtn = t.closest("[data-cat]");
      if (catBtn && catNav.contains(catBtn)) {
        update({ cat: catBtn.dataset.cat }, { scroll: true, chip: true });
        return;
      }
      const tagBtn = t.closest("[data-tag-filter]");
      if (tagBtn) {
        const tag = tagBtn.dataset.tagFilter;
        const tags = state.tags.includes(tag) ? state.tags.filter((x) => x !== tag) : [...state.tags, tag];
        update({ tags }, { scroll: desktopMQ.matches });
        return;
      }
      const priceBtn = t.closest("[data-price]");
      if (priceBtn) {
        update({ price: priceBtn.dataset.price }, { scroll: desktopMQ.matches });
        return;
      }
      if (t.closest("[data-fsheet-reset]")) {
        update({ tags: [], price: "all", sort: "recomendados" });
        const next = sheetApply.disabled ? $(".fsheet__close", sheet) : sheetApply;
        if (next) next.focus();
        return;
      }
      if (t.closest("[data-clear-filters]")) {
        clearAll();
        return;
      }
      const pill = t.closest("[data-remove]");
      if (pill) {
        const key = pill.dataset.remove;
        if (key === "cat") update({ cat: "todos" }, { chip: true });
        else if (key === "q") update({ q: "" });
        else if (key === "price") update({ price: "all" });
        else if (key === "sort") update({ sort: "recomendados" });
        else if (key.startsWith("tag:")) update({ tags: state.tags.filter((x) => x !== key.slice(4)) });
        // Mantém o foco no resumo depois que a pílula some.
        const next = $("[data-remove]", activeEl) || search;
        next.focus();
        return;
      }
      if (t.closest("[data-search-clear]")) {
        update({ q: "" });
        search.focus();
        return;
      }
      if (t.closest("[data-fsheet-open]")) {
        openSheet();
        return;
      }
      if (t.closest("[data-fsheet-close]")) {
        closeSheet();
        return;
      }
      if (t.closest("[data-fsheet-apply]")) {
        closeSheet();
        scrollToResults();
      }
    });

    document.addEventListener("change", (e) => {
      const sel = e.target;
      if (sel instanceof Element && sel.matches(".menu-sort")) {
        update({ sort: SORTS[sel.value] ? sel.value : "recomendados" }, { scroll: desktopMQ.matches });
      }
    });

    let searchTimer;
    search.addEventListener("input", () => {
      state.q = search.value.slice(0, 80);
      searchClear.hidden = !search.value;
      search.parentElement.classList.toggle("has-value", !!search.value);
      clearTimeout(searchTimer);
      searchTimer = setTimeout(render, 140);
    });
    search.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && search.value) {
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(searchTimer);
        update({ q: "" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(searchTimer);
        render();
        if (!desktopMQ.matches) search.blur(); // fecha o teclado no celular
      }
    });

    document.addEventListener("keydown", (e) => {
      if (sheetOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeSheet();
          return;
        }
        if (e.key === "Tab") {
          const items = focusables();
          if (!items.length) return;
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && (document.activeElement === first || !sheet.contains(document.activeElement))) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && (document.activeElement === last || !sheet.contains(document.activeElement))) {
            e.preventDefault();
            first.focus();
          }
        }
        return;
      }
      // Atalho "/" para buscar (desktop), como em grandes lojas on-line.
      const typing = e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]");
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && !document.querySelector(".sheet.is-open, .drawer.is-open")) {
        e.preventDefault();
        search.focus();
      }
    });

    // Só re-renderiza quando o layout realmente muda (alguns navegadores
    // disparam "change" sem alterar o resultado da media query).
    let lastDesktop = desktopMQ.matches;
    const onMQ = () => {
      if (desktopMQ.matches === lastDesktop) return;
      lastDesktop = desktopMQ.matches;
      place();
      render();
      revealActiveChip(false);
    };
    if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", onMQ);
    else if (desktopMQ.addListener) desktopMQ.addListener(onMQ);

    /* ---------------------------------------------------------------------
       Início
       --------------------------------------------------------------------- */
    place();
    render();
    revealActiveChip(false);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateSideFade);
    window.addEventListener("load", updateSideFade, { once: true });
  });
})();
