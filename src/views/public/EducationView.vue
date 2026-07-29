<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChevronLeft, ChevronRight, BookOpen, Calculator,
  Home, Droplet, Archive, Recycle, Loader2, Newspaper
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

  // Fallback demo facts
  if (facts.value.length === 0) {
    facts.value = [
      { id: 1, judul: 'Tahukah Kamu... apa itu DBD?', isi: 'DBD (Demam Berdarah Dengue) adalah penyakit infeksi yang disebabkan oleh virus Dengue, ditularkan oleh gigitan nyamuk Aedes aegypti betina yang telah terinfeksi.', stat: '244.409', statLabel: 'Jumlah kasus DBD di Indonesia sepanjang 2024, nilai tertinggi dalam pencatatan.' },
      { id: 2, judul: 'Tahukah Kamu... siklus nyamuk?', isi: 'Nyamuk Aedes aegypti bisa bertelur hingga 300 butir sekaligus di air bersih yang tidak mengalir. Telur bisa bertahan hingga 1 tahun dalam kondisi kering.', stat: '300 Telur', statLabel: 'Jumlah telur yang bisa dihasilkan nyamuk betina setiap kali bertelur.' },
      { id: 3, judul: 'Tahukah Kamu... waktu aktif nyamuk?', isi: 'Berbeda dengan nyamuk malaria yang aktif malam hari, nyamuk Aedes aegypti paling aktif pada pagi (08.00–10.00) dan sore hari (16.00–18.00).', stat: '2 kali/hari', statLabel: 'Puncak aktivitas menggigit nyamuk Aedes aegypti per hari.' },
    ]
  }

  // Fallback demo articles
  if (articles.value.length === 0) {
    articles.value = [
      { id: 1, slug: 'dbd-2025-menurun', tipe: 'artikel', judul: 'Kasus DBD 2025 Menurun, Tapi Kemenkes Minta Warga Tetap Waspada', sumber: 'Kompas.id', created_at: '2025-06-15', thumbnail: null },
      { id: 2, slug: 'kenapa-nyamuk-menggigit', tipe: 'artikel', judul: 'Kenapa Nyamuk Selalu Menggigit Orang Tertentu? Ini Penjelasannya', sumber: 'Alodokter', created_at: '2025-05-22', thumbnail: null },
      { id: 3, slug: '3m-plus-cara-benar', tipe: 'panduan', judul: 'Gerakan 3M Plus: Cara yang Benar Mencegah Sarang Nyamuk di Rumah', sumber: 'Dinkes RI', created_at: '2025-04-10', thumbnail: null },
    ]
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
</script>

<template>
  <div>
    <!-- ─── Hero illustration (Lottie placeholder) ─── -->
    <div class="lottie-placeholder" style="height: 200px; border-radius: 0;">
      <Home class="w-12 h-12 mb-2 mx-auto text-[--lj-blue]" />
      <span class="font-semibold" style="color: var(--lj-blue);">Lottie: Ilustrasi Rumah & Edukasi DBD</span>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">

      <!-- ─── Fakta DBD Slider ─── -->
      <section class="animate-on-scroll">
        <div class="lj-section-label mb-8 mx-auto" style="width: fit-content;">FAKTA TERKAIT DBD</div>

        <div v-if="isLoading" class="lottie-placeholder flex-col" style="height: 240px;">
          <Loader2 class="w-8 h-8 animate-spin text-[--lj-blue] mb-2" />
          <span class="text-sm font-semibold text-[--lj-blue]">Memuat fakta...</span>
        </div>

        <div v-else class="relative">
          <div
            class="lj-card overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0"
            style="border-color: var(--lj-blue);"
          >
            <!-- Text -->
            <div class="p-8 space-y-4">
              <h3 class="text-xl font-bold" style="color: var(--lj-navy);">{{ facts[factSlideIndex]?.judul }}</h3>
              <p class="text-sm leading-relaxed" style="color: var(--lj-muted);">{{ facts[factSlideIndex]?.isi }}</p>
            </div>

            <!-- Stat side -->
            <div class="flex flex-col items-center justify-center p-8" style="background: var(--lj-blue-pale);">
              <div class="text-4xl font-black" style="color: var(--lj-blue);">{{ facts[factSlideIndex]?.stat }}</div>
              <p class="text-xs text-center mt-2 leading-relaxed" style="color: var(--lj-muted); max-width: 200px;">
                {{ facts[factSlideIndex]?.statLabel }}
              </p>
            </div>
          </div>

          <!-- Navigation -->
          <button @click="prevFact" class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10" style="border: 1px solid var(--lj-border);">
            <ChevronLeft class="w-5 h-5" style="color: var(--lj-blue);" />
          </button>
          <button @click="nextFact" class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10" style="border: 1px solid var(--lj-border);">
            <ChevronRight class="w-5 h-5" style="color: var(--lj-blue);" />
          </button>

          <!-- Dots -->
          <div class="flex justify-center gap-2 mt-4">
            <button
              v-for="(_, i) in facts"
              :key="i"
              @click="factSlideIndex = i"
              class="rounded-full transition-all"
              :style="{ width: factSlideIndex === i ? '20px' : '8px', height: '8px', background: factSlideIndex === i ? 'var(--lj-blue)' : 'var(--lj-border)' }"
            />
          </div>
        </div>
      </section>

      <!-- ─── Gerakan 3M ─── -->
      <section class="animate-on-scroll relative">
        <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">PANDUAN GERAKAN 3M</div>
        <div class="text-center mb-10">
          <h2 class="lj-heading">Hanya dengan <span class="font-garamond" style="color: var(--lj-blue);">Tiga Langkah,</span></h2>
          <p class="text-base mt-1" style="color: var(--lj-green-dk); font-weight: 700;">satu rumah lebih aman.</p>
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
              class="snap-center shrink-0 w-full sm:w-[320px] lj-card p-6 text-center space-y-4 animate-on-scroll"
              :class="`delay-${(i + 1) * 100}`"
            >
              <!-- Lottie placeholder -->
              <div class="lottie-placeholder mx-auto flex-col" style="width: 100%; height: 140px;">
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
      </section>

      <!-- ─── Artikel DBD ─── -->
      <section class="animate-on-scroll">
        <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">ARTIKEL TERKAIT DBD</div>
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
        <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">KALKULATOR RISIKO DBD</div>

        <div
          class="lj-card p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          style="background: linear-gradient(135deg, var(--lj-blue-pale) 0%, white 100%);"
        >
          <!-- Text -->
          <div class="space-y-4">
            <h2 class="text-2xl sm:text-3xl font-bold leading-tight" style="color: var(--lj-navy);">
              Cek <span class="font-garamond" style="color: var(--risk-high);">Risikonya</span><br>
              sebelum jadi korbannya.
            </h2>
            <p class="text-sm leading-relaxed" style="color: var(--lj-muted);">
              Jawab beberapa pertanyaan singkat tentang kondisi rumah dan lingkunganmu.
              Kalkulator kami akan memberikan gambaran seberapa rentan rumahmu terhadap perkembangbiakan jentik nyamuk.
            </p>
            <RouterLink to="/edukasi/kuis" class="lj-btn-primary">
              <Calculator class="w-4 h-4" /> Mulai
            </RouterLink>
          </div>

          <!-- Illustration (Lottie placeholder) -->
          <div class="lottie-placeholder flex-col" style="height: 220px;">
            <Calculator class="w-12 h-12 mb-2 text-[--lj-blue]" />
            <span class="text-xs font-semibold text-[--lj-blue]">Lottie: Kalkulator Risiko</span>
          </div>
        </div>
      </section>

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
