<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { Bell, User, HelpCircle, Menu, X, ChevronDown, Facebook, Twitter, Instagram, Linkedin, Youtube, Clock } from 'lucide-vue-next'
import { useGamificationStore } from '@/stores/useGamificationStore'
import { useKaderStore } from '@/stores/useKaderStore'
import MosquitoComponent from '@/components/MosquitoComponent.vue'
import GuidedTour from '@/components/GuidedTour.vue'

const route = useRoute()
const router = useRouter()
const gamificationStore = useGamificationStore()
const kaderStore = useKaderStore()

const isMobileMenuOpen = ref(false)
const scrolled = ref(false)

const navItems = [
  { name: 'Beranda',    path: '/beranda' },
  { name: 'Peta Resiko', path: '/beranda/peta-resiko' },
  { name: 'Laporan',    path: '/beranda/laporan' },
  { name: 'Edukasi',    path: '/beranda/edukasi' },
  { name: 'Statistik',  path: '/beranda/statistik' },
]

const isActive = (path) => {
  if (path === '/beranda') return route.path === '/beranda' || route.path === '/beranda/'
  return route.path.startsWith(path)
}

// Dynamic profile link: dashboard if logged in, login if not
const profileLink = computed(() => {
  return kaderStore.isAuthenticated ? '/kader/dashboard' : '/kader/login'
})

const profileTitle = computed(() => {
  return kaderStore.isAuthenticated ? 'Portal Kader' : 'Login Kader'
})

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
  // Expose agar view yang mengubah konten dinamis bisa re-trigger observer
  window.__observeScrollElements = observeElements
  router.afterEach(observeElements)
  observeElements()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const emit = defineEmits(['trigger-onboarding'])
</script>

<template>
  <div class="flex flex-col" style="background: var(--lj-bg); color: var(--lj-text); min-height: 100vh;">

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
        <RouterLink to="/beranda" class="flex items-center gap-2 shrink-0 group">
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
            to="/beranda/notifikasi"
            class="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[--lj-green-pale]"
            title="Notifikasi"
          >
            <Bell class="w-5 h-5" style="color: var(--lj-green-dk);" />
          </RouterLink>

          <!-- Kader Login / Portal (dynamic: dashboard if logged in) -->
          <RouterLink
            :to="profileLink"
            class="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[--lj-green-pale]"
            :title="profileTitle"
          >
            <User v-if="!kaderStore.isAuthenticated" class="w-5 h-5" style="color: var(--lj-green-dk);" />
            <User v-else class="w-5 h-5" style="color: var(--lj-blue);" />
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
    <main class="flex-1 relative z-10 w-full flex flex-col" style="margin-bottom: 0; padding-bottom: 220px;">
      <RouterView v-slot="{ Component, route }">
        <Transition name="child-slide">
          <component :is="Component" :key="route.fullPath" @trigger-onboarding="$emit('trigger-onboarding')" />
        </Transition>
      </RouterView>
    </main>

    <!-- ─── Footer ────────────────────────────────────────────────────────── -->
    <footer class="relative w-full" style="margin: 0; padding: 0; margin-top: -220px; z-index: 20; position: relative;">
      <!-- City Silhouette SVG - sits ON TOP of the FAQ Lottie animation -->
      <img src="/footer.svg" alt="" aria-hidden="true" class="w-full h-auto block" style="pointer-events: none; display: block; margin: 0; padding: 0;" />

      <div class="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-5 text-white flex flex-col justify-end">
        <!-- Links Row -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-3 gap-3 max-w-5xl mx-auto w-full">
          <ul class="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-[11px] sm:text-xs font-medium opacity-90">
            <li><RouterLink to="/beranda" class="hover:text-white transition-colors">Home</RouterLink></li>
            <li class="relative group cursor-pointer hover:text-white transition-colors py-2">
              <span class="flex items-center gap-1">Services <ChevronDown class="w-3 h-3" /></span>
              <div class="absolute bottom-full left-0 mb-2 w-36 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden text-xs font-bold border border-gray-100 py-1" style="color: var(--lj-navy);">
                <RouterLink to="/beranda/peta-resiko" class="px-4 py-2.5 hover:bg-[#EEF1FD] hover:text-[#4E63DA] transition-colors">Peta Risiko</RouterLink>
                <RouterLink to="/beranda/laporan" class="px-4 py-2.5 hover:bg-[#EEF1FD] hover:text-[#4E63DA] transition-colors">Laporan</RouterLink>
                <RouterLink to="/beranda/edukasi" class="px-4 py-2.5 hover:bg-[#EEF1FD] hover:text-[#4E63DA] transition-colors">Edukasi</RouterLink>
                <RouterLink to="/beranda/statistik" class="px-4 py-2.5 hover:bg-[#EEF1FD] hover:text-[#4E63DA] transition-colors">Statistik</RouterLink>
              </div>
            </li>
            <li><RouterLink to="/beranda/edukasi" class="hover:text-white transition-colors">Blog</RouterLink></li>
            <li><span class="cursor-pointer hover:text-white transition-colors">Help Center</span></li>
            <li><span class="cursor-pointer hover:text-white transition-colors">About</span></li>
            <li><RouterLink to="/beranda/kebijakan-privasi" class="hover:text-white transition-colors">Kebijakan Privasi</RouterLink></li>
          </ul>
        </div>
        <div class="text-center">
          <p class="text-[10px] font-medium opacity-75">LensaJentik @ 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- ─── Easter Egg: Nyamuk Sesekali ────────────────────────────── -->
    <MosquitoComponent />

    <!-- ─── Guided Tour (Tombol "?") ──────────────────────────────── -->
    <GuidedTour />
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
