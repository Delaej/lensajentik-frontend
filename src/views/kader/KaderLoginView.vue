<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'

const router = useRouter()
const kaderStore = useKaderStore()

const email = ref('nayla@gmail.com')
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
  
  const success = await kaderStore.login(email.value, password.value)
  isLoading.value = false
  if (success) {
    router.push('/kader/dashboard')
  } else {
    errorMessage.value = 'Email atau kata sandi tidak cocok.'
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex" style="font-family:'Satoshi',sans-serif;">

    <!-- ── Left Column: Illustration Placeholder ──────────────────────────── -->
    <div class="hidden md:flex md:w-[44%] relative items-center justify-center overflow-hidden select-none"
      style="background:#f3f4f6;">
      <!-- Checkerboard pattern -->
      <div class="absolute inset-0 opacity-35" style="
        background-image:
          linear-gradient(45deg,#e5e7eb 25%,transparent 25%),
          linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),
          linear-gradient(45deg,transparent 75%,#e5e7eb 75%),
          linear-gradient(-45deg,transparent 75%,#e5e7eb 75%);
        background-size:32px 32px;
        background-position:0 0,0 16px,16px -16px,-16px 0px;
      "></div>
      <!-- Placeholder label -->
      <div class="relative z-10 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 text-center">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Placeholder Ilustrasi</span>
        <p class="text-[10px] text-slate-400 mt-0.5">Area ilustrasi login kader</p>
      </div>
    </div>

    <!-- ── Right Column: Login Form ─────────────────────────────────────── -->
    <div class="flex-1 min-h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-hidden"
      style="background:#F8FAFC;">
      <!-- Ambient glow blobs -->
      <div class="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-50"
        style="background:#5AF61F;"></div>
      <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
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
              placeholder="nayla@gmail.com"
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
            <router-link to="/kader/lupa-password" class="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
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
