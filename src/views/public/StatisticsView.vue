<script setup>
import { ref, onMounted } from 'vue'
import { Search, MapPin, X, TrendingUp, FileSpreadsheet, FileDown, ShieldCheck, AlertTriangle, ChevronRight, Download, BarChart3, ScatterChart } from 'lucide-vue-next'
import { useStatistikStore } from '@/stores/useStatistikStore'
import { statistikService } from '@/services/statistikService'
import { registerChartDefaults } from '@/utils/chartConfig'
import { mapService } from '@/services/mapService'
import StatistikTrenChart from '@/components/statistik/StatistikTrenChart.vue'
import { useRouter } from 'vue-router'
import StatistikConfidenceCard from '@/components/statistik/StatistikConfidenceCard.vue'
import StatistikKelengkapanData from '@/components/statistik/StatistikKelengkapanData.vue'
import StatistikGapAbj from '@/components/statistik/StatistikGapAbj.vue'
import StatistikLonjakanRisiko from '@/components/statistik/StatistikLonjakanRisiko.vue'
import StatistikBandingkanWilayah from '@/components/statistik/StatistikBandingkanWilayah.vue'
import StatistikLaporanNaratif from '@/components/statistik/StatistikLaporanNaratif.vue'
import StatistikKorelasiCuaca from '@/components/statistik/StatistikKorelasiCuaca.vue'
import StatistikExportRisetModal from '@/components/statistik/StatistikExportRisetModal.vue'

const router = useRouter()
const store = useStatistikStore()

/* ── Tabs ──────────────────────────────────────────────────── */
const tabs = [
  { id: 'ringkasan', label: 'Ringkasan', icon: BarChart3 },
  { id: 'korelasi', label: 'Analisis Korelasi', icon: ScatterChart },
  { id: 'bandingkan', label: 'Bandingkan Wilayah', icon: TrendingUp },
]
const activeTab = ref('ringkasan')

/* ── Stats (ringkasan tab) ─────────────────────────────────── */
const stats = ref(null)
const isLoading = ref(true)

