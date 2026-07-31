<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { TrendingUp, TrendingDown, Download, FileSpreadsheet, FileText, Search, MapPin, X } from 'lucide-vue-next'
import apiClient from '@/services/apiClient'
import { mapService } from '@/services/mapService'

/* ─── State ──────────────────────────────────────────────────────────────── */
const stats = ref(null)
const ringkasan = computed(() => stats.value?.ringkasan || {})
const perWilayah = computed(() => stats.value?.per_wilayah || [])
const wilayah = computed(() => stats.value?.wilayah || { nama: 'Indonesia', tingkat: 'nasional' })
const isLoading = ref(true)
const abjChartEl = ref(null)
const laporanChartEl = ref(null)
const perWilayahChartEl = ref(null)

// Region filter
const searchQuery = ref('')
const searchResults = ref([])
const selectedWilayah = ref(null)

/* ─── Fetch ──────────────────────────────────────────────────────────────── */
const fetchData = async (wilayahKode = null) => {
  isLoading.value = true
  try {
    const params = wilayahKode ? { wilayah_kode: wilayahKode } : {}
    const res = await apiClient.get('/statistik/ringkasan', { params })
    stats.value = res.data.data || res.data
  } catch (e) {
    console.error('Statistik fetch failed:', e)
  } finally {
    isLoading.value = false
    await nextTick()
    renderCharts()
  }
}

onMounted(() => fetchData())

/* ─── Search ──────────────────────────────────────────────────────────────── */
const handleSearch = async () => {
  if (searchQuery.value.length < 3) { searchResults.value = []; return }
  try {
    const res = await mapService.searchWilayah(searchQuery.value)
    searchResults.value = (res.data || res).filter(r => r.tingkat === 'kabupaten' || r.tingkat === 'kecamatan')
  } catch { searchResults.value = [] }
}

const selectWilayah = async (region) => {
  selectedWilayah.value = region
  searchQuery.value = ''
  searchResults.value = []
  await fetchData(region.kode)
}

const clearWilayah = async () => {
  selectedWilayah.value = null
  await fetchData()
}

/* ─── Computed ────────────────────────────────────────────────────────────── */
const wilayahNama = computed(() =>
  selectedWilayah.value ? `${selectedWilayah.value.nama} (${selectedWilayah.value.tingkat})` : 'Indonesia'
)

const rataAbj = computed(() => ringkasan.value.rata_abj)
const skorRisiko = computed(() => ringkasan.value.skor_risiko)
const levelRisiko = computed(() => ringkasan.value.level_risiko)
const zonaHijau = computed(() => ringkasan.value.zona_hijau)
const zonaMerah = computed(() => ringkasan.value.zona_merah)
const totalLaporan = computed(() => ringkasan.value.total_laporan)
const totalWilayah = computed(() => ringkasan.value.total_wilayah)
const wilayahDenganData = computed(() => ringkasan.value.wilayah_dengan_data)
const levelLabel = computed(() =>
  levelRisiko.value === 'tinggi' ? '🔴 Risiko Tinggi' :
  levelRisiko.value === 'sedang' ? '🟡 Risiko Sedang' :
  levelRisiko.value === 'rendah' ? '🟢 Risiko Rendah' : '—'
)

const trenDataRaw = computed(() => stats.value?.tren_abj || [])
const laporanDataRaw = computed(() => stats.value?.laporan_per_status || {})

/* ─── Table data ──────────────────────────────────────────────────────────── */
const tableColumns = computed(() => {
  if (selectedWilayah.value?.tingkat === 'kabupaten') {
    return [
      { key: 'nama', label: 'Kecamatan' },
      { key: 'abj', label: 'ABJ %', format: v => v != null ? `${Number(v).toFixed(1)}%` : '—' },
      { key: 'skor', label: 'Skor Risiko', format: v => v != null ? `${Number(v).toFixed(0)}/100` : '—' },
      { key: 'level', label: 'Status', format: v =>
        v === 'tinggi' ? '🔴 Tinggi' : v === 'sedang' ? '🟡 Sedang' : v === 'rendah' ? '🟢 Rendah' : '⚪ Belum Data' },
    ]
  }
  if (!selectedWilayah.value) {
    return [
      { key: 'nama', label: 'Kabupaten/Kota' },
      { key: 'skor', label: 'Skor Risiko', format: v => v != null ? `${Number(v).toFixed(0)}/100` : '—' },
      { key: 'level', label: 'Level', format: v =>
        v === 'tinggi' ? '🔴 Tinggi' : v === 'sedang' ? '🟡 Sedang' : v === 'rendah' ? '🟢 Rendah' : '⚪ Belum' },
      { key: 'kecamatan_dengan_data', label: 'Kec. dgn Data' },
    ]
  }
  // kecamatan: show ABJ trend table
  return []
})

