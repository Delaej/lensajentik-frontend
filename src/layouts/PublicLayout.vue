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

    <!-- ─── Sticky Navbar ───────────────────────────────────────────────── -->
    <header
      class="sticky top-0 z-50 transition-all duration-300"
      :class="scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[--lj-border]'
        : 'bg-white/80 backdrop-blur-sm border-b border-transparent'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        <!-- Brand Logo -->
        <RouterLink to="/" class="flex items-center gap-2 shrink-0 group">
          <div
            class="w-6 h-6 rounded-md flex items-center justify-center text-white font-black text-[10px] shadow-sm transition-transform group-hover:scale-110"
            style="background: var(--lj-green-dk);"
          >
            <div class="w-3 h-3 bg-white rounded-sm" style="border-radius: 2px 6px 2px 2px;" />
          </div>
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
          class="md:hidden bg-white border-t border-[--lj-border] px-4 py-3 space-y-1 shadow-lg"
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
    <footer class="relative mt-auto w-full pt-32" style="background: linear-gradient(180deg, #4E63DA 0%, #63D097 100%);">
      <!-- City Silhouette Overlay -->
      <div class="absolute bottom-full w-full pointer-events-none" style="margin-bottom: -1px; transform: translateY(100%); z-index: 1;">
        <svg viewBox="0 0 1440 320" class="w-full h-auto block" preserveAspectRatio="none">
          <path fill="#4E63DA" d="M0,192 L48,192 L48,160 L96,160 L96,192 L144,192 L144,128 L192,128 L192,192 L240,192 L240,256 L288,256 L288,224 L336,224 L336,256 L384,256 L384,192 L432,192 L432,256 L480,256 L480,224 L528,224 L528,256 L576,256 L576,288 L624,288 L624,224 L672,224 L672,256 L720,256 L720,224 L768,224 L768,192 L816,192 L816,256 L864,256 L864,192 L912,192 L912,224 L960,224 L960,256 L1008,256 L1008,192 L1056,192 L1056,256 L1104,256 L1104,192 L1152,192 L1152,256 L1200,256 L1200,224 L1248,224 L1248,192 L1296,192 L1296,224 L1344,224 L1344,192 L1392,192 L1392,256 L1440,256 L1440,320 L0,320 Z"/>
          <!-- Simplified silhouette for the buildings to match mockup roughly -->
          <path fill="#4E63DA" d="M60,160 h40 v60 h-40 z M70,170 h10 v10 h-10 z M90,170 h10 v10 h-10 z M70,190 h10 v10 h-10 z M90,190 h10 v10 h-10 z"/>
          <path fill="#4E63DA" d="M300,180 l30,-30 l30,30 v50 h-60 z M320,190 h20 v10 h-20 z M320,210 h20 v20 h-20 z"/>
          <path fill="#4E63DA" d="M550,150 h50 v80 h-50 z M560,160 h10 v10 h-10 z M580,160 h10 v10 h-10 z M560,180 h10 v10 h-10 z M580,180 h10 v10 h-10 z"/>
          <path fill="#4E63DA" d="M800,120 l40,-40 l40,40 v100 h-80 z M820,140 h10 v10 h-10 z M850,140 h10 v10 h-10 z M820,170 h10 v10 h-10 z M850,170 h10 v10 h-10 z"/>
          <path fill="#4E63DA" d="M1050,160 l30,-20 l30,20 v60 h-60 z M1070,180 h20 v10 h-20 z M1070,200 h20 v20 h-20 z"/>
          <path fill="#4E63DA" d="M1250,90 l20,-30 l20,30 v130 h-40 z M1260,110 h10 v10 h-10 z M1260,130 h10 v10 h-10 z M1260,150 h10 v10 h-10 z"/>
          <!-- Trees -->
          <path fill="#4E63DA" d="M220,200 l-15,30 h10 l-15,30 h40 l-15,-30 h10 z"/>
          <path fill="#4E63DA" d="M480,210 l-10,20 h5 l-10,20 h30 l-10,-20 h5 z"/>
          <path fill="#4E63DA" d="M720,190 l-15,30 h10 l-15,30 h40 l-15,-30 h10 z"/>
          <path fill="#4E63DA" d="M960,200 l-10,20 h5 l-10,20 h30 l-10,-20 h5 z"/>
          <path fill="#4E63DA" d="M1180,180 l-12,24 h8 l-12,24 h32 l-12,-24 h8 z"/>
          
          <!-- Clock on right tower -->
          <circle cx="1270" cy="115" r="5" fill="white" />
          <path d="M1270,115 v-3 M1270,115 h2" stroke="#4E63DA" stroke-width="1" />
        </svg>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-10 text-white">
        <!-- Links Row -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <ul class="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-xs font-medium">
            <li><RouterLink to="/" class="hover:text-white/80 transition-colors">Home</RouterLink></li>
            <li class="flex items-center gap-1 cursor-pointer hover:text-white/80 transition-colors">Services <ChevronDown class="w-3 h-3" /></li>
            <li><RouterLink to="/edukasi" class="hover:text-white/80 transition-colors">Blog</RouterLink></li>
            <li><span class="cursor-pointer hover:text-white/80 transition-colors">Help Center</span></li>
            <li><span class="cursor-pointer hover:text-white/80 transition-colors">About</span></li>
          </ul>

          <div class="flex items-center gap-4">
            <a href="#" class="hover:text-white/80 transition-colors"><Youtube class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white/80 transition-colors"><Facebook class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white/80 transition-colors"><Twitter class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white/80 transition-colors"><Instagram class="w-4 h-4" /></a>
            <a href="#" class="hover:text-white/80 transition-colors"><Linkedin class="w-4 h-4" /></a>
          </div>
        </div>

        <div class="border-t border-white/20 pt-6 text-center">
          <p class="text-[10px] font-medium" style="color: rgba(255,255,255,0.9);">
            LensaJentik @ 2026. All rights reserved.
          </p>
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
