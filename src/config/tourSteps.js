// ── Guided Tour Step Definitions ────────────────────────────────────
// Setiap route name memetakan ke array step:
//   selector    — CSS selector elemen yang di-spotlight
//   title       — label singkat di tooltip
//   description — penjelasan konten
//   position    — 'bottom' | 'top' | 'left' | 'right' (default 'bottom')
//
// ATURAN: Step pertama di setiap halaman SELALU menyorot h1/.lj-heading
//         (bukan hero image / .hero-full-width).

export const tourSteps = {

  // ── Beranda / Home ──────────────────────────────────────────────────
  home: [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '🏠 Selamat Datang di LensaJentik!',
      description:
        'Ini halaman utama LensaJentik — platform pemetaan dan mitigasi risiko DBD & Malaria berbasis data cuaca real-time, laporan warga, dan pemantauan kader kesehatan.',
      position: 'bottom',
    },
    {
      selector: '.lj-btn-primary',
      title: '🗺️ Tombol Lihat Peta',
      description:
        'Klik tombol ini untuk langsung membuka Peta Risiko Web-GIS — lihat tingkat bahaya DBD di wilayahmu dengan kode warna merah (tinggi), kuning (sedang), hijau (rendah).',
      position: 'bottom',
    },
    {
      selector: 'section:nth-of-type(2)',
      title: '📊 Tentang LensaJentik',
      description:
        'Bagian ini menjelaskan misi kami dan menampilkan data statistik darurat DBD di Indonesia — rekor tertinggi, beban global, dan ketimpangan antarwilayah.',
      position: 'top',
    },
    {
      selector: 'section:nth-of-type(3)',
      title: '✨ Fitur Unggulan',
      description:
        'Slider interaktif menampilkan empat fitur utama LensaJentik. Klik panah kiri/kanan atau titik di bawah untuk menjelajahi Peta Risiko, Laporan Warga, Edukasi, dan Statistik.',
      position: 'bottom',
    },
    {
      selector: '#home-carakerja-section',
      title: '⚙️ Cara Kerja LensaJentik',
      description:
        'Diagram empat langkah cara kerja platform: 1) Buka Peta Risiko → 2) Lapor Genangan → 3) Kader Pantau → 4) Data Perbarui Peta. Klik angka 1–4 untuk detail tiap langkah.',
      position: 'bottom',
    },
    {
      selector: '.faq-section',
      title: '❓ Pertanyaan Umum (FAQ)',
      description:
        'Kumpulan pertanyaan yang sering ditanyakan tentang LensaJentik, cara penggunaan, privasi data, dan laporan. Klik pertanyaan untuk membuka jawabannya.',
      position: 'top',
    },
  ],

  // ── Peta Resiko ─────────────────────────────────────────────────────
  'peta-resiko': [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '🗺️ Peta Risiko Nyamuk',
      description:
        'Halaman ini menampilkan peta risiko penyebaran DBD & Malaria berbasis data cuaca real-time, laporan warga, dan data ABJ dari kader kesehatan.',
      position: 'bottom',
    },
    {
      selector: '.animate-on-scroll.flex.gap-3',
      title: '🔍 Cari Wilayah',
      description:
        'Ketik nama kecamatan, kabupaten, atau kota di kolom ini untuk melihat risiko spesifik wilayahmu. Klik hasil pencarian untuk menampilkan data detail di peta.',
      position: 'bottom',
    },
    {
      selector: '.animate-on-scroll.relative.lj-card',
      title: '📍 Peta Interaktif',
      description:
        'Peta Web-GIS menampilkan semua wilayah dengan warna risiko. Zoom masuk dan klik wilayah mana saja untuk melihat data skor risiko dan cuaca real-time.',
      position: 'top',
    },
    {
      selector: '.risk-legend',
      title: '🎨 Legenda Tingkat Risiko',
      description:
        'Legenda warna peta: 🔴 Merah = Risiko Tinggi, 🟡 Kuning = Sedang, 🟢 Hijau = Rendah, ⚪ Abu-abu = Belum Ada Data lapangan (hanya estimasi cuaca).',
      position: 'top',
    },
  ],

  // ── Laporan ─────────────────────────────────────────────────────────
  laporan: [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '📋 Halaman Laporan',
      description:
        'Di sini kamu bisa melaporkan temuan genangan air atau sarang jentik nyamuk di lingkunganmu. Setiap laporan membantu sistem memetakan risiko secara akurat.',
      position: 'bottom',
    },
    {
      selector: '#report-map-section',
      title: '🗺️ Pilih Lokasi di Peta',
      description:
        'Gunakan kolom pencarian untuk mencari kelurahan/kecamatanmu, atau geser marker di peta untuk menentukan titik lokasi genangan air secara tepat.',
      position: 'bottom',
    },
    {
      selector: '#report-address-section',
      title: '📝 Alamat Spesifik',
      description:
        'Tuliskan alamat lengkap lokasi genangan — contoh: "Jl. Diponegoro No 10, selokan sebelah kanan rumah". Makin detail, makin cepat kader menindaklanjuti.',
      position: 'top',
    },
    {
      selector: '#report-mode-section',
      title: '👤 Opsi Identitas Pelapor',
      description:
        'Pilih apakah kamu ingin melaporkan dengan nama lengkap (identitas) atau tetap anonim. Laporan anonim tetap diproses dan diverifikasi oleh kader.',
      position: 'top',
    },
    {
      selector: '#report-form-section',
      title: '📸 Upload Foto & Deskripsi',
      description:
        'Unggah foto genangan air atau sarang nyamuk yang kamu temukan, lalu tuliskan deskripsi singkat kondisi lokasi (ukuran genangan, durasi, kondisi sekitar).',
      position: 'top',
    },
    {
      selector: '#report-submit-btn',
      title: '✅ Kirim Laporan',
      description:
        'Setelah semua data terisi, klik "Kirim Laporan". Laporanmu langsung diteruskan ke kader setempat dan kamu akan mendapatkan notifikasi perkembangan verifikasinya.',
      position: 'top',
    },
  ],

  // ── Edukasi ─────────────────────────────────────────────────────────
  edukasi: [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '📚 Hub Edukasi & Mitigasi',
      description:
        'Pusat informasi kesehatan LensaJentik. Di sini tersedia fakta DBD, panduan 3M Plus, artikel terkini, dan kalkulator kuis interaktif untuk mengukur risiko rumahmu.',
      position: 'bottom',
    },
    {
      selector: '#edukasi-stats',
      title: '📊 Fakta & Informasi DBD',
      description:
        'Fakta penting seputar nyamuk Aedes aegypti: jam aktif menggigit (pagi 08–10 & sore 16–17), tempat bertelur favorit, dan metode pencegahan berbasis riset Kemenkes RI.',
      position: 'bottom',
    },
    {
      selector: '#edukasi-artikel',
      title: '📰 Artikel Kesehatan Terbaru',
      description:
        'Kumpulan artikel berita dan panduan pencegahan DBD & malaria. Arahkan kursor atau ketuk kartu artikel untuk membaca isi selengkapnya.',
      position: 'bottom',
    },
    {
      selector: '#edukasi-kalkulator',
      title: '🧪 Kalkulator Risiko DBD',
      description:
        'Klik tombol "Mulai Kuis" di sini untuk mengevaluasi tingkat risiko rumahmu. Jawab beberapa pertanyaan singkat tentang kondisi dan kebiasaan lingkunganmu.',
      position: 'top',
    },
  ],

  // ── Kuis ────────────────────────────────────────────────────────────
  'edukasi-kuis': [
    {
      selector: 'h1.lj-heading, .lj-heading, .lj-section-label',
      title: '🧪 Kalkulator Risiko Personal',
      description:
        'Kuis ini menilai tingkat risiko rumahmu terhadap DBD berdasarkan kondisi lingkungan dan kebiasaan sehari-hari. Jawab dengan jujur untuk mendapat hasil akurat.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '❓ Pertanyaan Kuis',
      description:
        'Baca setiap pertanyaan dengan teliti dan pilih jawaban yang paling sesuai kondisimu. Setelah semua pertanyaan dijawab, skor risiko dan rekomendasi akan muncul.',
      position: 'bottom',
    },
    {
      selector: '.lj-btn-primary, .lj-btn-green',
      title: '▶️ Tombol Lanjut / Lihat Hasil',
      description:
        'Klik untuk melanjutkan ke pertanyaan berikutnya. Jika sudah di pertanyaan terakhir, klik untuk melihat skor risiko dan rekomendasi tindakan yang perlu dilakukan.',
      position: 'top',
    },
  ],

  // ── Statistik ───────────────────────────────────────────────────────
  statistik: [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '📈 Statistik Kecamatan',
      description:
        'Halaman ini menampilkan data statistik publik Angka Bebas Jentik (ABJ), ringkasan nasional, dan ranking zona risiko per kecamatan di seluruh Indonesia.',
      position: 'bottom',
    },
    {
      selector: '#stats-search-bar',
      title: '🔍 Cari & Export Data Kecamatan',
      description:
        'Ketik nama kecamatan untuk melihat detail skor risiko, tren ABJ bulanan, serta mengunduh rekap data dalam format Excel atau PDF untuk keperluan pelaporan.',
      position: 'bottom',
    },
    {
      selector: '#stats-summary-cards',
      title: '📊 Ringkasan Data Nasional',
      description:
        'Empat kartu menampilkan: rata-rata skor risiko nasional, persentase ABJ Indonesia 30 hari terakhir, distribusi zona (hijau/kuning/merah), dan total laporan warga nasional.',
      position: 'bottom',
    },
    {
      selector: '#stats-rankings-section',
      title: '🏆 Ranking Zona Hijau & Merah',
      description:
        'Daftar Top 10 kecamatan teraman (Zona Hijau) dan Top 10 kecamatan paling berisiko (Zona Merah). Klik nama kecamatan untuk membuka detail data ABJ dan skor risikonya.',
      position: 'top',
    },
  ],

  // ── Notifikasi Publik ───────────────────────────────────────────────
  'notifikasi-publik': [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '🔔 Pusat Notifikasi',
      description:
        'Halaman ini menampilkan semua notifikasi aktif — pemberitahuan fogging, kasus DBD baru, peringatan risiko tinggi, dan pengumuman dari dinas kesehatan setempat.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📬 Daftar Notifikasi',
      description:
        'Setiap kartu menampilkan satu notifikasi beserta tanggal, kategori, dan detail informasinya. Notifikasi yang belum dibaca ditandai dengan warna khusus.',
      position: 'bottom',
    },
  ],

  // ── Tentang Kami ────────────────────────────────────────────────────
  about: [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '👥 Tentang Tim LensaJentik',
      description:
        'Halaman ini menjelaskan latar belakang, visi-misi, dan tim pengembang di balik LensaJentik — platform citizen science untuk mitigasi DBD di Indonesia.',
      position: 'bottom',
    },
    {
      selector: 'section:nth-of-type(2)',
      title: '🎯 Visi & Misi',
      description:
        'Kami percaya bahwa partisipasi aktif masyarakat — dikombinasikan dengan teknologi — bisa mempercepat penanganan DBD sebelum berkembang menjadi wabah.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '🏗️ Tim & Teknologi',
      description:
        'Profil tim dan teknologi yang digunakan dalam membangun LensaJentik: Vue.js, Leaflet GIS, Laravel, Open-Meteo API, dan sistem gamifikasi laporan warga.',
      position: 'top',
    },
  ],

  // ── Kebijakan Privasi ───────────────────────────────────────────────
  'kebijakan-privasi': [
    {
      selector: 'h1.lj-heading, .lj-heading',
      title: '🔒 Kebijakan Privasi',
      description:
        'Dokumen ini menjelaskan bagaimana LensaJentik mengumpulkan, menggunakan, dan melindungi data pribadimu. Baca dengan teliti sebelum menggunakan layanan kami.',
      position: 'bottom',
    },
    {
      selector: 'section',
      title: '📄 Pasal-Pasal Kebijakan',
      description:
        'Setiap bagian membahas topik berbeda: jenis data yang dikumpulkan, cara penggunaan, keamanan data, dan hak-hakmu sebagai pengguna. Scroll untuk membaca semua.',
      position: 'bottom',
    },
  ],

  // ── Artikel Detail ──────────────────────────────────────────────────
  'edukasi-artikel': [
    {
      selector: 'h1.lj-heading, h1, .lj-heading',
      title: '📰 Artikel Kesehatan',
      description:
        'Artikel ini berisi informasi edukasi seputar DBD, malaria, atau kesehatan lingkungan yang dikurasi dan diverifikasi oleh tim LensaJentik.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📖 Isi Artikel',
      description:
        'Baca artikel lengkap di sini. Di bagian bawah tersedia tombol kembali ke daftar artikel dan tautan menuju artikel terkait lainnya.',
      position: 'bottom',
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // KADER PORTAL
  // ══════════════════════════════════════════════════════════════════

  // ── Kader Login ─────────────────────────────────────────────────────
  'kader-login': [
    {
      selector: 'h1.lj-heading, h1, .lj-card',
      title: '🔐 Login Kader Kesehatan',
      description:
        'Form login khusus untuk kader jumantik dan tenaga kesehatan yang terdaftar. Masukkan email dan kata sandi yang diberikan oleh supervisor wilayahmu.',
      position: 'bottom',
    },
    {
      selector: 'input[type="email"]',
      title: '📧 Email Kader',
      description:
        'Masukkan alamat email yang didaftarkan saat registrasi kader. Pastikan tidak ada kesalahan ketik sebelum menekan tombol login.',
      position: 'bottom',
    },
    {
      selector: 'input[type="password"]',
      title: '🔑 Kata Sandi',
      description:
        'Masukkan kata sandimu. Klik ikon mata untuk menampilkan/menyembunyikan teks. Lupa kata sandi? Gunakan link "Lupa Kata Sandi" di bawah form.',
      position: 'top',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: '▶️ Masuk ke Dashboard',
      description:
        'Klik setelah mengisi email dan kata sandi. Kamu akan diarahkan ke dashboard pemantauan wilayah binaanmu.',
      position: 'top',
    },
  ],

  // ── Kader Dashboard ─────────────────────────────────────────────────
  'kader-dashboard': [
    {
      selector: 'h1.lj-heading, h1, nav',
      title: '📌 Dashboard Kader',
      description:
        'Selamat datang di portal kader! Sidebar kiri berisi menu navigasi: Dashboard, Kelola Data ABJ, Riwayat & Tren, Laporan Warga, Notifikasi, dan Pengaturan.',
      position: 'bottom',
    },
    {
      selector: '.lj-card:first-of-type',
      title: '📊 Ringkasan Hari Ini',
      description:
        'Ringkasan data utama: jumlah rumah diperiksa hari ini, persentase ABJ wilayahmu, laporan warga masuk, dan status terkini wilayah binaan.',
      position: 'bottom',
    },
    {
      selector: '.lj-btn-primary, .lj-btn-green',
      title: '➕ Input Data ABJ',
      description:
        'Klik tombol ini untuk mencatat hasil pemeriksaan jentik di lapangan. Data ABJ yang kamu masukkan akan langsung memperbarui peta risiko publik.',
      position: 'top',
    },
  ],

  // ── Kader ABJ ───────────────────────────────────────────────────────
  'kader-abj': [
    {
      selector: 'h1.lj-heading, h1',
      title: '📋 Kelola Data ABJ',
      description:
        'Halaman untuk mencatat dan mengelola data Angka Bebas Jentik (ABJ). Rumus: ABJ = (rumah tanpa jentik ÷ total rumah diperiksa) × 100%. Target nasional ≥ 95%.',
      position: 'bottom',
    },
    {
      selector: 'form',
      title: '📝 Form Entri ABJ',
      description:
        'Isi form dengan data hasil pemeriksaan: tanggal pemeriksaan, jumlah rumah diperiksa, jumlah rumah positif jentik, dan wilayah kecamatan yang diperiksa.',
      position: 'bottom',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: '💾 Simpan Data ABJ',
      description:
        'Setelah semua data terisi dengan benar, klik Simpan. Data langsung diproses oleh sistem dan skor risiko pada peta publik akan diperbarui secara otomatis.',
      position: 'top',
    },
  ],

  // ── Kader Riwayat ───────────────────────────────────────────────────
  'kader-riwayat': [
    {
      selector: 'h1.lj-heading, h1',
      title: '📈 Riwayat & Tren ABJ',
      description:
        'Lihat grafik tren ABJ wilayah binaanmu dari waktu ke waktu. Data ini membantu mengevaluasi efektivitas program PSN dan pemantauan jentik yang kamu lakukan.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📊 Grafik Tren',
      description:
        'Grafik menampilkan fluktuasi ABJ per periode. Garis naik = kondisi membaik (lebih sedikit jentik). Garis turun = perlu tindakan PSN segera.',
      position: 'bottom',
    },
  ],

  // ── Kader Laporan ───────────────────────────────────────────────────
  'kader-laporan': [
    {
      selector: 'h1.lj-heading, h1',
      title: '📬 Laporan Warga',
      description:
        'Daftar semua laporan genangan yang dikirim warga di wilayah binaanmu. Kader bertugas memverifikasi, menindaklanjuti, dan mengupdate status setiap laporan.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📋 Kartu Laporan',
      description:
        'Setiap kartu menampilkan foto, lokasi, deskripsi, dan status laporan warga. Klik kartu untuk membuka detail dan mengubah status (Baru → Diproses → Selesai).',
      position: 'bottom',
    },
  ],

  // ── Kader Notifikasi ────────────────────────────────────────────────
  'kader-notifikasi': [
    {
      selector: 'h1.lj-heading, h1',
      title: '🔔 Notifikasi & Pengingat',
      description:
        'Notifikasi khusus kader: pengingat jadwal pemantauan rutin, alert risiko tinggi di wilayah binaan, dan pesan dari supervisor atau sistem pemantauan.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📬 Daftar Notifikasi',
      description:
        'Baca dan tandai notifikasi sebagai sudah dibaca. Notifikasi mendesak ditandai dengan warna merah agar mudah dikenali dan diprioritaskan.',
      position: 'bottom',
    },
  ],

  // ── Kader Pengaturan ────────────────────────────────────────────────
  'kader-pengaturan': [
    {
      selector: 'h1.lj-heading, h1',
      title: '⚙️ Pengaturan Profil',
      description:
        'Kelola profil akunmu: nama lengkap, nomor HP, foto profil, dan wilayah binaan. Informasi ini ditampilkan pada dashboard dan laporan kader.',
      position: 'bottom',
    },
    {
      selector: 'form',
      title: '✏️ Edit Profil',
      description:
        'Update data diri dan kontak di sini. Klik Simpan setelah selesai. Pastikan nomor HP aktif agar bisa menerima notifikasi penting dari sistem.',
      position: 'bottom',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: '💾 Simpan Perubahan',
      description:
        'Klik tombol ini untuk menyimpan semua perubahan profil yang sudah kamu buat. Perubahan berlaku langsung setelah tersimpan.',
      position: 'top',
    },
  ],
}
