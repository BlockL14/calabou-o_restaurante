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
        chapters[k].scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "center" });
        setActive(k);
      })
    );

    if (reduce.matches || !("IntersectionObserver" in window)) return;

    // Só escurece os capítulos inativos quando o JS está ativo.
    story.classList.add("is-enhanced");

    // Faixa estreita no centro da janela: o capítulo que a cruza vira o ativo.
    const io = new IntersectionObserver(
      (entries) => {
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
