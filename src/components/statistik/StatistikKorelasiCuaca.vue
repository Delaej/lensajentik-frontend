<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Scatter } from 'vue-chartjs'
import { ScatterChart, Download, ChevronDown, FileImage, FileSpreadsheet } from 'lucide-vue-next'
import { CHART_COLORS, makeBaseOptions } from '@/utils/chartConfig'
import { downloadChartAsPng } from '@/utils/chartDownload'
import { downloadCsv } from '@/utils/csvExport'
import { statistikService } from '@/services/statistikService'
import { useStatistikStore } from '@/stores/useStatistikStore'
import apiClient from '@/services/apiClient'

const store = useStatistikStore()

/* ── Filter variabel X ──────────────────────────────────────── */
const variabel = ref('curah_hujan') // 'curah_hujan' | 'suhu' | 'kelembapan'
const variabelOptions = [
  { value: 'curah_hujan', label: 'Curah Hujan (mm)' },
  { value: 'suhu', label: 'Suhu (°C)' },
  { value: 'kelembapan', label: 'Kelembapan (%)' },
]

/* ── Scope wilayah (Nasional / provinsi / kabupaten) ────────── */
const provinsiList = ref([])
const kabupatenList = ref([])
const scopeProvinsi = ref('')   // '' = Nasional
const scopeKabupaten = ref('')  // '' = semua kabupaten dalam provinsi

const scopeKode = computed(() => scopeKabupaten.value || scopeProvinsi.value || '')

const fetchProvinsi = async () => {
  try {
    const res = await apiClient.get('/wilayah', { params: { tingkat: 'provinsi' } })
    provinsiList.value = res.data?.data || []
  } catch (e) {
    console.error('Gagal memuat daftar provinsi:', e)
  }
}

const fetchKabupaten = async () => {
  kabupatenList.value = []
  scopeKabupaten.value = ''
  if (!scopeProvinsi.value) return
  try {
    const res = await apiClient.get('/wilayah', {
      params: { tingkat: 'kabupaten', parent_kode: scopeProvinsi.value },
    })
    kabupatenList.value = res.data?.data || []
  } catch (e) {
    console.error('Gagal memuat daftar kabupaten:', e)
  }
}

watch(scopeProvinsi, fetchKabupaten)

/* ── Data ───────────────────────────────────────────────────── */
const rawData = ref([]) // { wilayah_kode, nama, tanggal, nilai_x, skor }
const isLoading = ref(false)

const fetchKorelasi = async () => {
  isLoading.value = true
  try {
    const params = { variabel: variabel.value, jenis: store.jenisPenyakit }
    if (scopeKode.value) params.scope_kode = scopeKode.value
    const res = await statistikService.getKorelasiCuaca(params)
    rawData.value = res.data || []
  } catch (e) {
    console.error('Gagal memuat korelasi cuaca:', e)
    rawData.value = []
  } finally {
    isLoading.value = false
  }
}

watch(variabel, fetchKorelasi)
watch(scopeKode, fetchKorelasi)
watch(() => store.reloadToken, fetchKorelasi)

onMounted(() => {
  fetchProvinsi()
  fetchKorelasi()
})

