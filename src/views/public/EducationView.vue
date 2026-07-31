<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChevronLeft, ChevronRight, BookOpen, Calculator,
  Home, Droplet, Archive, Recycle, Loader2, Newspaper, X
} from 'lucide-vue-next'
import { educationService } from '@/services/educationService'

/* ─── Data from backend ──────────────────────────────────────────────────── */
const articles = ref([])
const facts = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [articleRes, factRes] = await Promise.allSettled([
      educationService.fetchArticles({ tipe: 'artikel' }),
      educationService.fetchArticles({ tipe: 'fakta' }),
    ])
    if (articleRes.status === 'fulfilled') articles.value = articleRes.value?.data || articleRes.value || []
    if (factRes.status === 'fulfilled') facts.value = factRes.value?.data || factRes.value || []
  } catch (e) {
    console.error('Education data fetch failed:', e)
  } finally {
    isLoading.value = false
  }
})

/* ─── Facts slider ───────────────────────────────────────────────────────── */
const factSlideIndex = ref(0)
const prevFact = () => { factSlideIndex.value = (factSlideIndex.value - 1 + facts.value.length) % facts.value.length }
const nextFact = () => { factSlideIndex.value = (factSlideIndex.value + 1) % facts.value.length }

/* ─── 3M steps ───────────────────────────────────────────────────────────── */
const gerakanM = [
  {
    num: '1',
    title: 'Menguras',
    desc: 'Kuras dan bersihkan tempat penampungan air seperti bak mandi, ember, drum minimal seminggu sekali untuk memutus siklus perkembangbiakan jentik nyamuk.',
    icon: Droplet,
    color: '#4E63DA',
  },
  {
    num: '2',
    title: 'Menutup',
    desc: 'Tutup rapat semua tempat penampungan air agar nyamuk betina tidak bisa masuk dan bertelur. Gunakan penutup yang tidak memiliki celah.',
    icon: Archive,
    color: '#22C55E',
  },
  {
    num: '3',
    title: 'Mendaur Ulang',
    desc: 'Manfaatkan atau buang barang-barang bekas yang dapat menampung air hujan, seperti ban bekas, kaleng, botol plastik, dan pecahan kaca.',
    icon: Recycle,
    color: '#F59E0B',
  },
]

/* ─── Article hover ─────────────────────────────────────────────────────── */
const hoveredArticle = ref(null)

const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString('id-ID', { dateStyle: 'long' }) }
  catch { return d }
}

