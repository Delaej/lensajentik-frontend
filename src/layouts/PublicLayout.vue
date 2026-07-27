<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  ShieldAlert,
  MapPin,
  FileSpreadsheet,
  BarChart3,
  Bell,
  BookOpen,
  UserCheck,
  Menu,
  X,
  Award,
  ChevronRight,
  HeartPulse,
} from 'lucide-vue-next'
import { useGamificationStore } from '@/stores/useGamificationStore'

const route = useRoute()
const gamificationStore = useGamificationStore()
const isMobileMenuOpen = ref(false)

const navItems = [
  { name: 'Beranda', path: '/', icon: ShieldAlert },
  { name: 'Peta Risiko', path: '/peta-resiko', icon: MapPin },
  { name: 'Lapor Genangan', path: '/laporan', icon: FileSpreadsheet },
  { name: 'Statistik', path: '/statistik', icon: BarChart3 },
  { name: 'Notifikasi', path: '/notifikasi', icon: Bell },
  { name: 'Edukasi', path: '/edukasi', icon: BookOpen },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
    <!-- Sticky Top Navbar -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Brand Logo -->
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert class="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-xl tracking-tight text-slate-900">Lensa<span class="text-blue-600">Jentik</span></span>
              <span class="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">GIS Web</span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium hidden sm:block">Pemetaan & Mitigasi Risiko DBD / Malaria</p>
          </div>
        </RouterLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 lg:gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            :class="[
              route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path))
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </nav>

        <!-- Action Items (Gamification Pill & Kader Login) -->
        <div class="flex items-center gap-3">
          <!-- Gamification Points Pill -->
          <RouterLink
            to="/laporan"
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold hover:bg-amber-100 transition-colors shadow-2xs"
            title="Poin Warga Peduli Lingkungan"
          >
            <Award class="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{{ gamificationStore.userPoints }} Poin</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </RouterLink>

          <!-- Kader Login Button -->
          <RouterLink
            to="/kader/login"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-blue-600 text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-blue-500/25 active:scale-95"
          >
            <UserCheck class="w-4 h-4 text-blue-400" />
            <span>Portal Kader</span>
          </RouterLink>

          <!-- Mobile Menu Button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation -->
      <div v-if="isMobileMenuOpen" class="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="[
            route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path))
              ? 'bg-blue-50 text-blue-700 font-bold'
              : 'text-slate-700 hover:bg-slate-100'
          ]"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-5 h-5 text-slate-500" />
            <span>{{ item.name }}</span>
          </div>
          <ChevronRight class="w-4 h-4 text-slate-400" />
        </RouterLink>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between px-3 py-2">
          <span class="text-xs text-slate-500 font-medium">Poin Partisipasi:</span>
          <span class="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full flex items-center gap-1">
            <Award class="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            {{ gamificationStore.userPoints }} Poin
          </span>
        </div>
      </div>
    </header>

    <!-- Main Dynamic Content Body -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer Component -->
    <footer class="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Col 1: Brand Info -->
          <div class="space-y-4 md:col-span-1">
            <div class="flex items-center gap-2 text-white font-bold text-lg">
              <ShieldAlert class="w-6 h-6 text-blue-400" />
              <span>LensaJentik</span>
            </div>
            <p class="text-xs leading-relaxed text-slate-400">
              Platform Web-GIS terintegrasi pemetaan risiko dan mitigasi dinamis kasus DBD & Malaria berbasis partisipasi warga dan kader kesehatan.
            </p>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 text-blue-300 rounded-full text-xs font-mono">
              <HeartPulse class="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Target Kompetisi 2026
            </div>
          </div>

          <!-- Col 2: Navigation Quicklinks -->
          <div>
            <h4 class="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Navigasi Utama</h4>
            <ul class="space-y-2 text-xs">
              <li><RouterLink to="/" class="hover:text-white transition-colors">Beranda</RouterLink></li>
              <li><RouterLink to="/peta-resiko" class="hover:text-white transition-colors">Peta Web-GIS Interaktif</RouterLink></li>
              <li><RouterLink to="/laporan" class="hover:text-white transition-colors">Lapor Genangan Air</RouterLink></li>
              <li><RouterLink to="/statistik" class="hover:text-white transition-colors">Data & Analisis ABJ</RouterLink></li>
            </ul>
          </div>

          <!-- Col 3: Edukasi & Bantuan -->
          <div>
            <h4 class="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Edukasi & Fitur</h4>
            <ul class="space-y-2 text-xs">
              <li><RouterLink to="/edukasi/kuis" class="hover:text-white transition-colors">Kalkulator Risiko Personal</RouterLink></li>
              <li><RouterLink to="/edukasi" class="hover:text-white transition-colors">Panduan 3M Plus</RouterLink></li>
              <li><RouterLink to="/notifikasi" class="hover:text-white transition-colors">Pusat Notifikasi Dini</RouterLink></li>
              <li><RouterLink to="/kader/login" class="hover:text-white transition-colors">Login Kader Kesehatan</RouterLink></li>
            </ul>
          </div>

          <!-- Col 4: Emergency Hotline -->
          <div class="space-y-3">
            <h4 class="text-white font-semibold text-xs uppercase tracking-wider">Layanan Darurat Kesehatan</h4>
            <p class="text-xs text-slate-400">Temukan gejala DBD atau demam tinggi berulang? Hubungi fasilitas kesehatan terdekat.</p>
            <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-400">Call Center DBD Bandung:</span>
              <div class="text-emerald-400 font-bold font-mono text-base">119 / (022) 4203736</div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 LensaJentik Platform. Hak Cipta Dilindungi Undang-Undang.</p>
          <div class="flex items-center gap-4 mt-2 sm:mt-0">
            <span class="hover:text-slate-400 cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span class="hover:text-slate-400 cursor-pointer">Syarat & Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