const fetchRingkasan = async () => {
  isLoading.value = true
  try {
    const { dari, sampai } = store.dateParams
    const res = await statistikService.getRingkasan({
      jenis_penyakit: store.jenisPenyakit,
      dari,
      sampai,
    })
    stats.value = res
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}

/* Watch filter changes */
import { watch } from 'vue'
watch(() => store.reloadToken, () => fetchRingkasan())

/* ── Kecamatan Search ──────────────────────────────────────── */
const searchQuery = ref('')
const searchResults = ref([])
const isLoadingDetail = ref(false)

const handleSearch = async () => {
  if (searchQuery.value.length < 3) { searchResults.value = []; return }
  try {
    const res = await mapService.searchWilayah(searchQuery.value)
    searchResults.value = (res.data || res).filter(r => r.tingkat === 'kecamatan')
  } catch { searchResults.value = [] }
}

const selectWilayah = async (region) => {
  store.setSelectedWilayah(region)
  searchQuery.value = ''
  searchResults.value = []
  isLoadingDetail.value = true
  try {
    const { dari, sampai } = store.dateParams
    const res = await statistikService.getRingkasan({
      wilayah_kode: region.kode,
      jenis_penyakit: store.jenisPenyakit,
      dari, sampai,
    })
    detail.value = res
  } catch (e) { detail.value = null }
  finally { isLoadingDetail.value = false }
}

const detail = ref(null)

const clearWilayah = () => {
  store.clearSelectedWilayah()
  detail.value = null
}

/* ── Export ─────────────────────────────────────────────────── */
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const handleExport = (format) => {
  const kode = store.selectedWilayah?.kode
  if (!kode) return
  window.open(`${baseUrl}/export/abj/${format}?wilayah_kode=${kode}`, '_blank')
}

/* ── Helpers ────────────────────────────────────────────────── */
const ringkasan = () => stats.value?.ringkasan || {}
const topHijau = () => stats.value?.top_hijau || []
const topMerah = () => stats.value?.top_merah || []

const levelColor = (level) => {
  if (level === 'tinggi') return '#EF4444'
  if (level === 'sedang') return '#F59E0B'
  if (level === 'rendah') return '#22C55E'
  return '#9CA3AF'
}

const goToMap = (kode) => router.push(`/beranda/peta-resiko?kode=${kode}`)

/* ── Unduh Dataset Riset (Feature 8) ─────────────────────────── */
const showExportRiset = ref(false)

/* ── Init ───────────────────────────────────────────────────── */
onMounted(() => {
  registerChartDefaults()
  fetchRingkasan()
})
</script>

<template>
  <div style="background-color: var(--lj-bg); min-height: 100vh;">

    <!-- ─── Hero Lottie ─── -->
    <div class="hero-full-width relative overflow-hidden" style="height: 650px; border-radius: 0; background: var(--lj-blue-pale);">
      <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <Vue3Lottie
          animationLink="/illustrasi_statistik_fix.json"
          :loop="true" :autoplay="true"
          class="w-full h-full"
          :rendererSettings="{ preserveAspectRatio: 'xMidYMid slice' }"
        />
      </div>
      <div class="absolute left-0 w-full z-10 pointer-events-none" style="bottom: -2px; transform: translateY(1px);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block h-auto" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-8">

      <!-- Header -->
      <div class="text-center space-y-3">
        <div class="lj-section-label mx-auto" style="width: fit-content;">STATISTIK & DATA</div>
        <h1 class="lj-heading">Statistik <span class="font-garamond" style="color: var(--lj-blue);">Kecamatan</span></h1>
        <p class="text-sm mx-auto" style="color: var(--lj-muted); max-width: 500px;">
          Ringkasan nasional, ranking zona, dan detail per kecamatan.
        </p>
      </div>

      <!-- ─── Unduh Dataset Riset (Feature 8) ─── -->
      <div class="flex justify-center">
        <button
          @click="showExportRiset = true"
          class="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-transform hover:scale-105"
          style="background: #4E63DA; box-shadow: 0 8px 20px rgba(78, 99, 218, 0.3);"
        >
          📥 Unduh Dataset Riset
        </button>
      </div>

      <!-- ─── Global Filter ─── -->
      <div id="stats-filter-bar" class="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white rounded-3xl px-6 py-4 border shadow-sm max-w-3xl mx-auto">
        <!-- Disease toggle -->
        <div class="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            @click="store.setJenisPenyakit('dbd')"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
            :style="store.jenisPenyakit === 'dbd' ? 'background: var(--lj-blue); color: white;' : 'color: var(--lj-muted);'"
          >DBD</button>
          <button
            @click="store.setJenisPenyakit('malaria')"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
            :style="store.jenisPenyakit === 'malaria' ? 'background: var(--lj-blue); color: white;' : 'color: var(--lj-muted);'"
          >Malaria</button>
        </div>

        <!-- Time range -->
        <div class="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            v-for="opt in [{v:'hari-ini',l:'Hari Ini'},{v:'7-hari',l:'7 Hari'},{v:'30-hari',l:'30 Hari'},{v:'custom',l:'Custom'}]"
            :key="opt.v"
            @click="store.setRentangWaktu(opt.v)"
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
            :style="store.rentangWaktu === opt.v ? 'background: white; color: var(--lj-navy); box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : 'color: var(--lj-muted);'"
          >{{ opt.l }}</button>
        </div>

        <!-- Custom date pickers -->
        <div v-if="store.rentangWaktu === 'custom'" class="flex items-center gap-2">
          <input type="date" :value="store.dariTanggal" @input="(e) => store.setCustomRange(e.target.value, store.sampaiTanggal)"
            class="text-xs border rounded-xl px-3 py-1.5" style="border-color: var(--lj-border);" />
          <span class="text-xs" style="color: var(--lj-muted);">s/d</span>
          <input type="date" :value="store.sampaiTanggal" @input="(e) => store.setCustomRange(store.dariTanggal, e.target.value)"
            class="text-xs border rounded-xl px-3 py-1.5" style="border-color: var(--lj-border);" />
        </div>
      </div>

      <!-- ─── Tab Navigation ─── -->
      <div class="flex flex-wrap items-center justify-center gap-2">
        <button
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-bold transition-all"
          :style="activeTab === tab.id
            ? 'background: var(--lj-blue); color: white; box-shadow: 0 4px 12px rgba(78,99,218,0.3);'
            : 'background: white; color: var(--lj-muted); border: 1px solid var(--lj-border);'"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <!-- ─── Tab: Ringkasan ─── -->
      <Transition name="child-slide" mode="out-in">
        <div v-if="activeTab === 'ringkasan'" key="ringkasan" class="space-y-8">

          <!-- Search bar -->
          <div id="stats-search-bar" class="relative max-w-xl mx-auto w-full">
            <div class="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border shadow-sm" style="border-color: var(--lj-border);">
              <Search class="w-5 h-5 shrink-0" style="color: #4E63DA;" />
              <div class="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                <span v-if="store.selectedWilayah" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px]" style="background: #EEF2FF; color: #4E63DA;">
                  📍 {{ store.selectedWilayah.nama }}
                  <button @click="clearWilayah"><X class="w-3 h-3" /></button>
                </span>
                <input
                  v-else
                  v-model="searchQuery" type="text" placeholder="Cari kecamatan untuk lihat detail & export..."
                  class="flex-1 bg-transparent outline-none text-sm font-medium min-w-[180px]"
                  style="color: var(--lj-navy);" @input="handleSearch"
                />
              </div>
            </div>
            <div v-if="searchResults.length > 0" class="absolute z-40 mt-2 w-full bg-white border rounded-2xl shadow-xl overflow-hidden" style="border-color: var(--lj-border);">
              <div v-for="r in searchResults" :key="r.kode" @click="selectWilayah(r)"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b last:border-0 text-sm">
                <span class="font-bold" style="color: var(--lj-navy);">{{ r.nama }}</span>
                <span class="text-[11px] px-2 py-0.5 rounded-full font-bold" style="background: #EEF2FF; color: #4E63DA;">kecamatan</span>
              </div>
            </div>
          </div>

          <!-- Kecamatan Detail Panel -->
          <div v-if="detail && store.selectedWilayah" class="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 animate-on-scroll">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 class="text-xl font-bold" style="color: var(--lj-navy);">{{ detail.wilayah.nama }}</h2>
                <p class="text-xs" style="color: var(--lj-muted);">{{ detail.wilayah.tingkat }} · {{ detail.wilayah.kode }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="handleExport('excel')" class="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5" style="background: #059669;">
                  <FileSpreadsheet class="w-3.5 h-3.5" /> Excel
                </button>
                <button @click="handleExport('pdf')" class="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5" style="background: #DC2626;">
                  <FileDown class="w-3.5 h-3.5" /> PDF
                </button>
                <StatistikLaporanNaratif />
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="p-4 rounded-2xl text-center" style="background: #EEF2FF;">
                <div class="text-2xl font-black" style="color: #4E63DA;">{{ detail.ringkasan.skor_risiko ?? '—' }}</div>
                <div class="text-[10px] font-bold" style="color: #4E63DA;">Skor Risiko /100</div>
              </div>
              <div class="p-4 rounded-2xl text-center" :style="{ background: detail.ringkasan.level_risiko === 'tinggi' ? '#FEE2E2' : detail.ringkasan.level_risiko === 'sedang' ? '#FEF3C7' : '#D1FAE5' }">
                <div class="text-2xl font-black" :style="{ color: levelColor(detail.ringkasan.level_risiko) }">{{ detail.ringkasan.level_risiko === 'tinggi' ? '🔴' : detail.ringkasan.level_risiko === 'sedang' ? '🟡' : '🟢' }}</div>
                <div class="text-[10px] font-bold">{{ detail.ringkasan.level_risiko?.toUpperCase() || '—' }}</div>
              </div>
              <div class="p-4 rounded-2xl text-center" style="background: #D1FAE5;">
                <div class="text-2xl font-black" style="color: #065F46;">{{ detail.ringkasan.rata_abj }}%</div>
                <div class="text-[10px] font-bold" style="color: #065F46;">Rata-rata ABJ</div>
              </div>
              <div class="p-4 rounded-2xl text-center" style="background: #F3F4F6;">
                <div class="text-2xl font-black" style="color: #6B7280;">{{ detail.ringkasan.total_laporan }}</div>
                <div class="text-[10px] font-bold" style="color: #6B7280;">Laporan Warga</div>
              </div>
            </div>
            <div v-if="detail.tren_abj && detail.tren_abj.length > 0">
              <h3 class="text-sm font-bold mb-2" style="color: var(--lj-navy);">Riwayat ABJ Bulanan</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr class="bg-gray-50 text-left">
                      <th class="p-2 font-bold" style="color: var(--lj-muted);">Tanggal</th>
                      <th class="p-2 font-bold text-right" style="color: var(--lj-muted);">ABJ (%)</th>
                      <th class="p-2 font-bold text-center" style="color: var(--lj-muted);">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr v-for="(row, i) in detail.tren_abj" :key="i">
                      <td class="p-2 font-bold" style="color: var(--lj-navy);">{{ row.tanggal_pemeriksaan }}</td>
                      <td class="p-2 text-right font-bold" :style="{ color: row.abj_persen >= 95 ? '#065F46' : row.abj_persen >= 90 ? '#92400E' : '#991B1B' }">{{ Number(row.abj_persen).toFixed(1) }}%</td>
                      <td class="p-2 text-center">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :style="row.abj_persen >= 95 ? 'background:#D1FAE5;color:#065F46;' : row.abj_persen >= 90 ? 'background:#FEF3C7;color:#92400E;' : 'background:#FEE2E2;color:#991B1B;'">
                          {{ row.abj_persen >= 95 ? 'Aman' : row.abj_persen >= 90 ? 'Waspada' : 'Bahaya' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="text-center text-xs py-4" style="color: var(--lj-muted);">Belum ada data ABJ untuk kecamatan ini.</div>
          </div>

          <!-- Loading detail -->
          <div v-if="isLoadingDetail" class="text-center py-8">
            <p class="text-sm" style="color: var(--lj-muted);">Memuat data kecamatan...</p>
          </div>

          <!-- Kelengkapan Data (Feature 7) -->
          <StatistikKelengkapanData />

          <!-- National summary cards -->
          <div v-if="isLoading && !stats" id="stats-summary-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-5 border shadow-sm text-center animate-pulse">
              <div class="h-3 w-24 mx-auto rounded bg-gray-200 mb-2"></div>
              <div class="h-8 w-16 mx-auto rounded bg-gray-100 mb-2"></div>
              <div class="h-2 w-20 mx-auto rounded bg-gray-100"></div>
            </div>
          </div>
          <div v-else id="stats-summary-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
              <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Rata-rata Skor Risiko</div>
              <div class="text-3xl font-black" :style="{ color: levelColor(ringkasan().level_risiko) }">{{ ringkasan().skor_risiko ?? '—' }}</div>
              <div class="text-[10px] font-bold" :style="{ color: levelColor(ringkasan().level_risiko) }">/100 · {{ ringkasan().level_risiko?.toUpperCase() || '—' }}</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
              <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Rata-rata ABJ Indonesia</div>
              <div class="text-3xl font-black" style="color: #065F46;">{{ ringkasan().rata_abj }}%</div>
              <div class="text-[10px] font-bold" style="color: #065F46;">30 hari terakhir</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
              <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Zona Risiko</div>
              <div class="flex items-center justify-center gap-3 mt-1">
                <span class="text-sm font-bold" style="color: #22C55E;">🟢 {{ ringkasan().zona_hijau || 0 }}</span>
                <span class="text-sm font-bold" style="color: #F59E0B;">🟡 {{ ringkasan().zona_sedang || 0 }}</span>
                <span class="text-sm font-bold" style="color: #EF4444;">🔴 {{ ringkasan().zona_merah || 0 }}</span>
              </div>
              <div class="text-[10px] font-bold mt-1" style="color: var(--lj-muted);">{{ ringkasan().wilayah_dengan_data || 0 }}/{{ ringkasan().total_wilayah || 0 }} kab dgn data</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
              <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Total Laporan Warga</div>
              <div class="text-3xl font-black" style="color: #4E63DA;">{{ ringkasan().total_laporan || 0 }}</div>
              <div class="text-[10px] font-bold" style="color: #4E63DA;">nasional</div>
            </div>
            <StatistikConfidenceCard :confidence-summary="ringkasan().confidence_summary" />
          </div>

          <!-- Tren Grafik (Feature 2) -->
          <StatistikTrenChart
            :ringkasan-data="stats"
            :selected-wilayah="store.selectedWilayah"
            :jenis-penyakit="store.jenisPenyakit"
            :date-params="store.dateParams"
          />

          <!-- Top Rankings -->
          <div id="stats-rankings-section" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-3xl p-6 border shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <ShieldCheck class="w-5 h-5" style="color: #22C55E;" />
                <h2 class="text-base font-bold" style="color: var(--lj-navy);">Top 10 Zona Hijau</h2>
              </div>
              <div class="space-y-2">
                <div v-for="(item, i) in topHijau()" :key="item.kode"
                  @click="selectWilayah({ kode: item.kode, nama: item.nama, tingkat: 'kecamatan' })"
                  class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style="background: #22C55E;">{{ i + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold truncate" style="color: var(--lj-navy);">{{ item.nama }}</div>
                  </div>
                  <span class="text-xs font-bold" style="color: #22C55E;">{{ item.skor }}/100</span>
                  <span
                    v-if="item.confidence_level === 'kuat'"
                    class="px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                    style="background: #D1FAE5; color: #065F46;"
                  >Data Lapangan</span>
                  <span
                    v-else-if="item.confidence_level === 'lemah'"
                    class="px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                    style="background: transparent; border: 1.5px solid #FDE68A; color: #92400E;"
                  >Estimasi</span>
                  <ChevronRight class="w-4 h-4" style="color: #D1D5DB;" />
                </div>
                <div v-if="topHijau().length === 0" class="text-center text-xs py-4" style="color: var(--lj-muted);">Belum ada data.</div>
              </div>
            </div>
            <div class="bg-white rounded-3xl p-6 border shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <AlertTriangle class="w-5 h-5" style="color: #EF4444;" />
                <h2 class="text-base font-bold" style="color: var(--lj-navy);">Top 10 Zona Merah</h2>
              </div>
              <div class="space-y-2">
                <div v-for="(item, i) in topMerah()" :key="item.kode"
                  @click="selectWilayah({ kode: item.kode, nama: item.nama, tingkat: 'kecamatan' })"
                  class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style="background: #EF4444;">{{ i + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold truncate" style="color: var(--lj-navy);">{{ item.nama }}</div>
                  </div>
                  <span class="text-xs font-bold" style="color: #EF4444;">{{ item.skor }}/100</span>
                  <span
                    v-if="item.confidence_level === 'kuat'"
                    class="px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                    style="background: #D1FAE5; color: #065F46;"
                  >Data Lapangan</span>
                  <span
                    v-else-if="item.confidence_level === 'lemah'"
                    class="px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap"
                    style="background: transparent; border: 1.5px solid #FDE68A; color: #92400E;"
                  >Estimasi</span>
                  <ChevronRight class="w-4 h-4" style="color: #D1D5DB;" />
                </div>
                <div v-if="topMerah().length === 0" class="text-center text-xs py-4" style="color: var(--lj-muted);">Belum ada data.</div>
              </div>
            </div>
          </div>

          <!-- Gap ABJ vs Target Nasional 95% (Feature 4) -->
          <StatistikGapAbj />

          <!-- Deteksi Lonjakan Risiko (Feature 9) -->
          <StatistikLonjakanRisiko />
        </div>

        <!-- ─── Tab: Analisis Korelasi (Feature 5) ─── -->
        <div v-else-if="activeTab === 'korelasi'" key="korelasi">
          <StatistikKorelasiCuaca />
        </div>

        <!-- ─── Tab: Bandingkan Wilayah (Feature 6) ─── -->
        <div v-else-if="activeTab === 'bandingkan'" key="bandingkan" class="max-w-3xl mx-auto">
          <StatistikBandingkanWilayah />
        </div>
      </Transition>

    </div>

    <!-- Unduh Dataset Riset (Feature 8) -->
    <StatistikExportRisetModal v-if="showExportRiset" @close="showExportRiset = false" />
  </div>
</template>
