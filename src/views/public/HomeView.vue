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
    <section
      class="relative overflow-hidden"
      style="background: linear-gradient(135deg, var(--lj-blue-pale) 0%, #dce3fb 50%, #c8f5b0 100%); min-height: 520px;"
    >
      <!-- Background mosquito SVGs decorative -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <svg class="absolute -top-4 right-10 opacity-20 animate-float-slow" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="none" stroke="#4E63DA" stroke-width="2"/><line x1="40" y1="5" x2="40" y2="75" stroke="#4E63DA" stroke-width="1"/><line x1="5" y1="40" x2="75" y2="40" stroke="#4E63DA" stroke-width="1"/></svg>
        <svg class="absolute top-20 left-6 opacity-15 animate-float" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="none" stroke="#95FE6D" stroke-width="2"/><circle cx="30" cy="30" r="10" fill="#95FE6D" opacity="0.3"/></svg>
        <svg class="absolute bottom-10 right-1/4 opacity-10 animate-float-delay" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#4E63DA" stroke-width="1.5"/><circle cx="50" cy="50" r="25" fill="none" stroke="#4E63DA" stroke-width="1"/></svg>
      </div>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Hero Text -->
          <div class="space-y-6 animate-on-scroll">
            <h1 class="text-4xl sm:text-5xl font-bold leading-tight" style="color: var(--lj-navy);">
              Satu Peta, <span class="font-garamond" style="color: var(--lj-blue);">Seribu Langkah</span>
              <br>Cegah Wabah.
            </h1>
            <p class="text-base leading-relaxed" style="color: var(--lj-muted); max-width: 440px;">
              LensaJentik menghubungkan laporan warga, data kader, dan pemantauan cuaca real-time untuk memetakan dan mencegah risiko DBD & Malaria bersama-sama.
            </p>
            <div class="flex flex-wrap gap-3 pt-2">
              <RouterLink data-onboard="peta" to="/peta-resiko" class="lj-btn-primary">
                Lihat Apa Saja
              </RouterLink>
            </div>
          </div>

          <!-- Hero Illustration Placeholder (Lottie) -->
          <div class="animate-on-scroll delay-200 hidden lg:block">
            <div class="lottie-placeholder flex-col" style="height: 320px; border-radius: 24px;">
              <Bug class="w-16 h-16 text-[--lj-blue] mb-2" />
              <span class="text-[--lj-blue] font-semibold text-sm">Lottie: Ilustrasi Hero</span>
              <span style="color: rgba(78,99,218,0.5); font-size: 11px;">Akan diganti dengan motion graphic</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── About LensaJentik ────────────────────────────────────────────── -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-12 animate-on-scroll">
        <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">TENTANG LENSAJENTIK</div>
        <h2 class="lj-heading">
          Lihat risiko wilayahmu,<br>
          <span class="font-garamond" style="color: var(--lj-blue);">sebelum jadi besar</span>
        </h2>
        <p class="text-sm mt-4" style="color: var(--lj-muted); max-width: 520px; margin: 12px auto 0;">
          Platform ini dirancang agar setiap warga bisa memantau wilayahnya, melapor, dan berkontribusi mencegah wabah — tanpa perlu keahlian khusus.
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
    <section class="py-16" style="background: white;">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10 animate-on-scroll">
          <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">FITUR KAMI</div>
        </div>

        <!-- Slider Card -->
        <div class="animate-on-scroll relative overflow-hidden rounded-3xl" :style="{ background: features[featureSliderIndex].bg }">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
            <!-- Text side -->
            <div class="p-8 sm:p-12 flex flex-col justify-center space-y-4">
              <span
                class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit"
                :style="{ background: features[featureSliderIndex].accent + '20', color: features[featureSliderIndex].accent }"
              >
                {{ features[featureSliderIndex].label }}
              </span>
              <h3
                class="text-2xl sm:text-3xl font-bold leading-tight whitespace-pre-line"
                :style="{ color: features[featureSliderIndex].accent }"
              >
                {{ features[featureSliderIndex].heading }}
              </h3>
              <p class="text-sm leading-relaxed" style="color: var(--lj-muted);">
                {{ features[featureSliderIndex].body }}
              </p>
              <RouterLink :to="features[featureSliderIndex].ctaPath" class="lj-btn-primary w-fit" :style="{ background: features[featureSliderIndex].accent }">
                {{ features[featureSliderIndex].cta }}
              </RouterLink>
            </div>

            <!-- Visual side (Lottie placeholder) -->
            <div class="flex items-center justify-center p-8">
              <div class="lottie-placeholder w-full flex-col" style="height: 240px;">
                <component :is="features[featureSliderIndex].icon" class="w-14 h-14 mb-3" :style="{ color: features[featureSliderIndex].accent }" />
                <span class="text-xs font-semibold" :style="{ color: features[featureSliderIndex].accent }">
                  Lottie: {{ features[featureSliderIndex].label }}
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

    <!-- ─── Cara Kerja ───────────────────────────────────────────────────── -->
    <section class="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12 animate-on-scroll">
        <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">CARA KERJA</div>
      </div>

      <!-- Step selector -->
      <div class="flex items-center justify-center gap-4 sm:gap-8 mb-10 animate-on-scroll">
        <template v-for="(step, i) in steps" :key="i">
          <button
            @click="activeStep = i"
            class="flex flex-col items-center gap-2 group transition-all"
          >
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
              :style="activeStep === i
                ? 'background: var(--lj-blue); box-shadow: 0 8px 24px rgba(78,99,218,0.35); transform: scale(1.15); color: white;'
                : 'background: var(--lj-blue-pale); color: var(--lj-blue);'"
            >
              <component :is="step.icon" class="w-6 h-6" />
            </div>
            <span
              class="text-xs font-bold hidden sm:block transition-colors"
              :style="{ color: activeStep === i ? 'var(--lj-blue)' : 'var(--lj-muted)' }"
            >
              {{ i + 1 }}
            </span>
          </button>

          <!-- Connector -->
          <div
            v-if="i < steps.length - 1"
            class="h-0.5 flex-1 max-w-16 transition-all duration-500"
            :style="{ background: i < activeStep ? 'var(--lj-green-dk)' : 'var(--lj-border)' }"
          />
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
    <section class="py-16" style="background: white;">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10 animate-on-scroll">
          <div class="lj-section-label mb-4 mx-auto" style="width: fit-content;">PERTANYAAN PALING SERING DITANYAKAN</div>
        </div>

        <div class="space-y-3 animate-on-scroll">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="lj-card overflow-hidden"
            :style="activeFaq === i ? 'border-color: var(--lj-blue);' : ''"
          >
            <button
              @click="toggleFaq(i)"
              class="w-full flex items-center justify-between p-5 text-left gap-4 hover:bg-[--lj-blue-pale] transition-colors"
            >
              <span class="text-sm font-600" style="color: var(--lj-navy);">{{ faq.q }}</span>
              <div
                class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                :style="activeFaq === i ? 'background: var(--lj-blue); color: white;' : 'background: var(--lj-blue-pale); color: var(--lj-blue);'"
              >
                <ChevronDown v-if="activeFaq !== i" class="w-4 h-4" />
                <ChevronUp v-else class="w-4 h-4" />
              </div>
            </button>

            <Transition name="accordion-content">
              <div v-if="activeFaq === i" class="px-5 pb-5">
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
