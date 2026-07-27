<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ShieldAlert,
  MapPin,
  FileSpreadsheet,
  BarChart3,
  Award,
  ArrowRight,
  Activity,
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  BookOpen,
} from 'lucide-vue-next'
import { useGamificationStore } from '@/stores/useGamificationStore'

const gamificationStore = useGamificationStore()
const showOnboardingModal = ref(false)

onMounted(() => {
  const hasVisited = localStorage.getItem('has_visited_lensajentik')
  if (!hasVisited) {
    showOnboardingModal.value = true
    localStorage.setItem('has_visited_lensajentik', 'true')
  }
})
</script>

<template>
  <div class="space-y-16 pb-16">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none"></div>

      <div class="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Hero Text Content -->
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles class="w-4 h-4 text-amber-400" />
            <span>Platform Web-GIS Mitigasi Dini DBD & Malaria 2026</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Pemetaan Dini Risiko <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">Jentik Nyamuk</span> Real-time
          </h1>

          <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            LensaJentik menghubungkan partisipasi warga dan kader kesehatan untuk memantau Angka Bebas Jentik (ABJ), mendeteksi lokasi berisiko tinggi, dan mempercepat intervensi 3M Plus.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <RouterLink
              to="/peta-resiko"
              class="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <MapPin class="w-5 h-5 stroke-[2.5]" />
              <span>Jelajahi Peta Risiko</span>
            </RouterLink>

            <RouterLink
              to="/laporan"
              class="py-3.5 px-7 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold text-sm flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <FileSpreadsheet class="w-5 h-5 text-amber-400" />
              <span>Lapor Genangan Air</span>
            </RouterLink>
          </div>

          <!-- Feature Highlights Pills -->
          <div class="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-black text-emerald-400">92.5%</div>
              <div class="text-xs text-slate-400">Rata-rata ABJ Kota</div>
            </div>
            <div>
              <div class="text-2xl font-black text-blue-400">&lt; 15 Menit</div>
              <div class="text-xs text-slate-400">Respon Laporan Warga</div>
            </div>
            <div>
              <div class="text-2xl font-black text-amber-400">+250 Poin</div>
              <div class="text-xs text-slate-400">Gamifikasi Partisipasi</div>
            </div>
          </div>
        </div>

        <!-- Hero Preview Feature Card -->
        <div class="lg:col-span-5 relative">
          <div class="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase text-blue-400 tracking-wider">Status Ketahanan Wilayah</span>
              <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 class="w-3.5 h-3.5" /> Aman (ABJ &ge;95%)
              </span>
            </div>

            <div class="space-y-3 pt-2">
              <div class="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div class="text-xs">
                  <div class="font-bold text-white">Kelurahan Pasteur</div>
                  <div class="text-slate-400">Kecamatan Sukajadi</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-black text-emerald-400">94.5% ABJ</div>
                  <div class="text-[10px] text-slate-400">Diperbarui Hari Ini</div>
                </div>
              </div>

              <div class="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div class="text-xs">
                  <div class="font-bold text-white">Kelurahan Gegerkalong</div>
                  <div class="text-slate-400">Kecamatan Sukasari</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-black text-rose-400">82.0% ABJ</div>
                  <div class="text-[10px] text-rose-300 font-bold">⚠️ Risiko Tinggi</div>
                </div>
              </div>
            </div>

            <RouterLink
              to="/peta-resiko"
              class="block w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-center text-xs font-bold text-white rounded-xl transition-colors"
            >
              Buka Web-GIS Selengkapnya →
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Value Proposition Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Mengapa LensaJentik Penting?</h2>
        <p class="text-sm text-slate-500">Solusi terpadu cegah wabah Demam Berdarah Dengue & Malaria sejak dini dari lingkungan rumah</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin class="w-6 h-6" />
          </div>
          <h3 class="font-extrabold text-slate-900 text-lg">Peta Risiko Web-GIS</h3>
          <p class="text-xs text-slate-600 leading-relaxed"> Visualisasi zone warna risiko (Merah, Kuning, Hijau) beserta prediksi tren perkembangan jentik 7-14 hari ke depan. </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award class="w-6 h-6" />
          </div>
          <h3 class="font-extrabold text-slate-900 text-lg">Gamifikasi Warga</h3>
          <p class="text-xs text-slate-600 leading-relaxed"> Kumpulkan poin reward dari setiap laporan genangan jentik, dapatkan badge "Duta Bebas Jentik", dan twibbon partisipasi sosial. </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserCheck class="w-6 h-6" />
          </div>
          <h3 class="font-extrabold text-slate-900 text-lg">Portal Khusus Kader</h3>
          <p class="text-xs text-slate-600 leading-relaxed"> Form digital kelola Angka Bebas Jentik (ABJ) 2 langkah dengan kalkulator otomatis real-time untuk kader puskesmas. </p>
        </div>
      </div>
    </section>

    <!-- Onboarding Modal First Visit -->
    <div v-if="showOnboardingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div class="bg-white rounded-3xl max-w-lg w-full p-8 text-center space-y-5 shadow-2xl">
        <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
          <ShieldAlert class="w-10 h-10" />
        </div>
        <h3 class="text-2xl font-black text-slate-900">Selamat Datang di LensaJentik! 🦟</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Platform pemetaan risiko DBD & Malaria berbasis Web-GIS. Anda dapat menjelajahi peta risiko wilayah, melaporkan genangan air berpotensi jentik, atau masuk sebagai kader kesehatan.
        </p>
        <button
          @click="showOnboardingModal = false"
          class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-blue-600/30"
        >
          Mulai Jelajahi Platform →
        </button>
      </div>
    </div>
  </div>
</template>
