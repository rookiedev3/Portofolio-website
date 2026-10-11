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
  { slug: "load-balancer-nginx-docker-compose", group: "devops", date: "2026-06-15",
    title: "Mencoba Membuat Load Balancer Menggunakan Nginx untuk Meningkatkan Performa Web Server",
    excerpt: "Ketika jumlah pengguna sebuah website semakin bertambah, beban kerja web server menjadi lebih berat. Ketika beban kerja melebihi batas dari kemampuan web server bisa menyebabkan website terasa lambat bahkan bisa membuat server down.",
    body: `<p>Ketika jumlah pengguna sebuah website semakin bertambah, beban kerja web server menjadi lebih berat. Ketika beban kerja melebihi batas dari kemampuan web server bisa menyebabkan website terasa lambat bahkan bisa membuat server down.</p>
<p>Salah satu solusi yang efektif untuk menangani lonjakan beban kerja web server bisa menggunakan load balancer untuk menyebarkan beban ke beberapa web server. Load balancer berfungsi untuk menyebarkan beban secara merata ke beberapa web server. Percobaan kali ini saya akan menggunakan nginx sebagai load balancer, yang terkenal ringan dan stabil, untuk mendistribusikan beban kerja ke web nodejs di dalam docker-compose.</p>
<h2>Strategi arsitektur</h2>
<p>kita akan membuat docker compose dengan struktur seperti berikut:</p>
<ul><li>3 container nodejs: Bertindak sebagai backend server.</li><li>1 container nginx: Bertindak load balancer.</li><li>1 docker network: Berfungsi untuk menyambungkan semua container dan menjaga keamanan dari akses luar yang tidak diinginkan.</li></ul>
<p>Supaya manajemen file rapi saya menulis file secara terstruktur, Berikut struktur file yang akan dibuat:</p>
<pre><code>load-balancer/
├── docker-compose.yml
├── nginx-lb
│   ├── conf.d
│   │   └── default.conf
│   └── Dockerfile
└── web-app
    ├── Dockerfile
    ├── .dockerignore
    ├── index.js
    ├── node_modules
    ├── package.json
    └── package-lock.json</code></pre>
<h2>1. Membuat direktori web</h2>
<p>Buat direktori untuk membuat image web-app sederhana terlebih dahulu.</p>
<pre><code>$ mkdir web-app &amp;&amp; cd web-app</code></pre>
<h2>1. Membuat aplikasi</h2>
<p>Selanjutnya kita membuat file index.js untuk web-appnya. Pada variable NUMBER akan menjadi pembeda pada setiap continer. Variable NUMBER akan mengambil nilai dari ENV docker compose. Berikut isi file index.js:</p>
<pre><code>const express = require('express');

// Env
const PORT = 8080
const NUMBER = process.env.NUMBER || 1;

// App
const app = express();
app.get('/', (req, res) =&gt; {
  res.send(\`&lt;h1&gt;Hello from container number \${NUMBER}&lt;/h1&gt;\`);
});

app.listen(PORT, () =&gt; {
  console.log(\`Running on http://localhost:\${PORT}\`);
});</code></pre>
<p>Lanjut dengan menuliskan <code>package.json</code>-nya.</p>
<pre><code>{
  "name": "docker_web_app",
  "version": "1.0.0",
  "description": "Node.js simple web",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "build": "mkdir -p dist &amp;&amp; cp index.js dist/"
  },
  "dependencies": {
    "express": "^4.16.1"
  }
}</code></pre>
<p>Jalankan command <code>npm install,</code> npm install berfungsi untuk mendownload semua library yang dibutuhkan.</p>
<pre><code>$ npm install</code></pre>
<p>Buat Dockerfile untuk membuat web-app image.</p>
<pre><code>FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev &amp;&amp; npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 8080
USER node
CMD  ["node", "dist/index.js"]</code></pre>
<p>Buat.dockerignore file untuk memberi tahu docker file dan direktori mana saja yang tidak masuk kedalam docker build.</p>
<pre><code>node_modules
npm-debug.log</code></pre>
<p>Jalankan command build docker untuk menjalankan build image untuk web-app.</p>
<pre><code>$ docker build -t web-app .</code></pre>
<p>Buat direktori load balancer untuk menyimpan semua file yang diperlukan untuk load balancer. Tambah direktori conf.d untuk direktori konfigurasi nginx.</p>
<pre><code>$ cd ..
$ mkdir nginx-lb &amp;&amp; cd nginx-lb
$ mkdir conf.d &amp;&amp; cd conf.d</code></pre>
<p>Buat file default.conf untuk konfigurasi loadbalancer.</p>
<pre><code>upstream backend {
    server web1:8080;
    server web2:8080;
    server web3:8080;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}</code></pre>
<p>kembali ke direktori nginx-lb lalu buat Dockefile.</p>
<pre><code>FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY conf.d/ /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]</code></pre>
<p>Jalankan command build docker untuk menjalankan build image untuk nginx-lb.</p>
<pre><code>$ docker build -t nginx-lb .</code></pre>
<p>Kembali ke direktori load-balancer lalu buat docker compose.yml</p>
<pre><code>version: '3.8'
services:
  web-app1:
    image: "web-app"
    environment:
      NUMBER : 1
    container_name: web1
    networks:
      - backend-network

  web-app2:
    image: "web-app"
    container_name: web2
    environment:
      NUMBER : 2
    networks:
      - backend-network

  web-app3:
    image: "web-app"
    container_name: web3
    environment:
      NUMBER : 3
    networks:
      - backend-network

  nginx-lb:
    image: "nginx-lb"
    container_name: nginx
    ports:
      - "8080:80"
    networks:
      - backend-network
    depends_on:
      - web-app1
      - web-app2
      - web-app3

networks:
  backend-network:
    driver: bridge</code></pre>
<p>Jalankan command docker compose up -d untuk menjalankan file docker compose.</p>
<pre><code>$ docker compose up -d</code></pre>
<p>Setelah docker compose sudah berjalan, loadbalancer bisa diakses lewat browser dengan url http://localhost:8080. refresh halaman beberapa kali. Perhatikan angka container number yang muncul. Jika angkanya berubah-ubah (1, 2, 3), artinya Load Balancer berhasil.</p>
<p>Load balancer juga bisa diakses lewat terminal dengan command curl http://localhost:8080</p>
<pre><code>$ curl http://localhost:8080
&lt;h1&gt;Hello from container number 1&lt;/h1&gt;
$ curl http://localhost:8080
&lt;h1&gt;Hello from container number 2&lt;/h1&gt;
$ curl http://localhost:8080
&lt;h1&gt;Hello from container number 3&lt;/h1&gt;</code></pre>` }
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