<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  FileText,
  Calendar,
  Filter,
  Printer,
  FileSpreadsheet,
  FileDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Building,
  Check,
} from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'
import { useReportStore } from '@/stores/useReportStore'
import { abjService } from '@/services/abjService'

const kaderStore = useKaderStore()
const reportStore = useReportStore()

const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const isApplied = ref(false)

onMounted(async () => {
  await kaderStore.fetchProfile()
  await kaderStore.fetchMyAbjRecords()
  await reportStore.fetchReports()
})

// Computed summary from real ABJ records
const totalDiperiksa = computed(() =>
  kaderStore.abjRecords.reduce((sum, r) => sum + (r.diperiksa || 0), 0)
)
const totalPositif = computed(() =>
  kaderStore.abjRecords.reduce((sum, r) => sum + (r.positifJentik || 0), 0)
)
const averageAbj = computed(() => kaderStore.averageAbjScore)

const handleApplyFilter = () => {
  isApplied.value = true
  setTimeout(() => (isApplied.value = false), 2000)
}

const isExportingPdf = ref(false)
const handleExportPdf = async () => {
  const kode = kaderStore.userProfile.wilayah_kode
  if (!kode) { alert('Wilayah binaan belum ditentukan.'); return }
  
  isExportingPdf.value = true
  try {
    const blob = await abjService.exportPdf(kode)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_ABJ_${kode}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Export PDF failed:', error)
    alert('Gagal mengunduh laporan PDF. Pastikan data tersedia.')
  } finally {
    isExportingPdf.value = false
  }
}

const isExportingExcel = ref(false)
const handleExportExcel = async () => {
  const kode = kaderStore.userProfile.wilayah_kode
  if (!kode) { alert('Wilayah binaan belum ditentukan.'); return }
  
  isExportingExcel.value = true
  try {
    const blob = await abjService.exportExcel(kode)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_ABJ_${kode}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Export Excel failed:', error)
    alert('Gagal mengunduh laporan Excel. Pastikan data tersedia.')
  } finally {
    isExportingExcel.value = false
  }
}

const handlePrint = () => {
  window.print()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
      <div>
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText class="w-6 h-6 text-blue-600" />
          Form Rekap Data & Export Laporan ABJ
        </h2>
        <p class="text-xs text-slate-500 mt-1">Unduh atau cetak rekapitulasi data pemeriksaan jentik resmi untuk laporan Puskesmas/Dinkes</p>
      </div>

      <!-- Action Buttons: Print & Export PDF/Excel -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          @click="handlePrint"
          class="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
        >
          <Printer class="w-4 h-4" /> Cetak
        </button>
        <button
          @click="handleExportExcel"
          :disabled="isExportingExcel"
          class="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet class="w-4 h-4" /> {{ isExportingExcel ? 'Mengunduh...' : 'Ekspor Excel' }}
        </button>
        <button
          @click="handleExportPdf"
          :disabled="isExportingPdf"
          class="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
        >
          <FileDown class="w-4 h-4" /> {{ isExportingPdf ? 'Mengunduh...' : 'Ekspor PDF' }}
        </button>
      </div>
    </div>

    <!-- Date Range Filter Bar -->
    <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <Filter class="w-4 h-4 text-blue-600" /> Filter Rentang Tanggal Laporan
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="w-full sm:w-auto flex-1">
          <label class="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Mulai</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
          />
        </div>
        <span class="text-slate-400 font-bold hidden sm:inline pt-5">s/d</span>
        <div class="w-full sm:w-auto flex-1">
          <label class="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Akhir</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
          />
        </div>
        <div class="w-full sm:w-auto pt-5">
          <button
            @click="handleApplyFilter"
            class="w-full sm:w-auto py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Check v-if="isApplied" class="w-4 h-4 text-emerald-300" />
            <span>{{ isApplied ? 'Filter Diterapkan!' : 'Terapkan Filter' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Metrics Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Total Rumah Diperiksa -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rumah Diperiksa</span>
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="text-3xl font-black text-slate-900">{{ totalDiperiksa.toLocaleString('id-ID') }}</div>
          <p class="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp class="w-3.5 h-3.5" /> Dari {{ kaderStore.abjRecords.length }} sesi pemeriksaan
          </p>
        </div>
      </div>

      <!-- Card 2: Persentase ABJ -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Persentase Rata-Rata ABJ</span>
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="text-3xl font-black text-slate-900">{{ averageAbj }}%</div>
          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span :class="averageAbj >= 95 ? 'bg-emerald-500' : averageAbj >= 90 ? 'bg-amber-500' : 'bg-rose-500'" class="w-2 h-2 rounded-full"></span>
            Status: {{ averageAbj >= 95 ? 'Aman' : averageAbj >= 90 ? 'Waspada' : 'Bahaya' }}
          </p>
        </div>
      </div>

      <!-- Card 3: Peringatan Rumah Positif Jentik -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-rose-700 uppercase tracking-wider">Rumah Positif Jentik</span>
          <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="text-3xl font-black text-rose-600">{{ totalPositif }}</div>
          <p class="text-xs text-rose-700 font-semibold mt-1">Perlu Intervensi Tindak Lanjut Abatisasi</p>
        </div>
      </div>
    </div>

    <!-- Official Report Preview Box -->
    <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
      <div class="border-b border-slate-200 pb-4 text-center space-y-1">
        <h3 class="text-lg font-bold text-slate-900 uppercase tracking-wide">REKAPITULASI DATA ANGKA BEBAS JENTIK (ABJ)</h3>
        <p class="text-xs text-slate-500 font-medium">WILAYAH BINAAN {{ kaderStore.userProfile.wilayah_binaan || '—' }} — PERIODE {{ new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase() }}</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Wilayah Tugas:</div>
          <div class="font-bold text-slate-800">{{ kaderStore.userProfile.district || 'Wilayah Kader' }}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Periode:</div>
          <div class="font-bold text-slate-800">{{ startDate }} s/d {{ endDate }}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Penanggung Jawab:</div>
          <div class="font-bold text-slate-800">{{ kaderStore.userProfile.nama || 'Kader Kesehatan' }}</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Tanggal Cetak:</div>
          <div class="font-bold text-slate-800">{{ new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</div>
        </div>
      </div>

      <div class="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs space-y-1">
          <div class="font-bold text-emerald-400">Siap Dikirimkan ke Puskesmas Terkait</div>
          <p class="text-slate-300">Format laporan memenuhi standar pelaporan Dinas Kesehatan.</p>
        </div>
        <button
          @click="handleExportPdf"
          :disabled="isExportingPdf"
          class="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shrink-0 disabled:opacity-50"
        >
          {{ isExportingPdf ? 'Sedang Mengunduh...' : 'Unduh Laporan Format Resmi PDF' }}
        </button>
      </div>
    </div>
  </div>
</template>
