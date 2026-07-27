<script setup>
import { ref } from 'vue'
import { Calculator, CheckCircle2, ShieldAlert } from 'lucide-vue-next'

const q1 = ref('jarang')
const q2 = ref('ada')
const q3 = ref('tidak')
const isCalculated = ref(false)

const handleCalculate = () => {
  isCalculated.value = true
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
      <h1 class="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
        <Calculator class="w-6 h-6 text-blue-600" /> Kalkulator Risiko Personal Interaktif
      </h1>
      <p class="text-xs text-slate-500">Hitung potensi risiko keberadaan jentik nyamuk di area rumah Anda dalam 2 menit</p>
    </div>

    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-2">1. Berapa kali Anda menguras tempat penampungan air?</label>
          <select v-model="q1" class="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold">
            <option value="rutin">Seminggu 1x (Rutin)</option>
            <option value="jarang">2 Minggu Sekali</option>
            <option value="jarang_banget">Jarang Sekali (> 1 Bulan)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-2">2. Apakah terdapat pot bunga / genangan ban bekas di luar rumah?</label>
          <select v-model="q2" class="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold">
            <option value="ada">Ya, Ada beberapa genangan</option>
            <option value="tidak">Tidak Ada, Selalu kering</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-2">3. Apakah Anda menggunakan bubuk Abate / Larvasida?</label>
          <select v-model="q3" class="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold">
            <option value="ya">Ya, Digunakan rutin</option>
            <option value="tidak">Belum Pernah</option>
          </select>
        </div>

        <button @click="handleCalculate" class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-xs shadow-md">
          Hitung Tingkat Risiko Saya →
        </button>
      </div>

      <!-- Result Card -->
      <div v-if="isCalculated" class="p-6 bg-slate-900 text-white rounded-3xl space-y-3 animate-in fade-in">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase text-amber-400">Hasil Evaluasi Personal:</span>
          <span class="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full border border-amber-500/30">
            Risiko Sedang
          </span>
        </div>
        <div class="text-2xl font-black">Potensi Jentik: 65%</div>
        <p class="text-xs text-slate-300 leading-relaxed">
          Disarankan meningkatkan frekuensi 3M Plus menjadi seminggu sekali dan memberikan larvasida pada tempat penampungan air terbuka.
        </p>
      </div>
    </div>
  </div>
</template>
