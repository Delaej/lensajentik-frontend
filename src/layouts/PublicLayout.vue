<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { Bell, User, HelpCircle, Menu, X, ChevronDown, Facebook, Twitter, Instagram, Linkedin, Youtube, Clock } from 'lucide-vue-next'
import { useGamificationStore } from '@/stores/useGamificationStore'

const route = useRoute()
const router = useRouter()
const gamificationStore = useGamificationStore()

const isMobileMenuOpen = ref(false)
const scrolled = ref(false)

const navItems = [
  { name: 'Beranda',    path: '/' },
  { name: 'Peta Resiko', path: '/peta-resiko' },
  { name: 'Laporan',    path: '/laporan' },
  { name: 'Edukasi',    path: '/edukasi' },
  { name: 'Statistik',  path: '/statistik' },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    { threshold: 0.1 }
  )
  const observeElements = () => {
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el)
      })
    }, 100)
  }
  router.afterEach(observeElements)
  observeElements()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const emit = defineEmits(['trigger-onboarding'])
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--lj-bg); color: var(--lj-text);">

    <!-- ─── Floating Navbar ───────────────────────────────────────────────── -->
    <header
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-full max-w-4xl px-4"
    >
      <div
        class="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-4 rounded-full"
        :class="scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
          : 'bg-white/90 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.08)]'"
      >

        <!-- Brand Logo -->
        <RouterLink to="/" class="flex items-center gap-2 shrink-0 group">
          <img src="/LOGO_LENSAJENTIK.svg" alt="Logo LensaJentik" class="h-6 w-auto transition-transform group-hover:scale-105" />
          <span class="font-bold text-lg tracking-tight" style="color: var(--lj-navy);">
            Lensa<span style="color: var(--lj-green-dk);">Jentik</span>
          </span>
        </RouterLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1 ml-8">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-5 py-2 rounded-full text-xs font-bold transition-all duration-200"
            :style="isActive(item.path)
              ? 'background: var(--lj-blue); color: white;'
              : 'color: var(--lj-navy);'"
            :class="!isActive(item.path) ? 'hover:bg-[--lj-blue-pale] hover:text-[--lj-blue]' : ''"
          >
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-2 ml-auto">
          <!-- Notification Bell -->
          <RouterLink
            to="/notifikasi"
            class="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[--lj-green-pale]"
            title="Notifikasi"
          >
            <Bell class="w-5 h-5" style="color: var(--lj-green-dk);" />
          </RouterLink>

          <!-- Kader Login -->
          <RouterLink
            to="/kader/login"
            class="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[--lj-green-pale]"
            title="Login Kader"
          >
            <User class="w-5 h-5" style="color: var(--lj-green-dk);" />
          </RouterLink>

          <!-- Mobile menu toggle -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[--lj-blue-pale]"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <Transition name="slide-down">
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden bg-white/95 backdrop-blur-md border border-[--lj-border] px-4 py-3 space-y-1 shadow-lg rounded-2xl mt-2 mx-4"
        >
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-600 transition-colors"
            :style="isActive(item.path)
              ? 'background: var(--lj-blue-pale); color: var(--lj-blue); font-weight: 700;'
              : 'color: var(--lj-muted);'"
          >
            <span>{{ item.name }}</span>
            <ChevronDown v-if="!isActive(item.path)" class="w-4 h-4 -rotate-90" />
          </RouterLink>
        </div>
      </Transition>
    </header>

    <!-- ─── Page Content ──────────────────────────────────────────────────────── -->
    <main class="flex-1 relative z-10 w-full flex flex-col">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" @trigger-onboarding="$emit('trigger-onboarding')" />
      </RouterView>
    </main>

    <!-- ─── Footer ─────────────────────────────────────────────────────────── -->
    <footer class="relative mt-auto w-full">
      <!-- City Silhouette SVG -->
      <img src="/footer.svg" alt="" aria-hidden="true" class="w-full h-auto block" style="margin-bottom: -2px; pointer-events: none;" />

      <div class="w-full px-4 sm:px-6 lg:px-8 pb-5 pt-3 text-white" style="background: linear-gradient(180deg, #4E63DA 0%, #63D097 100%);">
        <!-- Links Row -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-3 gap-3 max-w-7xl mx-auto">
          <ul class="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-[11px] font-medium opacity-90">
            <li><RouterLink to="/" class="hover:text-white transition-colors">Home</RouterLink></li>
            <li class="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">Services <ChevronDown class="w-3 h-3" /></li>
            <li><RouterLink to="/edukasi" class="hover:text-white transition-colors">Blog</RouterLink></li>
            <li><span class="cursor-pointer hover:text-white transition-colors">Help Center</span></li>
            <li><span class="cursor-pointer hover:text-white transition-colors">About</span></li>
          </ul>
          <div class="flex items-center gap-3 opacity-90">
            <a href="#" class="hover:text-white transition-colors"><Youtube class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white transition-colors"><Facebook class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white transition-colors"><Twitter class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white transition-colors"><Instagram class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white transition-colors"><Linkedin class="w-4 h-4" /></a>
          </div>
        </div>
        <div class="text-center">
          <p class="text-[10px] font-medium opacity-75">LensaJentik @ 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
