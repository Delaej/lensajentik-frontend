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

const defaultFacts = [
  { stat: 'Aedes aegypti', statLabel: 'Nyamuk penular DBD aktif menggigit pada pagi (09.00-10.00) dan sore hari (16.00-17.00).' },
  { stat: 'Fase Pelana Kuda', statLabel: 'Gejala khas DBD berupa demam tinggi, lalu suhu turun (fase kritis), kemudian naik lagi.' },
  { stat: 'Suka Air Bersih', statLabel: 'Nyamuk DBD bertelur di genangan air bersih, bukan di air kotor atau selokan yang bersentuhan langsung dengan tanah.' },
  { stat: 'Pencegahan Utama', statLabel: 'Pencegahan paling efektif bukan dengan fogging, melainkan memutus siklus hidup nyamuk (3M Plus).' },
  { stat: 'Risiko Fatal', statLabel: 'Keterlambatan penanganan pada fase kritis dapat menyebabkan syok hingga kematian akibat kebocoran plasma darah.' }
]

const defaultArticles = [
  {
    id: 'ext-1',
    tipe: 'Berita',
    judul: 'Kasus DBD Jakarta Barat Tembus 1.538 Kasus Hingga Juli 2026',
    sumber: 'Times Indonesia',
    created_at: '2026-07-26',
    thumbnail: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/news-thumbnail/2026/07/31/kasus-dbd-jakarta-barat-tembus-1538-kasus-hingga-juli-2026-thumbnail-suiiihlp.webp',
    external_url: 'https://timesindonesia.co.id/kesehatan/601703/kasus-dbd-jakarta-barat-tembus-1538-kasus-hingga-juli-2026'
  },
  {
    id: 'ext-2',
    tipe: 'Berita',
    judul: 'Awal 2026, Sudis Kesehatan Jakbar Catat DBD Menurun',
    sumber: 'Jakarta Barat',
    created_at: '2026-01-29',
    thumbnail: 'https://barat.jakarta.go.id/storage/images/berita/thumbnail/4b65475d10f16badd42f3e4bd89308ed-thumbnail.jpeg',
    external_url: 'https://barat.jakarta.go.id/berita/awal-2026-sudis-kesehatan-jakbar-catat-dbd-menurun'
  },
  {
    id: 'ext-3',
    tipe: 'Artikel',
    judul: 'Kewaspadaan Masyarakat Perlu Ditingkatkan: Dengue dan ISPA Meningkat pada Minggu ke-7',
    sumber: 'Puskesmas Kuta 1',
    created_at: '2026-03-07',
    thumbnail: 'https://puskesmaskuta1.badungkab.go.id/storage/puskesmaskuta1/image/whatsapp-image-2026-03-07-at-090357-20260307101957-OcpBm.jpeg',
    external_url: 'https://puskesmaskuta1.badungkab.go.id/artikel/69755-kewaspadaan-masyarakat-perlu-ditingkatkan-dengue-dan-ispa-meningkat-pada-minggu-ke-7-tahun-2026'
  }
]

// Pre-fill immediately with defaults so UI renders instantly
facts.value = defaultFacts
articles.value = defaultArticles
isLoading.value = false

