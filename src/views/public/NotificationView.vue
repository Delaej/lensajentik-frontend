<script setup>
import { ref, onMounted } from 'vue'
import { Bell, CloudRain, AlertTriangle, ShieldCheck, CheckCheck } from 'lucide-vue-next'
import apiClient from '@/services/apiClient'

const notifications = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await apiClient.get('/notifikasi')
    notifications.value = response.data.data || response.data || []
  } catch (error) {
    // Endpoint membutuhkan autentikasi atau belum ada data
    console.warn('Notifikasi publik tidak tersedia:', error.response?.status)
    notifications.value = []
  } finally {
    isLoading.value = false
  }
})

const getIcon = (tipe) => {
  switch (tipe) {
    case 'cuaca':
      return CloudRain
    case 'waspada':
      return AlertTriangle
    default:
      return ShieldCheck
  }
}

const getIconBg = (tipe) => {
  switch (tipe) {
    case 'cuaca': return 'bg-sky-100 text-sky-600'
    case 'waspada': return 'bg-amber-100 text-amber-600'
    default: return 'bg-indigo-100 text-indigo-600'
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
      <h1 class="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
        <Bell class="w-6 h-6 text-blue-600" /> Pusat Notifikasi Dini Publik
      </h1>
      <p class="text-xs text-slate-500">Peringatan potensi genangan air hujan, kenaikan tren kasus DBD, dan status wilayah berisiko</p>
    </div>

    <div v-if="isLoading" class="text-center py-12 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 shadow-xs">
      Memuat notifikasi publik...
    </div>

    <div v-else-if="notifications.length > 0" class="space-y-4">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4"
      >
        <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', getIconBg(notif.tipe)]">
          <component :is="getIcon(notif.tipe)" class="w-5 h-5" />
        </div>
        <div class="space-y-1">
          <div class="font-bold text-sm text-slate-900">{{ notif.judul }}</div>
          <p class="text-xs text-slate-600 leading-relaxed">{{ notif.isi }}</p>
          <div class="text-[10px] text-slate-400">{{ new Date(notif.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 shadow-xs">
      Tidak ada notifikasi publik saat ini.
    </div>
  </div>
</template>
