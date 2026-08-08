<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Search, X, TrendingUp, FileImage, FileSpreadsheet } from 'lucide-vue-next'
import { CHART_COLORS, makeBaseOptions } from '@/utils/chartConfig'
import { downloadChartAsPng } from '@/utils/chartDownload'
import { downloadCsv } from '@/utils/csvExport'
import { statistikService } from '@/services/statistikService'
import { mapService } from '@/services/mapService'
import { useStatistikStore } from '@/stores/useStatistikStore'

const store = useStatistikStore()

/* ── Selection state ────────────────────────────────────────── */
const selectedWilayah = ref([])   // { kode, nama, tingkat } — max 5
const searchQuery = ref('')
const searchResults = ref([])

const isFull = computed(() => selectedWilayah.value.length >= 5)

/* ── Search (multi-select) ──────────────────────────────────── */
const handleSearch = async () => {
  if (searchQuery.value.length < 3) { searchResults.value = []; return }
  try {
    const res = await mapService.searchWilayah(searchQuery.value)
    searchResults.value = (res.data || res).filter((r) => (
      r.tingkat === 'kecamatan' || r.tingkat === 'kabupaten'
    ))
  } catch { searchResults.value = [] }
}

const addWilayah = (region) => {
  if (isFull.value) return
  if (selectedWilayah.value.some((w) => w.kode === region.kode)) return
  selectedWilayah.value.push({ kode: region.kode, nama: region.nama, tingkat: region.tingkat })
  searchQuery.value = ''
  searchResults.value = []
  // Note: chart is NOT refreshed here — only the "Bandingkan" button fetches data.
}

const removeWilayah = (kode) => {
  selectedWilayah.value = selectedWilayah.value.filter((w) => w.kode !== kode)
  // Chart stays as-is until "Bandingkan" is clicked again.
}

/* ── Fetch on "Bandingkan" click ────────────────────────────── */
const comparisonData = ref(null)
const isLoading = ref(false)
const error = ref('')

const bandingkan = async () => {
  if (selectedWilayah.value.length === 0) return
  isLoading.value = true
  error.value = ''
  try {
    const { dari, sampai } = store.dateParams
    const res = await statistikService.getBandingkan({
      wilayah_kode: selectedWilayah.value.map((w) => w.kode),
      jenis: store.jenisPenyakit,
      dari,
      sampai,
    })
    comparisonData.value = res.data || []
  } catch (e) {
    console.error(e)
    error.value = 'Gagal memuat perbandingan. Coba lagi.'
    comparisonData.value = null
  } finally {
    isLoading.value = false
  }
}

/* ── Chart data (grouped bars) ──────────────────────────────── */
const chartRef = ref(null)

const hasData = computed(() => (comparisonData.value || []).length > 0)

const chartData = computed(() => {
  const rows = comparisonData.value || []
  if (rows.length === 0) return null
  return {
    labels: rows.map((r) => r.nama),
    datasets: [
      {
        label: 'Skor Risiko',
        data: rows.map((r) => (r.skor === null || r.skor === undefined ? null : Number(r.skor))),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 6,
        barPercentage: 0.85,
        categoryPercentage: 0.6,
      },
      {
        label: 'ABJ %',
        data: rows.map((r) => (r.abj === null || r.abj === undefined ? null : Number(r.abj))),
        backgroundColor: CHART_COLORS.green,
        borderRadius: 6,
        barPercentage: 0.85,
        categoryPercentage: 0.6,
      },
      {
        label: 'Laporan Aktif',
        data: rows.map((r) => Number(r.total_laporan || 0)),
        backgroundColor: CHART_COLORS.amber,
        borderRadius: 6,
        barPercentage: 0.85,
        categoryPercentage: 0.6,
      },
    ],
  }
})

const chartOptions = makeBaseOptions({
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: { color: '#F3F4F6', drawBorder: false },
      ticks: { color: '#9CA3AF', font: { size: 10 }, maxRotation: 0, autoSkip: true },
    },
    y: {
      beginAtZero: true,
      min: 0,
      max: 100,
      grid: { color: '#F3F4F6', drawBorder: false },
      ticks: { color: '#9CA3AF', font: { size: 10 }, stepSize: 20 },
      title: { display: true, text: 'Nilai / Jumlah', color: '#9CA3AF', font: { size: 10, weight: 'bold' } },
    },
  },
  plugins: {
    legend: { display: false }, // custom legend rendered below the chart
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const v = ctx.parsed.y
          if (v === null || v === undefined) return `${ctx.dataset.label}: —`
          return ctx.dataset.label === 'ABJ %'
            ? `${ctx.dataset.label}: ${v}%`
            : `${ctx.dataset.label}: ${v}`
        },
      },
    },
  },
})

/* ── Legend (below chart) ───────────────────────────────────── */
const legendItems = [
  { label: 'Skor Risiko', color: CHART_COLORS.blue },
  { label: 'ABJ %', color: CHART_COLORS.green },
  { label: 'Laporan Aktif', color: CHART_COLORS.amber },
]

