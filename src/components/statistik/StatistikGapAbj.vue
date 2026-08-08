<script setup>
import { useStatistikStore } from '@/stores/useStatistikStore'
import { statistikService } from '@/services/statistikService'
import apiClient from '@/services/apiClient'
import { watch, ref, onMounted } from 'vue'
import { AlertTriangle, Download } from 'lucide-vue-next'

const store = useStatistikStore()

/* ── Data ─────────────────────────────────────────────────────── */
const data = ref([])              // hasil gap-abj (kecamatan < 95%)
const kabupatenList = ref([])     // daftar kabupaten utk filter dropdown
const selectedKabupaten = ref('') // parent_kode terpilih ('' = semua)
const isLoading = ref(true)

const fetchGapAbj = async () => {
  isLoading.value = true
  try {
    const params = { ...store.dateParams }
    if (selectedKabupaten.value) params.parent_kode = selectedKabupaten.value
    const res = await statistikService.getGapAbj(params)
    data.value = res.data || []
  } catch (e) {
    console.error('Gagal memuat gap ABJ:', e)
    data.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchKabupaten = async () => {
  try {
    const res = await apiClient.get('/wilayah', { params: { tingkat: 'kabupaten' } })
    kabupatenList.value = res.data?.data || []
  } catch (e) {
    console.error('Gagal memuat daftar kabupaten:', e)
  }
}

/* Refetch ketika filter global berubah */
watch(() => store.reloadToken, fetchGapAbj)
/* Refetch ketika filter kabupaten berubah */
watch(selectedKabupaten, fetchGapAbj)

onMounted(() => {
  fetchKabupaten()
  fetchGapAbj()
})

/* ── Actions ──────────────────────────────────────────────────── */
const openDetail = (item) => {
  store.setSelectedWilayah({
    kode: item.kode,
    nama: item.nama,
    tingkat: 'kecamatan',
  })
}

const handleDownload = () => {
  const params = { ...store.dateParams }
  if (selectedKabupaten.value) params.parent_kode = selectedKabupaten.value
  window.open(statistikService.getGapAbjExportUrl(params), '_blank')
}

/* ── Helpers ──────────────────────────────────────────────────── */
const fmt = (v) => {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(1)
}

/* Semakin besar gap → latar baris semakin merah. */
const rowBackground = (gap) => {
  const g = Number(gap) || 0
  if (g >= 10) return 'rgba(239, 68, 68, 0.16)'   // ABJ ≤ 85 → paling merah
  if (g >= 5) return 'rgba(239, 68, 68, 0.09)'    // ABJ 85–90
  return 'rgba(239, 68, 68, 0.04)'                // ABJ 90–95 → merah muda
}

/* Nomor urut — warna semakin pekat untuk posisi terburuk. */
const rankColor = (i) => {
  const colors = ['#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5']
  return colors[Math.min(i, colors.length - 1)]
}
</script>

<template>
  <div id="stats-gap-abj" class="bg-white rounded-3xl p-6 border shadow-sm">
    <!-- Header: judul + filter + tombol unduh -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 shrink-0" style="color: #EF4444;" />
          <h2 class="text-base font-bold leading-snug" style="color: var(--lj-navy);">
            Wilayah di Bawah Target ABJ Nasional (95%)
          </h2>
        </div>
        <p class="text-xs mt-1.5" style="color: var(--lj-muted);">
          Kecamatan dengan rata-rata ABJ di bawah 95% — diurutkan dari yang paling rendah.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Filter kabupaten -->
        <select
          v-model="selectedKabupaten"
          class="text-xs font-bold bg-white border rounded-xl px-3 py-2 outline-none max-w-[180px] truncate"
          style="border-color: var(--lj-border); color: var(--lj-navy);"
        >
          <option value="">Semua Kabupaten</option>
          <option v-for="kab in kabupatenList" :key="kab.kode" :value="kab.kode">
            {{ kab.nama }}
          </option>
        </select>

        <!-- Unduh Excel -->
        <button
          @click="handleDownload"
          :disabled="data.length === 0"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: #059669;"
        >
          <Download class="w-3.5 h-3.5" /> Unduh Daftar (Excel)
        </button>
      </div>
    </div>

    <!-- Ringkasan jumlah -->
    <div
      v-if="!isLoading && data.length > 0"
      class="text-[11px] font-bold mb-3"
      style="color: #991B1B;"
    >
      {{ data.length }} kecamatan belum mencapai target ABJ 95%
    </div>

    <!-- ── Skeleton saat memuat pertama kali ── -->
    <template v-if="isLoading && data.length === 0">
      <div v-for="i in 4" :key="i" class="flex items-center gap-3 p-2.5 rounded-xl animate-pulse">
        <div class="w-6 h-6 rounded-full bg-gray-200"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 w-40 rounded bg-gray-200"></div>
          <div class="h-2 w-24 rounded bg-gray-100"></div>
        </div>
        <div class="h-4 w-12 rounded bg-gray-200"></div>
        <div class="h-5 w-24 rounded-full bg-gray-100"></div>
      </div>
    </template>

    <!-- ── Daftar kecamatan di bawah target ── -->
    <template v-else-if="data.length > 0">
      <div class="space-y-2">
        <div
          v-for="(item, i) in data"
          :key="item.kode"
          @click="openDetail(item)"
          class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-red-50"
          :style="{ background: rowBackground(item.gap) }"
        >
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
            :style="{ background: rankColor(i) }"
          >{{ i + 1 }}</span>

          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold truncate" style="color: var(--lj-navy);">{{ item.nama }}</div>
            <div class="text-[10px] font-semibold truncate" style="color: var(--lj-muted);">{{ item.kode }}</div>
          </div>

          <span class="text-xs font-black whitespace-nowrap" style="color: #EF4444;">{{ fmt(item.rata_abj) }}%</span>

          <!-- Gap badge: teks lengkap di layar besar, versi pendek di mobile -->
          <span
            class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0"
            style="background: #FEE2E2; color: #991B1B;"
          >−{{ fmt(item.gap) }}% dari target</span>
          <span
            class="sm:hidden px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0"
            style="background: #FEE2E2; color: #991B1B;"
          >−{{ fmt(item.gap) }}%</span>
        </div>
      </div>
    </template>

    <!-- ── Kosong: semua sudah mencapai target ── -->
    <div v-else class="text-center py-8">
      <AlertTriangle class="w-8 h-8 mx-auto mb-2" style="color: #22C55E;" />
      <p class="text-sm font-bold" style="color: var(--lj-navy);">Semua wilayah sudah di atas target! 🎉</p>
      <p class="text-xs mt-1" style="color: var(--lj-muted);">Tidak ada kecamatan dengan rata-rata ABJ di bawah 95%.</p>
    </div>
  </div>
</template>
