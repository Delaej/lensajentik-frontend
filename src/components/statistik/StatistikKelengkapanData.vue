<script setup>
import { ref, onMounted, watch } from 'vue'
import { Database, CloudSun, Users } from 'lucide-vue-next'
import { useStatistikStore } from '@/stores/useStatistikStore'
import { statistikService } from '@/services/statistikService'

const store = useStatistikStore()

/* ── Data ─────────────────────────────────────────────────────── */
const data = ref(null)
const isLoading = ref(true)

const fetchKelengkapanData = async () => {
  isLoading.value = true
  try {
    data.value = await statistikService.getKelengkapanData()
  } catch (e) {
    console.error('Gagal memuat kelengkapan data:', e)
  } finally {
    isLoading.value = false
  }
}

/* Refetch ketika filter global berubah */
watch(() => store.reloadToken, fetchKelengkapanData)

onMounted(fetchKelengkapanData)

/* ── Helpers ──────────────────────────────────────────────────── */
const abj = () => data.value?.abj || null
const kader = () => data.value?.kader_aktif || null
const cuaca = () => data.value?.cuaca_terakhir || null

const formatTanggal = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const persenTeks = (p) => {
  const n = Number(p)
  if (Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/* Indikator "kesegaran" data cuaca: 100% jika terakhir diperbarui baru saja,
   menurun ke 0% setelah data berusia lebih dari 30 hari. */
const cuacaPersen = () => {
  const t = cuaca()
  if (!t) return 0
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return 0
  const usia = Date.now() - d.getTime()
  const rentang = 30 * 24 * 60 * 60 * 1000 // 30 hari dalam ms
  return Math.max(0, Math.min(100, Math.round(100 - (usia / rentang) * 100)))
}
</script>

<template>
  <!-- Indikator kelengkapan data — warna netral (biru/abu), bukan warna risiko -->
  <div id="stats-kelengkapan-data" class="grid grid-cols-1 sm:grid-cols-3 gap-4">

    <!-- ── Skeleton saat muat pertama kali ── -->
    <template v-if="isLoading && !data">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-5 border shadow-sm flex items-start gap-3 animate-pulse">
        <div class="shrink-0 w-10 h-10 rounded-xl bg-gray-200"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 w-24 rounded bg-gray-200"></div>
          <div class="h-4 w-full rounded bg-gray-100"></div>
          <div class="h-2 w-full rounded-full bg-gray-100"></div>
        </div>
      </div>
    </template>

    <!-- ── 3 kartu data ── -->
    <template v-else>
      <!-- Card 1: Cakupan Data ABJ -->
      <div class="bg-white rounded-2xl p-5 border shadow-sm flex items-start gap-3">
        <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style="background: #EEF2FF; color: #4E63DA;">
          <Database class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Cakupan Data ABJ</div>
          <div class="text-sm font-bold leading-snug" style="color: var(--lj-navy);">
            <template v-if="abj()">
              {{ abj().kecamatan_dengan_abj }} dari {{ abj().total_kecamatan }} kecamatan ({{ persenTeks(abj().persen) }}%) punya input ABJ dalam 30 hari terakhir
            </template>
            <template v-else>—</template>
          </div>
          <div class="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full bg-[#4E63DA] transition-all duration-500" :style="{ width: (abj() ? abj().persen : 0) + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Card 2: Data Cuaca Terakhir -->
      <div class="bg-white rounded-2xl p-5 border shadow-sm flex items-start gap-3">
        <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style="background: #F3F4F6; color: #6B7280;">
          <CloudSun class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Data Cuaca Terakhir</div>
          <div class="text-sm font-bold leading-snug" style="color: var(--lj-navy);">
            Diperbarui: {{ formatTanggal(cuaca()) }}
          </div>
          <div class="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full bg-gray-400 transition-all duration-500" :style="{ width: cuacaPersen() + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Card 3: Kader Aktif -->
      <div class="bg-white rounded-2xl p-5 border shadow-sm flex items-start gap-3">
        <div class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style="background: #EEF2FF; color: #7B93F0;">
          <Users class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold mb-1" style="color: var(--lj-muted);">Kader Aktif</div>
          <div class="text-sm font-bold leading-snug" style="color: var(--lj-navy);">
            <template v-if="kader()">
              {{ kader().aktif }} dari {{ kader().total }} kader terdaftar aktif melapor
            </template>
            <template v-else>—</template>
          </div>
          <div class="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full bg-[#7B93F0] transition-all duration-500" :style="{ width: (kader() ? kader().persen : 0) + '%' }"></div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>
