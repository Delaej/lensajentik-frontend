<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, Rotate3D, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-vue-next'
import { educationService } from '@/services/educationService'

const questions = ref([])
const answers = ref({})
const currentQ = ref(0)
const isCalculated = ref(false)
const result = ref(null)
const isLoading = ref(true)
const isCalculating = ref(false)
const transitionDir = ref('next')

onMounted(async () => {
  try {
    const res = await educationService.fetchQuizQuestions()
    questions.value = res.pertanyaan || res
    questions.value.forEach((q) => { answers.value[q.id] = q.opsi[0]?.value ?? '' })
  } catch (e) {
    questions.value = []
  } finally {
    isLoading.value = false
    if (questions.value.length) answers.value[questions.value[0].id] = questions.value[0].opsi[0].value
  }
})

const goNext = () => {
  if (currentQ.value < questions.value.length - 1) {
    transitionDir.value = 'next'
    currentQ.value++
    if (!answers.value[questions.value[currentQ.value].id]) {
      answers.value[questions.value[currentQ.value].id] = questions.value[currentQ.value].opsi[0].value
    }
  }
}

const goPrev = () => {
  if (currentQ.value > 0) {
    transitionDir.value = 'prev'
    currentQ.value--
  }
}

const isLastQ = computed(() => currentQ.value === questions.value.length - 1)
const isFirstQ = computed(() => currentQ.value === 0)

const handleCalculate = async () => {
  isCalculating.value = true
  try {
    const res = await educationService.submitQuizAnswers({ jawaban: answers.value })
    result.value = res
  } catch (e) {
    result.value = { error: true, message: 'Gagal menghitung skor. Silakan coba lagi.' }
  } finally {
    isCalculating.value = false
    isCalculated.value = true
  }
}

const riskLevel = computed(() => result.value?.level_risiko ?? 'rendah')
const riskScore = computed(() => result.value?.skor ?? 0)
const riskConfig = computed(() => ({
  tinggi: { color: '#EF4444', bg: '#FEF2F2', label: 'Risiko Tinggi', icon: ShieldAlert },
  sedang: { color: '#F59E0B', bg: '#FFFBEB', label: 'Risiko Sedang', icon: AlertTriangle },
  rendah: { color: '#22C55E', bg: '#F0FDF4', label: 'Risiko Rendah', icon: CheckCircle2 },
}[riskLevel.value] || {}))

const retakeQuiz = () => {
  isCalculated.value = false
  currentQ.value = 0
  result.value = null
}

const optionPrefix = ['A', 'B', 'C', 'D', 'E']
</script>

