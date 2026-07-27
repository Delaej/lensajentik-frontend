<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { BookOpen, ArrowLeft, Calendar, User } from 'lucide-vue-next'

const route = useRoute()
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
    <RouterLink to="/edukasi" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
      <ArrowLeft class="w-4 h-4" /> Kembali ke Hub Edukasi
    </RouterLink>

    <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <span class="px-3 py-1 bg-blue-100 text-blue-800 font-extrabold text-xs rounded-full">Panduan Kesehatan</span>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
        Panduan Praktis 3M Plus di Musim Hujan 2026
      </h1>

      <div class="flex items-center gap-4 text-xs text-slate-400 border-y border-slate-100 py-3">
        <span class="flex items-center gap-1"><User class="w-4 h-4 text-slate-500" /> Tim Medis LensaJentik</span>
        <span>•</span>
        <span class="flex items-center gap-1"><Calendar class="w-4 h-4 text-slate-500" /> 24 Juli 2026</span>
      </div>

      <div class="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
        <p>
          Musim hujan sering memicu genangan air bersih di lingkungan pemukiman. Air jernih ini menjadi sarang ideal bagi nyamuk <em>Aedes aegypti</em> untuk berkembang biak.
        </p>
        <h3 class="font-extrabold text-slate-900 text-base">Langkah Kunci 3M Plus:</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Menguras:</strong> Tempat penampungan air seperti bak mandi, drum, dan wadah dispenser minimal seminggu sekali.</li>
          <li><strong>Menutup:</strong> Rapat-rapat semua tempat penampungan air.</li>
          <li><strong>Mendaur Ulang:</strong> Barang bekas yang berpotensi menampung air hujan.</li>
        </ul>
      </div>
    </div>
  </div>
</template>
