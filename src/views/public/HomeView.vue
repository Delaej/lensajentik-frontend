<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X,
  Bug, Map as MapIcon, Camera, BookOpen, PartyPopper,
  BarChart2, Globe, Building2, TrendingUp
} from 'lucide-vue-next'

/* ─── Onboarding ─────────────────────────────────────────────────────────── */
const showOnboarding = ref(false)
const onboardingStep = ref(0)

const onboardingSteps = [
  {
    title: 'Selamat datang di LensaJentik!',
    body: 'Platform pemetaan risiko DBD & Malaria berbasis Web-GIS. Kami menggabungkan data cuaca, kader kesehatan, dan laporan warga untuk membantu komunitas Anda tetap aman.',
    target: null,
  },
  {
    title: 'Peta Risiko Interaktif',
    body: 'Lihat peta risiko wilayahmu secara real-time. Kode warna hijau (aman), kuning (waspada), merah (berbahaya) menunjukkan tingkat risiko penyebaran jentik nyamuk.',
    target: '[data-onboard="peta"]',
  },
  {
    title: 'Lapor Genangan Air',
    body: 'Temukan genangan air di sekitarmu? Foto dan laporkan! Setiap laporan membantu kader dan mendapat poin reward.',
    target: '[data-onboard="laporan"]',
  },
  {
    title: 'Edukasi & Kalkulator Risiko',
    body: 'Pelajari cara mencegah DBD dan hitung risiko lingkungan rumahmu melalui kuis singkat kami.',
    target: '[data-onboard="edukasi"]',
  },
  {
    title: 'Kamu siap!',
    body: 'Tombol ? di navbar bisa kamu klik kapan saja untuk mengulang panduan ini. Yuk mulai eksplorasi!',
    target: null,
  },
]

const getOnboardingIcon = (step) => {
  return [Bug, MapIcon, Camera, BookOpen, PartyPopper][step]
}

const closeOnboarding = () => { showOnboarding.value = false }
const nextStep = () => {
  if (onboardingStep.value < onboardingSteps.length - 1) onboardingStep.value++
  else closeOnboarding()
}
const prevStep = () => { if (onboardingStep.value > 0) onboardingStep.value-- }

onMounted(() => {
  const hasVisited = localStorage.getItem('lj_onboarded_v2')
  if (!hasVisited) {
    setTimeout(() => {
      showOnboarding.value = true
      localStorage.setItem('lj_onboarded_v2', 'true')
    }, 800)
  }
})

/* ─── Feature Slider ─────────────────────────────────────────────────────── */
const featureSliderIndex = ref(0)
const features = [
  {
    label: 'Peta Risiko',
    heading: 'Satu Peta,\nSemua Level Risiko.',
    body: 'Visualisasi zona risiko DBD & Malaria secara real-time berdasarkan data cuaca, ABJ kader, dan laporan warga. Kode warna: hijau rendah, kuning sedang, merah tinggi.',
    cta: 'Lihat Peta Sekarang',
    ctaPath: '/peta-resiko',
    bg: '#EEF1FD',
    accent: '#4E63DA',
    icon: MapIcon
  },
  {
    label: 'Laporan Warga',
    heading: 'Laporkan Genangan,\nBantu Sesama.',
    body: 'Foto dan laporkan genangan air berbahaya di sekitar rumahmu. Setiap laporan mendapat poin reward dan langsung diteruskan ke kader kesehatan terdekat.',
    cta: 'Laporkan Genangan',
    ctaPath: '/laporan',
    bg: '#F0FDF4',
    accent: '#22C55E',
    icon: Camera
  },
  {
    label: 'Edukasi',
    heading: 'Pelajari DBD,\nMulai dari Rumah.',
    body: 'Artikel, panduan 3M Plus, dan kalkulator risiko personal untuk membantu kamu memahami dan mencegah DBD sejak dini di lingkungan sendiri.',
    cta: 'Pelajari Sekarang',
    ctaPath: '/edukasi',
    bg: '#FFFBEB',
    accent: '#F59E0B',
    icon: BookOpen
  },
  {
    label: 'Statistik',
    heading: 'Data Transparan\nuntuk Semua.',
    body: 'Dashboard statistik ABJ dan tren kasus DBD seluruh wilayah, dapat diakses publik tanpa login. Ekspor data dalam format PDF untuk keperluan resmi.',
    cta: 'Lihat Statistik',
    ctaPath: '/statistik',
    bg: '#FDF2F8',
    accent: '#A855F7',
    icon: BarChart2
  },
]