/* ── Download ───────────────────────────────────────────────── */
const downloadPng = () => {
  if (chartRef.value?.chart) {
    downloadChartAsPng(chartRef.value.chart, 'perbandingan-wilayah')
  }
}

const downloadCsvFile = () => {
  const rows = comparisonData.value || []
  if (rows.length === 0) return
  downloadCsv(
    rows,
    ['kode', 'nama', 'skor', 'level_risiko', 'confidence_level', 'abj', 'total_laporan'],
    ['Kode', 'Nama Wilayah', 'Skor Risiko', 'Level Risiko', 'Confidence', 'ABJ (%)', 'Total Laporan'],
    'perbandingan-wilayah',
  )
}
</script>

<template>
  <div id="stats-bandingkan-wilayah" class="bg-white rounded-3xl p-6 border shadow-sm">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 class="text-base font-bold" style="color: var(--lj-navy);">Bandingkan Wilayah</h2>
        <p class="text-xs mt-0.5" style="color: var(--lj-muted);">
          Pilih hingga 5 wilayah untuk membandingkan skor risiko, ABJ, dan jumlah laporan.
        </p>
      </div>
      <TrendingUp class="w-6 h-6 shrink-0" style="color: #4E63DA;" />
    </div>

    <!-- Search & chips -->
    <div class="relative">
      <div class="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 border" style="border-color: var(--lj-border);">
        <Search class="w-5 h-5 shrink-0" style="color: #4E63DA;" />
        <div class="flex-1 flex items-center gap-2 flex-wrap min-w-0">
          <span
            v-for="w in selectedWilayah"
            :key="w.kode"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style="background: #EEF2FF; color: #4E63DA;"
          >
            {{ w.nama }}
            <button @click="removeWilayah(w.kode)" class="hover:opacity-70"><X class="w-3 h-3" /></button>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="isFull ? 'Maksimal 5 wilayah dipilih' : 'Cari wilayah...'"
            class="flex-1 bg-transparent outline-none text-sm font-medium min-w-[160px]"
            style="color: var(--lj-navy);"
            :disabled="isFull"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Search dropdown -->
      <div
        v-if="searchResults.length > 0"
        class="absolute z-40 mt-2 w-full bg-white border rounded-2xl shadow-xl overflow-hidden"
        style="border-color: var(--lj-border);"
      >
        <div
          v-for="r in searchResults"
          :key="r.kode"
          @click="addWilayah(r)"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b last:border-0 text-sm"
        >
          <span class="font-bold" style="color: var(--lj-navy);">{{ r.nama }}</span>
          <span class="text-[11px] px-2 py-0.5 rounded-full font-bold" style="background: #EEF2FF; color: #4E63DA;">{{ r.tingkat }}</span>
        </div>
      </div>
    </div>

    <!-- Bandingkan button -->
    <div class="mt-4">
      <button
        @click="bandingkan"
        :disabled="selectedWilayah.length === 0 || isLoading"
        class="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-sm text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style="background: #4E63DA;"
      >
        <TrendingUp class="w-4 h-4" />
        Bandingkan
      </button>
      <p v-if="error" class="text-xs mt-2 text-center" style="color: #EF4444;">{{ error }}</p>
    </div>

    <!-- Result -->
    <div class="mt-6">
      <template v-if="hasData">
        <div class="relative chart-container" style="height: 350px;">
          <Bar
            v-if="chartData"
            ref="chartRef"
            :data="chartData"
            :options="chartOptions"
          />
          <div
            v-if="isLoading"
            class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-10"
          >
            <p class="text-xs font-bold" style="color: var(--lj-muted);">Memuat perbandingan...</p>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center justify-center gap-4 mt-4">
          <div
            v-for="item in legendItems"
            :key="item.label"
            class="flex items-center gap-1.5 text-xs font-bold"
            style="color: var(--lj-muted);"
          >
            <span class="w-3 h-3 rounded-sm" :style="{ background: item.color }"></span>
            {{ item.label }}
          </div>
        </div>

        <!-- Download -->
        <div class="flex items-center justify-center gap-3 mt-5">
          <button
            @click="downloadPng"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
            style="border: 1px solid var(--lj-border); color: var(--lj-navy); background: white;"
          >
            <FileImage class="w-3.5 h-3.5" style="color: #4E63DA;" /> PNG
          </button>
          <button
            @click="downloadCsvFile"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
            style="border: 1px solid var(--lj-border); color: var(--lj-navy); background: white;"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" style="color: #22C55E;" /> CSV
          </button>
        </div>
      </template>

      <!-- First-load loading state -->
      <div v-else-if="isLoading" class="flex items-center justify-center py-16">
        <p class="text-sm" style="color: var(--lj-muted);">Memuat perbandingan...</p>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <TrendingUp class="w-10 h-10 mx-auto mb-3" style="color: var(--lj-muted);" />
        <p class="text-sm font-medium" style="color: var(--lj-muted);">
          Pilih wilayah lalu tekan <span class="font-bold" style="color: #4E63DA;">Bandingkan</span> untuk melihat perbandingan.
        </p>
      </div>
    </div>
  </div>
</template>
