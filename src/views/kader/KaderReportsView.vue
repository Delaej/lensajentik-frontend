<script setup>
import { ref } from 'vue'
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

const startDate = ref('2026-07-01')
const endDate = ref('2026-07-31')
const isApplied = ref(false)

const handleApplyFilter = () => {
  isApplied.value = true
  setTimeout(() => (isApplied.value = false), 2000)
}

const handleExportPdf = () => {
  alert('Menyiapkan file PDF Rekapitulasi ABJ Kader... Dokumen siap diunduh!')
}

const handleExportExcel = () => {
  alert('Mengunduh spreadsheet Excel Data_ABJ_Sukajadi_Juli_2026.xlsx...')
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
          class="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <FileSpreadsheet class="w-4 h-4" /> Ekspor Excel
        </button>
        <button
          @click="handleExportPdf"
          class="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <FileDown class="w-4 h-4" /> Ekspor PDF
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
          <div class="text-3xl font-black text-slate-900">1,248</div>
          <p class="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp class="w-3.5 h-3.5" /> +12.4% dibanding bulan lalu
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
          <div class="text-3xl font-black text-slate-900">92.5%</div>
          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Status Ketahanan: Aman
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
          <div class="text-3xl font-black text-rose-600">93</div>
          <p class="text-xs text-rose-700 font-semibold mt-1">Perlu Intervensi Tindak Lanjut Abatisasi</p>
        </div>
      </div>
    </div>

    <!-- Official Report Preview Box -->
    <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
      <div class="border-b border-slate-200 pb-4 text-center space-y-1">
        <h3 class="text-lg font-bold text-slate-900 uppercase tracking-wide">REKAPITULASI DATA ANGKA BEBAS JENTIK (ABJ)</h3>
        <p class="text-xs text-slate-500 font-medium">WILAYAH BINAAN KECAMATAN SUKAJADI — PERIODE JULI 2026</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Kecamatan:</div>
          <div class="font-bold text-slate-800">Sukajadi</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Kelurahan:</div>
          <div class="font-bold text-slate-800">Pasteur</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Penanggung Jawab:</div>
          <div class="font-bold text-slate-800">Nayla Salsabila</div>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl">
          <div class="text-slate-400 font-medium">Tanggal Cetak:</div>
          <div class="font-bold text-slate-800">27 Juli 2026</div>
        </div>
      </div>

      <div class="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs space-y-1">
          <div class="font-bold text-emerald-400">Siap Dikirimkan ke Puskesmas Terkait</div>
          <p class="text-slate-300">Format laporan memenuhi standar pelaporan Dinas Kesehatan Kota Bandung 2026.</p>
        </div>
        <button
          @click="handleExportPdf"
          class="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shrink-0"
        >
          Unduh Laporan Format Resmi PDF
        </button>
      </div>
    </div>
  </div>
</template>
