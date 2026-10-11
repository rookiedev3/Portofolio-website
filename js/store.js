/* Riwayat baca disimpan di localStorage. Aman jika storage diblokir browser. */
window.App = window.App || {};
App.store = (() => {
  const KEY = "portfolio:history:v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* abaikan */ } };
  return {
    all: read,
    has: (slug) => read().some((x) => x.slug === slug),
    add(slug) { write([{ slug, ts: Date.now() }, ...read().filter((x) => x.slug !== slug)].slice(0, 100)); },
    remove(slug) { write(read().filter((x) => x.slug !== slug)); },
    clear() { try { localStorage.removeItem(KEY); } catch { /* abaikan */ } }
  };
})();