// ── Guided Tour Step Definitions ────────────────────────────────────
// Each route name maps to an array of step objects:
//   selector  — CSS selector for the element to spotlight
//   title     — short label for the tooltip
//   description — explanation text
//   position  — where to place the tooltip relative to the element:
//               'bottom' | 'top' | 'left' | 'right' (default 'bottom')

export const tourSteps = {
  // ── Beranda / Home ──────────────────────────────────────────────
  home: [
    {
      selector: 'header',
      title: 'Navigasi Utama',
      description:
        'Navbar mengambang berisi menu Beranda, Peta Resiko, Laporan, Edukasi, dan Statistik. Klik menu mana saja untuk berpindah halaman.',
      position: 'bottom',
    },
    {
      selector: 'header a[href="/beranda/peta-resiko"]',
      title: 'Peta Resiko',
      description:
        'Buka Peta Resiko Web-GIS untuk melihat sebaran risiko DBD di wilayah kamu secara real-time.',
      position: 'bottom',
    },
    {
      selector: 'header a[href="/beranda/laporan"]',
      title: 'Laporan',
      description:
        'Laporkan temuan genangan jentik nyamuk di sekitar kamu. Data ini membantu pemetaan risiko.',
      position: 'bottom',
    },
    {
      selector: 'header a[href="/beranda/edukasi"]',
      title: 'Edukasi',
      description:
        'Akses artikel kesehatan, kalkulator risiko personal, dan kuis interaktif tentang DBD & malaria.',
      position: 'bottom',
    },
    {
      selector: 'header a[href="/kader/login"]',
      title: 'Login Kader',
      description:
        'Kader kesehatan bisa login di sini untuk mengelola data ABJ, laporan, dan notifikasi.',
      position: 'bottom',
    },
  ],

  // ── Peta Resiko ──────────────────────────────────────────────────
  'peta-resiko': [
    {
      selector: '.map-container, .leaflet-container, [class*="map"]',
      title: 'Peta Interaktif',
      description:
        'Peta Web-GIS menampilkan sebaran risiko DBD dengan kode warna: merah (tinggi), kuning (sedang), hijau (rendah). Zoom dan geser untuk eksplorasi.',
      position: 'bottom',
    },
    {
      selector: '.risk-legend, [class*="legend"]',
      title: 'Legenda Risiko',
      description:
        'Legenda menjelaskan arti warna pada peta. Merah = risiko tinggi, Kuning = sedang, Hijau = rendah.',
      position: 'right',
    },
  ],

  // ── Laporan ──────────────────────────────────────────────────────
  laporan: [
    {
      selector: 'form, [class*="form"]',
      title: 'Form Laporan',
      description:
        'Isi form ini untuk melaporkan genangan air atau tempat perkembangbiakan jentik nyamuk. Data kamu sangat berharga untuk mitigasi DBD.',
      position: 'bottom',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: 'Kirim Laporan',
      description:
        'Setelah mengisi data, klik tombol ini untuk mengirim laporan. Laporan akan diverifikasi oleh kader setempat.',
      position: 'top',
    },
  ],

  // ── Edukasi ──────────────────────────────────────────────────────
  edukasi: [
    {
      selector: '[class*="article"], [class*="card"]',
      title: 'Artikel Edukasi',
      description:
        'Kumpulan artikel kesehatan tentang pencegahan DBD, malaria, dan pola hidup sehat. Ketuk untuk membaca selengkapnya.',
      position: 'bottom',
    },
    {
      selector: 'a[href*="kuis"], [class*="quiz"], .lj-btn-green',
      title: 'Kuis Interaktif',
      description:
        'Uji pengetahuanmu tentang DBD dengan kuis interaktif. Dapatkan skor dan rekomendasi personal.',
      position: 'top',
    },
  ],

  // ── Statistik ────────────────────────────────────────────────────
  statistik: [
    {
      selector: 'canvas, [class*="chart"], .chart-container',
      title: 'Grafik & Statistik',
      description:
        'Grafik dan diagram menampilkan tren data DBD dari waktu ke waktu. Gunakan untuk memahami pola penyebaran.',
      position: 'bottom',
    },
    {
      selector: '[class*="filter"], [class*="dropdown"]',
      title: 'Filter Data',
      description:
        'Gunakan filter untuk menampilkan data berdasarkan wilayah, rentang waktu, atau kategori tertentu.',
      position: 'bottom',
    },
  ],

  // ── Kader Dashboard ──────────────────────────────────────────────
  'kader-dashboard': [
    {
      selector: 'aside, [class*="sidebar"]',
      title: 'Sidebar Navigasi',
      description:
        'Sidebar berisi menu Dashboard, Kelola Data ABJ, Riwayat & Tren, Laporan, Notifikasi, dan Pengaturan.',
      position: 'right',
    },
    {
      selector: 'main, [class*="main"]',
      title: 'Dashboard Kader',
      description:
        'Ringkasan data ABJ, jumlah laporan masuk, dan statistik wilayah binaan kamu ditampilkan di sini.',
      position: 'left',
    },
    {
      selector: 'a[href="/kader/abj"], [class*="input"]',
      title: 'Input Data ABJ',
      description:
        'Klik di sini untuk mencatat data Angka Bebas Jentik (ABJ) dari hasil pemantauan lapangan.',
      position: 'bottom',
    },
  ],

  // ── Kader ABJ ────────────────────────────────────────────────────
  'kader-abj': [
    {
      selector: 'form, [class*="form"]',
      title: 'Form Entri ABJ',
      description:
        'Catat hasil pemeriksaan jentik di lapangan: jumlah rumah/bangunan diperiksa, jumlah positif jentik, dan detail lokasi.',
      position: 'bottom',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: 'Simpan Data',
      description:
        'Setelah semua data terisi dengan benar, klik Simpan. Data akan langsung masuk ke sistem dan memperbarui peta risiko.',
      position: 'top',
    },
  ],

  // ── Notifikasi ──────────────────────────────────────────────────
  'notifikasi-publik': [
    {
      selector: '[class*="notification"], [class*="list"]',
      title: 'Daftar Notifikasi',
      description:
        'Notifikasi berisi info fogging, kasus DBD terbaru, dan pengumuman penting dari dinas kesehatan.',
      position: 'bottom',
    },
  ],
}
