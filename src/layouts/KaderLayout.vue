<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  LayoutGrid,
  FileEdit,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'

const route = useRoute()
const router = useRouter()
const kaderStore = useKaderStore()

const isMobileSidebarOpen = ref(false)

const menuItems = [
  { name: 'Dashboard',      path: '/kader/dashboard',    icon: LayoutGrid },
  { name: 'Kelola Data ABJ',path: '/kader/abj',          icon: FileEdit },
  { name: 'Riwayat & Tren', path: '/kader/riwayat',      icon: TrendingUp },
  { name: 'Laporan',        path: '/kader/laporan',       icon: BarChart3 },
  { name: 'Notifikasi',     path: '/kader/notifikasi',    icon: Bell, badge: true },
  { name: 'Pengaturan',     path: '/kader/pengaturan',    icon: Settings },
]

const handleLogout = () => {
  kaderStore.logout()
  router.push('/kader/login')
}
</script>

<template>
  <div class="min-h-screen flex bg-[#F8FAFC]" style="font-family:'Satoshi',sans-serif;">

    <!-- ── Desktop Sidebar ─────────────────────────────────────────────────── -->
    <aside class="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 sticky top-0 h-screen shrink-0 z-30 select-none px-4 pt-6 pb-4 justify-between print:hidden">

      <!-- Brand Logo -->
      <div class="space-y-6">
        <RouterLink to="/kader/dashboard" class="flex items-center gap-2.5 px-1">
          <img src="/LOGO_LENSAJENTIK.svg" alt="LensaJentik Logo" class="w-9 h-9 object-contain" />

          <div class="leading-tight">
            <div class="font-black text-[15px] text-slate-900 tracking-tight">
              Lensa<span class="text-[#5AF61F]">Jentik</span>
            </div>
            <div class="text-[10px] font-semibold text-slate-400 tracking-wide">Kader Portal</div>
          </div>
        </RouterLink>

        <!-- CTA Button -->
        <RouterLink
          to="/kader/abj"
          class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-95 shadow-sm"
          style="background:#4E63DA;"
        >
          <Plus class="w-4 h-4 stroke-[3]" />
          Input Data Baru
        </RouterLink>

        <!-- Nav Menu -->
        <nav class="space-y-1">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="route.path === item.path
              ? 'text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
            :style="route.path === item.path ? 'background:#4E63DA;' : ''"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-[18px] h-[18px] stroke-[2.2]" />
              <span>{{ item.name }}</span>
            </div>
            <!-- Unread Badge -->
            <span
              v-if="item.badge && kaderStore.unreadNotificationsCount > 0"
              class="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
              style="background:#EF4444;"
            >
              {{ kaderStore.unreadNotificationsCount }}
            </span>
          </RouterLink>
        </nav>
      </div>

      <!-- Bottom: Bantuan & Keluar -->
      <div class="space-y-1 border-t border-slate-100 pt-3">
        <a
          href="#"
          @click.prevent
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <HelpCircle class="w-[18px] h-[18px] stroke-[2.2]" />
          Bantuan
        </a>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left"
        >
          <LogOut class="w-[18px] h-[18px] stroke-[2.2]" />
          Keluar
        </button>
      </div>
    </aside>

    <!-- ── Mobile Overlay Sidebar ──────────────────────────────────────────── -->
    <div v-if="isMobileSidebarOpen" class="fixed inset-0 z-50 lg:hidden flex">
      <div class="fixed inset-0 bg-slate-900/40" @click="isMobileSidebarOpen = false"></div>
      <aside class="relative flex flex-col w-60 bg-white h-full z-10 px-4 pt-6 pb-4 justify-between">
        <div class="space-y-5">
          <div class="flex items-center justify-between">
            <span class="font-black text-slate-900">LensaJentik</span>
            <button @click="isMobileSidebarOpen = false"><X class="w-5 h-5 text-slate-400" /></button>
          </div>
          <RouterLink to="/kader/abj" @click="isMobileSidebarOpen = false"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-white"
            style="background:#4E63DA;">
            + Input Data Baru
          </RouterLink>
          <nav class="space-y-1">
            <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path"
              @click="isMobileSidebarOpen = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              :class="route.path === item.path ? 'text-white' : 'text-slate-500 hover:bg-slate-50'"
              :style="route.path === item.path ? 'background:#4E63DA;' : ''">
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </nav>
        </div>
        <div class="border-t border-slate-100 pt-3">
          <button @click="handleLogout" class="flex items-center gap-3 text-sm font-semibold text-red-500">
            <LogOut class="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>
    </div>

    <!-- ── Main Content ────────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0">
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <!-- Mobile Toggle -->
        <div class="lg:hidden flex items-center gap-3 pb-4 mb-4 border-b border-slate-200 print:hidden">
          <button @click="isMobileSidebarOpen = true"
            class="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
            <Menu class="w-5 h-5" />
          </button>
          <span class="font-bold text-slate-900 text-sm">Portal Kader</span>
        </div>
        <RouterView />
      </main>
    </div>

  </div>
</template>
