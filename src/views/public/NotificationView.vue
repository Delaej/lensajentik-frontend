<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, User } from 'lucide-vue-next'
import apiClient from '@/services/apiClient'

const notifications = ref([])
const isLoading = ref(true)
const isError = ref(false)
const activeFilter = ref('semua')

onMounted(async () => {
  const token = localStorage.getItem('kader_token')
  if (!token) {
    isLoading.value = false
    return // public user — tidak perlu notifikasi, tampilkan empty state
  }
  try {
    const res = await apiClient.get('/notifikasi')
    const paginator = res.data?.data
    if (paginator && Array.isArray(paginator.data)) {
      notifications.value = paginator.data.map(n => ({
        id: n.id,
        judul: n.judul || 'Notifikasi',
        pesan: n.pesan || '',
        created_at: n.created_at,
        is_read: n.is_read || false,
        tipe: n.tipe || 'info',
      }))
    } else if (Array.isArray(paginator)) {
      notifications.value = paginator.map(n => ({
        id: n.id,
        judul: n.judul || 'Notifikasi',
        pesan: n.pesan || '',
        created_at: n.created_at,
        is_read: n.is_read || false,
        tipe: n.tipe || 'info',
      }))
    }
  } catch (e) {
    isError.value = true
  }
  isLoading.value = false
})

const filteredNotifications = () => {
  if (activeFilter.value === 'semua') return notifications.value
  return notifications.value.filter(n => !n.is_read)
}

const unreadCount = () => notifications.value.filter(n => !n.is_read).length
const totalCount = () => notifications.value.length

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return d }
}
</script>

<template>
  <div class="min-h-screen relative" style="background-color: var(--lj-bg);">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-40">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <RouterLink to="/" class="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft class="w-5 h-5" style="color: var(--lj-navy);" />
        </RouterLink>
        <div class="px-4 py-1.5 rounded-full border-2 text-xs font-bold" style="border-color: #95FE6D; background: white; color: var(--lj-navy);">
          NOTIFIKASI ANDA
        </div>
        <div class="w-8 h-8"></div> <!-- spacer -->
      </div>

      <!-- Filter tabs -->
      <div class="inline-flex rounded-full border-[3px] p-1 mb-8" style="border-color: #95FE6D; background: white;">
        <button
          @click="activeFilter = 'semua'"
          class="px-6 py-1.5 rounded-full text-xs font-bold transition-all"
          :style="activeFilter === 'semua' ? 'background: #4E63DA; color: white;' : 'background: transparent; color: #4B5563;'"
        >
          Semua ({{ totalCount() }})
        </button>
        <button
          @click="activeFilter = 'unread'"
          class="px-6 py-1.5 rounded-full text-xs font-bold transition-all"
          :style="activeFilter === 'unread' ? 'background: #4E63DA; color: white;' : 'background: transparent; color: #4B5563;'"
        >
          Belum dibaca ({{ unreadCount() }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center font-bold" style="color: var(--lj-blue);">Memuat notifikasi...</div>

      <!-- Notifications list -->
      <div v-else class="space-y-4">
        <div
          v-for="notif in filteredNotifications()"
          :key="notif.id"
          class="bg-white rounded-3xl p-5 flex items-start gap-5 border shadow-sm relative transition-transform hover:-translate-y-1"
          style="border-color: var(--lj-border);"
        >
          <!-- Unread dot -->
          <div v-if="!notif.is_read" class="absolute top-4 left-4 w-2 h-2 rounded-full" style="background: #95FE6D;"></div>

          <!-- Avatar -->
          <div class="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ml-2" :style="{ borderColor: notif.is_read ? '#9CA3AF' : '#4E63DA' }">
            <User class="w-6 h-6" :style="{ color: notif.is_read ? '#9CA3AF' : '#95FE6D' }" />
          </div>

          <!-- Content -->
          <div class="flex-1 mt-1">
            <p class="text-sm" style="color: #4B5563;">
              <span class="font-bold text-black">{{ notif.judul }}</span> {{ notif.pesan }}
            </p>
            <p class="text-[11px] mt-1" style="color: #9CA3AF;">{{ formatDate(notif.created_at) }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