/* ─── Chart.js ───────────────────────────────────────────────────────────── */
let chartInstances = []

const destroyCharts = () => {
  chartInstances.forEach(c => c.destroy())
  chartInstances = []
}

const renderCharts = async () => {
  if (typeof window === 'undefined') return
  destroyCharts()
  try {
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    // ABJ Trend
    if (abjChartEl.value && trenDataRaw.value.length > 0) {
      const ctx = abjChartEl.value.getContext('2d')
      const vals = trenDataRaw.value.map(t => t.abj_persen || 0)
      const labels = trenDataRaw.value.map(t => {
        try { return new Date(t.tanggal_pemeriksaan).toLocaleDateString('id-ID', { day:'numeric', month:'short' }) }
        catch { return t.tanggal_pemeriksaan || '' }
      })
      chartInstances.push(new Chart(ctx, {
        type: 'line', data: {
          labels,
          datasets: [{
            label: 'ABJ (%)', data: vals, borderColor: '#4E63DA',
            backgroundColor: 'rgba(78,99,218,0.08)', fill: true, tension: 0.4,
            pointRadius: 4, pointBackgroundColor: '#4E63DA', pointBorderColor: 'white', pointBorderWidth: 2, borderWidth: 2.5,
          }, {
            label: 'Target 95%', data: Array(labels.length).fill(95),
            borderColor: '#EF4444', borderWidth: 2, borderDash: [5,5], pointRadius: 0, fill: false, tension: 0,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { family:'Satoshi', size:11 } } } },
          scales: {
            y: { min: 70, max: 100, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => `${v}%`, font:{ family:'Satoshi', size:11 } } },
            x: { grid: { display: false }, ticks: { font:{ family:'Satoshi', size:11 } } },
          },
        },
      }))
    }

    // Laporan Status
    if (laporanChartEl.value && Object.keys(laporanDataRaw.value).length > 0) {
      const ctx = laporanChartEl.value.getContext('2d')
      const raw = laporanDataRaw.value
      const mapping = { belum_ditangani:'Belum Ditangani', diproses:'Dalam Proses', sedang_diproses:'Dalam Proses', selesai:'Selesai' }
      chartInstances.push(new Chart(ctx, {
        type: 'bar', data: {
          labels: Object.keys(raw).map(k => mapping[k] || k),
          datasets: [{ label: 'Laporan', data: Object.values(raw),
            backgroundColor: ['rgba(239,68,68,0.7)','rgba(245,158,11,0.7)','rgba(34,197,94,0.7)'],
            borderRadius: 8, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color:'rgba(0,0,0,0.04)' }, ticks: { font:{ family:'Satoshi', size:11 } } },
            y: { grid: { display: false }, ticks: { font:{ family:'Satoshi', size:11, weight:'700' } } },
          },
        },
      }))
    }

    // Per Wilayah chart
    if (perWilayahChartEl.value && perWilayah.value.length > 0) {
      const ctx = perWilayahChartEl.value.getContext('2d')
      const data = perWilayah.value.slice(0, 15)
      chartInstances.push(new Chart(ctx, {
        type: 'bar', data: {
          labels: data.map(w => w.nama),
          datasets: [{
            label: 'Skor Risiko', data: data.map(w => w.skor ?? 0),
            backgroundColor: data.map(w =>
              (w.level === 'tinggi') ? 'rgba(239,68,68,0.7)' :
              (w.level === 'sedang') ? 'rgba(245,158,11,0.7)' :
              (w.level === 'rendah') ? 'rgba(34,197,94,0.7)' : 'rgba(156,163,175,0.5)'
            ),
            borderRadius: 8, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { max: 100, ticks: { font:{ family:'Satoshi', size:11 } }, grid: { color:'rgba(0,0,0,0.04)' } },
            y: { grid: { display: false }, ticks: { font:{ family:'Satoshi', size:11 } } },
          },
        },
      }))
    }
  } catch (e) { console.error('Chart.js render failed:', e) }
}