const prevFeature = () => {
  featureSliderIndex.value = (featureSliderIndex.value - 1 + features.length) % features.length
}
const nextFeature = () => {
  featureSliderIndex.value = (featureSliderIndex.value + 1) % features.length
}

/* ─── Cara Kerja ────────────────────────────────────────────────────────── */
const activeStep = ref(0)
const steps = [
  {
    icon: MapIcon,
    title: 'Buka Peta Risiko',
    desc: 'Akses peta interaktif Web-GIS yang menampilkan zona risiko DBD & Malaria berdasarkan data cuaca real-time, ABJ dari kader, dan laporan warga di seluruh wilayah.',
    detail: 'Peta diperbarui otomatis setiap hari menggunakan data Open-Meteo dan laporan lapangan kader kesehatan.',
  },
  {
    icon: Camera,
    title: 'Laporkan Genangan',
    desc: 'Foto genangan air di sekitarmu, tandai lokasi dengan GPS, tulis deskripsi singkat, dan kirim laporan dalam 2 menit.',
    detail: 'Laporan langsung masuk ke sistem kader wilayah yang bertugas. Kamu mendapat poin reward setiap laporan terkirim.',
  },
  {
    icon: Bug,
    title: 'Subscribe Wilayah',
    desc: 'Pantau wilayah yang kamu pedulikan: rumah, sekolah anak, atau tempat kerja. Dapatkan notifikasi saat ada kenaikan risiko.',
    detail: 'Semakin aktif melapor, semakin banyak kuota wilayah yang bisa kamu pantau sekaligus.',
  },
  {
    icon: TrendingUp,
    title: 'Lihat Perkembangan',
    desc: 'Pantau statistik ABJ, tren kasus, dan dampak partisipasi warga di halaman Statistik publik tanpa perlu login.',
    detail: 'Data diperbarui setiap kali kader kesehatan melakukan input ABJ di lapangan.',
  },
]

/* ─── FAQ Accordion ──────────────────────────────────────────────────────── */
const activeFaq = ref(null)
const faqs = [
  {
    q: 'Apakah saya perlu daftar akun untuk melihat peta risiko?',
    a: 'Tidak perlu! Seluruh fitur publik LensaJentik — termasuk peta risiko, statistik, edukasi, dan laporan warga — dapat diakses langsung tanpa login atau pendaftaran akun.',
  },
  {
    q: 'Apa yang terjadi setelah saya mengirim laporan genangan?',
    a: 'Laporan Anda langsung diteruskan ke kader kesehatan wilayah setempat. Anda mendapat +50 poin reward, dan dapat berbagi bukti kontribusi ke Instagram Story atau WhatsApp Status.',
  },
  {
    q: 'Bagaimana cara melihat tingkat risiko wilayah saya?',
    a: 'Buka halaman Peta Risiko, ketik nama kecamatan atau kelurahan di kolom pencarian. Peta akan menampilkan kode warna risiko (hijau/kuning/merah) beserta prediksi tren 7–14 hari ke depan.',
  },
  {
    q: 'Apa itu "Subscribe Wilayah" dan apa manfaatnya?',
    a: 'Subscribe Wilayah artinya kamu mengikuti pembaruan wilayah tertentu. Setiap kali ada kenaikan risiko, kamu akan mendapat notifikasi otomatis. Makin banyak laporan yang kamu kirim, makin banyak wilayah yang bisa kamu pantau.',
  },
  {
    q: 'Apakah data saya aman saat mengirim laporan genangan?',
    a: 'Ya. Kamu bisa memilih lapor dengan identitas (nama) atau lapor sebagai anonim. Data lokasi hanya digunakan untuk keperluan pemetaan risiko dan tidak dibagikan ke pihak ketiga.',
  },
]

