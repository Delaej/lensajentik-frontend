<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { BarChart3, TrendingUp, TrendingDown, Download, ChevronDown } from 'lucide-vue-next'
import apiClient from '@/services/apiClient'

/* ─── State ──────────────────────────────────────────────────────────────── */
const stats = ref(null)
const isLoading = ref(true)
const activeTab = ref('abj') // 'abj' | 'laporan' | 'wilayah'
const chartInstance = ref(null)
const abjChartEl = ref(null)
const laporanChartEl = ref(null)
const wilayahChartEl = ref(null)

/* ─── Fetch data ─────────────────────────────────────────────────────────── */
onMounted(async () => {
  try {
    const res = await apiClient.get('/statistik/ringkasan', { params: { wilayah_kode: '3273' } })
    stats.value = res.data.data || res.data
  } catch (e) {
    console.error('Statistik fetch failed:', e)
  } finally {
    isLoading.value = false
    await nextTick()
    renderCharts()
  }
})

/* ─── Computed metrics ───────────────────────────────────────────────────── */
const rataAbj = computed(() => {
  const v = stats.value?.rata_rata_abj_30hari
  return v != null ? `${Number(v).toFixed(1)}%` : '—'
})
const totalLaporan = computed(() => {
  const lps = stats.value?.laporan_per_status || {}
  const total = Object.values(lps).reduce((s, n) => s + n, 0)
  return total || '—'
})
const trenDataRaw = computed(() => stats.value?.tren_abj || [])
const laporanDataRaw = computed(() => stats.value?.laporan_per_status || {})
const wilayahNama = computed(() => stats.value?.wilayah?.nama || 'Kota Bandung')

/* ─── Chart.js ───────────────────────────────────────────────────────────── */
const renderCharts = async () => {
  if (typeof window === 'undefined') return
  try {
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    // ABJ Trend chart
    if (abjChartEl.value) {
      const ctx = abjChartEl.value.getContext('2d')
      const abjVals = trenDataRaw.value.map(t => t.abj_persen || t.value || 0)
      const labels = trenDataRaw.value.map(t => t.label || t.tanggal || '')

      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'ABJ (%)',
            data: abjVals,
            borderColor: '#4E63DA',
            backgroundColor: 'rgba(78,99,218,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#4E63DA',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            borderWidth: 2.5,
          },
          {
            label: 'Batas Aman WHO (95%)',
            data: Array(labels.length).fill(95),
            borderColor: '#EF4444',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1E2B5B',
              titleFont: { family: 'Satoshi', weight: '700' },
              bodyFont: { family: 'Satoshi' },
              callbacks: { label: (ctx) => ` ABJ: ${ctx.raw}%` },
            },
          },
          scales: {
            y: {
              min: 70,
              max: 100,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { callback: v => `${v}%`, font: { family: 'Satoshi', size: 11 } },
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Satoshi', size: 11 } },
            },
          },
        },
      })
    }

    // Laporan per status bar chart
    if (laporanChartEl.value) {
      const ctx = laporanChartEl.value.getContext('2d')
      const rawStatus = laporanDataRaw.value
      const labels = Object.keys(rawStatus).map(k => k.replace(/_/g, ' '))
      const data = Object.values(rawStatus)
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Jumlah Laporan',
            data,
            backgroundColor: ['rgba(78,99,218,0.7)', 'rgba(245,158,11,0.7)', 'rgba(34,197,94,0.7)'],
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1E2B5B',
              titleFont: { family: 'Satoshi', weight: '700' },
              bodyFont: { family: 'Satoshi' },
            },
          },
          scales: {
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Satoshi', size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { family: 'Satoshi', size: 11 } } },
          },
        },
      })
    }

    // Wilayah comparison chart
    if (wilayahChartEl.value) {
      const ctx = wilayahChartEl.value.getContext('2d')
      const wilayahData = stats.value?.perbandingan_wilayah || []
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: wilayahData.map(w => w.nama),
          datasets: [{
            label: 'ABJ (%)',
            data: wilayahData.map(w => w.rata_rata_abj),
            backgroundColor: wilayahData.map(w =>
              w.rata_rata_abj < 90 ? 'rgba(239,68,68,0.7)' :
              w.rata_rata_abj < 95 ? 'rgba(245,158,11,0.7)' :
              'rgba(34,197,94,0.7)'
            ),
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { min: 70, max: 100, ticks: { callback: v => `${v}%`, font: { family: 'Satoshi', size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
            y: { grid: { display: false }, ticks: { font: { family: 'Satoshi', size: 11 } } },
          },
        },
      })
    }
  } catch (e) {
    console.error('Chart.js render failed:', e)
  }
}

