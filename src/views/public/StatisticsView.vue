<script setup>
import { BarChart3, TrendingUp, CheckCircle2, FileSpreadsheet, Building2 } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
        <BarChart3 class="w-7 h-7 text-blue-600" /> Dashboard Statistik ABJ & Tren Kasus Publik
      </h1>
      <p class="text-xs sm:text-sm text-slate-500">Transparansi data capaian Angka Bebas Jentik (ABJ), perbandingan antarwilayah, dan partisipasi laporan warga</p>
    </div>

    <!-- Metrics Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Rata-rata ABJ Kota</div>
        <div class="text-3xl font-black text-slate-900 mt-2">92.5%</div>
        <div class="text-xs text-emerald-600 font-bold mt-1">↑ +1.2% bulan ini</div>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Total Rumah Diperiksa</div>
        <div class="text-3xl font-black text-slate-900 mt-2">14,820</div>
        <div class="text-xs text-slate-500 mt-1">Seluruh Kecamatan</div>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Laporan Genangan Warga</div>
        <div class="text-3xl font-black text-blue-600 mt-2">342</div>
        <div class="text-xs text-blue-600 font-bold mt-1">98% Ditindaklanjuti</div>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div class="text-xs font-bold text-slate-500 uppercase">Wilayah Zona Hijau</div>
        <div class="text-3xl font-black text-emerald-600 mt-2">18 Kel.</div>
        <div class="text-xs text-emerald-600 font-bold mt-1">Status Aman</div>
      </div>
    </div>
  </div>
</template>
