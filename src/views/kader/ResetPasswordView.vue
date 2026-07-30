<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-vue-next'
import { authService } from '@/services/authService'

const router = useRouter()
const route = useRoute()

const token = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const showPassword = ref(false)

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  // Ambil token dan email dari query URL kalau ada (karena user klik link dari email)
  if (route.query.token) token.value = route.query.token
  if (route.query.email) email.value = route.query.email
})

const handleResetPassword = async () => {
  if (password.value !== password_confirmation.value) {
    errorMessage.value = 'Kata sandi baru dan konfirmasi tidak cocok.'
    return
  }
  
  if (!email.value || !token.value || !password.value) {
    errorMessage.value = 'Mohon lengkapi semua data.'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    await authService.resetPassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    })
    
    successMessage.value = 'Kata sandi berhasil direset! Silakan login dengan kata sandi baru.'
    
    // Redirect ke login setelah 3 detik
    setTimeout(() => {
      router.push('/kader/login')
    }, 3000)
    
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Terjadi kesalahan atau token sudah tidak berlaku.'
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
        <div class="text-center space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight" style="color:#4E63DA;">
            Reset Kata Sandi
          </h1>
          <p class="text-sm text-slate-500 font-medium leading-relaxed">
            Silakan masukkan token dari email Anda dan kata sandi baru.
          </p>
        </div>

        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold text-center">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold text-center flex flex-col items-center gap-2">
          <CheckCircle2 class="w-6 h-6 text-emerald-500" />
          {{ successMessage }}
        </div>

        <form v-if="!successMessage" @submit.prevent="handleResetPassword" class="space-y-4">
          <div class="relative">
            <input
              v-model="email"
              type="email"
              required
              placeholder="Email akun Anda"
              class="w-full px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#4E63DA]"
              style="background:#EEF0F7; border:none;"
            />
          </div>
          
          <div class="relative">
            <input
              v-model="token"
              type="text"
              required
              placeholder="Kode Token Reset"
              class="w-full px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-[#4E63DA]"
              style="background:#EEF0F7; border:none;"
            />
          </div>

          <div class="relative">
            <Lock class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 stroke-[2]" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Kata sandi baru"
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
          
          <div class="relative">
            <Lock class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 stroke-[2]" />
            <input
              v-model="password_confirmation"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Konfirmasi kata sandi"
              class="w-full pl-12 pr-12 py-3.5 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2"
              style="background:#EEF0F7; border:none;"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 rounded-2xl font-black text-sm text-slate-900 transition-all hover:brightness-105 active:scale-98 disabled:opacity-50 shadow-sm"
            style="background:#5AF61F;"
          >
            {{ isLoading ? 'Memproses...' : 'Simpan Kata Sandi Baru' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