/* ─── Export ─────────────────────────────────────────────────────────────── */
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const handleExport = (format) => {
  const kode = selectedWilayah.value?.kode
  if (!kode) { alert('Pilih wilayah terlebih dahulu untuk mengunduh laporan.'); return }
  window.open(`${baseUrl}/export/abj/${format}?wilayah_kode=${kode}`, '_blank')
}

/* ─── Table helpers ──────────────────────────────────────────────────────── */
const levelBadgeStyle = (level) => {
  if (level === 'tinggi') return 'background:#FEE2E2; color:#991B1B;'
  if (level === 'sedang') return 'background:#FEF3C7; color:#92400E;'
  if (level === 'rendah') return 'background:#D1FAE5; color:#065F46;'
  return 'background:#F3F4F6; color:#6B7280;'
}
</script>

<template>
  <div style="background-color: var(--lj-bg); min-height: 100vh;">

    <!-- ─── Hero illustration (Lottie full-width) ─── -->
    <div class="hero-full-width relative overflow-hidden" style="height: 550px; border-radius: 0; background: var(--lj-blue-pale);">
      <div class="absolute inset-0 z-0 pointer-events-none">
        <Vue3Lottie
          animationLink="/illustrasi_statistik.json"
          :loop="true"
          :autoplay="true"
          class="w-full h-full"
          :rendererSettings="{ preserveAspectRatio: 'xMidYMid slice' }"
        />
      </div>
      <!-- Sway wave bottom -->
      <div class="absolute left-0 w-full z-10 pointer-events-none" style="bottom: -2px; transform: translateY(1px);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block h-auto" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-8">

      <!-- Header -->
      <div class="text-center space-y-3">
        <div class="lj-section-label mx-auto" style="width: fit-content;">STATISTIK & DATA</div>
        <h1 class="lj-heading">Dashboard <span class="font-garamond" style="color: var(--lj-blue);">Statistik</span></h1>
        <p class="text-sm mx-auto" style="color: var(--lj-muted); max-width: 560px;">
          Data capaian ABJ, risiko DBD, dan laporan warga — transparan & tanpa login.
        </p>
        <div class="flex items-center justify-center gap-2 pt-1 flex-wrap">
          <span class="text-xs px-3 py-1 rounded-full font-bold"
            :style="selectedWilayah ? 'background:#FEF3C7; color:#92400E;' : 'background:#D1FAE5; color:#065F46;'">
            {{ selectedWilayah ? `📌 ${wilayahNama}` : '🌏 Nasional' }}
          </span>
          <span class="text-xs px-3 py-1 rounded-full font-bold" style="background:#EEF2FF; color:#4E63DA;">
            {{ totalWilayah }} wilayah · {{ wilayahDenganData }} dengan data
          </span>
        </div>
      </div>

      <!-- Search + Export -->
      <div class="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 rounded-2xl border shadow-sm" style="border-color: var(--lj-border);">
        <div class="relative flex-1 w-full">
          <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--lj-blue);" />
          <input v-model="searchQuery" @input="handleSearch" type="text"
            placeholder="Cari kabupaten atau kecamatan..."
            class="w-full pl-11 pr-4 py-3 rounded-xl bg-[--lj-bg] text-sm font-medium outline-none focus:ring-2 focus:ring-[--lj-blue]" />
          <div v-if="searchResults.length > 0" class="absolute left-0 right-0 top-full mt-2 bg-white border rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 text-sm" style="border-color: var(--lj-border);">
            <div v-for="res in searchResults" :key="res.kode" @click="selectWilayah(res)"
              class="p-3 hover:bg-[--lj-blue-pale] cursor-pointer flex justify-between border-b last:border-b-0" style="border-color: var(--lj-border);">
              <span class="font-bold text-gray-800">{{ res.nama }}</span>
              <span class="text-xs text-gray-400">{{ res.tingkat }}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 shrink-0">
          <button @click="handleExport('excel')" class="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold hover:scale-105 transition-all" style="background:#F0FDF4; color:#059669; border:1.5px solid #BBF7D0;">
            <FileSpreadsheet class="w-4 h-4" /> Excel
          </button>
          <button @click="handleExport('pdf')" class="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold hover:scale-105 transition-all" style="background:#FEF2F2; color:#DC2626; border:1.5px solid #FECACA;">
            <FileText class="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div v-if="selectedWilayah" class="flex items-center justify-center">
        <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold" style="background:#EEF2FF; color:#4E63DA;">
          <MapPin class="w-3.5 h-3.5" /> {{ wilayahNama }}
          <button @click="clearWilayah" class="hover:opacity-70"><X class="w-3.5 h-3.5" /></button>
        </span>
      </div>

      <!-- KPI Cards -->
      <div v-if="!isLoading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="lj-card p-5 space-y-2">
          <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Rata-rata ABJ</div>
          <div class="text-2xl font-black" :style="{ color: rataAbj >= 95 ? '#22C55E' : rataAbj >= 90 ? '#F59E0B' : rataAbj > 0 ? '#EF4444' : 'var(--lj-muted)' }">
            {{ rataAbj > 0 ? `${rataAbj}%` : '—' }}
          </div>
          <div class="text-xs" style="color: var(--lj-muted);">30 hari terakhir</div>
        </div>

        <div class="lj-card p-5 space-y-2">
          <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Skor Risiko</div>
          <div class="text-2xl font-black" :style="{ color: levelRisiko === 'tinggi' ? '#EF4444' : levelRisiko === 'sedang' ? '#F59E0B' : levelRisiko === 'rendah' ? '#22C55E' : 'var(--lj-muted)' }">
            {{ skorRisiko != null ? `${skorRisiko}/100` : '—' }}
          </div>
          <div class="text-xs font-bold" :style="{ color: levelRisiko === 'tinggi' ? '#EF4444' : levelRisiko === 'sedang' ? '#F59E0B' : levelRisiko === 'rendah' ? '#22C55E' : 'var(--lj-muted)' }">{{ levelLabel }}</div>
        </div>

        <div class="lj-card p-5 space-y-2">
          <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Zona Hijau</div>
          <div class="text-2xl font-black" style="color: #22C55E;">{{ zonaHijau ?? '—' }}</div>
          <div class="text-xs" style="color: var(--lj-muted);">ABJ ≥ 95%</div>
        </div>

        <div class="lj-card p-5 space-y-2">
          <div class="text-xs font-bold uppercase" style="color: var(--lj-muted);">Zona Merah</div>
          <div class="text-2xl font-black" style="color: #EF4444;">{{ zonaMerah ?? '—' }}</div>
          <div class="text-xs font-bold" :style="{ color: zonaMerah > 0 ? '#EF4444' : '#22C55E' }">
            {{ zonaMerah > 0 ? '⚠ Perlu Tindakan' : '✅ Aman' }}
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="lj-card p-5 space-y-3 animate-pulse">
          <div class="h-3 bg-gray-200 rounded w-20" />
          <div class="h-8 bg-gray-200 rounded w-16" />
          <div class="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="lj-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-sm" style="color: var(--lj-navy);">Tren ABJ</h3>
            <span class="text-xs px-2.5 py-1 rounded-full font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">Data Kader</span>
          </div>
          <div v-if="trenDataRaw.length > 0" style="height: 280px;"><canvas ref="abjChartEl" /></div>
          <div v-else class="flex items-center justify-center text-sm text-gray-400" style="height: 280px;">Belum ada data tren ABJ.</div>
        </div>

        <div class="lj-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-sm" style="color: var(--lj-navy);">Status Laporan Warga</h3>
            <span class="text-xs px-2.5 py-1 rounded-full font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">Total: {{ totalLaporan ?? 0 }}</span>
          </div>
          <div v-if="Object.keys(laporanDataRaw).length > 0" style="height: 280px;"><canvas ref="laporanChartEl" /></div>
          <div v-else class="flex items-center justify-center text-sm text-gray-400" style="height: 280px;">Belum ada laporan warga.</div>
        </div>
      </div>

      <!-- Per Wilayah Chart -->
      <div class="lj-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-sm" style="color: var(--lj-navy);">
            {{ selectedWilayah ? `Per Kecamatan di ${selectedWilayah.nama}` : 'Per Kabupaten/Kota' }}
          </h3>
          <span class="text-xs px-2.5 py-1 rounded-full font-bold" style="background: var(--lj-blue-pale); color: var(--lj-blue);">{{ perWilayah.length }} wilayah</span>
        </div>
        <div v-if="perWilayah.length > 0" class="chart-container" :style="{ height: Math.max(200, perWilayah.slice(0, 15).length * 34) + 'px' }">
          <canvas ref="perWilayahChartEl" />
        </div>
        <div v-else class="flex items-center justify-center text-sm text-gray-400" style="height: 200px;">
          Belum ada data.
        </div>
      </div>

      <!-- Data Table -->
      <div v-if="perWilayah.length > 0" class="lj-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-sm" style="color: var(--lj-navy);">
            📋 {{ selectedWilayah ? `Data per Kecamatan — ${selectedWilayah.nama}` : 'Data per Kabupaten/Kota' }}
          </h3>
          <span class="text-xs" style="color: var(--lj-muted);">{{ perWilayah.length }} wilayah</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b text-left" style="border-color: var(--lj-border);">
                <th class="py-3 px-3 font-bold" style="color: var(--lj-muted);">Wilayah</th>
                <th class="py-3 px-3 font-bold" style="color: var(--lj-muted);">Skor Risiko</th>
                <th class="py-3 px-3 font-bold" style="color: var(--lj-muted);">Level</th>
                <th v-if="perWilayah[0]?.abj !== undefined" class="py-3 px-3 font-bold" style="color: var(--lj-muted);">ABJ %</th>
                <th v-if="perWilayah[0]?.kecamatan_dengan_data !== undefined" class="py-3 px-3 font-bold" style="color: var(--lj-muted);">Kec. dgn Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in perWilayah" :key="row.kode" class="border-b hover:bg-gray-50" style="border-color: var(--lj-border);">
                <td class="py-3 px-3 font-medium" style="color: var(--lj-navy);">{{ row.nama }}</td>
                <td class="py-3 px-3 font-bold" :style="{ color: row.skor != null ? (row.skor >= 70 ? '#EF4444' : row.skor >= 40 ? '#F59E0B' : '#22C55E') : 'var(--lj-muted)' }">
                  {{ row.skor != null ? `${Number(row.skor).toFixed(0)}/100` : '—' }}
                </td>
                <td class="py-3 px-3">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold" :style="levelBadgeStyle(row.level)">
                    {{ row.level === 'tinggi' ? '🔴 Tinggi' : row.level === 'sedang' ? '🟡 Sedang' : row.level === 'rendah' ? '🟢 Rendah' : '⚪ Belum' }}
                  </span>
                </td>
                <td v-if="row.abj !== undefined" class="py-3 px-3 font-bold" :style="{ color: row.abj >= 95 ? '#22C55E' : row.abj >= 90 ? '#F59E0B' : row.abj != null ? '#EF4444' : 'var(--lj-muted)' }">
                  {{ row.abj != null ? `${Number(row.abj).toFixed(1)}%` : '—' }}
                </td>
                <td v-if="row.kecamatan_dengan_data !== undefined" class="py-3 px-3" style="color: var(--lj-muted);">
                  {{ row.kecamatan_dengan_data }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-xs text-center" style="color: var(--lj-muted);">
        Sumber data: Kader Kesehatan · Open-Meteo API · Laporan Warga LensaJentik
      </div>
    </div>
  </div>
</template>