/* ─── Horizontal Scroll Controls ─────────────────────────────────────────── */
const mSliderContainer = ref(null)
const scrollLeft = () => {
  if (mSliderContainer.value) {
    mSliderContainer.value.scrollBy({ left: -300, behavior: 'smooth' })
  }
}
const scrollRight = () => {
  if (mSliderContainer.value) {
    mSliderContainer.value.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

/* ─── Quiz Flow ──────────────────────────────────────────────────────────── */
const showQuiz = ref(false)
const quizStep = ref(0)
const selectedOption = ref(null)
const quizQuestions = [
  {
    q: 'Apakah ada barang bekas (ban, kaleng, botol) di sekitar rumah yang bisa menampung air hujan?',
    options: [
      { id: 'A', text: 'Tidak ada sama sekali', color: '#95FE6D' },
      { id: 'B', text: 'Ada, tapi sudah ditutup/dibalik', color: '#F3F4F6' },
      { id: 'C', text: 'Ada dan masih terbuka', color: '#F3F4F6' },
    ]
  },
  {
    q: 'Berapa kali Anda menguras bak mandi dalam sebulan?',
    options: [
      { id: 'A', text: 'Lebih dari 4 kali (seminggu sekali)', color: '#95FE6D' },
      { id: 'B', text: '2-3 kali sebulan', color: '#F3F4F6' },
      { id: 'C', text: '1 kali atau jarang', color: '#F3F4F6' },
    ]
  }
]

const startQuiz = () => { showQuiz.value = true; quizStep.value = 0; selectedOption.value = null; }
const closeQuiz = () => { showQuiz.value = false; }
const nextQuizStep = () => {
  if (quizStep.value < quizQuestions.length - 1) {
    quizStep.value++
    selectedOption.value = null
  } else {
    alert('Kuis Selesai! Rumah Anda relatif aman, pertahankan.')
    closeQuiz()
  }
}
</script>

<template>
  <div class="pb-24">
    <!-- ─── Hero illustration (Lottie full-width) ─── -->
    <div class="hero-full-width relative overflow-hidden" style="height: 550px; border-radius: 0; background: var(--lj-blue-pale);">
      <div class="absolute inset-0 z-0 pointer-events-none">
        <Vue3Lottie
          animationLink="/illustrasi_edukasi.json"
          :loop="true"
          :autoplay="true"
          class="w-full h-full"
          :rendererSettings="{ preserveAspectRatio: 'xMidYMid slice' }"
        />
      </div>
      <!-- Sway wave bottom -->
      <div class="absolute left-0 w-full z-10 pointer-events-none" style="bottom: -2px; transform: translateY(1px);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block h-auto" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <!-- Page Title -->
      <div class="text-center animate-on-scroll">
        <div class="lj-section-label mb-3 mx-auto" style="width: fit-content;">PUSAT EDUKASI</div>
        <h1 class="lj-heading">Edukasi <span class="font-garamond" style="color: var(--lj-blue);">DBD &amp; Malaria</span></h1>
        <p class="text-sm mt-3 mx-auto" style="color: var(--lj-muted); max-width: 520px;">Pelajari cara mengenali, mencegah, dan melindungi keluargamu dari ancaman demam berdarah dan malaria.</p>
      </div>

      <!-- ─── Fakta DBD Slider ─── -->
      <section class="animate-on-scroll relative">
        <!-- Ambient glow blobs -->
        <div class="absolute top-10 -left-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-40 z-0" style="background:#95FE6D;"></div>
        <div class="absolute bottom-10 -right-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-40 z-0" style="background:#4E63DA;"></div>

        <div class="lj-section-label mb-8 mx-auto text-center relative z-10" style="width: fit-content; background: white;">FAKTA TERKAIT DBD</div>

        <div v-if="isLoading" class="lottie-placeholder flex-col relative z-10" style="height: 240px;">
          <Loader2 class="w-8 h-8 animate-spin text-[--lj-blue] mb-2" />
          <span class="text-sm font-semibold text-[--lj-blue]">Memuat fakta...</span>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <!-- Left Side: Lottie -->
            <div class="flex flex-col items-center justify-center">
                 <div class="text-center mb-4">
                     <h2 class="text-3xl font-bold" style="color: var(--lj-green-dk);">Tahukah <span style="color: var(--lj-navy);">Kamu...</span></h2>
                     <div class="inline-block mt-2 px-6 py-2 rounded-full shadow-sm" style="background: var(--lj-blue); color: white; font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.5rem;">apa itu DBD?</div>
                 </div>
                 <Vue3Lottie
                    animationLink="/illustrasi_edukasi_apaitudbdb.json"
                    :loop="true"
                    :autoplay="true"
                    class="w-full"
                    style="max-width: 350px;"
                    :rendererSettings="{ preserveAspectRatio: 'xMidYMid meet' }"
                  />
            </div>

            <!-- Right Side: Slidable Card -->
            <div class="relative">
                <div class="lj-card p-10 bg-white shadow-xl flex flex-col items-center justify-center text-center relative" style="min-height: 350px; border-radius: 24px; border-color: var(--lj-blue-pale);">
                   <!-- Icon instead of graphic -->
                   <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                     <BookOpen class="w-8 h-8" />
                   </div>
                   
                   <h3 class="relative z-10 text-2xl font-bold mb-4" style="color: var(--lj-navy);">Informasi Penting</h3>
                   <div class="relative z-10 text-4xl font-black mb-4" style="color: var(--lj-green-dk);">{{ facts[factSlideIndex]?.stat }}</div>
                   <p class="relative z-10 text-base leading-relaxed mx-auto font-medium" style="color: var(--lj-muted); max-width: 280px;">
                     {{ facts[factSlideIndex]?.statLabel }}
                   </p>

                   <!-- Dots -->
                   <div class="relative z-10 flex justify-center gap-2 mt-10">
                     <button
                       v-for="(_, i) in facts"
                       :key="i"
                       @click="factSlideIndex = i"
                       class="rounded-full transition-all"
                       :style="{ width: factSlideIndex === i ? '20px' : '8px', height: '8px', background: factSlideIndex === i ? 'var(--lj-blue)' : 'var(--lj-border)' }"
                     />
                   </div>
                </div>
                
                <!-- Navigation -->
                <button @click="prevFact" class="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20" style="border: 1px solid var(--lj-border);">
                  <ChevronLeft class="w-5 h-5" style="color: var(--lj-blue);" />
                </button>
                <button @click="nextFact" class="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20" style="border: 1px solid var(--lj-border);">
                  <ChevronRight class="w-5 h-5" style="color: var(--lj-blue);" />
                </button>
            </div>
        </div>
      </section>

      <!-- ─── Gerakan 3M ─── -->
      <section class="animate-on-scroll hero-full-width relative" style="padding-top: 140px; padding-bottom: 140px;">
        <!-- Background Lottie -->
        <div class="absolute z-0 pointer-events-none" style="overflow: hidden; top: 0; left: 0; right: 0; bottom: 0;">
          <Vue3Lottie
            animationLink="/illustrasi_landing_bg_faq.json"
            :loop="true"
            :autoplay="true"
            style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
            :rendererSettings="{ preserveAspectRatio: 'xMidYMid slice' }"
          />
        </div>
        
        <!-- Sway top (hadapbawah) -->
        <div class="absolute top-0 left-0 w-full z-10 pointer-events-none" style="transform: translateY(-2px); top: -1px;">
          <img src="/sway-hadapbawah.svg" alt="" aria-hidden="true" class="w-full block h-auto" />
        </div>
        
        <!-- Sway bottom (hadapatas) -->
        <div class="absolute left-0 w-full z-10 pointer-events-none" style="bottom: -2px; transform: translateY(1px);">
          <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block h-auto" />
        </div>

        <div class="max-w-6xl mx-auto px-4 relative z-20">
          <div class="lj-section-label mb-4 mx-auto text-center" style="width: fit-content; background: white;">PANDUAN GERAKAN 3M</div>
          <div class="text-center mb-10">
            <h2 class="lj-heading">Hanya dengan <span class="font-garamond" style="color: var(--lj-blue);">Tiga Langkah,</span></h2>
            <p class="text-base mt-1" style="color: var(--lj-green-dk); font-weight: 700; background: rgba(255,255,255,0.7); display: inline-block; padding: 2px 8px; border-radius: 8px;">satu rumah lebih aman.</p>
          </div>

          <!-- Slider Controls -->
          <button @click="scrollLeft" class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md items-center justify-center hover:scale-110 transition-transform z-20" style="border: 1px solid var(--lj-border);">
            <ChevronLeft class="w-5 h-5 text-[--lj-blue]" />
          </button>
          <button @click="scrollRight" class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md items-center justify-center hover:scale-110 transition-transform z-20" style="border: 1px solid var(--lj-border);">
            <ChevronRight class="w-5 h-5 text-[--lj-blue]" />
          </button>

          <div class="relative w-full">
            <!-- Wave SVG connector (absolute behind cards) -->
            <div class="hidden md:block absolute top-12 left-0 right-0 pointer-events-none z-0" style="height: 60px;">
              <svg viewBox="0 0 900 60" preserveAspectRatio="none" class="w-full h-full">
                <path d="M150 30 Q350 0 450 30 Q550 60 750 30" fill="none" stroke="var(--lj-blue)" stroke-width="2.5" stroke-dasharray="8 4"/>
              </svg>
            </div>

            <!-- Horizontal Scroll Container -->
            <div
              ref="mSliderContainer"
              class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-4 pt-2 px-2 relative z-10"
              style="scroll-behavior: smooth;"
            >
              <div
                v-for="(m, i) in gerakanM"
                :key="i"
                class="snap-center shrink-0 w-full sm:w-[320px] lj-card p-6 text-center space-y-4 animate-on-scroll bg-white/95 backdrop-blur-sm"
                :class="`delay-${(i + 1) * 100}`"
              >
                <!-- Lottie placeholder -->
                <div class="lottie-placeholder mx-auto flex-col" style="width: 100%; height: 140px; background: transparent; border: none; shadow: none;">
                  <component :is="m.icon" class="w-10 h-10 mb-2" :style="{ color: m.color }" />
                  <span class="text-xs font-semibold" :style="{ color: m.color }">Lottie: Gerakan {{ m.title }}</span>
                </div>

                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm mx-auto"
                  :style="{ background: m.color }"
                >
                  {{ m.num }}
                </div>
                <h3 class="text-lg font-bold" :style="{ color: m.color }">{{ m.title }}</h3>
                <p class="text-xs leading-relaxed" style="color: var(--lj-muted);">{{ m.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Artikel DBD ─── -->
      <section class="animate-on-scroll">
        <div class="lj-section-label mb-4 mx-auto text-center" style="width: fit-content;">ARTIKEL TERKAIT DBD</div>
        <div class="text-center mb-10">
          <h2 class="lj-heading">
            Kabar <span class="font-garamond" style="color: var(--lj-blue);">terkini,</span>
          </h2>
          <p class="text-base font-bold mt-1" style="color: var(--lj-green-dk);">bukan info basi.</p>
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="lottie-placeholder flex-col" style="height: 200px;">
            <Loader2 class="w-8 h-8 animate-spin text-[--lj-blue]" />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="art in articles"
            :key="art.id"
            class="lj-card overflow-hidden relative group cursor-pointer"
            @mouseenter="hoveredArticle = art.id"
            @mouseleave="hoveredArticle = null"
          >
            <!-- Thumbnail / Lottie -->
            <div class="lottie-placeholder" style="height: 140px; border-radius: 0;">
              <Newspaper class="w-10 h-10 text-[--lj-blue-lt]" />
            </div>

            <div class="p-5 space-y-3">
              <span
                class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                style="background: var(--lj-blue-pale); color: var(--lj-blue);"
              >
                {{ art.tipe || 'Artikel' }}
              </span>
              <h3 class="text-sm font-bold leading-snug" style="color: var(--lj-navy);">{{ art.judul }}</h3>
              <div class="flex items-center justify-between text-xs" style="color: var(--lj-muted);">
                <span>{{ art.sumber || 'LensaJentik' }}</span>
                <span>{{ formatDate(art.created_at) }}</span>
              </div>
            </div>

            <!-- Hover overlay with Read button -->
            <Transition name="fade">
              <div
                v-if="hoveredArticle === art.id"
                class="absolute inset-0 flex items-center justify-center"
                style="background: rgba(78,99,218,0.88);"
              >
                <RouterLink
                  :to="`/edukasi/artikel/${art.slug || art.id}`"
                  class="lj-btn-green text-sm px-6 py-3"
                >
                  <BookOpen class="w-4 h-4" /> Baca Artikel
                </RouterLink>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Slider dots placeholder -->
        <div class="flex justify-center gap-2 mt-6">
          <span v-for="i in 3" :key="i" class="w-2 h-2 rounded-full" :style="{ background: i === 1 ? 'var(--lj-blue)' : 'var(--lj-border)' }" />
        </div>
      </section>

      <!-- ─── Kalkulator Risiko DBD ─── -->
      <section class="animate-on-scroll">
        <div class="lj-section-label mb-4 mx-auto text-center" style="width: fit-content;">KALKULATOR RISIKO DBD</div>

        <div
          class="lj-card p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden"
          style="background: linear-gradient(135deg, var(--lj-blue-pale) 0%, white 100%);"
        >
          <!-- Decorative Blobs -->
          <div class="blob-bg w-64 h-64 top-[-50px] right-[-50px]" style="background: var(--lj-green);"></div>

          <!-- Text -->
          <div class="space-y-5 relative z-10">
            <h2 class="text-2xl sm:text-4xl font-bold leading-tight" style="color: var(--lj-navy);">
              Cek <span class="font-garamond text-white highlight-blue" style="font-size: 1.05em;">Risikonya</span>,<br>
              sebelum jadi korbannya.
            </h2>
            <p class="text-sm leading-relaxed" style="color: var(--lj-muted);">
              Jawab beberapa pertanyaan singkat soal kondisi rumah dan lingkunganmu — hasilnya langsung kelihatan, lengkap sama saran yang bisa langsung kamu praktikkan.
            </p>
            <button @click="startQuiz" class="lj-btn-primary px-8 shadow-lg">
               Mulai Kuis
            </button>
          </div>

          <!-- Illustration (Lottie) -->
          <div class="relative z-10 overflow-hidden" style="height: 280px; border-radius: 24px;">
            <Vue3Lottie
              animationLink="/illustrasi_edukasi_kalkulator.json"
              :loop="true"
              :autoplay="true"
              class="w-full h-full"
              :rendererSettings="{ preserveAspectRatio: 'xMidYMid meet' }"
            />
          </div>
        </div>
      </section>

      <!-- ─── Quiz Modal ─── -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showQuiz" class="fixed inset-0 z-[200] flex items-center justify-center p-4" style="background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);">
            <div class="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-[0_20px_60px_rgba(78,99,218,0.15)] border relative" style="border-color: var(--lj-border);">
              
              <!-- Header Modal -->
              <div class="flex items-center justify-between mb-8">
                <button @click="closeQuiz" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full">
                  <ChevronLeft class="w-6 h-6" style="color: var(--lj-navy);" />
                </button>
                <div class="lj-section-label" style="background: white;">KALKULATOR RISIKO DBD</div>
                <div class="w-10 h-10"></div> <!-- spacer -->
              </div>

              <!-- Question Container -->
              <div class="relative bg-white rounded-3xl p-8 text-center shadow-lg border" style="border-color: var(--lj-border); z-index: 10;">
                <div class="absolute -top-6 -left-6 blob-bg w-32 h-32" style="background: var(--lj-blue); filter: blur(40px);"></div>
                <div class="absolute -bottom-6 -right-6 blob-bg w-32 h-32" style="background: var(--lj-green); filter: blur(40px);"></div>
                
                <h3 class="text-lg font-bold leading-relaxed relative z-10" style="color: var(--lj-navy);">
                  {{ quizQuestions[quizStep].q }}
                </h3>
              </div>

              <!-- Progress Dots -->
              <div class="flex justify-center gap-2 mt-8 mb-4 relative z-10">
                <div v-for="(_, i) in quizQuestions.length" :key="i" 
                     class="h-1.5 rounded-full transition-all"
                     :style="{ width: quizStep === i ? '24px' : '16px', background: quizStep >= i ? 'var(--lj-blue)' : '#E5E7EB' }">
                </div>
              </div>
              <div class="text-center text-xs font-bold mb-8" style="color: var(--lj-muted);">
                Pertanyaan {{ quizStep + 1 }}/{{ quizQuestions.length }}
              </div>

              <!-- Options -->
              <div class="space-y-3 relative z-10">
                <button
                  v-for="opt in quizQuestions[quizStep].options"
                  :key="opt.id"
                  @click="selectedOption = opt.id"
                  class="w-full flex items-center p-4 rounded-2xl transition-all border-2"
                  :style="selectedOption === opt.id 
                    ? `background: ${opt.color}; border-color: ${opt.color};` 
                    : `background: white; border-color: #F3F4F6; hover: border-gray-300;`"
                >
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-4"
                       :style="selectedOption === opt.id ? 'background: rgba(0,0,0,0.1); color: var(--lj-navy);' : 'background: var(--lj-blue); color: white;'">
                    {{ opt.id }}
                  </div>
                  <span class="text-sm font-bold text-left" style="color: var(--lj-navy);">{{ opt.text }}</span>
                </button>
              </div>

              <div class="mt-8 flex justify-end relative z-10">
                <button
                  @click="nextQuizStep"
                  :disabled="!selectedOption"
                  class="lj-btn-primary px-8 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>

            </div>
          </div>
        </Transition>
      </Teleport>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
