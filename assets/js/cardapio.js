/* ==========================================================================
   CALABOUÇO — Cardápio: filtros, busca, ordenação e categorias
   ========================================================================== */

(function () {
  "use strict";

  function onReady(fn) {
    if (window.Calabouco && window.Calabouco.ready) fn();
    else document.addEventListener("calabouco:ready", fn, { once: true });
  }

  onReady(() => {
    const C = window.Calabouco;
    const { $, $$, icon, escapeHTML, dishCard, observeReveal, checkImages } = C;
    const MENU = window.CALABOUCO_MENU || [];
    const CATEGORIES = window.CALABOUCO_CATEGORIES || [];

    const results = $("[data-menu-results]");
    if (!results) return;

    const chipsWrap = $("[data-cat-chips]");
    const search = $("#menu-search");
    const priceSel = $("#menu-price");
    const sortSel = $("#menu-sort");
    const countEl = $("[data-results-count]");
    const clearBtn = $("[data-clear-filters]");
    const tagButtons = $$("[data-tag-filter]");
    const filtersToggle = $("[data-filters-toggle]");
    const filterExtra = $(".filter-extra");

    const PRICE_RANGES = {
      all: () => true,
      "ate-50": (p) => p <= 50,
      "50-100": (p) => p > 50 && p <= 100,
      "acima-100": (p) => p > 100,
    };
    const SORTS = {
      relevancia: null,
      "menor-preco": (a, b) => a.price - b.price,
      "maior-preco": (a, b) => b.price - a.price,
      az: (a, b) => a.name.localeCompare(b.name, "pt-BR"),
    };

    const normalize = (s = "") => s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

    const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || "";

    /* ---------- Estado (sincronizado com a URL) ---------- */
    const params = new URLSearchParams(location.search);
    const state = {
      cat: CATEGORIES.some((c) => c.id === params.get("cat")) ? params.get("cat") : "todos",
      q: params.get("q") || "",
      price: PRICE_RANGES[params.get("preco")] ? params.get("preco") : "all",
      tags: new Set((params.get("tag") || "").split(",").filter((t) => C.TAG_INFO[t])),
      sort: SORTS.hasOwnProperty(params.get("ordem")) ? params.get("ordem") : "relevancia",
    };

    function syncURL() {
      const p = new URLSearchParams();
      if (state.cat !== "todos") p.set("cat", state.cat);
      if (state.q) p.set("q", state.q);
      if (state.price !== "all") p.set("preco", state.price);
      if (state.tags.size) p.set("tag", [...state.tags].join(","));
      if (state.sort !== "relevancia") p.set("ordem", state.sort);
      const qs = p.toString();
      history.replaceState(null, "", `${location.pathname}${qs ? "?" + qs : ""}`);
    }

    const hasActiveFilters = () =>
      state.cat !== "todos" || state.q || state.price !== "all" || state.tags.size || state.sort !== "relevancia";

    /* ---------- Filtragem ---------- */
    function matches(item, { ignoreCat = false } = {}) {
      if (!ignoreCat && state.cat !== "todos" && item.cat !== state.cat) return false;
      if (!PRICE_RANGES[state.price](item.price)) return false;
      for (const t of state.tags) if (!item.tags.includes(t)) return false;
      if (state.q) {
        const hay = normalize(`${item.name} ${item.desc} ${catLabel(item.cat)} ${item.meta || ""}`);
        if (
          !normalize(state.q)
            .split(/\s+/)
            .every((w) => hay.includes(w))
        )
          return false;
      }
      return true;
    }

    /* ---------- Renderização ---------- */
    function renderChips() {
      const base = MENU.filter((m) => matches(m, { ignoreCat: true }));
      const chip = (id, label, count) => `
      <button class="chip" type="button" data-cat="${id}" aria-pressed="${state.cat === id}">
        ${escapeHTML(label)}<span class="chip__count">${count}</span>
      </button>`;
      chipsWrap.innerHTML =
        chip("todos", "Todos", base.length) +
        CATEGORIES.map((c) => chip(c.id, c.label, base.filter((m) => m.cat === c.id).length)).join("");
      const active = $(`[data-cat="${state.cat}"]`, chipsWrap);
      if (active && active.scrollIntoView && state.cat !== "todos") {
        chipsWrap.scrollLeft = active.offsetLeft - chipsWrap.offsetLeft - 16;
      }
    }

    function render() {
      let items = MENU.filter((m) => matches(m));
      const sorter = SORTS[state.sort];

      if (!items.length) {
        results.innerHTML = `
        <div class="empty-state">
          ${icon("search")}
          <h3>Nada por aqui… ainda.</h3>
          <p>Nenhum prato corresponde aos filtros escolhidos. Tente outra combinação.</p>
          <p style="margin-top:20px"><button class="btn btn--ghost btn--sm" type="button" data-clear-filters>Limpar filtros</button></p>
        </div>`;
      } else if (sorter) {
        items = items.slice().sort(sorter);
        results.innerHTML = `<div class="dish-grid dish-grid--menu">${items.map(dishCard).join("")}</div>`;
      } else {
        results.innerHTML = CATEGORIES.map((c) => {
          const group = items.filter((m) => m.cat === c.id);
          if (!group.length) return "";
          return `
          <section class="menu-group" id="cat-${c.id}" aria-labelledby="h-${c.id}">
            <header class="menu-group__head">
              ${icon(c.icon)}
              <h2 id="h-${c.id}">${escapeHTML(c.label)}</h2>
            </header>
            <div class="dish-grid dish-grid--menu">${group.map(dishCard).join("")}</div>
          </section>`;
        }).join("");
      }

      const n = items.length;
      countEl.textContent = `${n} ${n === 1 ? "prato encontrado" : "pratos encontrados"}`;
      clearBtn.hidden = !hasActiveFilters();

      renderChips();
      tagButtons.forEach((b) => b.setAttribute("aria-pressed", String(state.tags.has(b.dataset.tagFilter))));
      observeReveal(results);
      checkImages(results);
      syncURL();
    }

    function scrollToResults() {
      const toolbar = $(".menu-toolbar");
      const offset =
        (toolbar ? toolbar.offsetHeight : 0) +
        parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) +
        12;
      const top = results.getBoundingClientRect().top + window.scrollY - offset;
      if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
    }

    /* ---------- Eventos ---------- */
    chipsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.cat = btn.dataset.cat;
      render();
      scrollToResults();
    });

    let t;
    search.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.q = search.value.trim();
        render();
      }, 160);
    });

    priceSel.addEventListener("change", () => {
      state.price = priceSel.value;
      render();
    });

    sortSel.addEventListener("change", () => {
      state.sort = sortSel.value;
      render();
    });

    tagButtons.forEach((b) =>
      b.addEventListener("click", () => {
        const tag = b.dataset.tagFilter;
        state.tags.has(tag) ? state.tags.delete(tag) : state.tags.add(tag);
        render();
      }),
    );

    if (filtersToggle && filterExtra) {
      filtersToggle.addEventListener("click", () => {
        const open = !filterExtra.classList.contains("is-open");
        filterExtra.classList.toggle("is-open", open);
        filtersToggle.setAttribute("aria-expanded", String(open));
      });
    }

    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-clear-filters]")) return;
      state.cat = "todos";
      state.q = "";
      state.price = "all";
      state.tags.clear();
      state.sort = "relevancia";
      search.value = "";
      priceSel.value = "all";
      sortSel.value = "relevancia";
      render();
    });

    /* ---------- Estado inicial ---------- */
    search.value = state.q;
    priceSel.value = state.price;
    sortSel.value = state.sort;
    if (state.price !== "all" || state.tags.size || state.sort !== "relevancia") {
      filterExtra && filterExtra.classList.add("is-open");
      filtersToggle && filtersToggle.setAttribute("aria-expanded", "true");
    }
    render();
  });
})();
