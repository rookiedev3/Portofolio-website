/* Setiap fungsi mengembalikan string HTML. */
window.App = window.App || {};
App.views = (() => {
  const { GROUPS, ARTICLES, CV } = App;
  const groupOf = (id) => GROUPS.find((g) => g.id === id);
  const bySlug = (s) => ARTICLES.find((a) => a.slug === s);
  const newest = (list) => [...list].sort((a, b) => b.date.localeCompare(a.date));
  const fmt = (iso, opt) => new Intl.DateTimeFormat("id-ID", opt || { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso + "T00:00:00"));
  const readTime = (html) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 200)) + " menit baca";

  const card = (a, wide) => `
    <a class="card${wide ? " wide" : ""}" href="#/artikel/${a.slug}">
      <span class="cat">${groupOf(a.group).name}</span>
      <h2>${a.title}</h2>
      <p>${a.excerpt}</p>
      <div class="meta"><time datetime="${a.date}">${fmt(a.date)}</time><span>${readTime(a.body)}</span></div>
    </a>`;

  const grid = (items) => items.length
    ? `<div class="grid">${newest(items).map((a, i) => card(a, i === 0)).join("")}</div>`
    : `<div class="grid"><p class="empty">Belum ada artikel di kelompok ini.</p></div>`;

  const itemsFor = (active) => (active === "all" ? ARTICLES : ARTICLES.filter((a) => a.group === active));

  /* Beranda: daftar artikel + filter dinamis */
  function list(active) {
    const items = itemsFor(active);
    const chips = [{ id: "all", name: "Semua" }, ...GROUPS].map((g) =>
      `<button type="button" class="chip" data-filter="${g.id}" aria-pressed="${g.id === active}">${g.name}</button>`).join("");
    return `
      <section class="page-head">
        <h1>Catatan teknis dari lapangan.</h1>
        <p>Artikel tentang backend, DevOps, Linux, dan cara kerja sistem.</p>
      </section>
      <div class="filters" role="group" aria-label="Filter kelompok artikel">${chips}</div>
      <p class="count" aria-live="polite">${items.length} artikel</p>
      <div id="list-grid">${grid(items)}</div>`;
  }

  /* Ringkasan semua kelompok */
  function groups() {
    const cards = GROUPS.map((g) => {
      const items = newest(ARTICLES.filter((a) => a.group === g.id));
      return `
        <a class="card" href="#/kelompok/${g.id}">
          <h2>${g.name}</h2>
          <p>${g.desc}</p>
          <ul class="mini">${items.slice(0, 3).map((a) => `<li>${a.title}</li>`).join("")}</ul>
          <div class="meta"><span>${items.length} artikel</span></div>
        </a>`;
    }).join("");
    return `
      <section class="page-head"><h1>Kelompok artikel</h1><p>Pilih topik untuk melihat semua tulisan yang terkait.</p></section>
      <div class="grid groups">${cards}</div>`;
  }

  function group(id) {
    const g = groupOf(id);
    if (!g) return notFound();
    const others = GROUPS.filter((x) => x.id !== id).map((x) => `<a class="chip" href="#/kelompok/${x.id}">${x.name}</a>`).join("");
    return `
      <section class="page-head"><h1>${g.name}</h1><p>${g.desc}</p></section>
      <div class="filters" aria-label="Kelompok lain"><a class="chip" href="#/kelompok">Semua kelompok</a>${others}</div>
      <p class="count">${ARTICLES.filter((a) => a.group === id).length} artikel</p>
      ${grid(ARTICLES.filter((a) => a.group === id))}`;
  }

  /* Halaman baca */
  function post(slug) {
    const a = bySlug(slug);
    if (!a) return notFound();
    const g = groupOf(a.group);
    const more = newest(ARTICLES.filter((x) => x.group === a.group && x.slug !== slug)).slice(0, 3);
    return `
      <article class="post">
        <a class="back" href="#/">Kembali ke semua artikel</a>
        <p class="cat"><a href="#/kelompok/${g.id}">${g.name}</a></p>
        <h1>${a.title}</h1>
        <div class="meta"><time datetime="${a.date}">${fmt(a.date)}</time><span>${readTime(a.body)}</span></div>
        <div class="prose">${a.body}</div>
        ${more.length ? `<aside class="more"><h2>Lainnya di ${g.name}</h2><ul>${more.map((m) => `<li><a href="#/artikel/${m.slug}">${m.title}<span>${fmt(m.date, { month: "short", year: "numeric" })}</span></a></li>`).join("")}</ul></aside>` : ""}
      </article>`;
  }

  /* Histori menulis: timeline kronologis per tahun dan bulan */
  function timeline(active) {
    const items = newest(itemsFor(active));
    if (!items.length) return `<p class="note">Belum ada tulisan di kelompok ini.</p>`;
    const years = {};
    items.forEach((a) => {
      const y = a.date.slice(0, 4);
      const m = fmt(a.date, { month: "long" });
      ((years[y] = years[y] || {})[m] = years[y][m] || []).push(a);
    });
    return Object.entries(years).sort((a, b) => b[0] - a[0]).map(([y, months]) => `
      <section class="year">
        <h2 class="year-title">${y}</h2>
        ${Object.entries(months).map(([m, list]) => `
          <h3 class="month">${m} <span>${list.length} tulisan</span></h3>
          <ul class="log">${list.map((a) => `
            <li><div class="info"><a href="#/artikel/${a.slug}">${a.title}</a><small>${groupOf(a.group).name}</small></div>
            <time datetime="${a.date}">${fmt(a.date, { day: "numeric", month: "short" })}</time></li>`).join("")}</ul>`).join("")}
      </section>`).join("");
  }

  function history(active) {
    const sorted = newest(ARTICLES);
    const first = sorted[sorted.length - 1], last = sorted[0];
    const chips = [{ id: "all", name: "Semua" }, ...GROUPS].map((g) =>
      `<button type="button" class="chip" data-hfilter="${g.id}" aria-pressed="${g.id === active}">${g.name}</button>`).join("");
    const stats = GROUPS.map((g) => `<li><strong>${ARTICLES.filter((a) => a.group === g.id).length}</strong> ${g.name}</li>`).join("");
    return `
      <section class="page-head">
        <h1>Histori menulis</h1>
        <p>Jejak tulisan saya dari waktu ke waktu, disusun dari yang terbaru. ${ARTICLES.length} tulisan sejak ${fmt(first.date, { month: "long", year: "numeric" })}, terakhir terbit ${fmt(last.date)}.</p>
      </section>
      <ul class="stats" aria-label="Jumlah tulisan per kelompok">${stats}</ul>
      <div class="filters" role="group" aria-label="Filter histori menurut kelompok">${chips}</div>
      <div id="timeline" class="timeline" aria-live="polite">${timeline(active)}</div>`;
  }

  /* CV ATS: satu kolom, teks biasa, heading standar */
  function cv() {
    const s = CV;
    return `
      <div class="cv-bar no-print">
        <p>Format satu kolom dengan teks biasa agar terbaca sistem ATS. Saat mencetak, tampilan otomatis menjadi putih bersih.</p>
        <div class="cv-actions">
          <button type="button" class="btn" data-print>Cetak</button>
          <button type="button" class="btn primary" data-pdf>Unduh PDF</button>
        </div>
      </div>
      <article class="cv" id="cv">
        <header>
          <h1>${s.name}</h1>
          <p class="role">${s.title}</p>
          <p class="contact">${s.contact.join(" | ")}</p>
        </header>
        <section><h2>Ringkasan Profesional</h2><p>${s.summary}</p></section>
        <section><h2>Keterampilan Teknis</h2><ul>${s.skills.map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join("")}</ul></section>
        <section><h2>Pengalaman Proyek</h2>${s.projects.map((p) => `
          <div class="job"><h3>${p.name}</h3><p class="when">${p.meta}</p><ul>${p.points.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</section>
        <section><h2>Pendidikan</h2>${s.education.map((e) => `
          <div class="job"><h3>${e.school}</h3><p class="when">${e.degree}, ${e.period}</p></div>`).join("")}</section>
      </article>`;
  }

  function notFound() {
    return `<section class="page-head"><h1>Halaman tidak ditemukan</h1><p>Alamat yang Anda buka tidak tersedia. <a href="#/" style="border-bottom:1px solid">Kembali ke beranda</a>.</p></section>`;
  }

  return { itemsFor, grid, list, groups, group, post, history, timeline, cv, notFound };
})();