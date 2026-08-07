<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, MapPin, X, TrendingUp, FileSpreadsheet, FileDown, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-vue-next'
import apiClient from '@/services/apiClient'
import { mapService } from '@/services/mapService'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ─── State ──────────────────────────────────────────────────── */
const stats = ref(null)
const ringkasan = computed(() => stats.value?.ringkasan || {})
const topHijau = computed(() => stats.value?.top_hijau || [])
const topMerah = computed(() => stats.value?.top_merah || [])
const isLoading = ref(true)

// Search
const searchQuery = ref('')
const searchResults = ref([])
const selectedWilayah = ref(null)

// Detail kecamatan
const detail = ref(null)
const isLoadingDetail = ref(false)

/* ─── Fetch nasional ──────────────────────────────────────────── */
const fetchNasional = async () => {
  isLoading.value = true
  try {
    const res = await apiClient.get('/statistik/ringkasan')
    stats.value = res.data
  } catch (e) { console.error(e) }
  finally { isLoading.value = false }
}

onMounted(() => fetchNasional())

/* ─── Search ──────────────────────────────────────────────────── */
const handleSearch = async () => {
  if (searchQuery.value.length < 3) { searchResults.value = []; return }
  try {
    const res = await mapService.searchWilayah(searchQuery.value)
    searchResults.value = (res.data || res).filter(r => r.tingkat === 'kecamatan')
  } catch { searchResults.value = [] }
}

const selectWilayah = async (region) => {
  selectedWilayah.value = region
  searchQuery.value = ''
  searchResults.value = []
  isLoadingDetail.value = true
  try {
    const res = await apiClient.get(`/statistik/ringkasan?wilayah_kode=${region.kode}`)
    detail.value = res.data
  } catch (e) { detail.value = null }
  finally { isLoadingDetail.value = false }
}

const clearWilayah = () => {
  selectedWilayah.value = null
  detail.value = null
}

/* ─── Export ──────────────────────────────────────────────────── */
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const handleExport = (format) => {
  const kode = selectedWilayah.value?.kode
  if (!kode) return
  window.open(`${baseUrl}/export/abj/${format}?wilayah_kode=${kode}`, '_blank')
}

/* ─── Helpers ──────────────────────────────────────────────────── */
const skorNasional = computed(() => ringkasan.value.skor_risiko)
const levelNasional = computed(() => ringkasan.value.level_risiko)
const rataAbj = computed(() => ringkasan.value.rata_abj)
const zonaHijau = computed(() => ringkasan.value.zona_hijau || 0)
const zonaSedang = computed(() => ringkasan.value.zona_sedang || 0)
const zonaMerah = computed(() => ringkasan.value.zona_merah || 0)
const totalWilayah = computed(() => ringkasan.value.total_wilayah || 0)
const denganData = computed(() => ringkasan.value.wilayah_dengan_data || 0)

const levelColor = (level) => {
  if (level === 'tinggi') return '#EF4444'
  if (level === 'sedang') return '#F59E0B'
  if (level === 'rendah') return '#22C55E'
  return '#9CA3AF'
}

const goToMap = (kode) => router.push(`/beranda/peta-resiko?kode=${kode}`)
</script>

