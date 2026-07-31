<script setup>
import { RouterLink } from 'vue-router'
import { Bell, User, BookOpen, CheckCircle2, Plus, TrendingUp } from 'lucide-vue-next'

import { onMounted, computed } from 'vue'
import { useKaderStore } from '@/stores/useKaderStore'

const kaderStore = useKaderStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})

onMounted(async () => {
  await kaderStore.fetchProfile()
  await kaderStore.fetchDashboard()
  await kaderStore.fetchMyAbjRecords()
  await kaderStore.fetchNotifications()
})

// Real notifications list mapped from store
const notifications = computed(() => {
  return kaderStore.notifications.slice(0, 3)
})

// Weekly Trend bars – mapped from real store ABJ records
const chartBars = computed(() => {
  if (kaderStore.abjRecords.length === 0) return []
  return kaderStore.abjRecords.slice(0, 6).reverse().map((rec, index) => {
    return {
      label: `Mg ${index + 1}`,
      h: rec.abjScore,
      color: rec.abjScore >= 95 ? '#5AF61F' : rec.abjScore >= 90 ? '#4E63DA' : '#D9534F'
    }
  })
})

</script>

<template>
  <div class="space-y-6 max-w-6xl mx-auto" style="font-family:'Satoshi',sans-serif;">

    <!-- ── Top Header ──────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-2">
          {{ greeting }},
          <span class="px-3 py-0.5 rounded-full text-slate-900 font-black" style="background:#5AF61F;">
            {{ kaderStore.userProfile.nama || 'Kader' }}!
          </span>
        </h1>
        <p class="text-sm text-slate-500 font-medium mt-1.5">
          Mari pantau jentik hari ini untuk lingkungan yang lebih sehat.
        </p>
      </div>

      <!-- Bell + User Avatar icons (lime green circle) -->
      <div class="flex items-center gap-2.5 shrink-0 ml-4">
        <RouterLink to="/kader/notifikasi"
          class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:brightness-105"
          style="background:#5AF61F;" title="Notifikasi">
          <Bell class="w-5 h-5 stroke-[2.3] text-slate-900" />
        </RouterLink>
        <RouterLink to="/kader/pengaturan"
          class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:brightness-105"
          style="background:#5AF61F;" title="Profil">
          <User class="w-5 h-5 stroke-[2.3] text-slate-900" />
        </RouterLink>
      </div>
    </div>

    <!-- ── Main Grid: Rangkuman + Notifikasi ─────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

      <!-- LEFT: Rangkuman Wilayah Binaan (8 cols) -->
      <div class="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col justify-between gap-6">
        <!-- Card Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <BookOpen class="w-6 h-6 stroke-[2.2]" style="color:#4E63DA;" />
            <h2 class="text-base font-black text-slate-900">Rangkuman Wilayah Binaan</h2>
          </div>
          <!-- Status Aman badge -->
          <div class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-2xs"
            :style="{ background: kaderStore.quickMetricsDisplay.status === 'Aman' ? '#5AF61F' : kaderStore.quickMetricsDisplay.status === 'Waspada' ? '#F59E0B' : '#EF4444' }">
            <CheckCircle2 class="w-3.5 h-3.5 stroke-[2.8]" />
            Status {{ kaderStore.quickMetricsDisplay.status }}
          </div>
        </div>

        <!-- 3 Metric Boxes -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-5 rounded-2xl text-center border-2 bg-white" style="border-color:#5AF61F;">
            <div class="text-xs font-semibold text-slate-600 mb-1">Total Rumah</div>
            <div class="text-4xl font-black text-slate-900">{{ kaderStore.quickMetricsDisplay.totalHouseTarget || '—' }}</div>
          </div>
          <div class="p-5 rounded-2xl text-center border-2 bg-white" style="border-color:#5AF61F;">
            <div class="text-xs font-semibold text-slate-600 mb-1">Diperiksa</div>
            <div class="text-4xl font-black text-slate-900">{{ kaderStore.quickMetricsDisplay.diperiksa }}</div>
          </div>
          <div class="p-5 rounded-2xl text-center border-2 bg-white" style="border-color:#7B93F0;">
            <div class="text-[11px] font-semibold text-slate-600 mb-1 leading-tight">Angka Bebas<br/>Jentik (ABJ)</div>
            <div class="text-4xl font-black text-slate-900">{{ kaderStore.quickMetricsDisplay.abjScore }}%</div>
          </div>
        </div>

        <!-- Input Data Baru CTA button -->
        <RouterLink to="/kader/abj"
          class="w-full py-3.5 rounded-2xl font-black text-sm text-slate-900 text-center flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-98 shadow-2xs"
          style="background:#5AF61F;">
          <Plus class="w-4 h-4 stroke-[3]" />
          Input Data Baru
        </RouterLink>
      </div>

      <!-- RIGHT: Notifikasi (4 cols) -->
      <div class="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col justify-between gap-4">
        <!-- Card Header -->
        <div class="flex items-center gap-3">
          <Bell class="w-6 h-6 stroke-[2.2]" style="color:#4E63DA;" />
          <h2 class="text-base font-black text-slate-900">Notifikasi</h2>
        </div>

        <!-- Notification Items -->
        <div class="space-y-3 flex-1">
          <div v-for="item in notifications" :key="item.id"
            class="p-3 rounded-2xl border flex items-center gap-3"
            style="background:#F0FDF4; border-color:#D1FAE5;">
            <!-- Avatar circle -->
            <div class="relative w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style="background:#5AF61F;">
              <User class="w-5 h-5 stroke-[2.2] text-slate-900" />
              <span class="absolute top-0 left-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </div>
            <div class="text-xs leading-snug">
              <div class="font-bold text-slate-900">{{ item.title }}
                <span class="font-normal text-slate-500">{{ item.subtitle }}</span>
              </div>
              <div class="text-[10px] text-slate-400 font-medium mt-0.5">{{ item.date }}</div>
            </div>
          </div>
        </div>

        <!-- Lihat Semua button -->
        <RouterLink to="/kader/notifikasi"
          class="block w-full py-3 rounded-2xl font-black text-sm text-white text-center transition-all hover:brightness-110 shadow-sm"
          style="background:#4E63DA;">
          Lihat Semua
        </RouterLink>
      </div>
    </div>

    <!-- ── Tren ABJ Mingguan Chart Card ──────────────────────────────────── -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <TrendingUp class="w-6 h-6 stroke-[2.2]" style="color:#4E63DA;" />
          <h2 class="text-base font-black text-slate-900">Tren ABJ Mingguan</h2>
        </div>
        <RouterLink to="/kader/riwayat"
          class="text-sm font-semibold underline underline-offset-2 transition-colors hover:opacity-80"
          style="color:#4E63DA;">
          Lihat detail
        </RouterLink>
      </div>

      <!-- Bar Chart -->
      <div class="relative pb-6">
        <!-- Y-axis grid lines -->
        <div class="space-y-[26px]">
          <div v-for="label in [100,75,50,25,0]" :key="label" class="flex items-center gap-3">
            <span class="w-7 text-[11px] text-right font-medium text-slate-400">{{ label }}</span>
            <div class="flex-1 h-px bg-slate-100"></div>
          </div>
        </div>

        <!-- Bar columns overlaid on chart area -->
        <div class="absolute inset-x-0 top-0 bottom-7 left-10 flex items-end justify-between px-6 sm:px-14 gap-2 sm:gap-4">
          <div v-for="(bar, i) in chartBars" :key="i" class="flex-1 h-full flex flex-col justify-end items-center group">
            <div
              class="w-full rounded-t-xl transition-all duration-300 group-hover:brightness-110"
              :style="{ height: bar.h + '%', background: bar.color }"
            ></div>
          </div>
        </div>

        <!-- X-axis labels -->
        <div class="flex justify-between pl-10 pr-0 sm:px-14 pt-2 text-[11px] font-semibold text-slate-400">
          <span v-for="bar in chartBars" :key="bar.label" class="flex-1 text-center">{{ bar.label }}</span>
        </div>
      </div>
    </div>

  </div>
</template>