/* ── Regresi linier (least squares) ─────────────────────────── */
function linearRegression(points) {
  const n = points.length
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

/* ── Chart ──────────────────────────────────────────────────── */
const chartRef = ref(null)

const hasData = computed(() => rawData.value.length > 0)

const chartData = computed(() => {
  const rows = rawData.value
  if (!rows.length) return null

  const points = rows.map((r) => ({
    x: Number(r.nilai_x),
    y: Number(r.skor),
  }))

  const datasets = [
    {
      label: 'Kecamatan',
      data: points,
      backgroundColor: 'rgba(78, 99, 218, 0.6)',
      borderColor: CHART_COLORS.blue,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ]

  // Garis regresi linier dari semua titik
  const reg = points.length >= 2 ? linearRegression(points) : null
  if (reg) {
    const xs = points.map((p) => p.x)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    datasets.push({
      type: 'line',
      label: 'Garis Regresi',
      isRegression: true,
      data: [
        { x: minX, y: reg.slope * minX + reg.intercept },
        { x: maxX, y: reg.slope * maxX + reg.intercept },
      ],
      borderColor: CHART_COLORS.red,
      borderDash: [5, 5],
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 0,
      fill: false,
      tension: 0,
    })
  }

  return { datasets }
})

const variabelLabel = computed(
  () => variabelOptions.find((o) => o.value === variabel.value)?.label || ''
)

const chartOptions = computed(() =>
  makeBaseOptions({
    scales: {
      x: {
        grid: { color: '#F3F4F6', drawBorder: false },
        ticks: { color: '#9CA3AF', font: { size: 10 } },
        title: {
          display: true,
          text: variabelLabel.value,
          color: CHART_COLORS.blue,
          font: { size: 10, weight: 'bold' },
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        grid: { color: '#F3F4F6', drawBorder: false },
        ticks: { color: '#9CA3AF', font: { size: 10 }, stepSize: 20 },
        title: {
          display: true,
          text: 'Skor Risiko',
          color: CHART_COLORS.blue,
          font: { size: 10, weight: 'bold' },
        },
      },
    },
    plugins: {
      legend: {
        labels: { usePointStyle: true, pointStyleWidth: 10, font: { size: 11 }, color: '#6B7280' },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const ctx = items[0]
            if (!ctx || ctx.dataset.isRegression) return ''
            return rawData.value[ctx.dataIndex]?.nama || ''
          },
          label: (ctx) => {
            if (ctx.dataset.isRegression) return ''
            const row = rawData.value[ctx.dataIndex]
            if (!row) return ''
            const opt = variabelOptions.find((o) => o.value === variabel.value)
            return [
              `Tanggal: ${row.tanggal}`,
              `${opt.label}: ${Number(row.nilai_x).toFixed(1)}`,
              `Skor Risiko: ${Number(row.skor).toFixed(1)}`,
            ]
          },
        },
      },
    },
  })
)

/* ── Download ───────────────────────────────────────────────── */
const downloadOpen = ref(false)

const downloadPng = () => {
  if (chartRef.value?.chart) {
    downloadChartAsPng(chartRef.value.chart, 'korelasi-cuaca')
  }
  downloadOpen.value = false
}

const downloadCsvFile = () => {
  const rows = rawData.value
  if (!rows.length) return
  downloadCsv(
    rows,
    ['nama', 'tanggal', 'nilai_x', 'skor'],
    ['Wilayah', 'Tanggal', 'Nilai Cuaca', 'Skor Risiko'],
    'korelasi-data',
  )
  downloadOpen.value = false
}
</script>

<template>
  <div id="stats-korelasi-cuaca" class="bg-white rounded-3xl p-6 border shadow-sm">
    <!-- Header: judul + filter + unduh -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <ScatterChart class="w-5 h-5 shrink-0" style="color: #4E63DA;" />
          <h2 class="text-base font-bold leading-snug" style="color: var(--lj-navy);">
            Korelasi Cuaca vs Skor Risiko
          </h2>
        </div>
        <p class="text-xs mt-1.5" style="color: var(--lj-muted);">
          Setiap titik mewakili satu kecamatan pada satu tanggal. Garis merah menunjukkan tren korelasi.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <!-- Variabel X -->
        <select
          v-model="variabel"
          class="text-xs font-bold bg-white border rounded-xl px-3 py-2 outline-none"
          style="border-color: var(--lj-border); color: var(--lj-navy);"
        >
          <option v-for="opt in variabelOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- Scope: provinsi -->
        <select
          v-model="scopeProvinsi"
          class="text-xs font-bold bg-white border rounded-xl px-3 py-2 outline-none max-w-[180px] truncate"
          style="border-color: var(--lj-border); color: var(--lj-navy);"
        >
          <option value="">Nasional</option>
          <option v-for="p in provinsiList" :key="p.kode" :value="p.kode">{{ p.nama }}</option>
        </select>

        <!-- Scope: kabupaten -->
        <select
          v-if="scopeProvinsi"
          v-model="scopeKabupaten"
          class="text-xs font-bold bg-white border rounded-xl px-3 py-2 outline-none max-w-[180px] truncate"
          style="border-color: var(--lj-border); color: var(--lj-navy);"
        >
          <option value="">Semua Kabupaten</option>
          <option v-for="k in kabupatenList" :key="k.kode" :value="k.kode">{{ k.nama }}</option>
        </select>

        <!-- Download dropdown -->
        <div class="relative">
          <button
            @click="downloadOpen = !downloadOpen"
            :disabled="!hasData"
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

    <!-- Chart -->
    <div class="relative chart-container" style="height: 350px;">
      <Scatter
        v-if="hasData && chartData"
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
      />
      <div v-else class="flex items-center justify-center h-full text-center">
        <div>
          <ScatterChart class="w-10 h-10 mx-auto mb-3" style="color: var(--lj-muted);" />
          <p class="text-sm font-medium" style="color: var(--lj-muted);">Belum ada data korelasi.</p>
        </div>
      </div>
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-10"
      >
        <p class="text-xs font-bold" style="color: var(--lj-muted);">Memuat data...</p>
      </div>
    </div>

    <!-- Footer info -->
    <div
      v-if="hasData"
      class="flex items-center justify-between mt-3 text-[11px] font-semibold"
      style="color: var(--lj-muted);"
    >
      <span>{{ rawData.length }} titik data · 90 hari terakhir</span>
      <span>Garis merah = regresi linier</span>
    </div>
  </div>
</template>