<template>
  <div style="background-color: var(--lj-bg); min-height: 100vh;">

    <!-- ─── Hero illustration (Lottie full-width) ─── -->
    <div class="hero-full-width relative overflow-hidden" style="height: 650px; border-radius: 0; background: var(--lj-blue-pale);">
      <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <Vue3Lottie
          animationLink="/illustrasi_statistik_fix.json"
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
        <h1 class="lj-heading">Statistik <span class="font-garamond" style="color: var(--lj-blue);">Kecamatan</span></h1>
        <p class="text-sm mx-auto" style="color: var(--lj-muted); max-width: 500px;">
          Ringkasan nasional, ranking zona, dan detail per kecamatan.
        </p>
      </div>

      <!-- Search bar -->
      <div id="stats-search-bar" class="relative max-w-xl mx-auto w-full">
        <div class="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border shadow-sm" style="border-color: var(--lj-border);">
          <Search class="w-5 h-5 shrink-0" style="color: #4E63DA;" />
          <div class="flex-1 flex items-center gap-2 flex-wrap min-w-0">
            <span v-if="selectedWilayah" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px]" style="background: #EEF2FF; color: #4E63DA;">
              📍 {{ selectedWilayah.nama }}
              <button @click="clearWilayah"><X class="w-3 h-3" /></button>
            </span>
            <input
              v-else
              v-model="searchQuery"
              type="text"
              placeholder="Cari kecamatan untuk lihat detail & export..."
              class="flex-1 bg-transparent outline-none text-sm font-medium min-w-[180px]"
              style="color: var(--lj-navy);"
              @input="handleSearch"
            />
          </div>
        </div>
        <!-- Dropdown -->
        <div v-if="searchResults.length > 0" class="absolute z-40 mt-2 w-full bg-white border rounded-2xl shadow-xl overflow-hidden" style="border-color: var(--lj-border);">
          <div v-for="r in searchResults" :key="r.kode" @click="selectWilayah(r)"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b last:border-0 text-sm">
            <span class="font-bold" style="color: var(--lj-navy);">{{ r.nama }}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-bold" style="background: #EEF2FF; color: #4E63DA;">kecamatan</span>
          </div>
        </div>
      </div>

      <!-- Detail kecamatan -->
      <div v-if="detail && selectedWilayah" class="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 class="text-xl font-bold" style="color: var(--lj-navy);">{{ detail.wilayah.nama }}</h2>
            <p class="text-xs" style="color: var(--lj-muted);">Kecamatan · {{ detail.wilayah.kode }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="handleExport('excel')" class="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5" style="background: #059669;">
              <FileSpreadsheet class="w-3.5 h-3.5" /> Excel
            </button>
            <button @click="handleExport('pdf')" class="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5" style="background: #DC2626;">
              <FileDown class="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        <!-- Metrics -->
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

        <!-- Monthly ABJ trend table -->
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

      <!-- Nasional summary cards -->
      <div id="stats-summary-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
          <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Rata-rata Skor Risiko</div>
          <div class="text-3xl font-black" :style="{ color: levelColor(levelNasional) }">{{ skorNasional ?? '—' }}</div>
          <div class="text-[10px] font-bold" :style="{ color: levelColor(levelNasional) }">/100 · {{ levelNasional?.toUpperCase() || '—' }}</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
          <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Rata-rata ABJ Indonesia</div>
          <div class="text-3xl font-black" style="color: #065F46;">{{ rataAbj }}%</div>
          <div class="text-[10px] font-bold" style="color: #065F46;">30 hari terakhir</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
          <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Zona Risiko</div>
          <div class="flex items-center justify-center gap-3 mt-1">
            <span class="text-sm font-bold" style="color: #22C55E;">🟢 {{ zonaHijau }}</span>
            <span class="text-sm font-bold" style="color: #F59E0B;">🟡 {{ zonaSedang }}</span>
            <span class="text-sm font-bold" style="color: #EF4444;">🔴 {{ zonaMerah }}</span>
          </div>
          <div class="text-[10px] font-bold mt-1" style="color: var(--lj-muted);">{{ denganData }}/{{ totalWilayah }} kab dgn data</div>
        </div>
        <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
          <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Total Laporan Warga</div>
          <div class="text-3xl font-black" style="color: #4E63DA;">{{ ringkasan.total_laporan || 0 }}</div>
          <div class="text-[10px] font-bold" style="color: #4E63DA;">nasional</div>
        </div>
      </div>

      <!-- Rankings -->
      <div id="stats-rankings-section" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Top 10 Hijau -->
        <div class="bg-white rounded-3xl p-6 border shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <ShieldCheck class="w-5 h-5" style="color: #22C55E;" />
            <h2 class="text-base font-bold" style="color: var(--lj-navy);">Top 10 Zona Hijau</h2>
          </div>
          <div class="space-y-2">
            <div v-for="(item, i) in topHijau" :key="item.kode"
              @click="selectWilayah({ kode: item.kode, nama: item.nama, tingkat: 'kecamatan' })"
              class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style="background: #22C55E;">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold truncate" style="color: var(--lj-navy);">{{ item.nama }}</div>
              </div>
              <span class="text-xs font-bold" style="color: #22C55E;">{{ item.skor }}/100</span>
              <ChevronRight class="w-4 h-4" style="color: #D1D5DB;" />
            </div>
            <div v-if="topHijau.length === 0" class="text-center text-xs py-4" style="color: var(--lj-muted);">Belum ada data.</div>
          </div>
        </div>

        <!-- Top 10 Merah -->
        <div class="bg-white rounded-3xl p-6 border shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <AlertTriangle class="w-5 h-5" style="color: #EF4444;" />
            <h2 class="text-base font-bold" style="color: var(--lj-navy);">Top 10 Zona Merah</h2>
          </div>
          <div class="space-y-2">
            <div v-for="(item, i) in topMerah" :key="item.kode"
              @click="selectWilayah({ kode: item.kode, nama: item.nama, tingkat: 'kecamatan' })"
              class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style="background: #EF4444;">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold truncate" style="color: var(--lj-navy);">{{ item.nama }}</div>
              </div>
              <span class="text-xs font-bold" style="color: #EF4444;">{{ item.skor }}/100</span>
              <ChevronRight class="w-4 h-4" style="color: #D1D5DB;" />
            </div>
            <div v-if="topMerah.length === 0" class="text-center text-xs py-4" style="color: var(--lj-muted);">Belum ada data.</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
