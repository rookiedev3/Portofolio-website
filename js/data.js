/* ===== Semua konten ada di sini. Ganti dengan data Anda. ===== */
window.App = window.App || {};

App.SITE = { name: "Nama Anda" };

App.GROUPS = [
  { id: "backend", name: "Backend", desc: "Desain API, basis data, dan praktik membangun layanan sisi server dengan Go dan Laravel." },
  { id: "devops", name: "DevOps", desc: "Kontainer, orkestrasi, CI/CD, dan cara menjalankan aplikasi dengan andal di produksi." },
  { id: "linux", name: "Linux/OS", desc: "Sistem operasi, shell, layanan, dan administrasi server Linux sehari-hari." },
  { id: "systems", name: "Systems", desc: "Jaringan, performa, observabilitas, dan cara kerja sistem di balik layar." }
];

App.ARTICLES = [
  { slug: "api-go-yang-mudah-dirawat", group: "backend", date: "2026-10-04",
    title: "Struktur proyek API Go yang mudah dirawat",
    excerpt: "Pisahkan handler, layanan, dan penyimpanan sejak awal agar proyek kecil tidak berubah menjadi kusut.",
    body: `<p>Proyek Go sering dimulai dari satu file <code>main.go</code>. Itu wajar, tetapi begitu endpoint bertambah, logika bisnis ikut menumpuk di handler.</p>
<h2>Tiga lapisan sederhana</h2>
<ul><li><strong>Handler</strong> membaca request dan menulis response.</li><li><strong>Service</strong> berisi aturan bisnis.</li><li><strong>Repository</strong> berbicara dengan basis data.</li></ul>
<pre><code>type UserRepo interface {
    FindByID(ctx context.Context, id int64) (*User, error)
}

type UserService struct{ repo UserRepo }</code></pre>
<p>Dengan antarmuka kecil seperti ini, layanan bisa diuji tanpa basis data sungguhan.</p>` },
  { slug: "n-plus-satu-di-laravel", group: "backend", date: "2026-09-26",
    title: "Mengenali dan memperbaiki query N+1 di Laravel",
    excerpt: "Satu halaman bisa menjalankan ratusan query tanpa terlihat. Eager loading biasanya cukup untuk menyelesaikannya.",
    body: `<p>Masalah N+1 muncul ketika relasi diakses di dalam perulangan. Setiap iterasi memicu satu query tambahan.</p>
<h2>Sebelum dan sesudah</h2>
<pre><code>// N+1
$posts = Post::all();
foreach ($posts as $p) { echo $p->author->name; }

// 2 query saja
$posts = Post::with('author')->get();</code></pre>
<p>Aktifkan <code>Model::preventLazyLoading()</code> di lingkungan pengembangan agar masalah ini ketahuan sejak dini.</p>` },
  { slug: "dockerfile-multi-stage", group: "devops", date: "2026-09-20",
    title: "Dockerfile multi-stage untuk aplikasi Go",
    excerpt: "Image akhir bisa mengecil dari ratusan megabyte menjadi belasan megabyte dengan memisahkan tahap build dan runtime.",
    body: `<p>Tahap build membutuhkan compiler, tetapi tahap runtime tidak. Multi-stage build memisahkan keduanya.</p>
<pre><code>FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./cmd/api

FROM gcr.io/distroless/static
COPY --from=build /app /app
USER nonroot
ENTRYPOINT ["/app"]</code></pre>
<p>Hasilnya image yang kecil, lebih cepat ditarik, dan memiliki permukaan serangan lebih sempit.</p>` },
  { slug: "podman-tanpa-daemon", group: "devops", date: "2026-08-29",
    title: "Podman rootless: kontainer tanpa daemon",
    excerpt: "Menjalankan kontainer sebagai pengguna biasa mengurangi risiko, dan perintahnya hampir sama dengan Docker.",
    body: `<p>Podman tidak membutuhkan daemon yang berjalan sebagai root. Setiap kontainer adalah proses biasa milik pengguna.</p>
<pre><code>podman run -d --name web -p 8080:80 docker.io/library/nginx
podman ps
podman generate systemd --new --name web</code></pre>
<p>Perintah terakhir menghasilkan unit systemd, sehingga kontainer bisa dikelola seperti layanan Linux lainnya.</p>` },
  { slug: "systemd-service-sendiri", group: "linux", date: "2026-09-14",
    title: "Membuat service systemd untuk aplikasi sendiri",
    excerpt: "Satu file unit sudah cukup agar aplikasi berjalan otomatis, dimulai ulang saat gagal, dan mudah dipantau lognya.",
    body: `<p>Daripada menjalankan aplikasi di dalam <code>screen</code>, serahkan pengelolaannya ke systemd.</p>
<pre><code>[Unit]
Description=API Saya
After=network.target

[Service]
ExecStart=/opt/api/app
Restart=on-failure
User=api

[Install]
WantedBy=multi-user.target</code></pre>
<p>Aktifkan dengan <code>systemctl enable --now api</code> dan lihat log melalui <code>journalctl -u api -f</code>.</p>` },
  { slug: "izin-file-linux", group: "linux", date: "2026-08-17",
    title: "Memahami izin file Linux tanpa menghafal angka",
    excerpt: "Angka 755 dan 644 mudah dipahami jika Anda tahu bahwa setiap digit hanyalah tiga bit.",
    body: `<p>Izin file dibagi menjadi tiga kelompok: pemilik, grup, dan lainnya. Masing-masing punya bit baca (4), tulis (2), dan eksekusi (1).</p>
<h2>Contoh</h2>
<ul><li><code>755</code>: pemilik penuh, lainnya hanya baca dan eksekusi.</li><li><code>644</code>: pemilik baca-tulis, lainnya hanya baca.</li><li><code>600</code>: hanya pemilik, cocok untuk kunci privat.</li></ul>
<p>Prinsipnya sederhana: beri izin sesempit mungkin.</p>` },
  { slug: "membaca-load-average", group: "systems", date: "2026-09-08",
    title: "Cara membaca load average dengan benar",
    excerpt: "Angka load tidak berarti apa-apa sebelum dibandingkan dengan jumlah inti CPU.",
    body: `<p>Perintah <code>uptime</code> menampilkan tiga angka: rata-rata beban selama 1, 5, dan 15 menit terakhir.</p>
<p>Pada mesin 4 inti, load 4,0 berarti CPU terpakai penuh. Load 8,0 berarti ada antrean proses yang menunggu giliran.</p>
<h2>Langkah pemeriksaan</h2>
<ul><li>Bandingkan load dengan jumlah inti dari <code>nproc</code>.</li><li>Cek apakah penyebabnya CPU atau I/O dengan <code>top</code>.</li><li>Lihat tren 15 menit untuk membedakan lonjakan sesaat dari masalah menetap.</li></ul>` },
  { slug: "dns-dan-latensi", group: "systems", date: "2026-07-30",
    title: "Kenapa DNS sering menjadi biang latensi",
    excerpt: "Sebelum koneksi pertama dibuat, aplikasi harus menerjemahkan nama menjadi alamat. Langkah ini mudah terlewat saat debugging.",
    body: `<p>Banyak keluhan \"aplikasi lambat\" ternyata berasal dari resolusi DNS yang tersendat, bukan dari kode.</p>
<pre><code>dig example.com +stats
curl -w "dns: %{time_namelookup}s\\n" -o /dev/null -s https://example.com</code></pre>
<p>Jika waktu lookup mencapai ratusan milidetik, periksa resolver, cache lokal, dan pengaturan TTL sebelum menyentuh aplikasi.</p>` }
];