const toggleFaq = (idx) => {
  activeFaq.value = activeFaq.value === idx ? null : idx
}

/* ─── Stat cards ─────────────────────────────────────────────────────────── */
const statCards = [
  { value: 'Risiko\nTertinggi\nSepanjang\nSejarah', sub: 'DBD 2019–2024 di Indonesia', color: '#FEF2F2', textColor: '#EF4444', icon: BarChart2 },
  { value: 'Indonesia\nSumbang\n7,3%\nSeban Dunia', sub: 'Kasus DBD global terbanyak', color: '#FFF7ED', textColor: '#F59E0B', icon: Globe },
  { value: 'Satu\nProvinsi,\n1M Kasus\nPer Tahun', sub: 'Jawa Barat penyumbang kasus terbesar', color: '#EFF6FF', textColor: '#4E63DA', icon: Building2 },
]
</script>

<template>
  <div>
    <!-- ─── Hero Section ─────────────────────────────────────────────────── -->
    <section class="hero-full-width overflow-hidden bg-[--lj-blue-pale] relative" style="min-height: 700px;">
      <!-- Lottie Background Placeholder fills full height -->
      <div class="absolute inset-0 lottie-placeholder" style="border-radius: 0;">
        <span class="text-[--lj-blue] font-semibold text-xl">Lottie: Ilustrasi Hero (Animasi)</span>
      </div>

      <!-- Backdrop overlay for readability -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/70 via-white/30 to-transparent"></div>

      <!-- Sway wave bottom -->
      <div class="absolute bottom-0 left-0 w-full z-10" style="transform: translateY(1px);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block" style="height: 80px; object-fit: fill;" />
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-36 pb-28 relative z-10 text-center flex flex-col items-center justify-center" style="min-height: 700px;">
        <div class="space-y-6 animate-on-scroll">
          <h1 class="text-4xl sm:text-[3.5rem] font-bold leading-tight text-glow" style="color: var(--lj-navy);">
            Satu Peta, 
            <span class="font-garamond highlight-green" style="color: var(--lj-navy);">Seribu Langkah</span>
            <br>Cegah Wabah.
          </h1>
          <p class="text-base sm:text-lg leading-relaxed mx-auto text-glow" style="color: var(--lj-navy); max-width: 500px; font-weight: 500;">
            LensaJentik menghubungkan laporan warga, data kader, dan pemantauan cuaca real-time untuk memetakan dan mencegah risiko DBD &amp; Malaria bersama-sama.
          </p>
          <div class="flex justify-center pt-4">
            <RouterLink data-onboard="peta" to="/peta-resiko" class="lj-btn-primary px-8 py-3.5 shadow-xl hover:scale-105">
              Lihat Peta Sekarang
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── About LensaJentik ────────────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
      <!-- Decorative Blobs -->
      <div class="blob-bg w-96 h-96 top-0 left-0" style="background: var(--lj-green);"></div>
      <div class="blob-bg w-96 h-96 bottom-0 right-0" style="background: var(--lj-blue);"></div>

      <div class="text-center mb-16 relative z-10 animate-on-scroll">
        <div class="lj-section-label mb-5 mx-auto bg-white" style="width: fit-content;">TENTANG LENSAJENTIK</div>
        <h2 class="lj-heading">
          Lihat risiko <span style="color: var(--lj-green-dk);">wilayahmu</span>,<br>
          <span class="font-garamond highlight-blue text-white inline-block mt-2" style="font-size: 1.05em;">sebelum jadi kasus</span>
        </h2>
        <p class="text-sm mt-6" style="color: var(--lj-muted); max-width: 580px; margin-left: auto; margin-right: auto; font-weight: 500;">
          Sebagian besar masyarakat baru waspada setelah kasus muncul. LensaJentik membaca pola cuaca, laporan warga, dan data jentik lebih dulu supaya kamu bisa bertindak sebelum wilayahmu ikut jadi statistik.
        </p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          v-for="(card, i) in statCards"
          :key="i"
          class="lj-card p-6 animate-on-scroll flex flex-col items-center text-center"
          :class="`delay-${(i + 1) * 100}`"
        >
          <!-- Lottie placeholder -->
          <div class="lottie-placeholder flex-col w-full mb-4" style="height: 120px;">
            <component :is="card.icon" class="w-10 h-10 mb-2" :style="{ color: card.textColor }" />
          </div>
          <div class="text-sm font-bold leading-snug whitespace-pre-line" :style="{ color: card.textColor }">
            {{ card.value }}
          </div>
          <p class="text-xs mt-2" style="color: var(--lj-muted);">{{ card.sub }}</p>
        </div>
      </div>
    </section>

    <!-- ─── Feature Slider ───────────────────────────────────────────────── -->
    <section class="py-24 relative hero-full-width">
      <!-- Background Lottie Placeholder -->
      <div class="absolute inset-0 lottie-placeholder" style="border-radius: 0;"></div>
      
      <!-- Sway wave top & bottom -->
      <div class="absolute top-0 left-0 w-full z-10" style="transform: translateY(-98%) rotate(180deg);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block" style="height: 70px; object-fit: fill;" />
      </div>
      <div class="absolute bottom-0 left-0 w-full z-10" style="transform: translateY(98%);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block" style="height: 70px; object-fit: fill;" />
      </div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div class="text-center mb-12 animate-on-scroll">
          <div class="lj-section-label mb-4 mx-auto bg-white" style="width: fit-content;">FITUR KAMI</div>
        </div>

        <!-- Slider Card -->
        <div class="animate-on-scroll relative overflow-hidden rounded-3xl bg-white shadow-2xl" style="max-width: 900px; margin: 0 auto;">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
            <!-- Text side -->
            <div class="p-8 sm:p-12 flex flex-col justify-center space-y-5">
              <span
                class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit"
                :style="{ background: features[featureSliderIndex].accent + '20', color: features[featureSliderIndex].accent }"
              >
                {{ features[featureSliderIndex].label }}
              </span>
              <h3
                class="text-2xl sm:text-4xl font-bold leading-tight whitespace-pre-line text-glow"
                style="color: var(--lj-navy);"
              >
                {{ features[featureSliderIndex].heading.split('\n')[0] }}<br>
                <span class="font-garamond highlight-green mt-1 inline-block" style="font-size: 0.95em;">
                  {{ features[featureSliderIndex].heading.split('\n')[1] }}
                </span>
              </h3>
              <p class="text-sm leading-relaxed" style="color: var(--lj-muted);">
                Bukan sekadar peta biasa, warna di tiap wilayah dihitung dari suhu, kelembapan, dan curah hujan real-time, lalu diproyeksikan jadi tren 7-14 hari ke depan. Kamu tahu duluan, sebelum kasus muncul.
              </p>
              <RouterLink :to="features[featureSliderIndex].ctaPath" class="lj-btn-primary w-fit mt-2 shadow-lg" :style="{ background: features[featureSliderIndex].accent }">
                {{ features[featureSliderIndex].cta }}
              </RouterLink>
            </div>

            <!-- Visual side (Lottie placeholder) -->
            <div class="flex items-center justify-center p-8 bg-[--lj-bg]">
              <div class="lottie-placeholder w-full flex-col bg-white border-dashed border-2 shadow-inner" style="height: 280px; border-color: var(--lj-border);">
                <component :is="features[featureSliderIndex].icon" class="w-16 h-16 mb-3" :style="{ color: features[featureSliderIndex].accent }" />
                <span class="text-sm font-semibold" :style="{ color: features[featureSliderIndex].accent }">
                  Lottie: Ilustrasi {{ features[featureSliderIndex].label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Navigation arrows -->
          <button
            @click="prevFeature"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          >
            <ChevronLeft class="w-5 h-5" :style="{ color: features[featureSliderIndex].accent }" />
          </button>
          <button
            @click="nextFeature"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          >
            <ChevronRight class="w-5 h-5" :style="{ color: features[featureSliderIndex].accent }" />
          </button>
        </div>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(_, i) in features"
            :key="i"
            @click="featureSliderIndex = i"
            class="rounded-full transition-all"
            :style="{
              width: featureSliderIndex === i ? '24px' : '8px',
              height: '8px',
              background: featureSliderIndex === i ? 'var(--lj-blue)' : 'var(--lj-border)',
            }"
          />
        </div>
      </div>
    </section>

    <!-- ─── Cara Kerja ───────────────────────────────────────────────── -->
    <section class="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12 animate-on-scroll">
        <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">CARA KERJA</div>
      </div>

      <!-- Cara Kerja Diagram SVG -->
      <div class="w-full animate-on-scroll mb-8">
        <img src="/cara-kerja.svg" alt="Diagram Cara Kerja LensaJentik" class="w-full h-auto block max-w-3xl mx-auto" />
      </div>

      <!-- Step selector -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10 animate-on-scroll relative">
        <template v-for="(step, i) in steps" :key="i">
          <button
            @click="activeStep = i"
            class="flex flex-col items-center gap-2 group transition-all relative z-10 bg-[--lj-bg] p-2"
          >
            <div
              class="w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 font-bold text-xl shadow-sm bg-white"
              :style="activeStep === i
                ? 'border-color: var(--lj-navy); color: var(--lj-navy); transform: scale(1.1); box-shadow: 0 10px 25px rgba(0,0,0,0.1);'
                : 'border-color: var(--lj-border); color: var(--lj-muted);'"
            >
              {{ i + 1 }}
            </div>
          </button>
        </template>
      </div>

      <!-- Step content -->
      <Transition name="step-content" mode="out-in">
        <div
          :key="activeStep"
          class="lj-card p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div class="space-y-4">
            <component :is="steps[activeStep].icon" class="w-10 h-10 text-[--lj-blue]" />
            <h3 class="text-xl font-bold" style="color: var(--lj-navy);">{{ steps[activeStep].title }}</h3>
            <p class="text-sm leading-relaxed" style="color: var(--lj-muted);">{{ steps[activeStep].desc }}</p>
            <div class="p-4 rounded-xl text-xs leading-relaxed" style="background: var(--lj-blue-pale); color: var(--lj-blue);">
              💡 {{ steps[activeStep].detail }}
            </div>
          </div>
          <div class="lottie-placeholder flex-col" style="height: 200px;">
            <component :is="steps[activeStep].icon" class="w-12 h-12 text-[--lj-blue] mb-2" />
            <span class="text-xs font-semibold text-[--lj-blue]">Lottie: Langkah {{ activeStep + 1 }}</span>
          </div>
        </div>
      </Transition>

      <!-- Previous / Next -->
      <div class="flex justify-center gap-4 mt-6">
        <button
          @click="prevStep"
          :disabled="activeStep === 0"
          class="px-5 py-2 rounded-full text-sm font-bold border transition-all disabled:opacity-30 flex items-center gap-2"
          style="border-color: var(--lj-blue); color: var(--lj-blue);"
        >
          <ChevronLeft class="w-4 h-4" /> Sebelumnya
        </button>
        <button
          @click="nextStep"
          :disabled="activeStep === steps.length - 1"
          class="lj-btn-primary disabled:opacity-30 flex items-center gap-2"
        >
          Selanjutnya <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </section>

    <!-- ─── FAQ ─────────────────────────────────────────────────────────── -->
    <section class="pt-24 hero-full-width relative pb-0 mb-0">
      <!-- Background Lottie Placeholder -->
      <div class="absolute inset-0 lottie-placeholder" style="border-radius: 0;"></div>
      
      <!-- Sway wave top -->
      <div class="absolute top-0 left-0 w-full z-10" style="transform: translateY(-98%) rotate(180deg);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block" style="height: 70px; object-fit: fill;" />
      </div>

      <div class="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 pb-8">
        <div class="text-center mb-10 animate-on-scroll">
          <div class="lj-section-label mb-4 mx-auto bg-white" style="width: fit-content;">PERTANYAAN PALING SERING DITANYAKAN</div>
        </div>

        <div class="space-y-4 animate-on-scroll">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="lj-card overflow-hidden bg-white/95 backdrop-blur shadow-sm"
            style="border-radius: 100px;"
            :style="activeFaq === i ? 'border-color: var(--lj-blue); border-radius: 24px;' : ''"
          >
            <button
              @click="toggleFaq(i)"
              class="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-[--lj-blue-pale] transition-colors"
            >
              <span class="text-sm font-bold" style="color: var(--lj-navy);">{{ faq.q }}</span>
              <div
                class="shrink-0 w-8 h-8 flex items-center justify-center transition-all text-[--lj-navy]"
              >
                <ChevronDown v-if="activeFaq !== i" class="w-5 h-5" />
                <ChevronUp v-else class="w-5 h-5" />
              </div>
            </button>

            <Transition name="accordion-content">
              <div v-if="activeFaq === i" class="px-6 pb-5 pt-0">
                <p class="text-xs sm:text-sm leading-relaxed" style="color: var(--lj-muted);">{{ faq.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Onboarding Spotlight Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showOnboarding"
          class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          style="background: rgba(30, 43, 91, 0.75); backdrop-filter: blur(4px);"
        >
          <div
            class="bg-white rounded-3xl max-w-md w-full p-8 space-y-5 shadow-2xl relative"
            style="animation: scaleIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);"
          >
            <!-- Progress dots -->
            <div class="flex gap-2">
              <div
                v-for="(_, i) in onboardingSteps"
                :key="i"
                class="h-1.5 rounded-full transition-all duration-300"
                :style="{
                  width: onboardingStep === i ? '24px' : '8px',
                  background: onboardingStep >= i ? 'var(--lj-blue)' : 'var(--lj-border)',
                }"
              />
            </div>

            <!-- Icon -->
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style="background: var(--lj-blue-pale); color: var(--lj-blue);"
            >
              <component :is="getOnboardingIcon(onboardingStep)" class="w-8 h-8" />
            </div>

            <h3 class="text-xl font-bold text-center" style="color: var(--lj-navy);">
              {{ onboardingSteps[onboardingStep].title }}
            </h3>
            <p class="text-sm text-center leading-relaxed" style="color: var(--lj-muted);">
              {{ onboardingSteps[onboardingStep].body }}
            </p>

            <div class="flex gap-3 pt-2">
              <button
                v-if="onboardingStep > 0"
                @click="prevStep"
                class="flex-1 py-3 rounded-2xl border text-sm font-bold transition-colors hover:bg-[--lj-blue-pale]"
                style="border-color: var(--lj-border); color: var(--lj-blue);"
              >
                Kembali
              </button>
              <button
                @click="nextStep"
                class="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 flex justify-center items-center gap-1"
                style="background: var(--lj-blue);"
              >
                {{ onboardingStep < onboardingSteps.length - 1 ? 'Lanjut' : 'Mulai Eksplorasi' }}
                <ChevronRight v-if="onboardingStep < onboardingSteps.length - 1" class="w-4 h-4" />
              </button>
            </div>

            <button @click="closeOnboarding" class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[--lj-blue-pale] transition-colors">
              <X class="w-4 h-4" style="color: var(--lj-muted);" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.step-content-enter-active,
.step-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.step-content-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.step-content-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
