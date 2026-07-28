<script setup>
import { ref, onMounted } from 'vue'
import { Calculator, CheckCircle2, ShieldAlert } from 'lucide-vue-next'
import { educationService } from '@/services/educationService'

const questions = ref([])
const answers = ref({})
const isCalculated = ref(false)
const result = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await educationService.fetchQuizQuestions()
    questions.value = response.pertanyaan || response
    // Initialize default answers
    questions.value.forEach((q) => {
      answers.value[q.id] = q.opsi[0].value
    })
  } catch (error) {
    console.error('Fetch quiz questions failed:', error)
  } finally {
    isLoading.value = false
  }
})

const handleCalculate = async () => {
  try {
    const response = await educationService.submitQuizAnswers({ jawaban: answers.value })
    result.value = response
    isCalculated.value = true
  } catch (error) {
    alert('Gagal menghitung kuis: ' + error.message)
  }
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
      <div v-if="isLoading" class="text-center py-6 text-xs text-slate-500">
        Memuat pertanyaan kuis...
      </div>

      <div v-else class="space-y-4">
        <div v-for="(q, idx) in questions" :key="q.id">
          <label class="block text-xs font-bold text-slate-700 uppercase mb-2">
            {{ idx + 1 }}. {{ q.teks }}
          </label>
          <select v-model="answers[q.id]" class="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="opt in q.opsi" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <button @click="handleCalculate" class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all active:scale-[0.99] mt-4">
          Hitung Tingkat Risiko Saya →
        </button>
      </div>

      <!-- Result Card -->
      <div v-if="isCalculated && result" class="p-6 bg-slate-900 text-white rounded-3xl space-y-3 animate-in fade-in">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase text-amber-400">Hasil Evaluasi Personal:</span>
          <span
            class="px-2.5 py-0.5 font-extrabold text-xs rounded-full border"
            :class="[
              result.level_risiko === 'tinggi' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
              result.level_risiko === 'sedang' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            ]"
          >
            Risiko {{ result.level_risiko === 'tinggi' ? 'Tinggi' : result.level_risiko === 'sedang' ? 'Sedang' : 'Rendah' }}
          </span>
        </div>
        <div class="text-2xl font-black">Skor Kerentanan: {{ result.skor }}%</div>
        <p class="text-xs text-slate-300 leading-relaxed">
          {{ result.rekomendasi }}
        </p>
      </div>
    </div>
  </div>
</template>
