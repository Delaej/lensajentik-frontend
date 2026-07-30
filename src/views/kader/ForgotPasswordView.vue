<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import { authService } from '@/services/authService'

const router = useRouter()
const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = 'Silakan masukkan email Anda.'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await authService.forgotPassword(email.value)
    successMessage.value = response.message || 'Tautan reset password telah dikirim ke email Anda (jika terdaftar).'
    email.value = ''
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex" style="font-family:'Satoshi',sans-serif;">
    <div class="hidden md:flex md:w-[44%] relative items-center justify-center overflow-hidden select-none" style="background:#f3f4f6;">
      <div class="absolute inset-0 opacity-35" style="
        background-image:
          linear-gradient(45deg,#e5e7eb 25%,transparent 25%),
          linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),
          linear-gradient(45deg,transparent 75%,#e5e7eb 75%),
          linear-gradient(-45deg,transparent 75%,#e5e7eb 75%);
        background-size:32px 32px;
        background-position:0 0,0 16px,16px -16px,-16px 0px;
      "></div>
      <div class="relative z-10 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 text-center">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">LensaJentik Keamanan</span>
        <p class="text-[10px] text-slate-400 mt-0.5">Pemulihan Akun Kader</p>
      </div>
    </div>

    <div class="flex-1 min-h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-hidden" style="background:#F8FAFC;">
      <div class="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-50" style="background:#5AF61F;"></div>
      <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20" style="background:#4E63DA;"></div>

      <div class="w-full max-w-sm z-10 space-y-8">
        <button @click="router.push('/kader/login')" class="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft class="w-4 h-4" /> Kembali ke Login
        </button>

        <div class="text-center space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight" style="color:#4E63DA;">
            Lupa Kata Sandi?
          </h1>
          <p class="text-sm text-slate-500 font-medium leading-relaxed">
            Masukkan email yang terdaftar, kami akan mengirimkan instruksi pemulihan.
          </p>
        </div>

        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold text-center">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold text-center flex flex-col items-center gap-2">
          <CheckCircle2 class="w-6 h-6 text-emerald-500" />
          {{ successMessage }}
        </div>

        <form v-if="!successMessage" @submit.prevent="handleForgotPassword" class="space-y-4">
          <div class="relative">
            <Mail class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 stroke-[2]" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="Email akun Anda"
              class="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#4E63DA]"
              style="background:#EEF0F7; border:none;"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 rounded-2xl font-black text-sm text-slate-900 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 shadow-sm"
            style="background:#5AF61F;"
          >
            {{ isLoading ? 'Memproses...' : 'Kirim Link Reset' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
