<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ClipboardCheck,
  Calendar,
  MapPin,
  Info,
  Minus,
  Plus,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'
import { abjService } from '@/services/abjService'

const router = useRouter()
const kaderStore = useKaderStore()

const currentStep = ref(1) // Step 1: Area Kerja, Step 2: Detail Pemeriksaan

// Step 1 Form Data
const selectedRt = ref('03')
const selectedRw = ref('05')
const inspectionDate = ref(new Date().toISOString().split('T')[0])
const villages = ref([])
const selectedVillageKode = ref('')

onMounted(async () => {
  await kaderStore.fetchProfile()
  if (kaderStore.userProfile.wilayah_kode) {
    try {
      const response = await abjService.fetchDesaByKecamatan(kaderStore.userProfile.wilayah_kode)
      villages.value = response.data || response
      if (villages.value.length > 0) {
        selectedVillageKode.value = villages.value[0].kode
      }
    } catch (error) {
      console.error('Fetch villages failed:', error)
    }
  }
})

// Step 2 Form Data
const totalDiperiksa = ref(45)
const rumahPositif = ref(3)
const notes = ref('')

const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// Real-time ABJ Calculator
const calculatedAbj = computed(() => {
  if (!totalDiperiksa.value || totalDiperiksa.value <= 0) return 0
  const cleanHouses = Math.max(0, totalDiperiksa.value - rumahPositif.value)
  const score = (cleanHouses / totalDiperiksa.value) * 100
  return Number(score.toFixed(1))
})

// Real-time Status Badge
const calculatedStatus = computed(() => {
  const score = calculatedAbj.value
  if (score >= 95) {
    return {
      label: 'Aman',
      colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeBg: 'bg-emerald-500',
      message: 'Sangat Baik! Target Nasional ≥95% Angka Bebas Jentik tercapai.',
    }
  } else if (score >= 90) {
    return {
      label: 'Waspada',
      colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeBg: 'bg-amber-500',
      message: 'Perlu pengawasan berkala! Beberapa titik genangan terindikasi jentik.',
    }
  } else {
    return {
      label: 'Bahaya',
      colorClass: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeBg: 'bg-rose-500',
      message: 'Risiko Tinggi! Di bawah 90%, diperlukan tindakan 3M Plus serentak.',
    }
  }
})

// Counter Modifiers
const incrementDiperiksa = () => totalDiperiksa.value++
const decrementDiperiksa = () => {
  if (totalDiperiksa.value > 1) {
    totalDiperiksa.value--
    if (rumahPositif.value > totalDiperiksa.value) {
      rumahPositif.value = totalDiperiksa.value
    }
  }
}

const incrementPositif = () => {
  if (rumahPositif.value < totalDiperiksa.value) {
    rumahPositif.value++
  }
}
const decrementPositif = () => {
  if (rumahPositif.value > 0) {
    rumahPositif.value--
  }
}

// Navigation Flow Controls
const goToStep2 = () => {
  if (!selectedRt.value || !selectedRw.value || !inspectionDate.value || !selectedVillageKode.value) {
    alert('Silakan lengkapi area kerja, desa, dan tanggal terlebih dahulu.')
    return
  }
  currentStep.value = 2
}

const submitForm = async () => {
  if (!selectedVillageKode.value) {
    alert('Silakan pilih desa/kelurahan terlebih dahulu.')
    return
  }
  isSubmitting.value = true
  try {
    const fullNotes = `RT ${selectedRt.value} / RW ${selectedRw.value}. ${notes.value}`
    await kaderStore.addAbjRecord({
      wilayah_kode: selectedVillageKode.value,
      date: inspectionDate.value,
      diperiksa: totalDiperiksa.value,
      positifJentik: rumahPositif.value,
      notes: fullNotes,
    })
    isSubmitting.value = false
    showSuccessModal.value = true
  } catch (error) {
    isSubmitting.value = false
    alert('Gagal menyimpan data ABJ: ' + (error.response?.data?.message || error.message))
  }
}

