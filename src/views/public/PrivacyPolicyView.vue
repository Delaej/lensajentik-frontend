<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Shield, Lock, Eye, Server, FileText, Cookie,
  UserCheck, AlertTriangle, Database, Mail, Globe,
  ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-vue-next'

/* ─── Accordion state ─────────────────────────────────────────────────────── */
const openSection = ref(null)

const toggleSection = (index) => {
  openSection.value = openSection.value === index ? null : index
}

/* ─── Policy sections ─────────────────────────────────────────────────────── */
const sections = [
  {
    id: 'pengantar',
    icon: Shield,
    title: '1. Pengantar',
    color: '#4E63DA',
    content: `Selamat datang di LensaJentik. Kami berkomitmen penuh untuk melindungi privasi dan keamanan data setiap pengguna yang mengakses platform kami, baik warga masyarakat maupun kader kesehatan.

Kebijakan Privasi ini menjelaskan bagaimana LensaJentik mengumpulkan, menggunakan, menyimpan, dan melindungi informasi yang Anda berikan saat menggunakan layanan kami. Dengan mengakses dan menggunakan LensaJentik, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.

LensaJentik adalah platform pemetaan dan mitigasi risiko Demam Berdarah Dengue (DBD) dan Malaria berbasis Web-GIS yang dikembangkan untuk mendukung program kesehatan masyarakat Indonesia. Kami memahami bahwa data yang kami kelola bersifat sensitif dan berdampak langsung pada kesehatan publik.`
  },
  {
    id: 'data-dikumpulkan',
    icon: Database,
    title: '2. Informasi yang Kami Kumpulkan',
    color: '#4E63DA',
    content: `LensaJentik dirancang dengan prinsip minimalisasi data — kami hanya mengumpulkan informasi yang benar-benar diperlukan untuk menjalankan fungsi platform:

a. Data Laporan Warga (Anonim):
• Titik koordinat lokasi genangan jentik yang dilaporkan
• Foto genangan yang diunggah (opsional)
• Keterangan singkat mengenai lokasi
• Estimasi tingkat risiko berdasarkan parameter yang diisi
• Data sesi anonim (session-based) — tanpa nama, email, atau identitas pribadi

b. Data Kader Kesehatan (Terautentikasi):
• Nama lengkap kader (sesuai registrasi)
• Alamat email untuk keperluan autentikasi
• Data institusi/puskesmas asal
• Data ABJ (Angka Bebas Jentik) yang diinput
• Riwayat pelaporan dan aktivitas pemantauan

c. Data Teknis Otomatis:
• Alamat IP (hanya untuk keperluan keamanan dan debugging)
• Jenis browser dan perangkat
• Halaman yang dikunjungi (statistik penggunaan)
• Timestamp akses

Kami TIDAK mengumpulkan:
✗ Nomor telepon pribadi
✗ Data lokasi real-time di luar titik laporan
✗ Informasi finansial atau pembayaran
✗ Data kesehatan individu yang dapat diidentifikasi`
  },
  {
    id: 'penggunaan-data',
    icon: Eye,
    title: '3. Bagaimana Kami Menggunakan Data',
    color: '#4E63DA',
    content: `Data yang dikumpulkan LensaJentik digunakan secara eksklusif untuk tujuan-tujuan berikut:

a. Pemetaan Risiko Kesehatan Masyarakat:
• Memvisualisasikan sebaran titik genangan jentik pada peta Web-GIS interaktif
• Menghitung dan menampilkan Angka Bebas Jentik (ABJ) per wilayah
• Menghasilkan peta heatmap risiko DBD dan Malaria
• Menganalisis tren dan pola penyebaran vektor penyakit

b. Fasilitasi Tindakan Mitigasi:
• Memberikan notifikasi kepada kader kesehatan terdekat saat ada laporan baru
• Menyediakan data analitik bagi dinas kesehatan untuk pengambilan keputusan
• Mendukung program 3M Plus (Menguras, Menutup, Mendaur Ulang)

c. Peningkatan Layanan:
• Menganalisis pola penggunaan untuk meningkatkan UX/UI platform
• Mengidentifikasi bug dan masalah teknis
• Mengukur efektivitas program edukasi dan mitigasi

d. Komunikasi (hanya untuk akun Kader):
• Pengiriman notifikasi terkait laporan di wilayah tugas
• Informasi pembaruan sistem dan fitur baru
• Pengingat jadwal pemantauan jentik berkala`
  },
  {
    id: 'penyimpanan-keamanan',
    icon: Lock,
    title: '4. Penyimpanan & Keamanan Data',
    color: '#22C55E',
    content: `LensaJentik menerapkan standar keamanan berlapis untuk melindungi data yang tersimpan di platform kami:

a. Infrastruktur:
• Backend API di-hosting di platform cloud dengan sertifikasi keamanan internasional (Railway)
• Database terenkripsi saat istirahat (encryption at rest) menggunakan AES-256
• Koneksi jaringan diamankan dengan HTTPS/TLS 1.3

b. Keamanan Aplikasi:
• Autentikasi kader menggunakan Laravel Sanctum dengan token-based API authentication
• Password di-hash menggunakan algoritma bcrypt/argon2
• Validasi input di sisi server untuk mencegah SQL Injection dan XSS
• Rate limiting untuk mencegah brute-force attack
• CORS (Cross-Origin Resource Sharing) dikonfigurasi secara ketat

c. Keamanan Data:
• Backup database dilakukan secara berkala dan otomatis
• Log akses dicatat untuk keperluan audit keamanan
• Data sensitif tidak pernah dikirimkan dalam format plaintext
• File upload (foto laporan) diproses dan divalidasi sebelum disimpan

d. Monitoring:
• Pemantauan uptime server 24/7
• Alert otomatis untuk aktivitas mencurigakan
• Audit keamanan berkala pada dependensi dan library`
  },
  {
    id: 'berbagi-data',
    icon: UserCheck,
    title: '5. Berbagi Data dengan Pihak Ketiga',
    color: '#4E63DA',
    content: `LensaJentik memegang teguh prinsip bahwa data pengguna bukanlah komoditas. Kami TIDAK menjual, menyewakan, atau memperdagangkan data pengguna dalam bentuk apa pun kepada pihak ketiga.

Data dapat dibagikan dalam kondisi terbatas berikut:

a. Kepada Dinas Kesehatan & Institusi Terkait:
• Data agregat ABJ dan peta risiko (bukan data individu pelapor)
• Laporan statistik anonim untuk perencanaan program kesehatan
• Semua data yang dibagikan bersifat agregat dan tidak dapat diidentifikasi ke individu

b. Kepada Penyedia Layanan Teknis:
• Railway (cloud hosting) — memproses data sesuai infrastruktur deployment
• Cloudinary (penyimpanan media) — menyimpan foto laporan yang diunggah
• Kedua penyedia terikat oleh kebijakan privasi dan standar keamanan mereka sendiri

c. Kewajiban Hukum:
• Jika diwajibkan oleh peraturan perundang-undangan yang berlaku
• Jika diperlukan untuk melindungi hak, properti, atau keselamatan LensaJentik, pengguna, atau masyarakat
• Dalam hal ini, kami akan memberitahukan pengguna sejauh dimungkinkan oleh hukum`
  },
  {
    id: 'cookie-tracking',
    icon: Cookie,
    title: '6. Cookie & Teknologi Pelacakan',
    color: '#4E63DA',
    content: `LensaJentik menggunakan cookie dan teknologi serupa secara minimal untuk memastikan platform berfungsi dengan baik:

a. Cookie Esensial (Wajib):
• Session cookie untuk menjaga status login kader
• CSRF token cookie untuk keamanan form submission
• Cookie ini tidak melacak aktivitas Anda di luar LensaJentik

b. Cookie Fungsional:
• Preferensi tampilan (jika ada fitur kustomisasi)
• Cookie ini bersifat opsional dan dapat dinonaktifkan

c. Analytics (Terbatas):
• Kami menggunakan analytics sederhana untuk menghitung jumlah kunjungan dan halaman yang diakses
• Data bersifat agregat dan anonim
• Tidak menggunakan Google Analytics atau third-party tracker

d. Yang TIDAK Kami Gunakan:
✗ Third-party advertising cookies
✗ Cross-site tracking cookies
✗ Fingerprinting atau teknik pelacakan invasif
✗ Social media tracking pixels

Anda dapat mengelola preferensi cookie melalui pengaturan browser Anda. Namun, menonaktifkan cookie esensial dapat memengaruhi fungsi platform.`
  },
  {
    id: 'hak-pengguna',
    icon: FileText,
    title: '7. Hak-Hak Pengguna',
    color: '#4E63DA',
    content: `Sesuai dengan Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) dan prinsip privasi universal, setiap pengguna LensaJentik memiliki hak-hak berikut:

a. Hak Akses:
• Meminta informasi tentang data apa yang kami simpan tentang Anda
• Khusus akun Kader: melihat profil dan data yang tercatat

b. Hak Koreksi:
• Memperbaiki data yang tidak akurat atau tidak lengkap
• Kader dapat memperbarui profil melalui halaman Pengaturan

c. Hak Penghapusan (Right to Erasure):
• Meminta penghapusan data pribadi dari sistem kami
• Data laporan anonim yang sudah diagregasi ke statistik publik tidak dapat dihapus karena sudah menjadi bagian dari data kesehatan masyarakat

d. Hak Keberatan:
• Keberatan terhadap pemrosesan data dalam kondisi tertentu
• Menarik persetujuan kapan saja untuk pemrosesan yang berbasis persetujuan

e. Hak Portabilitas Data:
• Meminta salinan data dalam format yang terstruktur dan umum digunakan
• Hanya berlaku untuk akun Kader terdaftar

Untuk menggunakan hak-hak tersebut, silakan hubungi kami melalui email yang tercantum di bagian Kontak. Kami akan merespons dalam waktu maksimal 14 hari kerja.`
  },
  {
    id: 'retensi-data',
    icon: Server,
    title: '8. Retensi & Penghapusan Data',
    color: '#4E63DA',
    content: `Kebijakan retensi data LensaJentik mengikuti prinsip penyimpanan minimal — kami menyimpan data hanya selama diperlukan:

a. Data Laporan Anonim:
• Disimpan secara permanen sebagai bagian dari dataset kesehatan masyarakat
• Data ini bersifat anonim dan tidak terhubung ke identitas pelapor
• Digunakan untuk analisis tren jangka panjang dan penelitian

b. Data Akun Kader:
• Disimpan selama akun aktif
• Data dihapus dalam waktu 60 hari setelah permintaan penghapusan akun
• Log aktivitas kader disimpan maksimal 2 tahun untuk keperluan audit

c. Data Sesi Anonim:
• Session token kadaluarsa otomatis setelah periode inactivity
• Tidak ada data personal yang disimpan dari sesi anonim

d. File Upload (Foto):
• Foto laporan disimpan di Cloudinary
• Foto dihapus jika laporan terkait dihapus
• Backup sistem disimpan maksimal 90 hari

e. Backup Database:
• Backup penuh disimpan 30 hari
• Backup inkremental mingguan
• Semua backup terenkripsi`
  },
  {
    id: 'keamanan-anak',
    icon: AlertTriangle,
    title: '9. Perlindungan Anak',
    color: '#F59E0B',
    content: `LensaJentik tidak secara sengaja mengumpulkan data pribadi dari anak di bawah usia 13 tahun tanpa persetujuan orang tua atau wali.

• Platform kami dirancang untuk digunakan oleh masyarakat umum dan kader kesehatan dewasa
• Jika Anda adalah orang tua atau wali dan mengetahui bahwa anak Anda telah memberikan data pribadi kepada kami tanpa persetujuan Anda, silakan hubungi kami
• Kami akan segera menghapus data tersebut dari sistem kami

Fitur-fitur edukasi di LensaJentik (seperti kuis risiko DBD) dirancang aman untuk diakses oleh segala usia dan tidak mengumpulkan data personal dari pengguna yang tidak terautentikasi.`
  },
  {
    id: 'perubahan-kebijakan',
    icon: Globe,
    title: '10. Perubahan Kebijakan Privasi',
    color: '#4E63DA',
    content: `Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu untuk mencerminkan perubahan pada praktik kami atau karena alasan operasional, hukum, atau peraturan lainnya.

a. Pemberitahuan Perubahan:
• Perubahan signifikan akan diumumkan melalui notifikasi di platform
• Kader terdaftar akan menerima pemberitahuan melalui email
• Banner pemberitahuan akan ditampilkan di halaman utama

b. Tanggal Efektif:
• Setiap versi kebijakan mencantumkan tanggal efektif di bagian akhir dokumen
• Perubahan berlaku segera setelah dipublikasikan, kecuali dinyatakan lain
• Penggunaan platform setelah perubahan berlaku merupakan persetujuan Anda terhadap kebijakan yang diperbarui

c. Riwayat Versi:
• Versi 1.0 — 30 Juli 2026 (versi pertama)

Kami mendorong Anda untuk meninjau Kebijakan Privasi ini secara berkala.`
  },
  {
    id: 'kontak',
    icon: Mail,
    title: '11. Kontak & Pengaduan',
    color: '#22C55E',
    content: `Jika Anda memiliki pertanyaan, kekhawatiran, atau keluhan terkait Kebijakan Privasi ini atau praktik data LensaJentik, jangan ragu untuk menghubungi kami:

📧 Email Privasi: privasi@lensajentik.id
📧 Email Umum: halo@lensajentik.id
🌐 Website: https://lensajentik.id

Untuk pengaduan terkait perlindungan data pribadi, Anda juga berhak untuk menghubungi otoritas perlindungan data yang berwenang sesuai dengan ketentuan UU PDP.

Kami berkomitmen untuk menanggapi setiap pertanyaan dan menyelesaikan setiap keluhan secara transparan dan tepat waktu.`
  }
]

