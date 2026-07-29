<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { educationService } from '@/services/educationService'

const route = useRoute()
const article = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const data = await educationService.fetchArticleDetail(route.params.id)
    article.value = data
  } catch (e) {
    console.error('Fetch article detail failed:', e)
  } finally {
    isLoading.value = false
    if (!article.value) {
      article.value = {
        judul: 'Kasus DBD 2025 Menurun, Tapi Kemenkes Minta Warga Tetap Waspada',
        isi: `Kabar baik datang dari data terbaru Kementerian Kesehatan RI: tren kasus demam berdarah dengue (DBD) sepanjang 2025 menunjukkan penurunan dibanding tahun sebelumnya. Namun, angka yang masih di kisaran ratusan ribu kasus membuat pemerintah tetap mengimbau masyarakat untuk tidak lengah.
Penurunan yang Belum Berarti Aman

Berdasarkan data Sistem Kewaspadaan Dini dan Respon (SKDR), Kementerian Kesehatan mencatat sekitar 131 ribu kasus DBD sepanjang Januari hingga Oktober 2025, dengan ratusan kematian menyertainya. Meski jumlah ini menurun cukup signifikan dibanding tahun 2024 — yang tercatat sebagai tahun dengan kasus DBD tertinggi sepanjang sejarah pencatatan di Indonesia — angka tersebut tetap menempatkan Indonesia sebagai penyumbang kasus dengue yang besar secara global. Pola tahunan yang berulang juga masih terlihat: kasus cenderung melonjak di awal tahun dan kembali naik menjelang pertengahan tahun, mengikuti perubahan musim hujan dan aktivitas nyamuk Aedes aegypti sebagai vektor utama penularan.
Kenapa DBD Bukan Penyakit Musiman

Salah satu kesalahpahaman umum di masyarakat adalah menganggap DBD hanya muncul saat musim hujan. Padahal, virus dengue sebenarnya bisa menyerang sepanjang tahun, tanpa memandang usia maupun gaya hidup seseorang. Perubahan iklim turut memperparah situasi ini — semakin tinggi suhu lingkungan, semakin sering pula nyamuk menggigit, sehingga potensi penularan pun meningkat. Wilayah dengan kepadatan penduduk tinggi seperti Jawa Barat, Jawa Timur, dan Jawa Tengah secara konsisten menjadi penyumbang kasus dan kematian tertinggi di Indonesia. Sementara itu, kelompok usia produktif tercatat paling sering terinfeksi, namun risiko kematian justru lebih tinggi pada anak-anak dan remaja karena sistem kekebalan tubuh mereka yang belum sekuat orang dewasa.
Deteksi Dini Jadi Kunci

Salah satu tantangan terbesar dalam penanganan DBD adalah keterlambatan penanganan akibat gejala yang sering disalahartikan sebagai flu biasa. Padahal, justru saat demam mulai turun di hari keempat atau kelima, itulah masa kritis yang paling perlu diwaspadai. Jika diabaikan, kondisi ini bisa berkembang menjadi sindrom syok dengue yang jauh lebih berbahaya.

Karena hingga kini belum ditemukan obat khusus untuk DBD, pencegahan tetap menjadi langkah paling efektif. Gerakan 3M Plus — menguras, menutup, dan mendaur ulang tempat-tempat yang berpotensi menjadi sarang nyamuk — masih menjadi strategi utama yang didorong pemerintah, dilengkapi dengan inovasi tambahan seperti pemantauan berbasis teknologi dan vaksinasi dengue bagi yang membutuhkan.

Apa yang Bisa Kamu Lakukan?
Selain rutin menerapkan 3M Plus di rumah masing-masing, partisipasi aktif warga dalam melaporkan titik-titik genangan air di lingkungan sekitar menjadi salah satu cara paling nyata untuk membantu memutus rantai penyebaran nyamuk sejak dini — sebelum genangan kecil itu sempat berkembang jadi sumber wabah baru.`,
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        tipe: 'artikel',
        sumber: 'Kemenkes RI',
        created_at: '2025-11-20'
      }
    }
  }
})
</script>

<template>
  <div class="min-h-screen relative" style="background-color: #f7fbf8;">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-40">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <RouterLink to="/edukasi" class="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft class="w-5 h-5" style="color: var(--lj-navy);" />
        </RouterLink>
        <div class="px-4 py-1.5 rounded-full border-2 text-xs font-bold" style="border-color: #95FE6D; background: white; color: var(--lj-navy);">
          ARTIKEL TERKAIT DBD
        </div>
        <div class="w-8 h-8"></div> <!-- spacer -->
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center font-bold" style="color: var(--lj-blue);">Memuat artikel...</div>

      <!-- Article content -->
      <template v-else>
        <!-- Thumbnail -->
        <div class="w-full h-[280px] sm:h-[400px] bg-gray-200 rounded-[24px] mb-8 overflow-hidden shadow-sm">
          <img v-if="article.thumbnail" :src="article.thumbnail" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-[#4E63DA]/10 text-4xl">📰</div>
        </div>

        <!-- Title -->
        <h1 class="text-2xl sm:text-4xl font-black leading-tight text-center mb-10 px-4" style="color: var(--lj-navy);">
          <span style="color: #95FE6D;">{{ article.judul.split(',')[0] }},</span>
          {{ article.judul.split(',').slice(1).join(',') }}
        </h1>

        <!-- Article body (mockup style, very clean plain text) -->
        <div
          class="prose max-w-none text-sm sm:text-base px-2 sm:px-8"
          style="line-height: 1.8; color: #4B5563; font-family: 'Satoshi', sans-serif; white-space: pre-wrap;"
        >{{ article.isi }}</div>
      </template>
    </div>
  </div>
</template>
