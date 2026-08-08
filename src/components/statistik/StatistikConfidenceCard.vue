<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Info } from 'lucide-vue-next'

const props = defineProps({
  confidenceSummary: {
    type: Object,
    default: () => ({}),
  },
})

const kuat = computed(() => props.confidenceSummary?.kuat || { jumlah: 0, persen: 0 })
const lemah = computed(() => props.confidenceSummary?.lemah || { jumlah: 0, persen: 0 })

const kuatJumlah = computed(() => Number(kuat.value.jumlah) || 0)
const lemahJumlah = computed(() => Number(lemah.value.jumlah) || 0)
const kuatPersen = computed(() => Number(kuat.value.persen) || 0)

const total = computed(() => kuatJumlah.value + lemahJumlah.value)

const chartData = computed(() => ({
  labels: ['Data Lapangan', 'Estimasi Cuaca'],
  datasets: [
    {
      data: [kuatJumlah.value, lemahJumlah.value],
      backgroundColor: ['#22C55E', '#D1D5DB'],
      borderWidth: 0,
      hoverOffset: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx) => {
          const pct = total.value > 0 ? Math.round((ctx.parsed / total.value) * 100) : 0
          return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`
        },
      },
    },
  },
}
</script>

<template>
  <div class="bg-white rounded-2xl p-5 border shadow-sm text-center">
    <!-- Title + info tooltip -->
    <div class="flex items-center justify-center gap-1 mb-2">
      <span class="text-xs font-bold" style="color: var(--lj-muted);">Kepercayaan Data</span>
      <span class="relative inline-flex items-center group">
        <Info class="w-3.5 h-3.5 cursor-help" style="color: #9CA3AF;" />
        <span
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl p-3 text-[10px] font-medium leading-relaxed text-left opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-xl"
          style="background: #1E2B5B; color: #F9FAFB;"
        >
          <strong style="color: #22C55E;">Kuat:</strong> skor dihitung dari data ABJ kader setempat.<br />
          <strong style="color: #F59E0B;">Lemah:</strong> estimasi berdasarkan data cuaca saja.
        </span>
      </span>
    </div>

    <!-- Mini donut -->
    <template v-if="total > 0">
      <div class="relative w-28 h-28 mx-auto">
        <Doughnut :data="chartData" :options="chartOptions" />
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-2xl font-black leading-none" style="color: #065F46;">{{ kuatPersen }}%</span>
          <span class="text-[9px] font-bold mt-1" style="color: #6B7280;">Data Lapangan</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-center gap-4 mt-3">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" style="background: #22C55E;"></span>
          <span class="text-[10px] font-bold" style="color: #065F46;">Data Lapangan</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" style="background: #D1D5DB;"></span>
          <span class="text-[10px] font-bold" style="color: #6B7280;">Estimasi Cuaca</span>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else class="py-8">
      <p class="text-[11px] font-bold" style="color: var(--lj-muted);">Belum ada data kepercayaan.</p>
    </div>
  </div>
</template>
