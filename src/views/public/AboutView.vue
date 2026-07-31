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
    id: 'apa-itu',
    icon: Shield,
    title: '1. Apa itu LensaJentik?',
    color: '#4E63DA',
    content: `LensaJentik adalah platform pemetaan dan mitigasi risiko Demam Berdarah Dengue (DBD) dan Malaria berbasis Web-GIS. Kami menggabungkan data cuaca, kader kesehatan, dan laporan warga untuk membantu komunitas tetap aman.`
  },
  {
    id: 'visi',
    icon: Eye,
    title: '2. Visi Kami',
    color: '#22C55E',
    content: `Menciptakan lingkungan yang bebas dari ancaman penyakit yang ditularkan oleh nyamuk melalui partisipasi aktif masyarakat dan pemanfaatan teknologi.`
  },
  {
    id: 'misi',
    icon: Shield,
    title: '3. Misi Kami',
    color: '#F59E0B',
    content: `• Memberikan informasi risiko penyebaran penyakit secara real-time.
• Memfasilitasi pelaporan warga mengenai genangan air.
• Memberikan edukasi yang mudah dipahami tentang pencegahan DBD.`
  },
  {
    id: 'tim',
    icon: UserCheck,
    title: '4. Tim di Balik LensaJentik',
    color: '#4E63DA',
    content: `Kami adalah tim yang berdedikasi tinggi dalam bidang teknologi dan kesehatan masyarakat, bersatu untuk membawa perubahan positif bagi Indonesia.`
  }
]

/* ─── Quick-nav cards ─────────────────────────────────────────────────────── */
const quickCards = [
  { icon: Globe, label: 'Inovatif', desc: 'Teknologi Web-GIS' },
  { icon: UserCheck, label: 'Kolaboratif', desc: 'Warga & Kader' },
  { icon: Database, label: 'Informatif', desc: 'Data Real-time' },
  { icon: FileText, label: 'Edukatif', desc: 'Artikel & Panduan' },
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
        to="/"
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
              MENGAPA LENSAJENTIK ADA
            </div>
            <h2 class="lj-heading mb-6">
              Kesehatan sebagai <span class="font-garamond" style="color: var(--lj-blue);">Tanggung Jawab Bersama</span>
            </h2>
            <div class="space-y-4 text-sm leading-relaxed" style="color: var(--lj-muted); max-width: 680px;">
              <p>
                <strong style="color: var(--lj-navy);">LensaJentik dibangun dari kepedulian.</strong>
                Sebagai platform kesehatan masyarakat, kami memahami bahwa penanganan penyakit
                menular memerlukan kolaborasi seluruh elemen masyarakat.
              </p>
              <p>
                Nilai inti kami:
              </p>
              <ul class="space-y-2 ml-4">
                <li class="flex items-start gap-2">
                  <span class="mt-0.5 w-2 h-2 rounded-full shrink-0" style="background: var(--lj-green-dk);"></span>
                  <span><strong style="color: var(--lj-navy);">Empati</strong> — peduli terhadap keselamatan bersama.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-0.5 w-2 h-2 rounded-full shrink-0" style="background: var(--lj-green-dk);"></span>
                  <span><strong style="color: var(--lj-navy);">Sinergi</strong> — warga dan tenaga kesehatan bekerja sama.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="mt-0.5 w-2 h-2 rounded-full shrink-0" style="background: var(--lj-green-dk);"></span>
                  <span><strong style="color: var(--lj-navy);">Progresif</strong> — memadukan teknologi dengan aksi nyata.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Accordion Sections ────────────────────────────────────────────── -->
      <section class="space-y-4">
        <div class="lj-section-label mb-6 mx-auto" style="width: fit-content;">
          INFORMASI LEBIH LANJUT
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
                to="/"
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
