<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Search, X, Download, TrendingUp, ChevronDown, FileImage, FileSpreadsheet } from 'lucide-vue-next'
import { CHART_COLORS, makeBaseOptions } from '@/utils/chartConfig'
import { downloadChartAsPng } from '@/utils/chartDownload'
import { downloadCsv } from '@/utils/csvExport'
import { statistikService } from '@/services/statistikService'
import { mapService } from '@/services/mapService'
import { useStatistikStore } from '@/stores/useStatistikStore'

const props = defineProps({
  ringkasanData: { type: Object, required: true },
  selectedWilayah: { type: Object, default: null },
  jenisPenyakit: { type: String, default: 'dbd' },
  dateParams: { type: Object, default: () => ({}) },
})

const store = useStatistikStore()

const chartRef = ref(null)
const detailData = ref(null)   // fetched response for the selected kecamatan
const isLoading = ref(false)

/* ── Search (kecamatan) ─────────────────────────────────────── */
const searchQuery = ref('')
const searchResults = ref([])

const handleSearch = async () => {
  if (searchQuery.value.length < 3) { searchResults.value = []; return }
  try {
    const res = await mapService.searchWilayah(searchQuery.value)
    searchResults.value = (res.data || res).filter((r) => r.tingkat === 'kecamatan')
  } catch { searchResults.value = [] }
}

const selectKecamatan = (region) => {
  searchQuery.value = ''
  searchResults.value = []
  store.setSelectedWilayah(region)
}

const clearWilayah = () => {
  searchQuery.value = ''
  searchResults.value = []
  store.clearSelectedWilayah()
}