/* ─── Quick-nav cards ─────────────────────────────────────────────────────── */
const quickCards = [
  { icon: Shield, label: 'Privasi\nTerjamin', desc: 'Data Anda\n100% terlindungi' },
  { icon: Lock, label: 'Enkripsi\nAES-256', desc: 'Standar keamanan\nlevel perbankan' },
  { icon: Eye, label: 'Minimalisasi\nData', desc: 'Hanya data yang\nbenar-benar diperlukan' },
  { icon: UserCheck, label: 'Tanpa\nPelacakan', desc: 'Bebas tracker\n& third-party ads' },
]
</script>

<template>
  <div class="pb-24">
    <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
    <div
      class="hero-full-width relative flex flex-col items-center justify-center text-center px-4"
      style="height: 340px; background: linear-gradient(135deg, var(--lj-navy) 0%, var(--lj-blue) 60%, #7B93F0 100%);"
    >
      <!-- Decorative blobs -->
      <div class="blob-bg w-72 h-72 top-[-60px] right-[-40px]" style="background: var(--lj-green); opacity: 0.2;"></div>
      <div class="blob-bg w-56 h-56 bottom-[-40px] left-[-30px]" style="background: var(--lj-blue-lt); opacity: 0.25;"></div>

      <!-- Back button -->
      <RouterLink
        to="/beranda"
        class="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105"
        style="background: rgba(255,255,255,0.15); color: white; backdrop-filter: blur(4px);"
      >
        <ArrowLeft class="w-4 h-4" /> Kembali
      </RouterLink>

      <div class="relative z-10 max-w-2xl">
        <div
          class="lj-section-label mb-6 mx-auto animate-on-scroll"
          style="width: fit-content; background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color: white;"
        >
          <Shield class="w-3.5 h-3.5" /> LEGAL & KEBIJAKAN
        </div>
        <h1 class="text-3xl sm:text-5xl font-black leading-tight mb-4 animate-on-scroll delay-100" style="color: white;">
          Kebijakan <span class="font-garamond highlight-green" style="color: var(--lj-navy);">Privasi</span>
        </h1>
        <p class="text-sm sm:text-base font-medium animate-on-scroll delay-200 max-w-lg mx-auto" style="color: rgba(255,255,255,0.85);">
          Transparansi penuh tentang bagaimana LensaJentik mengumpulkan, menggunakan, dan melindungi data Anda.
        </p>
        <p class="text-xs mt-3 animate-on-scroll delay-300" style="color: rgba(255,255,255,0.6);">
          Terakhir diperbarui: 30 Juli 2026 &nbsp;·&nbsp; Versi 1.0
        </p>
      </div>

      <!-- Sway wave bottom -->
      <div class="absolute bottom-0 left-0 w-full z-10" style="transform: translateY(1px);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block" style="height: 70px; object-fit: fill;" />
      </div>
    </div>

    <!-- ─── Main Content ──────────────────────────────────────────────────────── -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      <!-- ─── Quick Cards Row ───────────────────────────────────────────────── -->
      <section class="animate-on-scroll">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="(card, i) in quickCards"
            :key="i"
            class="lj-card p-5 text-center space-y-2"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
              style="background: var(--lj-blue-pale);"
            >
              <component :is="card.icon" class="w-5 h-5" style="color: var(--lj-blue);" />
            </div>
            <div class="text-xs font-bold leading-tight whitespace-pre-line" style="color: var(--lj-navy);">{{ card.label }}</div>
            <div class="text-[10px] leading-tight whitespace-pre-line" style="color: var(--lj-muted);">{{ card.desc }}</div>
          </div>
        </div>
      </section>

      <!-- ─── Komitmen Kami ─────────────────────────────────────────────────── -->
      <section class="animate-on-scroll">
        <div
          class="lj-card p-8 sm:p-10 relative overflow-hidden"
          style="background: linear-gradient(135deg, var(--lj-blue-pale) 0%, white 100%);"
        >
          <div class="blob-bg w-48 h-48 top-[-40px] right-[-40px]" style="background: var(--lj-green);"></div>

          <div class="relative z-10">
            <div class="lj-section-label mb-6" style="width: fit-content;">
              KOMITMEN KAMI
            </div>
            <h2 class="lj-heading mb-6">
              Privasi sebagai <span class="font-garamond" style="color: var(--lj-blue);">Hak Dasar</span>
            </h2>
            <div class="space-y-4 text-sm leading-relaxed" style="color: var(--lj-muted); max-width: 680px;">
              <p>
                <strong style="color: var(--lj-navy);">LensaJentik dibangun di atas fondasi kepercayaan.</strong>
                Sebagai platform kesehatan masyarakat, kami memahami bahwa data yang kami kelola — mulai dari
                laporan genangan jentik hingga data pemantauan kader — memiliki dampak langsung pada kehidupan
                dan kesehatan masyarakat Indonesia.
              </p>
              <p>
                Kami berkomitmen untuk:
              </p>
              <ul class="space-y-2 ml-4">
                <li class="flex items-start gap-2">
                  <span class="mt-0.5 w-2 h-2 rounded-full shrink-0" style="background: var(--lj-green-dk);"></span>
                  <span><strong style="color: var(--lj-navy);">Transparansi</strong> — setiap pengguna berhak tahu data apa yang dikumpulkan dan untuk apa.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-0.5 w-2 h-2 rounded-full shrink-0" style="background: var(--lj-green-dk);"></span>
                  <span><strong style="color: var(--lj-navy);">Minimalisasi</strong> — kami hanya mengumpulkan data yang benar-benar diperlukan.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-0.5 w-2 h-2 rounded-full shrink-0" style="background: var(--lj-green-dk);"></span>
                  <span><strong style="color: var(--lj-navy);">Keamanan</strong> — standar industri terbaik untuk melindungi data yang dipercayakan.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-0.5 w-2 h-2 rounded-full shrink-0" style="background: var(--lj-green-dk);"></span>
                  <span><strong style="color: var(--lj-navy);">Kontrol Pengguna</strong> — Anda memegang kendali atas data Anda sendiri.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Accordion Sections ────────────────────────────────────────────── -->
      <section class="space-y-4">
        <div class="lj-section-label mb-6 mx-auto" style="width: fit-content;">
          ISI KEBIJAKAN PRIVASI
        </div>

        <div
          v-for="(section, index) in sections"
          :key="section.id"
          class="animate-on-scroll"
          :class="`delay-${Math.min((index % 5) + 1, 5) * 100}`"
        >
          <div
            class="lj-card overflow-hidden transition-all duration-300"
            :class="openSection === index ? 'shadow-[0_12px_32px_rgba(78,99,218,0.14)]' : ''"
          >
            <!-- Accordion Header -->
            <button
              @click="toggleSection(index)"
              class="w-full flex items-center justify-between p-5 sm:p-6 text-left group"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  :style="{ background: openSection === index ? section.color : 'var(--lj-blue-pale)' }"
                >
                  <component
                    :is="section.icon"
                    class="w-5 h-5 transition-colors duration-300"
                    :style="{ color: openSection === index ? 'white' : section.color }"
                  />
                </div>
                <h3
                  class="text-sm sm:text-base font-bold transition-colors duration-300"
                  :style="{ color: openSection === index ? section.color : 'var(--lj-navy)' }"
                >
                  {{ section.title }}
                </h3>
              </div>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                :style="{ background: openSection === index ? 'var(--lj-blue-pale)' : 'transparent' }"
              >
                <ChevronDown
                  v-if="openSection !== index"
                  class="w-4 h-4"
                  style="color: var(--lj-muted);"
                />
                <ChevronUp
                  v-else
                  class="w-4 h-4"
                  style="color: var(--lj-blue);"
                />
              </div>
            </button>

            <!-- Accordion Content -->
            <Transition name="accordion-content">
              <div
                v-if="openSection === index"
                class="px-5 sm:px-6 pb-6 pt-0"
              >
                <div class="h-px mb-5" style="background: var(--lj-border);"></div>
                <div
                  class="text-sm leading-relaxed whitespace-pre-line"
                  style="color: var(--lj-muted); font-family: 'Satoshi', sans-serif;"
                >
                  {{ section.content }}
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- ─── Security Notice ────────────────────────────────────────────────── -->
      <section class="animate-on-scroll">
        <div
          class="lj-card p-8 sm:p-10 relative overflow-hidden"
          style="border-color: var(--lj-green-dk); border-width: 2px;"
        >
          <div class="blob-bg w-56 h-56 bottom-[-40px] right-[-30px]" style="background: var(--lj-green); opacity: 0.25;"></div>

          <div class="relative z-10 flex flex-col sm:flex-row items-start gap-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style="background: var(--lj-green);">
              <Shield class="w-7 h-7" style="color: var(--lj-navy);" />
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-bold mb-3" style="color: var(--lj-navy);">
                🔒 Komitmen Keamanan Berkelanjutan
              </h3>
              <p class="text-sm leading-relaxed mb-4" style="color: var(--lj-muted);">
                Kami secara proaktif memantau dan meningkatkan keamanan platform. Tim pengembang LensaJentik
                secara rutin melakukan pembaruan keamanan, audit dependensi, dan pengujian penetrasi internal
                untuk memastikan platform tetap aman dari ancaman yang terus berkembang.
              </p>
              <div class="flex flex-wrap gap-3">
                <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                  AES-256 Encryption
                </span>
                <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                  HTTPS/TLS 1.3
                </span>
                <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                  Token-Based Auth
                </span>
                <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                  Regular Security Audit
                </span>
                <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                  Rate Limiting
                </span>
                <span class="px-3 py-1.5 rounded-full text-[10px] font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                  Automated Backups
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Kepatuhan ──────────────────────────────────────────────────────── -->
      <section class="animate-on-scroll">
        <div class="text-center space-y-4">
          <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">
            KEPATUHAN REGULASI
          </div>
          <h2 class="lj-heading">
            Mematuhi <span class="font-garamond" style="color: var(--lj-blue);">Standar Nasional</span>
          </h2>
          <p class="text-sm mx-auto" style="color: var(--lj-muted); max-width: 520px;">
            Kebijakan privasi LensaJentik disusun mengacu pada regulasi perlindungan data yang berlaku di Indonesia.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div class="lj-card p-6 text-center space-y-2">
              <FileText class="w-8 h-8 mx-auto" style="color: var(--lj-blue);" />
              <h4 class="text-sm font-bold" style="color: var(--lj-navy);">UU No. 27 Tahun 2022</h4>
              <p class="text-xs" style="color: var(--lj-muted);">Perlindungan Data Pribadi (UU PDP)</p>
            </div>
            <div class="lj-card p-6 text-center space-y-2">
              <Database class="w-8 h-8 mx-auto" style="color: var(--lj-blue);" />
              <h4 class="text-sm font-bold" style="color: var(--lj-navy);">UU No. 11 Tahun 2008</h4>
              <p class="text-xs" style="color: var(--lj-muted);">Informasi & Transaksi Elektronik (ITE)</p>
            </div>
            <div class="lj-card p-6 text-center space-y-2">
              <Globe class="w-8 h-8 mx-auto" style="color: var(--lj-blue);" />
              <h4 class="text-sm font-bold" style="color: var(--lj-navy);">Permenkes No. 1501/2010</h4>
              <p class="text-xs" style="color: var(--lj-muted);">Sistem Informasi Kesehatan</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Contact CTA ────────────────────────────────────────────────────── -->
      <section class="animate-on-scroll">
        <div
          class="lj-card p-8 sm:p-10 text-center relative overflow-hidden"
          style="background: linear-gradient(135deg, var(--lj-navy) 0%, var(--lj-blue) 100%);"
        >
          <div class="blob-bg w-64 h-64 top-[-50px] left-[-30px]" style="background: var(--lj-green); opacity: 0.15;"></div>

          <div class="relative z-10 space-y-5">
            <h2 class="text-2xl sm:text-3xl font-black" style="color: white;">
              Ada Pertanyaan?
            </h2>
            <p class="text-sm mx-auto" style="color: rgba(255,255,255,0.8); max-width: 480px;">
              Tim kami siap menjawab pertanyaan Anda terkait privasi dan keamanan data di LensaJentik.
              Jangan ragu untuk menghubungi kami.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:privasi@lensajentik.id"
                class="lj-btn-green px-8"
              >
                <Mail class="w-4 h-4" /> privasi@lensajentik.id
              </a>
              <RouterLink
                to="/beranda"
                class="px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105"
                style="background: rgba(255,255,255,0.15); color: white;"
              >
                Kembali ke Beranda
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* ─── Accordion transition ────────────────────────────────────────────────── */
.accordion-content-enter-active,
.accordion-content-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.accordion-content-enter-from,
.accordion-content-leave-to {
  max-height: 0;
  opacity: 0;
}
.accordion-content-enter-to,
.accordion-content-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>