onMounted(async () => {
  // Silently try to load from backend in background
  try {
    const [articleRes, factRes] = await Promise.allSettled([
      educationService.fetchArticles({ tipe: 'artikel' }),
      educationService.fetchArticles({ tipe: 'fakta' }),
    ])
    
    const fetchedArticles = articleRes.status === 'fulfilled' ? (articleRes.value?.data || articleRes.value || []) : []
    if (fetchedArticles.length > 0) articles.value = fetchedArticles
    
    const fetchedFacts = factRes.status === 'fulfilled' ? (factRes.value?.data || factRes.value || []) : []
    if (fetchedFacts.length > 0) facts.value = fetchedFacts
  } catch (e) {
    // Default data already shown, no action needed
    console.error('Background fetch failed, using defaults:', e)
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
const showResult = ref(false)
const quizStep = ref(0)
const selectedOption = ref(null)
const userAnswers = ref([])

const quizQuestions = [
  {
    q: 'Apakah ada barang bekas (ban, kaleng, botol) di sekitar rumah yang bisa menampung air hujan?',
    options: [
      { id: 'A', text: 'Tidak ada sama sekali', score: 0 },
      { id: 'B', text: 'Ada, tapi sudah ditutup/dibalik', score: 1 },
      { id: 'C', text: 'Ada dan masih terbuka', score: 2 },
    ]
  },
  {
    q: 'Berapa kali Anda menguras bak mandi atau tempat penampungan air lainnya?',
    options: [
      { id: 'A', text: 'Minimal seminggu sekali', score: 0 },
      { id: 'B', text: '2-3 kali sebulan', score: 1 },
      { id: 'C', text: '1 kali sebulan atau jarang', score: 2 },
    ]
  },
  {
    q: 'Apakah Anda menggunakan kelambu atau anti nyamuk (oles/bakar/elektrik) saat tidur?',
    options: [
      { id: 'A', text: 'Ya, rutin digunakan', score: 0 },
      { id: 'B', text: 'Kadang-kadang saja', score: 1 },
      { id: 'C', text: 'Tidak pernah', score: 2 },
    ]
  },
  {
    q: 'Apakah ada keluarga atau tetangga di sekitar rumah yang terkena DBD dalam 1 bulan terakhir?',
    options: [
      { id: 'A', text: 'Tidak ada', score: 0 },
      { id: 'B', text: 'Ada tetangga beda RT', score: 1 },
      { id: 'C', text: 'Ada keluarga / tetangga sebelah rumah', score: 2 },
    ]
  },
  {
    q: 'Bagaimana kondisi pencahayaan dan sirkulasi udara di dalam rumah Anda?',
    options: [
      { id: 'A', text: 'Terang dan sirkulasi udara lancar', score: 0 },
      { id: 'B', text: 'Agak redup', score: 1 },
      { id: 'C', text: 'Gelap, lembap, dan kurang ventilasi', score: 2 },
    ]
  }
]

const startQuiz = () => { 
  showQuiz.value = true
  showResult.value = false
  quizStep.value = 0
  selectedOption.value = null
  userAnswers.value = []
}
const closeQuiz = () => { 
  showQuiz.value = false
  showResult.value = false 
}

const quizResult = ref({ score: 0, title: '', desc: '', color: '', bg: '' })

const nextQuizStep = () => {
  if (!selectedOption.value) return;
  
  const opt = quizQuestions[quizStep.value].options.find(o => o.id === selectedOption.value)
  userAnswers.value.push(opt.score)

  if (quizStep.value < quizQuestions.length - 1) {
    quizStep.value++
    selectedOption.value = null
  } else {
    // Kuis Selesai -> Hitung Skor
    const total = userAnswers.value.reduce((a, b) => a + b, 0)
    quizResult.value.score = total;
    
    if (total <= 3) {
      quizResult.value.title = 'Risiko Rendah'
      quizResult.value.desc = 'Hebat! Pertahankan kebiasaan baik Anda. Lingkungan rumah Anda saat ini relatif aman dari tempat perkembangbiakan nyamuk.'
      quizResult.value.color = '#15803d' // green-700
      quizResult.value.bg = '#dcfce7' // green-100
    } else if (total <= 7) {
      quizResult.value.title = 'Risiko Sedang'
      quizResult.value.desc = 'Masih ada beberapa celah yang bisa menjadi sarang nyamuk. Yuk mulai rutinkan gerakan 3M Plus untuk pencegahan!'
      quizResult.value.color = '#b45309' // amber-700
      quizResult.value.bg = '#fef3c7' // amber-100
    } else {
      quizResult.value.title = 'Risiko Tinggi'
      quizResult.value.desc = 'Waspada! Lingkungan Anda sangat berisiko menjadi sarang nyamuk DBD. Segera lakukan pemberantasan sarang nyamuk (PSN) secara menyeluruh!'
      quizResult.value.color = '#be123c' // rose-700
      quizResult.value.bg = '#ffe4e6' // rose-100
    }
    
    showResult.value = true;
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

        <div class="flex justify-center w-full"><div class="lj-section-label mb-8 text-center relative z-10" style="width: fit-content; background: white;">FAKTA TERKAIT DBD</div></div>

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
            <div class="relative h-[420px]">
                <div class="lj-card p-10 bg-white shadow-xl flex flex-col items-center text-center relative w-full h-full" style="border-radius: 24px; border-color: var(--lj-blue-pale);">
                   <!-- Icon instead of graphic -->
                   <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6 shrink-0 mt-4" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
                     <BookOpen class="w-8 h-8" />
                   </div>
                   
                   <h3 class="relative z-10 text-2xl font-bold mb-4 shrink-0" style="color: var(--lj-navy);">Informasi Penting</h3>
                   <div class="relative z-10 text-3xl font-black mb-4 shrink-0 px-4 leading-tight" style="color: var(--lj-blue); min-height: 70px; display: flex; align-items: center; justify-content: center;">
                     {{ facts[factSlideIndex]?.stat }}
                   </div>
                   
                   <p class="relative z-10 text-sm leading-relaxed mx-auto font-medium w-full px-2" style="color: var(--lj-muted); max-width: 320px;">
                     {{ facts[factSlideIndex]?.statLabel }}
                   </p>

                   <!-- Spacer to push dots to bottom -->
                   <div class="flex-grow"></div>

                   <!-- Dots -->
                   <div class="relative z-10 flex justify-center gap-2 mb-2 shrink-0">
                     <button
                       v-for="(_, i) in facts"
                       :key="i"
                       @click="factSlideIndex = i"
                       class="rounded-full transition-all"
                       :style="{ width: factSlideIndex === i ? '24px' : '8px', height: '8px', background: factSlideIndex === i ? 'var(--lj-blue)' : 'var(--lj-border)' }"
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
        
        <!-- Sway top -->
        <div class="absolute top-0 left-0 w-full z-10 pointer-events-none" style="top: -2px; transform: rotate(180deg);">
          <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block h-auto" />
        </div>
        
        <!-- Sway bottom (hadapatas) -->
        <div class="absolute left-0 w-full z-10 pointer-events-none" style="bottom: -2px; transform: translateY(1px);">
          <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block h-auto" />
        </div>

        <div class="max-w-6xl mx-auto px-4 relative z-20">
          <div class="flex justify-center w-full"><div class="lj-section-label mb-4 text-center" style="width: fit-content; background: white;">PANDUAN GERAKAN 3M</div></div>
          <div class="text-center mb-10">
            <h2 class="lj-heading">Hanya dengan <span class="font-garamond" style="color: var(--lj-blue);">Tiga Langkah,</span></h2>
            <p class="text-base mt-1" style="color: var(--lj-green-dk); font-weight: 700; background: rgba(255,255,255,0.7); display: inline-block; padding: 2px 8px; border-radius: 8px;">satu rumah lebih aman.</p>
          </div>

          <!-- Slider Controls removed -->

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
              class="flex md:justify-center overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-4 pt-2 px-2 relative z-10"
              style="scroll-behavior: smooth;"
            >
              <div
                v-for="(m, i) in gerakanM"
                :key="i"
                class="snap-center shrink-0 w-full sm:w-[320px] lj-card p-6 text-center space-y-4 animate-on-scroll bg-white/95 backdrop-blur-sm"
                :class="`delay-${(i + 1) * 100}`"
              >
                <!-- Icon Container -->
                <div class="flex items-center justify-center" style="width: 100%; height: 140px;">
                  <div class="mx-auto flex items-center justify-center" style="width: 80px; height: 80px; border-radius: 24px; background: var(--lj-blue-pale);">
                    <component :is="m.icon" class="w-10 h-10" :style="{ color: m.color }" />
                  </div>
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
        <div class="flex justify-center w-full"><div class="lj-section-label mb-4 text-center" style="width: fit-content;">ARTIKEL TERKAIT DBD</div></div>
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
            <!-- Thumbnail -->
            <div class="overflow-hidden" style="height: 160px; border-radius: 0;">
              <img
                v-if="art.thumbnail"
                :src="art.thumbnail"
                :alt="art.judul"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
                style="background: var(--lj-blue-pale);"
              >
                <Newspaper class="w-10 h-10 text-[--lj-blue-lt]" />
              </div>
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
                <!-- All links go to internal preview first -->
                <RouterLink
                  :to="`/edukasi/artikel/${art.slug || art.id}`"
                  class="lj-btn-green text-sm px-6 py-3 flex items-center gap-2"
                >
                  <BookOpen class="w-4 h-4" /> Baca Artikel
                </RouterLink>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- ─── Kalkulator Risiko DBD ─── -->
      <section class="animate-on-scroll">
        <div class="flex justify-center w-full"><div class="lj-section-label mb-4 text-center" style="width: fit-content;">KALKULATOR RISIKO DBD</div></div>

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
              
              <!-- QUESTION VIEW -->
              <div v-if="!showResult">
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
                    class="w-full flex items-center p-4 rounded-2xl transition-all border-2 text-left"
                    :style="selectedOption === opt.id 
                      ? `background: #EFF6FF; border-color: #3B82F6;` 
                      : `background: white; border-color: #F3F4F6;`"
                    :class="selectedOption !== opt.id ? 'hover:border-gray-300' : ''"
                  >
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-4 transition-colors"
                         :style="selectedOption === opt.id ? 'background: #3B82F6; color: white;' : 'background: #E5E7EB; color: #4B5563;'">
                      {{ opt.id }}
                    </div>
                    <span class="text-sm font-bold" :style="selectedOption === opt.id ? 'color: #1E3A8A;' : 'color: var(--lj-navy);'">{{ opt.text }}</span>
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

              <!-- RESULT VIEW -->
              <div v-else class="text-center py-6 animate-in fade-in zoom-in duration-300">
                <div class="flex justify-center mb-6">
                  <div class="w-24 h-24 rounded-full flex items-center justify-center shadow-inner" :style="`background: ${quizResult.bg}; color: ${quizResult.color}; border: 4px solid white; box-shadow: 0 10px 25px -5px ${quizResult.bg};`">
                    <span class="text-4xl font-black">{{ quizResult.score }}</span>
                    <span class="text-sm font-bold mt-3 opacity-70">/10</span>
                  </div>
                </div>
                
                <h2 class="text-2xl font-black mb-3" :style="`color: ${quizResult.color};`">{{ quizResult.title }}</h2>
                <p class="text-sm font-medium mb-10 leading-relaxed max-w-sm mx-auto" style="color: var(--lj-muted);">
                  {{ quizResult.desc }}
                </p>
                
                <button @click="closeQuiz" class="lj-btn-primary w-full shadow-lg hover:shadow-xl transition-shadow text-base py-4">
                  Selesai & Tutup
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
