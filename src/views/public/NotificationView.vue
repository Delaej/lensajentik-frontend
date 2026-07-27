<script setup>
import { Bell, CloudRain, AlertTriangle, ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
      <h1 class="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
        <Bell class="w-6 h-6 text-blue-600" /> Pusat Notifikasi Dini Publik
      </h1>
      <p class="text-xs text-slate-500">Peringatan potensi genangan air hujan, kenaikan tren kasus DBD, dan batas waktu klaim reward subscribe</p>
    </div>

    <div class="space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
        <div class="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
          <CloudRain class="w-5 h-5" />
        </div>
        <div class="space-y-1">
          <div class="font-bold text-sm text-slate-900">Peringatan Cuaca Ekstrem (BMKG)</div>
          <p class="text-xs text-slate-600 leading-relaxed">Potensi hujan lebat berdurasi lama di wilayah Kecamatan Sukajadi 3 hari mendatang. Periksa talang air dan pot rumah Anda.</p>
          <div class="text-[10px] text-slate-400">Hari ini, 09:00 WIB</div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
        <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div class="space-y-1">
          <div class="font-bold text-sm text-slate-900">Status Waspada Kelurahan Gegerkalong</div>
          <p class="text-xs text-slate-600 leading-relaxed">Angka Bebas Jentik berada di level 82.0%. Disarankan gerakan PSN Mandiri serentak.</p>
          <div class="text-[10px] text-slate-400">25 Juli 2026</div>
        </div>
      </div>
    </div>
  </div>
</template>
