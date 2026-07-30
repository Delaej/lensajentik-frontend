<script setup>
import { ref, computed } from 'vue'
import { Bell, CheckCheck, CloudRain, AlertTriangle, ShieldCheck, Filter } from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'

const kaderStore = useKaderStore()
const currentFilter = ref('all') // 'all' | 'unread' | 'high'

const filteredNotifications = computed(() => {
  if (currentFilter.value === 'unread') {
    return kaderStore.notifications.filter((n) => !n.read)
  }
  if (currentFilter.value === 'high') {
    return kaderStore.notifications.filter((n) => n.priority === 'high')
  }
  return kaderStore.notifications
})

const getIcon = (type) => {
  switch (type) {
    case 'cuaca_ekstrem':
    case 'weather':
      return CloudRain
    case 'kenaikan_risiko':
      return AlertTriangle
    case 'reminder_kader':
    case 'reminder':
      return Bell
    case 'laporan_baru':
      return AlertTriangle
    case 'system':
    case 'info':
      return ShieldCheck
    default:
      return Bell
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
      <div>
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Bell class="w-6 h-6 text-blue-600" />
          Pusat Notifikasi & Jadwal Pengingat
        </h2>
        <p class="text-xs text-slate-500 mt-1">Peringatan dini curah hujan, jadwal survey jentik, dan laporan warga masuk</p>
      </div>

      <button
        @click="kaderStore.markAllNotificationsRead()"
        class="py-2.5 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-blue-200"
      >
        <CheckCheck class="w-4 h-4 text-blue-600" />
        <span>Tandai Semua Dibaca</span>
      </button>
    </div>

    <!-- Filter Buttons Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        @click="currentFilter = 'all'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0"
        :class="currentFilter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
      >
        Semua Notifikasi ({{ kaderStore.notifications.length }})
      </button>
      <button
        @click="currentFilter = 'unread'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
        :class="currentFilter === 'unread' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
      >
        Belum Dibaca
        <span v-if="kaderStore.unreadNotificationsCount > 0" class="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px]">
          {{ kaderStore.unreadNotificationsCount }}
        </span>
      </button>
      <button
        @click="currentFilter = 'high'"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0"
        :class="currentFilter === 'high' ? 'bg-rose-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
      >
        Prioritas Tinggi ⚠️
      </button>
    </div>

    <!-- Notifications List Cards -->
    <div class="space-y-3">
      <div
        v-for="notif in filteredNotifications"
        :key="notif.id"
        class="bg-white rounded-2xl p-5 border transition-all space-y-3 relative group"
        :class="[
          !notif.read ? 'border-blue-300 bg-blue-50/20 shadow-xs' : 'border-slate-200 opacity-90'
        ]"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <!-- Icon Avatar -->
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              :class="[
                notif.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                notif.type === 'weather' ? 'bg-sky-100 text-sky-600' : 'bg-indigo-100 text-indigo-600'
              ]"
            >
              <component :is="getIcon(notif.type)" class="w-5 h-5" />
            </div>

            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-sm text-slate-900">{{ notif.title }}</h4>
                <!-- Unread Indicator Dot -->
                <span v-if="!notif.read" class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">{{ notif.description }}</p>
              <div class="text-[11px] text-slate-400 font-medium pt-1">{{ notif.date }}</div>
            </div>
          </div>

          <!-- Mark read button -->
          <button
            v-if="!notif.read"
            @click="kaderStore.markNotificationRead(notif.id)"
            class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors shrink-0"
          >
            Tandai Dibaca
          </button>
        </div>
      </div>

      <div v-if="filteredNotifications.length === 0" class="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
        Tidak ada notifikasi dalam kategori ini.
      </div>
    </div>
  </div>
</template>
