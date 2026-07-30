<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { educationService } from '@/services/educationService'

const route = useRoute()
const article = ref(null)
const isLoading = ref(true)
const isError = ref(false)

onMounted(async () => {
  try {
    const data = await educationService.fetchArticleDetail(route.params.id)
    article.value = data
  } catch (e) {
    console.error('Fetch article detail failed:', e)
    isError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen relative" style="background-color: #f7fbf8;">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-40">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <RouterLink to="/edukasi" class="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft class="w-5 h-5" style="color: var(--lj-navy);" />
        </RouterLink>
        <div class="px-4 py-1.5 rounded-full border-2 text-xs font-bold" style="border-color: #95FE6D; background: white; color: var(--lj-navy);">
          ARTIKEL TERKAIT DBD
        </div>
        <div class="w-8 h-8"></div> <!-- spacer -->
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center font-bold" style="color: var(--lj-blue);">Memuat artikel...</div>

      <!-- Article content -->
      <template v-else>
        <!-- Thumbnail -->
        <div class="w-full h-[280px] sm:h-[400px] bg-gray-200 rounded-[24px] mb-8 overflow-hidden shadow-sm">
          <img v-if="article.thumbnail" :src="article.thumbnail" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-[#4E63DA]/10 text-4xl">📰</div>
        </div>

        <!-- Title -->
        <h1 class="text-2xl sm:text-4xl font-black leading-tight text-center mb-10 px-4" style="color: var(--lj-navy);">
          <span style="color: #95FE6D;">{{ article.judul.split(',')[0] }},</span>
          {{ article.judul.split(',').slice(1).join(',') }}
        </h1>

        <!-- Article body (mockup style, very clean plain text) -->
        <div
          class="prose max-w-none text-sm sm:text-base px-2 sm:px-8"
          style="line-height: 1.8; color: #4B5563; font-family: 'Satoshi', sans-serif; white-space: pre-wrap;"
        >{{ article.isi }}</div>
      </template>
    </div>
  </div>
</template>
