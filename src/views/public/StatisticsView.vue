<script setup>
import { ref, onMounted, computed } from 'vue'
import { BarChart3, TrendingUp, CheckCircle2, FileSpreadsheet, Building2 } from 'lucide-vue-next'
import apiClient from '@/services/apiClient'

const stats = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await apiClient.get('/statistik/ringkasan', { params: { wilayah_kode: '3273' } })
    stats.value = response.data.data || response.data
  } catch (error) {
    console.error('Fetch public stats failed:', error)
  } finally {
    isLoading.value = false
  }
})

const rataAbj = computed(() => stats.value?.rata_rata_abj_30hari ?? '—')
const totalRumah = computed(() => {
  const tren = stats.value?.tren_abj || []
  return tren.length > 0 ? tren.length + ' data' : '—'
})
const totalLaporan = computed(() => {
  const lps = stats.value?.laporan_per_status || {}
  return Object.values(lps).reduce((sum, n) => sum + n, 0) || '—'
})
const zonaHijau = computed(() => stats.value?.wilayah?.nama ?? '—')
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
        <BarChart3 class="w-7 h-7 text-blue-600" /> Dashboard Statistik ABJ &amp; Tren Kasus Publik
      </h1>
      <p class="text-xs sm:text-sm text-slate-500">Transparansi data capaian Angka Bebas Jentik (ABJ), perbandingan antarwilayah, dan partisipasi laporan warga</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 shadow-xs">
      Memuat statistik publik...
    </div>

    <!-- Metrics Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Rata-rata ABJ Kota</div>
        <div class="text-3xl font-black text-slate-900 mt-2">{{ rataAbj }}%</div>
        <div class="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
          <TrendingUp class="w-3.5 h-3.5" /> Data Terkini
        </div>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Total Rumah Diperiksa</div>
        <div class="text-3xl font-black text-slate-900 mt-2">{{ totalRumah }}</div>
        <div class="text-xs text-slate-500 mt-1">Seluruh Kecamatan</div>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Laporan Genangan Warga</div>
        <div class="text-3xl font-black text-blue-600 mt-2">{{ totalLaporan }}</div>
        <div class="text-xs text-blue-600 font-bold mt-1">Total Laporan Masuk</div>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Wilayah Zona Hijau</div>
        <div class="text-3xl font-black text-emerald-600 mt-2">{{ zonaHijau }}</div>
        <div class="text-xs text-emerald-600 font-bold mt-1">Status Aman</div>
      </div>
    </div>
  </div>
</template>
