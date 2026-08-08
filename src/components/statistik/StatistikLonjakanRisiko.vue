<script setup>
import { useStatistikStore } from '@/stores/useStatistikStore'
import { statistikService } from '@/services/statistikService'
import { watch, ref, computed, onMounted } from 'vue'
import { TrendingUp, X } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { CHART_COLORS, makeBaseOptions } from '@/utils/chartConfig'

const store = useStatistikStore()

/* ── Data ─────────────────────────────────────────────────────── */
const data = ref([])          // hasil lonjakan-risiko (delta > 0, urut desc)
const isLoading = ref(true)
const selected = ref(null)    // item yang popover sparkline-nya terbuka

const fetchLonjakanRisiko = async () => {
  isLoading.value = true
  selected.value = null // tutup popover saat data dimuat ulang
  try {
    const res = await statistikService.getLonjakanRisiko({
      jenis: store.jenisPenyakit,
    })
    data.value = res.data || []
  } catch (e) {
    console.error('Gagal memuat lonjakan risiko:', e)
    data.value = []
  } finally {
    isLoading.value = false
  }
}

/* Refetch ketika filter global (jenis penyakit / rentang) berubah */
watch(() => store.reloadToken, fetchLonjakanRisiko)

onMounted(fetchLonjakanRisiko)

/* ── Popover sparkline ────────────────────────────────────────── */
const sparklineData = computed(() => {
  if (!selected.value) return null
  const riwayat = selected.value.riwayat_7_hari || []
  return {
    labels: riwayat.map((r) => formatShortDate(r.tanggal)),
    datasets: [
      {
        label: 'Skor Risiko',
        data: riwayat.map((r) => Number(r.skor)),
        borderColor: CHART_COLORS.red,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: CHART_COLORS.red,
        pointBorderColor: CHART_COLORS.red,
      },
    ],
  }
})

/* Sparkline minimal: tanpa label sumbu, tanpa zoom/legend */
const sparklineOptions = makeBaseOptions({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E2B5B',
      cornerRadius: 12,
      padding: 12,
      callbacks: {
        label: (ctx) => `Skor: ${ctx.parsed.y}`,
      },
    },
    zoom: {
      zoom: { enabled: false },
      pan: { enabled: false },
    },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
})

/* ── Helpers ──────────────────────────────────────────────────── */
const fmtNum = (v) => {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/* Semakin besar delta → latar baris semakin merah. */
const rowBackground = (delta) => {
  const d = Number(delta) || 0
  if (d >= 15) return 'rgba(239, 68, 68, 0.16)'   // lonjakan ekstrem
  if (d >= 10) return 'rgba(239, 68, 68, 0.11)'
  if (d >= 5) return 'rgba(239, 68, 68, 0.07)'
  return 'rgba(239, 68, 68, 0.03)'
}

/* Nomor urut — warna semakin pekat untuk kenaikan terbesar. */
const rankColor = (i) => {
  const colors = ['#B91C1C', '#DC2626', '#EF4444', '#F87171', '#FCA5A5']
  return colors[Math.min(i, colors.length - 1)]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const formatShortDate = (d) => {
  const s = String(d || '').slice(0, 10)
  const parts = s.split('-')
  if (parts.length !== 3) return s
  const m = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  if (Number.isNaN(m) || Number.isNaN(day)) return s
  return `${day} ${MONTHS[m]}`
}
</script>

<template>
  <div id="stats-lonjakan-risiko" class="bg-white rounded-3xl p-6 border shadow-sm">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-5">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <TrendingUp class="w-5 h-5 shrink-0" style="color: #EF4444;" />
          <h2 class="text-base font-bold leading-snug" style="color: var(--lj-navy);">
            Wilayah dengan Kenaikan Risiko Tercepat (7 Hari Terakhir)
          </h2>
        </div>
        <p class="text-xs mt-1.5" style="color: var(--lj-muted);">
          Kecamatan dengan kenaikan skor risiko tercepat dalam 7 hari — diurutkan dari yang paling besar.
        </p>
      </div>
    </div>

    <!-- Ringkasan jumlah -->
    <div
      v-if="!isLoading && data.length > 0"
      class="text-[11px] font-bold mb-3"
      style="color: #991B1B;"
    >
      🔺 {{ data.length }} kecamatan mengalami kenaikan risiko
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

    <!-- ── Daftar kecamatan dengan kenaikan risiko ── -->
    <template v-else-if="data.length > 0">
      <div class="space-y-2">
        <div
          v-for="(item, i) in data"
          :key="item.kode"
          @click="selected = item"
          class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-red-50"
          :style="{ background: rowBackground(item.delta) }"
        >
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
            :style="{ background: rankColor(i) }"
          >{{ i + 1 }}</span>

          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold truncate" style="color: var(--lj-navy);">{{ item.nama }}</div>
            <div class="text-[10px] font-semibold truncate" style="color: var(--lj-muted);">
              {{ fmtNum(item.skor_7_hari_lalu) }} → {{ fmtNum(item.skor_sekarang) }}
            </div>
          </div>

          <!-- Delta indicator -->
          <span
            class="hidden sm:inline-flex items-center gap-1 text-xs font-black whitespace-nowrap"
            style="color: #EF4444;"
          >
            <TrendingUp class="w-3.5 h-3.5" />
            +{{ fmtNum(item.delta) }} poin dalam 7 hari
          </span>
          <span
            class="sm:hidden inline-flex items-center gap-1 text-xs font-black whitespace-nowrap"
            style="color: #EF4444;"
          >
            <TrendingUp class="w-3.5 h-3.5" />
            +{{ fmtNum(item.delta) }} poin
          </span>
        </div>
      </div>
    </template>

    <!-- ── Kosong: tidak ada lonjakan ── -->
    <div v-else class="text-center py-8">
      <TrendingUp class="w-8 h-8 mx-auto mb-2" style="color: #22C55E;" />
      <p class="text-sm font-bold" style="color: var(--lj-navy);">Tidak ada lonjakan risiko</p>
      <p class="text-xs mt-1" style="color: var(--lj-muted);">
        Tidak ada kecamatan dengan kenaikan skor risiko dalam 7 hari terakhir.
      </p>
    </div>

    <!-- ── Popover / modal sparkline ── -->
    <div
      v-if="selected"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      @click.self="selected = null"
    >
      <div class="bg-white rounded-3xl p-5 w-full max-w-md border shadow-xl">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="min-w-0">
            <div class="text-sm font-bold truncate" style="color: var(--lj-navy);">{{ selected.nama }}</div>
            <div class="text-[10px] font-semibold" style="color: var(--lj-muted);">{{ selected.kode }}</div>
          </div>
          <button
            @click="selected = null"
            class="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X class="w-4 h-4" style="color: var(--lj-muted);" />
          </button>
        </div>

        <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-3"
          style="background: #FEE2E2; color: #991B1B;">
          <TrendingUp class="w-3 h-3" />
          +{{ fmtNum(selected.delta) }} poin dalam 7 hari
        </div>

        <!-- Sparkline 7 hari -->
        <div class="bg-gray-50 rounded-xl p-4">
          <div style="height: 150px;">
            <Line
              v-if="sparklineData"
              :data="sparklineData"
              :options="sparklineOptions"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mt-3 text-[11px] font-bold" style="color: var(--lj-muted);">
          <span>{{ fmtNum(selected.skor_7_hari_lalu) }} → {{ fmtNum(selected.skor_sekarang) }}</span>
          <span style="color: #EF4444;">+{{ fmtNum(selected.delta) }} poin</span>
        </div>
      </div>
    </div>
  </div>
</template>
