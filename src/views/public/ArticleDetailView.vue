<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { BookOpen, ArrowLeft, Calendar, User } from 'lucide-vue-next'
import { educationService } from '@/services/educationService'

const route = useRoute()
const article = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const data = await educationService.fetchArticleDetail(route.params.id)
    article.value = data
  } catch (error) {
    console.error('Fetch article detail failed:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
    <RouterLink to="/edukasi" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
      <ArrowLeft class="w-4 h-4" /> Kembali ke Hub Edukasi
    </RouterLink>

    <div v-if="isLoading" class="text-center py-12 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 shadow-xs">
      Memuat detail artikel...
    </div>

    <div v-else-if="article" class="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
      <span class="px-3 py-1 bg-blue-100 text-blue-800 font-extrabold text-[10px] rounded-full uppercase border border-blue-200">
        {{ article.tipe }}
      </span>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
        {{ article.judul }}
      </h1>

      <div class="flex items-center gap-4 text-xs text-slate-400 border-y border-slate-100 py-3">
        <span class="flex items-center gap-1"><User class="w-4 h-4 text-slate-500" /> Sumber: {{ article.sumber || 'Tim Medis LensaJentik' }}</span>
        <span>•</span>
        <span class="flex items-center gap-1"><Calendar class="w-4 h-4 text-slate-500" /> {{ new Date(article.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</span>
      </div>

      <!-- Render HTML content of the article -->
      <div class="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4" v-html="article.isi">
      </div>
    </div>

    <div v-else class="text-center py-12 bg-white rounded-3xl border border-slate-200 text-xs text-rose-500 shadow-xs">
      Artikel tidak ditemukan atau gagal dimuat.
    </div>
  </div>
</template>
