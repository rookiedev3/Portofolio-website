(() => {
  "use strict";
  const { views, CV, SITE } = App;
  const main = document.getElementById("konten");
  let filter = "all", hfilter = "all";

  const setNav = (key) =>
    document.querySelectorAll("[data-nav]").forEach((a) =>
      a.dataset.nav === key ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));

  function route() {
    const [section, param] = location.hash.replace(/^#\/?/, "").split("/");
    let html, nav = null, title = `${SITE.name} — Backend dan DevOps`;

    if (!section) { html = views.list(filter); nav = "artikel"; }
    else if (section === "artikel" && param) {
      const slug = decodeURIComponent(param);
      html = views.post(slug); nav = "artikel";
      const a = App.ARTICLES.find((x) => x.slug === slug);
      if (a) { title = `${a.title} — ${SITE.name}`; }
    }
    else if (section === "kelompok") { html = param ? views.group(param) : views.groups(); nav = "kelompok"; }
    else if (section === "histori") { html = views.history(hfilter); nav = "histori"; title = `Histori menulis — ${SITE.name}`; }
    else if (section === "cv") { html = views.cv(); nav = "cv"; title = `CV — ${SITE.name}`; }
    else html = views.notFound();

    main.innerHTML = html;
    document.title = title;
    setNav(nav);
    window.scrollTo({ top: 0 });
    main.focus({ preventScroll: true });
  }

  /* Satu listener untuk semua tombol interaktif */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button, [data-filter]");
    if (!t) return;

    if (t.dataset.filter) {
      filter = t.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((c) => c.setAttribute("aria-pressed", String(c === t)));
      const items = views.itemsFor(filter);
      document.querySelector(".count").textContent = `${items.length} artikel`;
      document.getElementById("list-grid").innerHTML = views.grid(items);
    } else if (t.dataset.hfilter) {
      hfilter = t.dataset.hfilter;
      document.querySelectorAll("[data-hfilter]").forEach((c) => c.setAttribute("aria-pressed", String(c === t)));
      document.getElementById("timeline").innerHTML = views.timeline(hfilter);
    }
    else if (t.hasAttribute("data-print")) window.print();
    else if (t.hasAttribute("data-pdf")) {
      const old = document.title;
      document.title = `CV - ${CV.name}`;           /* menjadi nama file PDF yang disarankan */
      window.addEventListener("afterprint", () => { document.title = old; }, { once: true });
      window.print();
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  window.addEventListener("hashchange", route);
  route();
})();