/* ── Data loading ────────────────────────────────────────────── */
const loadChartData = async () => {
  if (!props.selectedWilayah) {
    detailData.value = null
    return
  }
  isLoading.value = true
  try {
    const { dari, sampai } = props.dateParams
    const res = await statistikService.getRingkasan({
      wilayah_kode: props.selectedWilayah.kode,
      jenis_penyakit: props.jenisPenyakit,
      dari, sampai,
    })
    detailData.value = res
  } catch (e) {
    console.error(e)
    detailData.value = null
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [
    props.selectedWilayah?.kode,
    props.jenisPenyakit,
    props.dateParams?.dari,
    props.dateParams?.sampai,
  ],
  loadChartData,
)
onMounted(loadChartData)

/* ── Computed chart data ─────────────────────────────────────── */
const activeData = computed(() => {
  if (props.selectedWilayah) return detailData.value
  return props.ringkasanData
})

const hasChartData = computed(() => {
  const data = activeData.value
  if (!data) return false
  return (data.tren_skor_risiko?.length || 0) + (data.tren_abj?.length || 0) > 0
})

const chartTitle = computed(() =>
  props.selectedWilayah ? `Tren ${props.selectedWilayah.nama}` : 'Tren Nasional'
)

const jenisPenyakitLabel = computed(() =>
  props.jenisPenyakit === 'malaria' ? 'Malaria' : 'DBD'
)

const emptyMessage = computed(() => {
  if (props.selectedWilayah) return 'Belum ada data tren untuk wilayah ini.'
  return 'Pilih kecamatan untuk melihat tren'
})

/* ── Normalization / merge ───────────────────────────────────── */
const normalizeDate = (d) => {
  if (!d) return ''
  const s = String(d)
  return s.slice(0, 10)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const formatLabel = (d) => {
  const parts = d.split('-')
  if (parts.length !== 3) return d
  const y = parts[0]
  const m = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  if (Number.isNaN(m) || Number.isNaN(day)) return d
  return `${day} ${MONTHS[m]} ${y}`
}

const buildChartData = (skorTren, abjTren) => {
  const skorByDate = {}
  skorTren.forEach((r) => {
    const d = normalizeDate(r.tanggal)
    if (d) skorByDate[d] = r
  })
  const abjByDate = {}
  abjTren.forEach((r) => {
    const d = normalizeDate(r.tanggal_pemeriksaan)
    if (d) abjByDate[d] = r
  })
  const dates = [...new Set([...Object.keys(skorByDate), ...Object.keys(abjByDate)])].sort()

  return {
    labels: dates.map(formatLabel),
    datasets: [
      {
        label: 'Skor Risiko',
        data: dates.map((d) => (skorByDate[d] ? Number(skorByDate[d].skor) : null)),
        borderColor: CHART_COLORS.blue,
        backgroundColor: 'rgba(78, 99, 218, 0.12)',
        fill: true,
        tension: 0.35,
        yAxisID: 'y',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: CHART_COLORS.blue,
      },
      {
        label: 'ABJ %',
        data: dates.map((d) => (abjByDate[d] ? Number(abjByDate[d].abj_persen) : null)),
        borderColor: CHART_COLORS.green,
        backgroundColor: 'rgba(34, 197, 94, 0.10)',
        borderDash: [6, 4],
        fill: false,
        tension: 0.35,
        yAxisID: 'y1',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: CHART_COLORS.green,
      },
    ],
  }
}

const chartDatasets = computed(() => {
  const data = activeData.value
  if (!data) return null
  const skorTren = data.tren_skor_risiko || []
  const abjTren = data.tren_abj || []
  if (skorTren.length === 0 && abjTren.length === 0) return null
  return buildChartData(skorTren, abjTren)
})

/* ── Chart options (dual Y-axis) ─────────────────────────────── */
const chartOptions = makeBaseOptions({
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: { color: '#F3F4F6', drawBorder: false },
      ticks: { color: '#9CA3AF', font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
    },
    y: {
      position: 'left',
      beginAtZero: true,
      min: 0,
      max: 100,
      grid: { color: '#F3F4F6', drawBorder: false },
      ticks: { color: '#9CA3AF', font: { size: 10 }, stepSize: 20 },
      title: { display: true, text: 'Skor Risiko', color: CHART_COLORS.blue, font: { size: 10, weight: 'bold' } },
    },
    y1: {
      position: 'right',
      beginAtZero: true,
      min: 0,
      max: 100,
      grid: { drawOnChartArea: false },
      ticks: { color: '#9CA3AF', font: { size: 10 }, stepSize: 20 },
      title: { display: true, text: 'ABJ %', color: CHART_COLORS.green, font: { size: 10, weight: 'bold' } },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const v = ctx.parsed.y
          if (ctx.dataset.label === 'Skor Risiko') {
            return `Skor Risiko: ${v === null || v === undefined ? '—' : v}`
          }
          if (ctx.dataset.label === 'ABJ %') {
            return `ABJ: ${v === null || v === undefined ? '—' : `${v}%`}`
          }
          return ''
        },
      },
    },
    legend: {
      labels: { usePointStyle: true, pointStyleWidth: 10, font: { size: 11 }, color: '#6B7280' },
    },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        drag: { enabled: true, backgroundColor: 'rgba(78,99,218,0.08)', borderColor: '#4E63DA' },
        mode: 'x',
      },
      pan: { enabled: true, mode: 'x' },
    },
  },
})

/* ── Download ────────────────────────────────────────────────── */
const downloadOpen = ref(false)

const downloadPng = () => {
  if (chartRef.value?.chart) {
    downloadChartAsPng(chartRef.value.chart, 'tren-skor')
  }
  downloadOpen.value = false
}

const buildCsvRows = () => {
  const data = activeData.value
  if (!data) return []
  const skorTren = data.tren_skor_risiko || []
  const abjTren = data.tren_abj || []
  const skorByDate = {}
  skorTren.forEach((r) => {
    const d = normalizeDate(r.tanggal)
    if (d) skorByDate[d] = r
  })
  const abjByDate = {}
  abjTren.forEach((r) => {
    const d = normalizeDate(r.tanggal_pemeriksaan)
    if (d) abjByDate[d] = r
  })
  const dates = [...new Set([...Object.keys(skorByDate), ...Object.keys(abjByDate)])].sort()

  return dates.map((d) => ({
    tanggal: d,
    skor: skorByDate[d]?.skor ?? '',
    level_risiko: skorByDate[d]?.level_risiko ?? '',
    abj_persen: abjByDate[d]?.abj_persen ?? '',
  }))
}