/* Data CV: tulis dengan teks biasa agar terbaca mesin ATS. */
App.CV = {
  name: "Nama Lengkap Anda",
  title: "Backend dan DevOps Engineer",
  contact: ["email@contoh.com", "+62 812-0000-0000", "Yogyakarta, Indonesia", "github.com/username", "linkedin.com/in/username"],
  summary: "Engineer Backend dan DevOps dengan fokus pada pengembangan API, otomatisasi deployment, dan administrasi server Linux. Berpengalaman membangun layanan dengan Go dan Laravel, mengemas aplikasi dengan Docker dan Podman, serta menjalankannya di Kubernetes. Terbiasa menulis dokumentasi dan bekerja secara mandiri maupun dalam tim.",
  skills: [
    ["Bahasa Pemrograman", "Go, PHP, JavaScript, SQL, Bash"],
    ["Framework", "Laravel, Gin, Echo"],
    ["Cloud dan DevOps", "Docker, Podman, Kubernetes, CI/CD, GitHub Actions, Nginx"],
    ["Sistem Operasi", "Linux (Ubuntu, Debian, Rocky), systemd, administrasi server"],
    ["Basis Data", "PostgreSQL, MySQL, Redis"],
    ["Perangkat", "Git, Prometheus, Grafana"]
  ],
  projects: [
    { name: "Platform E-commerce (Backend)", meta: "Pengembang Backend, 2025 - sekarang",
      points: ["Membangun REST API dengan Laravel untuk katalog, keranjang, dan checkout.", "Mengurangi waktu muat halaman katalog dengan eager loading dan caching Redis.", "Menyusun alur deployment otomatis menggunakan Docker dan GitHub Actions."] },
    { name: "Migrasi Layanan ke Kubernetes", meta: "Engineer DevOps, 2025",
      points: ["Memindahkan layanan monolit ke kontainer dan menjalankannya di klaster Kubernetes.", "Menyiapkan pemantauan dengan Prometheus dan Grafana.", "Menulis runbook operasional untuk tim."] },
    { name: "Layanan Inventori (Go)", meta: "Pengembang Backend, 2024",
      points: ["Membuat layanan API dengan Go dan PostgreSQL untuk pengelolaan stok.", "Menambahkan pengujian otomatis dan image multi-stage yang lebih kecil."] }
  ],
  education: [
    { school: "Nama Universitas Anda", degree: "S1 Teknik Informatika", period: "2020 - 2024" }
  ]
};