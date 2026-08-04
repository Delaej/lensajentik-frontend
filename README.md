# 🦟 LensaJentik — Frontend SPA

Frontend **Single Page Application** untuk platform LensaJentik — Web-GIS pemetaan dan mitigasi risiko DBD & Malaria. Dibangun dengan Vue 3 + Vite.

---

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Struktur Halaman](#-struktur-halaman)
- [Routing](#-routing)
- [State Management](#-state-management)
- [Environment Variables](#-environment-variables)
- [Testing Manual](#-testing-manual)
- [Build & Deploy](#-build--deploy)

---

## 🛠 Tech Stack

| Komponen | Teknologi |
|---|---|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Routing | Vue Router 5 |
| State | Pinia 4 |
| HTTP Client | Axios |
| Peta | Leaflet |
| Chart | Chart.js + vue-chartjs |
| Animasi | CSS Animations + vue3-lottie |
| Ikon | Lucide Vue Next |
| Lint | ESLint + Oxlint + Prettier |

---

## 🚀 Quick Start

```bash
# 1. Install dependency
npm install

# 2. Jalankan dev server
npm run dev
# → http://localhost:5173

# 3. Build production
npm run build
# → output di folder dist/

# 4. Preview build production
npm run preview
```

> **Prasyarat:** Node.js >= 18.x, npm >= 9.x

---

## 📁 Struktur Halaman

```
src/views/
├── SplashView.vue              # Splash screen (loading + animasi nyamuk)
├── public/                     # Halaman untuk warga (publik)
│   ├── HomeView.vue            # Landing page / beranda
│   ├── RiskMapView.vue         # Peta risiko interaktif (Leaflet)
│   ├── ReportView.vue          # Form lapor genangan jentik
│   ├── StatisticsView.vue      # Statistik & tren ABJ
│   ├── EducationView.vue       # Hub edukasi (artikel, panduan)
│   ├── QuizView.vue            # Kalkulator risiko personal
│   ├── NotificationView.vue    # Pusat notifikasi
│   ├── ArticleDetailView.vue   # Detail artikel edukasi
│   ├── PrivacyPolicyView.vue   # Halaman kebijakan privasi
│   └── AboutView.vue           # Tentang kami
└── kader/                      # Portal kader kesehatan
    ├── KaderLoginView.vue      # Login kader
    ├── ForgotPasswordView.vue  # Lupa password
    ├── ResetPasswordView.vue   # Reset password
    ├── KaderDashboardView.vue  # Dashboard kader
    ├── KaderAbjView.vue        # Input & kelola data ABJ
    ├── KaderHistoryView.vue    # Riwayat & tren ABJ
    ├── KaderReportsView.vue    # Rekap laporan
    ├── KaderNotificationsView.vue
    └── KaderSettingsView.vue   # Pengaturan profil
```

### Layouts

| Layout | Digunakan Untuk |
|---|---|
| `PublicLayout.vue` | Semua halaman publik (navbar floating + footer + konten) |
| `KaderLayout.vue` | Portal kader (sidebar + header) |
| `AuthLayout.vue` | Halaman login / auth |

---

## 🛣 Routing

| Path | Name | Auth | Keterangan |
|---|---|---|---|
| `/` | `splash` | — | Splash screen, redirect ke `/beranda` |
| `/beranda` | `home` | — | Landing page |
| `/beranda/peta-resiko` | `peta-resiko` | — | Peta risiko interaktif |
| `/beranda/laporan` | `laporan` | Opsional | Form lapor jentik |
| `/beranda/statistik` | `statistik` | — | Statistik publik |
| `/beranda/notifikasi` | `notifikasi-publik` | ✅ | Pusat notifikasi |
| `/beranda/edukasi` | `edukasi` | — | Hub edukasi |
| `/beranda/edukasi/kuis` | `edukasi-kuis` | — | Kalkulator risiko |
| `/beranda/edukasi/artikel/:id` | `edukasi-artikel` | — | Detail artikel |
| `/beranda/kebijakan-privasi` | `kebijakan-privasi` | — | Kebijakan privasi |
| `/beranda/tentang-kami` | `about` | — | Tentang kami |
| `/kader/login` | `kader-login` | — | Login kader |
| `/kader/dashboard` | `kader-dashboard` | ✅ Kader | Dashboard kader |
| `/kader/abj` | `kader-abj` | ✅ Kader | Kelola data ABJ |
| `/kader/riwayat` | `kader-riwayat` | ✅ Kader | Riwayat ABJ |
| `/kader/laporan` | `kader-laporan` | ✅ Kader | Rekap laporan |
| `/kader/notifikasi` | `kader-notifikasi` | ✅ Kader | Notifikasi |
| `/kader/pengaturan` | `kader-pengaturan` | ✅ Kader | Pengaturan profil |

> Catch-all `/:pathMatch(.*)*` mengarahkan kembali ke `/` (splash).

---

## 🗃 State Management

| Store | File | Fungsi |
|---|---|---|
| `useGamificationStore` | `stores/useGamificationStore.js` | Poin user, kuota subscribe, reward |
| `useReportStore` | `stores/useReportStore.js` | State laporan warga |
| `useMapStore` | `stores/useMapStore.js` | State peta & wilayah |
| `useKaderStore` | `stores/useKaderStore.js` | State portal kader |

---

## 🔧 Environment Variables

Frontend menggunakan proxy Vite untuk development. Konfigurasi proxy di `vite.config.js`:

```js
// Default: proxy /api ke backend di localhost:8000
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

Jika backend berjalan di port berbeda, edit `vite.config.js` atau set environment variable:

```bash
# .env (root frontend)
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🧪 Testing Manual

### Cek semua halaman publik

1. Buka `http://localhost:5173` → Splash screen → klik nyamuk
2. **Beranda** — scroll untuk lihat hero, fitur, statistik, FAQ
3. **Peta Resiko** — klik `/beranda/peta-resiko`, cek peta Leaflet render dengan benar
4. **Edukasi** — klik `/beranda/edukasi`, cek artikel dan panduan
5. **Statistik** — klik `/beranda/statistik`, cek grafik Chart.js
6. **Laporan** — klik `/beranda/laporan`, coba submit form (upload foto)
7. **Notifikasi** — login dulu, cek lonceng di navbar

### Cek halaman kader

1. Buka `/kader/login` — login dengan akun kader demo
2. Setelah login, cek dashboard menampilkan data
3. Coba input ABJ di `/kader/abj`
4. Cek riwayat di `/kader/riwayat`

### Cek responsive design

- Buka Chrome DevTools → Device Toolbar
- Test di: iPhone SE, iPhone 12, iPad, Samsung Galaxy
- Pastikan navbar mobile (hamburger menu) berfungsi
- Pastikan tidak ada overflow horizontal

### Cek error state

1. Matikan backend, buka halaman yang fetch data → pastikan tidak crash
2. Submit form kosong → pastikan validasi muncul
3. Upload file > 5MB → pastikan ada pesan error

---

## 🏗 Build & Deploy

```bash
# Build production
npm run build

# Output di dist/, bisa di-serve dengan:
npm run start          # Serve statis via `serve`

# Atau deploy ke Vercel:
vercel --prod
```

### Build Commands

| Command | Deskripsi |
|---|---|
| `npm run dev` | Dev server dengan HMR |
| `npm run build` | Build production ke `dist/` |
| `npm run start` | Serve `dist/` (untuk production) |
| `npm run preview` | Preview build production lokal |
| `npm run lint` | Jalankan ESLint + Oxlint |
| `npm run format` | Format kode dengan Prettier |
