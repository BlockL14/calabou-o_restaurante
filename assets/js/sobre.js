/* ==========================================================================
   CALABOUÇO — Sobre nós
   Scrollytelling estilo Apple: a foto fixa troca (crossfade) conforme o
   capítulo que está no centro da tela. Os pontos sobre a foto levam a cada
   capítulo. Em telas menores ou com movimento reduzido, cada capítulo mostra
   a própria foto e nada disso é necessário.
   ========================================================================== */

(function () {
  "use strict";

  function onReady(fn) {
    if (window.Calabouco && window.Calabouco.ready) fn();
    else document.addEventListener("calabouco:ready", fn, { once: true });
  }

  onReady(() => {
    const C = window.Calabouco;
    const story = C.$("[data-story]");
    if (!story) return;

    const chapters = C.$$("[data-chapter]", story);
    const frames = C.$$("[data-story-img]", story);
    const dots = C.$$("[data-story-dot]", story);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = -1;
    let io = null;

    // Durante a rolagem disparada pelos pontos, o observer fica travado: sem isso,
    // ir do capítulo 1 ao 3 reativava o 2 no meio do caminho (foto 3 → 2 → 3).
    let lock = false;
    let lockT = 0;

    // Capítulo que cruza a faixa central da janela (a mesma do observer).
    function chapterAtCenter() {
      const y = window.innerHeight * 0.475;
      return chapters.findIndex((c) => {
        const r = c.getBoundingClientRect();
        return r.top <= y && r.bottom >= y;
      });
    }

    function release() {
      if (!lock) return;
      lock = false;
      clearTimeout(lockT);
      // Se a pessoa interrompeu a rolagem, sincroniza com o que está na tela.
      if (io) setActive(chapterAtCenter());
    }

    function setActive(i) {
      if (i < 0 || i === active) return;
      active = i;
      frames.forEach((f, k) => f.classList.toggle("is-active", k === i));
      chapters.forEach((c, k) => c.classList.toggle("is-active", k === i));
      dots.forEach((d, k) => {
        d.classList.toggle("is-active", k === i);
        if (k === i) d.setAttribute("aria-current", "step");
        else d.removeAttribute("aria-current");
      });
    }

    setActive(0);

    // Os pontos levam ao capítulo correspondente (funcionam com ou sem animação).
    dots.forEach((dot, k) =>
      dot.addEventListener("click", () => {
        if (!chapters[k]) return;
        lock = true;
        clearTimeout(lockT);
        const hasScrollEnd = "onscrollend" in window;
        if (hasScrollEnd) window.addEventListener("scrollend", release, { once: true });
        // Rede de segurança: sem scrollend (ou se não houver rolagem), libera sozinho.
        lockT = setTimeout(release, hasScrollEnd ? 2000 : 1200);
        chapters[k].scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "center" });
        setActive(k);
      })
    );

    if (reduce.matches || !("IntersectionObserver" in window)) return;

    // Só escurece os capítulos inativos quando o JS está ativo.
    story.classList.add("is-enhanced");

    // Faixa estreita no centro da janela: o capítulo que a cruza vira o ativo.
    io = new IntersectionObserver(
      (entries) => {
        if (lock) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(chapters.indexOf(entry.target));
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    chapters.forEach((c) => io.observe(c));

    // As fotos da mídia fixa usam loading="lazy"; adianta o carregamento
    // das próximas assim que a seção se aproxima, para o crossfade não piscar.
    // (Só no desktop: no celular a mídia fixa fica oculta e não deve baixar.)
    const desktop = window.matchMedia("(min-width: 900px)");
    const warm = new IntersectionObserver(
      (entries) => {
        if (!desktop.matches || !entries.some((e) => e.isIntersecting)) return;
        frames.forEach((f) => {
          const img = f.querySelector("img");
          if (img) img.loading = "eager";
        });
        warm.disconnect();
      },
      { rootMargin: "600px 0px" }
    );
    warm.observe(story);
  });
})();
