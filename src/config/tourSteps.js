// ── Guided Tour Step Definitions ────────────────────────────────────
// Setiap route name memetakan ke array step:
//   selector    — CSS selector elemen yang di-spotlight (bisa beberapa dipisah koma)
//   title       — label singkat di tooltip
//   description — penjelasan konten
//   position    — 'bottom' | 'top' | 'left' | 'right' (default 'bottom')

export const tourSteps = {

  // ── Beranda / Home ──────────────────────────────────────────────────
  home: [
    {
      selector: '.hero-full-width',
      title: '🏠 Selamat Datang di LensaJentik!',
      description:
        'Ini halaman utama LensaJentik — platform pemetaan dan mitigasi risiko DBD & Malaria berbasis data cuaca, laporan warga, dan pemantauan kader.',
      position: 'bottom',
    },
    {
      selector: '.lj-btn-primary',
      title: '🗺️ Tombol Lihat Peta',
      description:
        'Klik tombol ini untuk langsung membuka Peta Risiko Web-GIS — lihat tingkat bahaya DBD di wilayahmu secara real-time dengan kode warna merah/kuning/hijau.',
      position: 'bottom',
    },
    {
      selector: 'section:nth-of-type(2)',
      title: '📊 Tentang LensaJentik',
      description:
        'Bagian ini menjelaskan misi kami. Scroll ke bawah untuk melihat tiga kartu fitur utama: Peta Risiko, Laporan Warga, dan Sistem Berbasis Data.',
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
      selector: '.lj-section-label',
      title: '⚙️ Cara Kerja',
      description:
        'Diagram langkah cara kerja LensaJentik. Klik angka 1–4 untuk melihat detail setiap langkah: mulai dari buka peta → lapor genangan → pantau wilayah.',
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
      selector: '.lj-heading',
      title: '🗺️ Peta Risiko Nyamuk',
      description:
        'Halaman ini menampilkan peta risiko penyebaran DBD & Malaria berbasis data cuaca real-time, laporan warga, dan data ABJ dari kader kesehatan.',
      position: 'bottom',
    },
    {
      selector: '.animate-on-scroll.flex.gap-3',
      title: '🔍 Cari Wilayah',
      description:
        'Ketik nama kecamatan, kabupaten, atau kota di sini untuk melihat risiko spesifik wilayahmu. Klik hasil pencarian untuk menampilkan data detail di peta.',
      position: 'bottom',
    },
    {
      selector: '.animate-on-scroll.relative.lj-card',
      title: '📍 Peta Interaktif',
      description:
        'Peta Web-GIS menampilkan semua wilayah dengan warna risiko: 🔴 Merah (tinggi), 🟡 Kuning (sedang), 🟢 Hijau (rendah). Zoom masuk dan klik wilayah untuk detail.',
      position: 'top',
    },
  ],

  // ── Laporan ─────────────────────────────────────────────────────────
  laporan: [
    {
      selector: '.hero-full-width',
      title: '📋 Halaman Laporan',
      description:
        'Di sini kamu bisa melaporkan temuan genangan air atau sarang jentik nyamuk di lingkunganmu. Setiap laporan membantu sistem memetakan risiko lebih akurat.',
      position: 'bottom',
    },
    {
      selector: '.animate-on-scroll.space-y-0',
      title: '🗺️ Pilih Lokasi di Peta',
      description:
        'Gunakan kolom pencarian untuk mencari wilayahmu, atau seret marker di peta untuk menentukan lokasi genangan secara akurat.',
      position: 'bottom',
    },
    {
      selector: 'textarea',
      title: '📝 Deskripsi Alamat',
      description:
        'Tulis alamat lengkap lokasi genangan — misalnya: "Jl. Mawar No.5, di samping selokan". Makin detail, makin mudah kader menindaklanjuti.',
      position: 'top',
    },
    {
      selector: 'form.space-y-6',
      title: '📸 Form Laporan',
      description:
        'Unggah foto genangan, pilih apakah ingin lapor dengan identitas atau anonim, isi nama (jika identitas), dan tuliskan deskripsi singkat kondisi lokasi.',
      position: 'top',
    },
    {
      selector: 'button[type="submit"]',
      title: '✅ Kirim Laporan',
      description:
        'Setelah semua data terisi, klik "Kirim Laporan". Laporanmu akan diverifikasi kader setempat dan membantu memperbarui peta risiko wilayah tersebut.',
      position: 'top',
    },
  ],

  // ── Edukasi ─────────────────────────────────────────────────────────
  edukasi: [
    {
      selector: '.hero-full-width',
      title: '📚 Hub Edukasi & Mitigasi',
      description:
        'Pusat informasi kesehatan LensaJentik. Di sini tersedia artikel, fakta DBD, panduan 3M Plus, dan kuis interaktif untuk meningkatkan kewaspadaanmu.',
      position: 'bottom',
    },
    {
      selector: '.grid.grid-cols-2',
      title: '📊 Fakta & Statistik DBD',
      description:
        'Fakta penting seputar nyamuk Aedes aegypti, pola gigitan, siklus hidup, dan cara pencegahan yang paling efektif — berdasarkan data resmi Kemenkes.',
      position: 'bottom',
    },
    {
      selector: '.snap-center',
      title: '📰 Artikel Kesehatan',
      description:
        'Kumpulan artikel terkurasi tentang pencegahan DBD, malaria, lingkungan sehat, dan 3M Plus. Geser kartu untuk melihat semua artikel yang tersedia.',
      position: 'bottom',
    },
    {
      selector: '.lj-btn-green',
      title: '🧪 Mulai Kuis Risiko',
      description:
        'Klik tombol ini untuk mengikuti kuis interaktif — evaluasi risiko rumahmu dari faktor kebiasaan, kondisi lingkungan, dan pencegahan yang sudah kamu lakukan.',
      position: 'top',
    },
  ],

  // ── Kuis ────────────────────────────────────────────────────────────
  'edukasi-kuis': [
    {
      selector: '.lj-section-label',
      title: '🧪 Kalkulator Risiko Personal',
      description:
        'Kuis ini menilai tingkat risiko rumahmu terhadap DBD berdasarkan kondisi lingkungan dan kebiasaanmu sehari-hari. Jawaban jujur = hasil yang akurat.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '❓ Pertanyaan Kuis',
      description:
        'Baca setiap pertanyaan dengan teliti dan pilih jawaban yang paling sesuai kondisimu. Ada beberapa pertanyaan — jawab semua untuk mendapat skor akhir.',
      position: 'bottom',
    },
    {
      selector: '.lj-btn-primary, .lj-btn-green',
      title: '▶️ Tombol Lanjut / Lihat Hasil',
      description:
        'Klik untuk melanjutkan ke pertanyaan berikutnya, atau jika sudah di pertanyaan terakhir — klik untuk melihat skor risiko dan rekomendasimu.',
      position: 'top',
    },
  ],

  // ── Statistik ───────────────────────────────────────────────────────
  statistik: [
    {
      selector: '.lj-heading',
      title: '📈 Statistik & Tren ABJ',
      description:
        'Halaman ini menampilkan data statistik publik Angka Bebas Jentik (ABJ) dan tren risiko DBD per wilayah. Data diperbarui secara berkala dari laporan kader.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📊 Grafik & Data',
      description:
        'Grafik menampilkan tren ABJ dan skor risiko dari waktu ke waktu. Kamu bisa melihat apakah kondisi suatu wilayah membaik atau memburuk.',
      position: 'bottom',
    },
  ],

  // ── Notifikasi Publik ───────────────────────────────────────────────
  'notifikasi-publik': [
    {
      selector: '.lj-heading',
      title: '🔔 Pusat Notifikasi',
      description:
        'Halaman ini menampilkan semua notifikasi aktif — pemberitahuan fogging, kasus DBD baru, peringatan risiko tinggi, dan pengumuman dari dinas kesehatan.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📬 Daftar Notifikasi',
      description:
        'Setiap kartu menampilkan satu notifikasi beserta tanggal, kategori, dan detail informasinya. Notifikasi yang belum dibaca ditandai dengan highlight khusus.',
      position: 'bottom',
    },
  ],

  // ── Tentang Kami ────────────────────────────────────────────────────
  about: [
    {
      selector: '.hero-full-width',
      title: '👥 Tentang Tim LensaJentik',
      description:
        'Halaman ini menjelaskan latar belakang, visi-misi, dan tim pengembang di balik LensaJentik — platform citizen science untuk mitigasi DBD di Indonesia.',
      position: 'bottom',
    },
    {
      selector: 'section:nth-of-type(2)',
      title: '🎯 Visi & Misi',
      description:
        'Kami percaya bahwa partisipasi aktif masyarakat — dikombinasikan dengan teknologi — bisa mempercepat penanganan DBD sebelum menjadi wabah.',
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
      selector: '.hero-full-width',
      title: '🔒 Kebijakan Privasi',
      description:
        'Dokumen ini menjelaskan bagaimana LensaJentik mengumpulkan, menggunakan, dan melindungi data pribadimu. Baca dengan teliti sebelum menggunakan layanan.',
      position: 'bottom',
    },
    {
      selector: 'section',
      title: '📄 Pasal-Pasal Kebijakan',
      description:
        'Setiap bagian membahas topik berbeda: jenis data yang dikumpulkan, cara penggunaan, keamanan, dan hak-hakmu sebagai pengguna. Scroll untuk membaca semua.',
      position: 'bottom',
    },
  ],

  // ── Artikel Detail ──────────────────────────────────────────────────
  'edukasi-artikel': [
    {
      selector: '.lj-heading, h1',
      title: '📰 Artikel Kesehatan',
      description:
        'Artikel ini berisi informasi edukasi seputar DBD, malaria, atau kesehatan lingkungan yang dikurasi oleh tim LensaJentik.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📖 Isi Artikel',
      description:
        'Baca artikel lengkap di sini. Di bagian bawah tersedia tombol kembali ke daftar artikel dan link artikel terkait lainnya.',
      position: 'bottom',
    },
  ],

  // ══════════════════════════════════════════════════════════════════
  // KADER PORTAL
  // ══════════════════════════════════════════════════════════════════

  // ── Kader Login ─────────────────────────────────────────────────────
  'kader-login': [
    {
      selector: '.lj-card, form',
      title: '🔐 Login Kader Kesehatan',
      description:
        'Form login khusus untuk kader jumantik dan tenaga kesehatan yang terdaftar. Masukkan email dan kata sandi yang diberikan oleh supervisor wilayahmu.',
      position: 'bottom',
    },
    {
      selector: 'input[type="email"]',
      title: '📧 Email Kader',
      description:
        'Masukkan alamat email yang didaftarkan saat registrasi kader. Pastikan tidak ada typo sebelum klik login.',
      position: 'bottom',
    },
    {
      selector: 'input[type="password"]',
      title: '🔑 Kata Sandi',
      description:
        'Masukkan kata sandimu. Gunakan ikon mata untuk menampilkan/menyembunyikan kata sandi. Lupa kata sandi? Klik link "Lupa Kata Sandi" di bawah form.',
      position: 'top',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: '▶️ Masuk ke Dashboard',
      description:
        'Klik tombol ini setelah mengisi email dan kata sandi untuk masuk ke portal kader. Kamu akan diarahkan ke dashboard pemantauan wilayahmu.',
      position: 'top',
    },
  ],

  // ── Kader Dashboard ─────────────────────────────────────────────────
  'kader-dashboard': [
    {
      selector: 'nav, aside, .sidebar',
      title: '📌 Sidebar Navigasi',
      description:
        'Menu navigasi kader: Dashboard, Kelola Data ABJ, Riwayat & Tren, Laporan Warga, Notifikasi, dan Pengaturan. Klik ikon atau teks untuk berpindah halaman.',
      position: 'right',
    },
    {
      selector: '.lj-card:first-of-type',
      title: '📊 Ringkasan Dashboard',
      description:
        'Ringkasan data utama: jumlah rumah diperiksa, ABJ wilayahmu, laporan warga masuk, dan status wilayah binaan hari ini.',
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
      selector: '.lj-heading, h1',
      title: '📋 Kelola Data ABJ',
      description:
        'Halaman ini untuk mencatat dan mengelola data Angka Bebas Jentik (ABJ) hasil pemantauan lapanganmu. ABJ = (rumah negatif jentik ÷ total diperiksa) × 100%.',
      position: 'bottom',
    },
    {
      selector: 'form',
      title: '📝 Form Entri ABJ',
      description:
        'Isi form dengan data hasil pemeriksaan: tanggal, jumlah rumah diperiksa, jumlah rumah positif jentik, dan wilayah kecamatan yang diperiksa.',
      position: 'bottom',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: '💾 Simpan Data ABJ',
      description:
        'Setelah semua data terisi dengan benar, klik Simpan. Data akan langsung diproses dan memperbarui skor risiko pada peta publik.',
      position: 'top',
    },
  ],

  // ── Kader Riwayat ───────────────────────────────────────────────────
  'kader-riwayat': [
    {
      selector: '.lj-heading, h1',
      title: '📈 Riwayat & Tren ABJ',
      description:
        'Lihat grafik tren ABJ wilayahmu dari waktu ke waktu. Data ini membantu mengevaluasi efektivitas program PSN dan pemantauan jentik.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📊 Grafik Tren',
      description:
        'Grafik menampilkan fluktuasi ABJ per periode. Garis naik berarti kondisi membaik (lebih sedikit jentik). Garis turun perlu tindakan segera.',
      position: 'bottom',
    },
  ],

  // ── Kader Laporan ───────────────────────────────────────────────────
  'kader-laporan': [
    {
      selector: '.lj-heading, h1',
      title: '📬 Laporan Warga',
      description:
        'Daftar laporan genangan yang dikirim warga di wilayahmu. Kader bertugas memverifikasi, menindaklanjuti, dan mengupdate status setiap laporan.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📋 Kartu Laporan',
      description:
        'Setiap kartu menampilkan foto, lokasi, deskripsi, dan status laporan warga. Klik untuk melihat detail dan mengubah status (Baru → Diproses → Selesai).',
      position: 'bottom',
    },
  ],

  // ── Kader Notifikasi ────────────────────────────────────────────────
  'kader-notifikasi': [
    {
      selector: '.lj-heading, h1',
      title: '🔔 Notifikasi & Pengingat',
      description:
        'Notifikasi khusus kader: pengingat jadwal pemantauan, alert risiko tinggi di wilayah binaan, dan pesan dari supervisor atau sistem.',
      position: 'bottom',
    },
    {
      selector: '.lj-card',
      title: '📬 Daftar Notifikasi',
      description:
        'Baca dan tandai notifikasi sebagai sudah dibaca. Notifikasi penting ditandai dengan warna berbeda agar mudah dikenali.',
      position: 'bottom',
    },
  ],

  // ── Kader Pengaturan ────────────────────────────────────────────────
  'kader-pengaturan': [
    {
      selector: '.lj-heading, h1',
      title: '⚙️ Pengaturan Profil',
      description:
        'Kelola profil akunmu: nama, nomor HP, foto profil, dan wilayah binaan. Informasi ini ditampilkan pada dashboard dan laporan kader.',
      position: 'bottom',
    },
    {
      selector: 'form',
      title: '✏️ Edit Profil',
      description:
        'Update data diri dan kontak di form ini. Klik Simpan setelah selesai mengubah. Pastikan nomor HP aktif agar bisa menerima notifikasi SMS.',
      position: 'bottom',
    },
    {
      selector: 'button[type="submit"], .lj-btn-primary',
      title: '💾 Simpan Perubahan',
      description:
        'Klik tombol ini untuk menyimpan semua perubahan profil yang sudah kamu buat.',
      position: 'top',
    },
  ],
}