/* ─── Export ─────────────────────────────────────────────────────────────── */
const handleExport = () => {
  alert('Fitur unduh laporan PDF akan segera tersedia.')
}
</script>

<template>
  <div class="pb-0 mb-0 relative overflow-hidden" style="background-color: var(--lj-bg);">
    
    <!-- ─── Hero banner / Illustration (Lottie placeholder) ─── -->
    <div class="hero-full-width lottie-placeholder relative" style="height: 320px; border-radius: 0;">
      <BarChart3 class="w-16 h-16 mb-2 mx-auto text-[--lj-blue]" />
      <span class="font-semibold text-lg text-glow" style="color: var(--lj-blue);">Lottie: Ilustrasi Grafik & Data</span>
      
      <!-- Sway wave bottom -->
      <div class="absolute bottom-0 left-0 w-full z-10" style="transform: translateY(1px);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block" style="height: 70px; object-fit: fill;" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-10 relative z-10">

      <!-- Header (centered) -->
      <div class="animate-on-scroll space-y-3 text-center">
        <div class="lj-section-label mb-3 mx-auto" style="width: fit-content;">STATISTIK & DATA</div>
        <h1 class="lj-heading">
          Dashboard <span class="font-garamond" style="color: var(--lj-blue);">Statistik</span> Publik
        </h1>
        <p class="text-sm" style="color: var(--lj-muted); max-width: 560px; margin: 0 auto;">
          Data transparansi capaian Angka Bebas Jentik (ABJ) dan tren kasus DBD — bisa diakses tanpa login.
          <span class="font-bold ml-1" style="color: var(--lj-blue);">Wilayah: {{ wilayahNama }}</span>
        </p>
        <div class="flex justify-center pt-2">
          <button @click="handleExport" class="lj-btn-primary text-sm px-5 py-2.5">
            <Download class="w-4 h-4" /> Unduh Laporan
          </button>
        </div>
      </div>

    <!-- ─── Stat Metric Cards ─── -->
    <div v-if="!isLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-on-scroll">
      <!-- ABJ Card -->
      <div class="lj-card p-5 space-y-2">
        <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Rata-rata ABJ</div>
        <div class="text-2xl font-black" style="color: var(--lj-blue);">{{ rataAbj }}</div>
        <div class="flex items-center gap-1 text-xs font-bold" style="color: #22C55E;">
          <TrendingUp class="w-3.5 h-3.5" /> Tren Meningkat
        </div>
      </div>

      <!-- Total Laporan Card -->
      <div class="lj-card p-5 space-y-2">
        <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Total Laporan</div>
        <div class="text-2xl font-black" style="color: var(--lj-navy);">{{ totalLaporan }}</div>
        <div class="text-xs" style="color: var(--lj-muted);">Laporan masuk warga</div>
      </div>

      <!-- Zona Hijau Card -->
      <div class="lj-card p-5 space-y-2">
        <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Zona Hijau</div>
        <div class="text-2xl font-black" style="color: #22C55E;">3</div>
        <div class="text-xs" style="color: var(--lj-muted);">Kecamatan ABJ ≥95%</div>
      </div>

      <!-- Zona Merah Card -->
      <div class="lj-card p-5 space-y-2">
        <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Zona Merah</div>
        <div class="text-2xl font-black" style="color: #EF4444;">2</div>
        <div class="flex items-center gap-1 text-xs font-bold" style="color: #EF4444;">
          <TrendingDown class="w-3.5 h-3.5" /> Perlu Tindakan
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="lottie-placeholder" style="height: 100px; border-radius: 20px;">
        <span>⏳</span>
      </div>
    </div>

    <!-- ─── Tab Selector ─── -->
    <div class="flex gap-2 animate-on-scroll flex-wrap">
      <button
        v-for="tab in [{ key: 'abj', label: 'Tren ABJ' }, { key: 'laporan', label: 'Status Laporan' }, { key: 'wilayah', label: 'Perbandingan Wilayah' }]"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
        :style="activeTab === tab.key
          ? 'background: var(--lj-blue); color: white;'
          : 'background: white; color: var(--lj-muted); border: 1.5px solid var(--lj-border);'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ─── ABJ Trend Chart ─── -->
    <div v-show="activeTab === 'abj'" class="lj-card p-6 animate-on-scroll">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-base" style="color: var(--lj-navy);">Tren ABJ 12 Bulan Terakhir</h3>
        <span class="text-xs px-3 py-1 rounded-full font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">Data Kader</span>
      </div>
      <div class="chart-container" style="height: 300px;">
        <canvas ref="abjChartEl" />
      </div>
      <p class="text-xs mt-4" style="color: var(--lj-muted);">
        Batas aman: ABJ ≥ 95%. Target WHO untuk eliminasi DBD.
        Garis merah horizontal menunjukkan ambang batas kritis (90%).
      </p>
    </div>

    <!-- ─── Laporan Status Chart ─── -->
    <div v-show="activeTab === 'laporan'" class="lj-card p-6 animate-on-scroll">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-base" style="color: var(--lj-navy);">Distribusi Status Laporan Warga</h3>
        <span class="text-xs px-3 py-1 rounded-full font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">Crowdsourcing</span>
      </div>
      <div class="chart-container" style="height: 280px;">
        <canvas ref="laporanChartEl" />
      </div>
    </div>

    <!-- ─── Wilayah Comparison Chart ─── -->
    <div v-show="activeTab === 'wilayah'" class="lj-card p-6 animate-on-scroll">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-base" style="color: var(--lj-navy);">Perbandingan ABJ Antarwilayah</h3>
        <span class="text-xs px-3 py-1 rounded-full font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">Kota Bandung</span>
      </div>
      <div class="chart-container" style="height: 280px;">
        <canvas ref="wilayahChartEl" />
      </div>
      <div class="flex gap-3 mt-4 flex-wrap">
        <div class="flex items-center gap-1.5 text-xs" style="color: var(--lj-muted);">
          <span class="w-3 h-3 rounded-full" style="background: rgba(34,197,94,0.7);" /> Aman (≥95%)
        </div>
        <div class="flex items-center gap-1.5 text-xs" style="color: var(--lj-muted);">
          <span class="w-3 h-3 rounded-full" style="background: rgba(245,158,11,0.7);" /> Sedang (90–94%)
        </div>
        <div class="flex items-center gap-1.5 text-xs" style="color: var(--lj-muted);">
          <span class="w-3 h-3 rounded-full" style="background: rgba(239,68,68,0.7);" /> Tinggi (&lt;90%)
        </div>
      </div>
    </div>

    <!-- Sumber data note -->
    <div class="text-xs text-center animate-on-scroll" style="color: var(--lj-muted);">
      Sumber data: Kader Kesehatan Kota Bandung · Open-Meteo API · Laporan Warga LensaJentik 2026
    </div>
    </div> <!-- end of max-w-6xl -->
  </div>
</template>