<template>
  <!-- Main background matching the mockup (light gray-green with abstract blobs) -->
  <div class="min-h-screen relative overflow-hidden" style="background-color: #f7fbf8;">
    <!-- Decorative background blobs -->
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
      <div class="absolute top-10 right-[10%] w-[500px] h-[400px] rounded-full blur-[100px]" style="background: rgba(78,99,218,0.4);" />
      <div class="absolute top-40 left-[15%] w-[400px] h-[400px] rounded-[100px] blur-[80px]" style="background: rgba(149,254,109,0.5);" />
    </div>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 relative z-10 space-y-12 min-h-screen flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <button @click="isFirstQ ? $router.push('/beranda/edukasi') : goPrev()" class="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
          <ChevronLeft class="w-5 h-5" style="color: var(--lj-navy);" />
        </button>
        <div class="px-4 py-1.5 rounded-full border-2 text-xs font-bold" style="border-color: #95FE6D; background: white; color: var(--lj-navy);">
          KALKULATOR RISIKO DBD
        </div>
        <div class="w-8 h-8"></div> <!-- spacer -->
      </div>

      <div v-if="isLoading" class="text-center font-bold" style="color: var(--lj-blue);">Memuat kuis...</div>
      
      <!-- QUIZ MODE -->
      <template v-else-if="!isCalculated">
        <div class="flex-1 flex flex-col justify-center gap-12">
          
          <!-- Question Box -->
          <div class="relative w-full max-w-lg mx-auto">
            <!-- Shadow offset mimicking mockup -->
            <div class="absolute w-full h-full rounded-[32px] top-6 -right-6" style="background: #4E63DA; z-index: -1;"></div>
            <!-- Main Question Card -->
            <Transition :name="transitionDir === 'next' ? 'q-next' : 'q-prev'" mode="out-in">
              <div :key="currentQ" class="bg-white rounded-[32px] p-8 sm:p-12 text-center relative border-b-[6px] border-r-[6px]" style="border-color: #95FE6D;">
                <!-- Decorative Elements -->
                <div class="absolute -top-6 -right-6">
                  <svg width="60" height="60" viewBox="0 0 100 100">
                    <path d="M50 0 Q60 40 100 50 Q60 60 50 100 Q40 60 0 50 Q40 40 50 0Z" fill="#95FE6D" />
                  </svg>
                </div>
                <div class="absolute -bottom-8 -left-8">
                  <!-- Abstract sunburst blue -->
                  <svg width="80" height="80" viewBox="0 0 100 100" style="animation: spin 20s linear infinite;">
                    <circle cx="50" cy="50" r="25" fill="#4E63DA" />
                    <g fill="#4E63DA">
                      <rect x="46" y="0" width="8" height="100" />
                      <rect x="0" y="46" width="100" height="8" />
                      <rect x="46" y="0" width="8" height="100" transform="rotate(45 50 50)" />
                      <rect x="46" y="0" width="8" height="100" transform="rotate(-45 50 50)" />
                      <rect x="46" y="0" width="8" height="100" transform="rotate(22.5 50 50)" />
                      <rect x="46" y="0" width="8" height="100" transform="rotate(-22.5 50 50)" />
                      <rect x="46" y="0" width="8" height="100" transform="rotate(67.5 50 50)" />
                      <rect x="46" y="0" width="8" height="100" transform="rotate(-67.5 50 50)" />
                    </g>
                  </svg>
                </div>

                <p class="text-base sm:text-lg font-medium leading-relaxed" style="color: var(--lj-navy);">
                  {{ questions[currentQ]?.teks }}
                </p>
              </div>
            </Transition>
          </div>

          <!-- Progress -->
          <div class="text-center space-y-2">
            <div class="flex justify-center gap-2">
              <div
                v-for="(_, i) in questions"
                :key="i"
                class="h-1.5 rounded-full transition-all"
                :style="currentQ === i ? 'width: 28px; background: #4E63DA;' : 'width: 28px; background: #D1D5DB;'"
              />
            </div>
            <p class="text-sm font-medium" style="color: #4B5563;">Pertanyaan {{ currentQ + 1 }}/{{ questions.length }}</p>
          </div>

          <!-- Options -->
          <div class="space-y-4 max-w-lg mx-auto w-full">
            <label
              v-for="(opt, idx) in questions[currentQ]?.opsi"
              :key="opt.value"
              class="flex items-center gap-4 p-3 pr-6 rounded-2xl cursor-pointer transition-all border-2 border-transparent shadow-sm"
              :style="answers[questions[currentQ]?.id] === opt.value
                ? 'background: #95FE6D;'
                : 'background: white;'"
            >
              <input
                type="radio"
                :name="questions[currentQ]?.id"
                :value="opt.value"
                v-model="answers[questions[currentQ]?.id]"
                class="hidden"
              />
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                :style="answers[questions[currentQ]?.id] === opt.value ? 'background: #22C55E;' : 'background: #4E63DA;'"
              >
                {{ optionPrefix[idx] }}
              </div>
              <span class="text-sm font-medium flex-1" style="color: var(--lj-navy);">
                {{ opt.label }}
              </span>
            </label>
          </div>

          <!-- Next Button -->
          <div class="flex justify-end max-w-lg mx-auto w-full mt-4">
            <button
              v-if="!isLastQ"
              @click="goNext"
              class="px-8 py-3 rounded-full text-white font-bold transition-transform hover:scale-105"
              style="background: #4E63DA;"
            >
              Selanjutnya
            </button>
            <button
              v-else
              @click="handleCalculate"
              :disabled="isCalculating"
              class="px-8 py-3 rounded-full text-white font-bold transition-transform hover:scale-105 disabled:opacity-50"
              style="background: #22C55E;"
            >
              {{ isCalculating ? 'Menghitung...' : 'Lihat Hasil' }}
            </button>
          </div>
        </div>
      </template>

      <!-- RESULT MODE -->
      <template v-else-if="result">
        <div class="lj-card p-8 text-center space-y-6" :style="{ borderColor: riskConfig.color, background: riskConfig.bg }">
          <component :is="riskConfig.icon" class="w-16 h-16 mx-auto" :style="{ color: riskConfig.color }" />
          <div>
            <h2 class="text-3xl font-black" :style="{ color: riskConfig.color }">{{ riskScore }}%</h2>
            <p class="font-bold uppercase tracking-wider" :style="{ color: riskConfig.color }">{{ riskConfig.label }}</p>
          </div>
          <p class="text-sm" style="color: var(--lj-muted);">{{ result.rekomendasi }}</p>
          <button @click="retakeQuiz" class="lj-btn-primary mx-auto" style="background: var(--lj-navy);">Ulangi Kuis</button>
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.q-next-enter-active, .q-next-leave-active,
.q-prev-enter-active, .q-prev-leave-active {
  transition: all 0.25s ease-in-out;
}
.q-next-enter-from { opacity: 0; transform: translateX(20px); }
.q-next-leave-to   { opacity: 0; transform: translateX(-20px); }
.q-prev-enter-from { opacity: 0; transform: translateX(-20px); }
.q-prev-leave-to   { opacity: 0; transform: translateX(20px); }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