const handleFinished = () => {
  showSuccessModal.value = false
  router.push('/kader/riwayat')
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-24">
    <!-- Header Page Description -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
      <div>
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck class="w-6 h-6 text-blue-600" />
          Form Digital Input Data ABJ Lapangan
        </h2>
        <p class="text-xs text-slate-500 mt-1">Masukkan data pemeriksaan jentik berkala di wilayah binaan secara akurat</p>
      </div>

      <!-- Step Indicator Badge -->
      <div class="flex items-center gap-2">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
        >
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
          Area Kerja
        </div>
        <div class="w-6 h-0.5 bg-slate-200"></div>
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
        >
          <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
          Detail Pemeriksaan
        </div>
      </div>
    </div>

    <!-- LANGKAH 1: Area Kerja -->
    <div v-if="currentStep === 1" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
      <div class="border-b border-slate-100 pb-4">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin class="w-5 h-5 text-indigo-600" />
          Langkah 1: Tentukan Area Kerja & Tanggal
        </h3>
        <p class="text-xs text-slate-500">Pilih RT, RW, dan tanggal pelaksanaan survey jentik</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Desa/Kelurahan Binaan Select (Full Width) -->
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih Desa/Kelurahan Binaan</label>
          <select
            v-model="selectedVillageKode"
            class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option v-if="villages.length === 0" value="">Memuat daftar desa...</option>
            <option v-for="village in villages" :key="village.kode" :value="village.kode">
              {{ village.nama }}
            </option>
          </select>
        </div>

        <!-- RT Select -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih RT Binaan</label>
          <select
            v-model="selectedRt"
            class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="01">RT 01</option>
            <option value="02">RT 02</option>
            <option value="03">RT 03 (Utama)</option>
            <option value="04">RT 04</option>
            <option value="05">RT 05</option>
          </select>
        </div>

        <!-- RW Select -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih RW</label>
          <select
            v-model="selectedRw"
            class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="05">RW 05 Pasteur</option>
            <option value="06">RW 06 Cipaganti</option>
          </select>
        </div>

        <!-- Date Picker -->
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tanggal Pemeriksaan</label>
          <div class="relative">
            <Calendar class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="inspectionDate"
              type="date"
              class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Info Box Panduan Field Survey -->
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Info class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div class="space-y-1">
          <div class="font-bold">Panduan Survey PSN (3M Plus):</div>
          <p class="leading-relaxed">
            Periksa bak mandi, drum penampung, vas bunga, serta wadah di pekarangan rumah. Catat rumah sebagai "Positif Jentik" apabila ditemukan setidaknya 1 larva jentik aktif.
          </p>
        </div>
      </div>

      <!-- Continue Action -->
      <div class="flex justify-end pt-4">
        <button
          @click="goToStep2"
          class="py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <span>Lanjut ke Detail Pemeriksaan</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- LANGKAH 2: Detail Pemeriksaan & Real-time Calculator -->
    <div v-if="currentStep === 2" class="space-y-6 animate-in fade-in">
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator class="w-5 h-5 text-indigo-600" />
              Langkah 2: Data Jumlah & Kalkulator ABJ Real-time
            </h3>
            <p class="text-xs text-slate-500">Lokasi: RT {{ selectedRt }}/RW {{ selectedRw }} • Tanggal: {{ inspectionDate }}</p>
          </div>
          <button @click="currentStep = 1" class="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1">
            <ArrowLeft class="w-3.5 h-3.5" /> Ubah Area
          </button>
        </div>

        <!-- Counter Input Section Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Counter 1: Total Rumah Diperiksa -->
          <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Total Rumah Diperiksa</label>
            <div class="flex items-center justify-between gap-3">
              <button
                @click="decrementDiperiksa"
                class="w-12 h-12 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
              >
                <Minus class="w-5 h-5" />
              </button>
              <input
                v-model.number="totalDiperiksa"
                type="number"
                min="1"
                class="w-24 text-center py-2 bg-white border border-slate-300 rounded-xl font-black text-2xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                @click="incrementDiperiksa"
                class="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center active:scale-95 shadow-md shadow-blue-500/20"
              >
                <Plus class="w-5 h-5" />
              </button>
            </div>
            <p class="text-[11px] text-slate-500 text-center">Rumah yang dikunjungi kader</p>
          </div>

          <!-- Counter 2: Rumah Positif Jentik -->
          <div class="p-5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-3">
            <label class="block text-xs font-bold text-rose-800 uppercase tracking-wider">Rumah Positif Jentik</label>
            <div class="flex items-center justify-between gap-3">
              <button
                @click="decrementPositif"
                class="w-12 h-12 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
              >
                <Minus class="w-5 h-5" />
              </button>
              <input
                v-model.number="rumahPositif"
                type="number"
                min="0"
                :max="totalDiperiksa"
                class="w-24 text-center py-2 bg-white border border-rose-300 rounded-xl font-black text-2xl text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <button
                @click="incrementPositif"
                class="w-12 h-12 rounded-xl bg-rose-600 text-white font-black text-lg flex items-center justify-center active:scale-95 shadow-md shadow-rose-500/20"
              >
                <Plus class="w-5 h-5" />
              </button>
            </div>
            <p class="text-[11px] text-rose-700 text-center">Ditemukan jentik Aedes / Anopheles</p>
          </div>
        </div>

        <!-- KALKULATOR OTOMATIS ABJ REAL-TIME CARD -->
        <div class="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl relative overflow-hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Calculator class="w-5 h-5 text-emerald-400" />
              <span class="font-bold text-sm tracking-wide">Hasil Kalkulasi ABJ Otomatis:</span>
            </div>
            <!-- Status Badge Display -->
            <span
              class="px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 border"
              :class="calculatedStatus.colorClass"
            >
              <span class="w-2 h-2 rounded-full" :class="calculatedStatus.badgeBg"></span>
              {{ calculatedStatus.label }}
            </span>
          </div>

          <!-- Formula Score Display -->
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
            <div>
              <div class="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {{ calculatedAbj }}%
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Rumus ABJ = <span class="font-mono text-emerald-300">((Total Diperiksa - Positif Jentik) / Total Diperiksa) × 100%</span>
              </p>
            </div>

            <!-- Visual Progress Meter -->
            <div class="w-full sm:w-48 space-y-1">
              <div class="flex justify-between text-[10px] font-bold text-slate-400">
                <span>0%</span>
                <span>Target: 95%</span>
                <span>100%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-3 p-0.5 border border-slate-700">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="calculatedAbj >= 95 ? 'bg-emerald-400' : calculatedAbj >= 90 ? 'bg-amber-400' : 'bg-rose-500'"
                  :style="{ width: `${Math.min(100, calculatedAbj)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <p class="text-xs text-slate-300 bg-white/10 p-3 rounded-xl backdrop-blur-xs leading-relaxed">
            {{ calculatedStatus.message }}
          </p>
        </div>

        <!-- Optional Field Notes -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText class="w-4 h-4 text-slate-500" />
            Catatan Lapangan & Temuan Khusus (Opsional)
          </label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="Misal: Ditemukan genangan jentik di pot tanaman luar rumah No. 12. Telah diberikan bubuk Abate."
            class="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>
      </div>

      <!-- Floating Bottom Save Action -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between">
        <button
          @click="currentStep = 1"
          class="py-3 px-5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-sm flex items-center gap-2"
        >
          <ArrowLeft class="w-4 h-4" /> Kembali
        </button>

        <button
          @click="submitForm"
          :disabled="isSubmitting"
          class="py-3.5 px-7 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Save class="w-4 h-4 stroke-[2.5]" />
          <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Riwayat Data ABJ' }}</span>
        </button>
      </div>
    </div>

    <!-- Success Modal Popup -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 class="w-10 h-10" />
        </div>
        <h3 class="text-xl font-bold text-slate-900">Data ABJ Berhasil Disimpan!</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Pemeriksaan untuk RT {{ selectedRt }}/RW {{ selectedRw }} dengan skor ABJ <span class="font-bold text-emerald-600">{{ calculatedAbj }}%</span> telah tercatat dalam sistem portal kader.
        </p>
        <button
          @click="handleFinished"
          class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md"
        >
          Lihat Riwayat & Tren →
        </button>
      </div>
    </div>
  </div>
</template>