const downloadCsvFile = () => {
  const rows = buildCsvRows()
  if (rows.length === 0) return
  downloadCsv(
    rows,
    ['tanggal', 'skor', 'level_risiko', 'abj_persen'],
    ['Tanggal', 'Skor Risiko', 'Level Risiko', 'ABJ (%)'],
    'tren-data',
  )
  downloadOpen.value = false
}
</script>

<template>
  <div id="stats-tren-chart" class="bg-white rounded-3xl p-6 border shadow-sm">
    <!-- Header: title + search + download -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
      <div>
        <h2 class="text-base font-bold" style="color: var(--lj-navy);">{{ chartTitle }}</h2>
        <p class="text-xs mt-0.5" style="color: var(--lj-muted);">Skor Risiko & ABJ per hari · {{ jenisPenyakitLabel }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Kecamatan search -->
        <div class="relative w-full sm:w-auto sm:min-w-[220px]">
          <div class="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search class="w-4 h-4 shrink-0" style="color: #9CA3AF;" />
            <span
              v-if="selectedWilayah"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px]"
              style="background: #EEF2FF; color: #4E63DA;"
            >
              📍 {{ selectedWilayah.nama }}
              <button @click="clearWilayah" class="hover:opacity-70"><X class="w-3 h-3" /></button>
            </span>
            <input
              v-else
              v-model="searchQuery"
              type="text"
              placeholder="Cari kecamatan..."
              class="flex-1 bg-transparent outline-none text-xs font-medium min-w-[120px]"
              style="color: var(--lj-navy);"
              @input="handleSearch"
            />
          </div>
          <div
            v-if="searchResults.length > 0"
            class="absolute z-40 mt-2 w-full bg-white border rounded-2xl shadow-xl overflow-hidden"
            style="border-color: var(--lj-border);"
          >
            <div
              v-for="r in searchResults"
              :key="r.kode"
              @click="selectKecamatan(r)"
              class="px-3 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b last:border-0 text-xs"
            >
              <span class="font-bold" style="color: var(--lj-navy);">{{ r.nama }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold" style="background: #EEF2FF; color: #4E63DA;">kecamatan</span>
            </div>
          </div>
        </div>

        <!-- Download dropdown -->
        <div class="relative">
          <button
            @click="downloadOpen = !downloadOpen"
            :disabled="!hasChartData"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style="border: 1px solid var(--lj-border); color: var(--lj-navy); background: white;"
          >
            <Download class="w-3.5 h-3.5" /> Download
            <ChevronDown class="w-3.5 h-3.5" />
          </button>
          <div
            v-if="downloadOpen"
            class="absolute right-0 z-40 mt-2 w-32 bg-white border rounded-2xl shadow-xl overflow-hidden"
            style="border-color: var(--lj-border);"
          >
            <button
              @click="downloadPng"
              class="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
              style="color: var(--lj-navy);"
            >
              <FileImage class="w-3.5 h-3.5" style="color: #4E63DA;" /> PNG
            </button>
            <button
              @click="downloadCsvFile"
              class="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-50 flex items-center gap-2 border-t"
              style="color: var(--lj-navy); border-color: var(--lj-border);"
            >
              <FileSpreadsheet class="w-3.5 h-3.5" style="color: #22C55E;" /> CSV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart area -->
    <div class="chart-container" style="height: 350px;">
      <Line
        v-if="hasChartData && chartDatasets"
        ref="chartRef"
        :data="chartDatasets"
        :options="chartOptions"
      />
      <div v-else class="flex items-center justify-center h-full text-center">
        <div>
          <TrendingUp class="w-10 h-10 mx-auto mb-3" style="color: var(--lj-muted);" />
          <p class="text-sm font-medium" style="color: var(--lj-muted);">{{ emptyMessage }}</p>
        </div>
      </div>
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-10"
      >
        <p class="text-xs font-bold" style="color: var(--lj-muted);">Memuat tren...</p>
      </div>
    </div>
  </div>
</template>
