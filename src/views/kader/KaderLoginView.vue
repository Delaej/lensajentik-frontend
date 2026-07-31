<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'

const router = useRouter()
const kaderStore = useKaderStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Silakan isi email dan kata sandi Anda.'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await kaderStore.login(email.value, password.value)
    if (response) {
      router.push('/kader/dashboard')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Email atau kata sandi tidak cocok.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="h-screen w-full flex overflow-hidden" style="font-family:'Satoshi',sans-serif;">

    <!-- ── Left Column: Lottie Illustration ──────────────────────────── -->
    <div class="hidden md:flex md:w-[55%] relative overflow-hidden select-none z-10 sticky top-0 h-screen"
      style="background: var(--lj-blue-pale);">
      <!-- Lottie fills entire left column -->
      <div class="absolute inset-0 z-0">
        <Vue3Lottie
          animationLink="/illustrasi login.json"
          :loop="true"
          :autoplay="true"
          class="w-full h-full"
          :rendererSettings="{ preserveAspectRatio: 'xMidYMid slice' }"
        />
      </div>
      <!-- Right-facing sway (overlaps the Lottie, pointing left toward the login card) -->
      <div class="absolute top-0 right-0 h-full z-10 pointer-events-none flex items-stretch" style="width: 80px; transform: translateX(1px);">
        <svg viewBox="0 0 80 900" preserveAspectRatio="none" class="w-full h-full block" fill="#F8FAFC" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 0 Q0 450 80 900 L80 900 L80 0 Z" />
        </svg>
      </div>
    </div>

    <!-- ── Right Column: Login Form ─────────────────────────────────────── -->
    <div class="flex-1 h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-20"
      style="background:#F8FAFC;">
      <!-- Ambient glow blobs -->
      <div class="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-50 z-0"
        style="background:#5AF61F;"></div>
      <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-40 z-20"
        style="background:#4E63DA;"></div>

      <div class="w-full max-w-sm z-10 space-y-8">

        <!-- Brand Logo (centered) -->
        <div class="flex justify-center">
          <img src="/LOGO_LENSAJENTIK.svg" alt="LensaJentik Logo" class="w-24 h-24 object-contain" />
        </div>

        <!-- Heading -->
        <div class="text-center space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight" style="color:#4E63DA;">
            Masuk ke Akun Anda
          </h1>
          <p class="text-sm text-slate-500 font-medium leading-relaxed">
            Halo Kader! Senang melihatmu kembali.<br />
            Silakan masuk ke akun Anda.
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage"
          class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold text-center">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div class="relative">
            <Mail class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 stroke-[2]" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="Email akun kader"
              class="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#4E63DA]"
              style="background:#EEF0F7; border:none;"
            />
          </div>

          <!-- Password -->
          <div class="relative">
            <Lock class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 stroke-[2]" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••••"
              class="w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2"
              style="background:#EEF0F7; border:none;"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
            >
              <Eye v-if="!showPassword" class="w-5 h-5 stroke-[2]" />
              <EyeOff v-else class="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          <!-- Lupa Password -->
          <div class="text-right">
            <router-link to="/kader/login/lupa-password" class="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Lupa password?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 rounded-2xl font-black text-sm text-slate-900 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 shadow-sm"
            style="background:#5AF61F;"
          >
            {{ isLoading ? 'Memproses...' : 'Mulai!' }}
          </button>
        </form>

      </div>
    </div>

  </div>
</template>
