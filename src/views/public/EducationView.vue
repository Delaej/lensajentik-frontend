<script setup>
import { RouterLink } from 'vue-router'
import { BookOpen, Calculator, HelpCircle, ShieldCheck } from 'lucide-vue-next'

const articles = [
  { id: 1, title: 'Panduan Praktis 3M Plus di Musim Hujan', category: 'Pencegahan', date: '24 Jul 2026' },
  { id: 2, title: 'Mengenali Perbedaan Gejala Demam DBD & Malaria', category: 'Medis', date: '20 Jul 2026' },
  { id: 3, title: 'Cara Menggunakan Larvasida (Abate) yang Benar', category: 'Edukasi', date: '18 Jul 2026' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen class="w-7 h-7 text-blue-600" /> Hub Edukasi & Mitigasi DBD / Malaria
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">Artikel kesehatan, panduan 3M Plus, dan Kalkulator Risiko Personal Interaktif</p>
      </div>

      <RouterLink
        to="/edukasi/kuis"
        class="py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 shrink-0 hover:scale-105 transition-transform"
      >
        <Calculator class="w-5 h-5 text-amber-300" />
        <span>Kalkulator Risiko Personal</span>
      </RouterLink>
    </div>

    <!-- Articles List -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="art in articles" :key="art.id" class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <span class="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full border border-blue-200">
          {{ art.category }}
        </span>
        <h3 class="font-extrabold text-slate-900 text-base leading-snug">{{ art.title }}</h3>
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>{{ art.date }}</span>
          <RouterLink :to="`/edukasi/artikel/${art.id}`" class="text-blue-600 font-bold hover:underline">Baca →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
