<script setup>
import { ref } from 'vue'
import {
  FileSpreadsheet,
  Camera,
  MapPin,
  Award,
  Share2,
  CheckCircle2,
  Navigation,
  Sparkles,
  User,
  FileText,
} from 'lucide-vue-next'
import { useReportStore } from '@/stores/useReportStore'
import { useGamificationStore } from '@/stores/useGamificationStore'

const reportStore = useReportStore()
const gamificationStore = useGamificationStore()

const userName = ref('')
const address = ref('Jl. Pasteur No. 42, Kel. Pasteur, Sukajadi')
const description = ref('')
const isLocating = ref(false)
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const showTwibbonModal = ref(false)

const handleGetGps = () => {
  isLocating.value = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        isLocating.value = false
        address.value = `GPS: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) — Pasteur Sukajadi`
      },
      () => {
        isLocating.value = false
        address.value = 'GPS Terdeteksi: Pasteur Sukajadi (Simulasi)'
      }
    )
  } else {
    isLocating.value = false
    address.value = 'GPS Terdeteksi: Pasteur Sukajadi (Simulasi)'
  }
}

const handleSubmitReport = () => {
  if (!description.value) {
    alert('Silakan isi deskripsi temuan genangan jentik terlebih dahulu.')
    return
  }

  isSubmitting.value = true
  setTimeout(() => {
    reportStore.addReport({
      userName: userName.value || 'Warga Peduli',
      address: address.value,
      description: description.value,
    })

    gamificationStore.addPoints(50)
    isSubmitting.value = false
    showSuccessModal.value = true
  }, 600)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Header Page -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
        <Award class="w-4 h-4 text-amber-600" />
        <span>Dapatkan +50 Poin Warga Peduli Lingkungan</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Lapor Genangan Air & Jentik Nyamuk</h1>
      <p class="text-xs sm:text-sm text-slate-500">Bantu kader kesehatan mendeteksi lokasi perkembangbiakan nyamuk Aedes/Anopheles secara cepat</p>
    </div>

    <!-- Form Container -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <form @submit.prevent="handleSubmitReport" class="space-y-6">
        <!-- User Name -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Pelapor (Opsional)</label>
          <div class="relative">
            <User class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="userName"
              type="text"
              placeholder="Misal: Ahmad Pratama"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Auto Geolocation GPS Address -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Lokasi Genangan (GPS)</label>
            <button
              type="button"
              @click="handleGetGps"
              class="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <Navigation class="w-3.5 h-3.5" />
              <span>{{ isLocating ? 'Deteksi GPS...' : 'Ambil Koordinat Saya' }}</span>
            </button>
          </div>
          <div class="relative">
            <MapPin class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="address"
              type="text"
              required
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Deskripsi Temuan Jentik</label>
          <textarea
            v-model="description"
            rows="3"
            required
            placeholder="Misal: Ditemukan genangan air jernih pada drum bekas di samping rumah No. 12. Larva jentik aktif terlihat."
            class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Photo Upload Box Mock -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Upload Foto Bukti Genangan</label>
          <div class="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors">
            <Camera class="w-8 h-8 text-slate-400 mx-auto" />
            <div class="text-xs font-bold text-slate-700">Ambil Foto atau Pilih Gambar</div>
            <p class="text-[11px] text-slate-400">Format PNG/JPG max 5MB (Sudah siap foto otomatis)</p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Sparkles class="w-5 h-5 text-amber-300" />
          <span>Kirim Laporan & Klaim +50 Poin</span>
        </button>
      </form>
    </div>

    <!-- Success Modal with Twibbon Share Trigger -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
          <CheckCircle2 class="w-10 h-10" />
        </div>
        <h3 class="text-xl font-black text-slate-900">Laporan Berhasil Terkirim! 🎉</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Terima kasih telah berpartisipasi! Anda berhasil mendapatkan <span class="font-bold text-amber-600">+50 Poin Warga Peduli</span>. Laporan ini telah diteruskan ke Kader Kesehatan wilayah Anda.
        </p>

        <div class="space-y-2 pt-2">
          <button
            @click="showTwibbonModal = true; showSuccessModal = false"
            class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Share2 class="w-4 h-4" /> Share Twibbon Dukungan 3M Plus
          </button>
          <button
            @click="showSuccessModal = false"
            class="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Twibbon Share Modal -->
    <div v-if="showTwibbonModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
        <h3 class="text-lg font-black text-slate-900">Twibbon Gerakan Bebas Jentik 2026</h3>
        <div class="aspect-square bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl p-6 text-white flex flex-col justify-between shadow-inner">
          <div class="text-left font-black text-xl">#LensaJentik2026</div>
          <div class="text-center font-bold text-sm">Saya Duta Bebas Jentik! Mari Bersama Lakukan 3M Plus</div>
          <div class="text-xs text-blue-100">Poin Partisipasi: {{ gamificationStore.userPoints }} Poin</div>
        </div>
        <button
          @click="alert('Twibbon berhasil diunduh ke galeri Anda!')"
          class="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl text-xs shadow-md"
        >
          Unduh Twibbon PNG
        </button>
        <button @click="showTwibbonModal = false" class="text-xs text-slate-500 font-bold hover:underline">Selesai</button>
      </div>
    </div>
  </div>
</template>
