<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { educationService } from '@/services/educationService'

const route = useRoute()
const article = ref(null)
const isLoading = ref(true)
const isError = ref(false)

const mockupArticles = [
  {
    id: 'ext-1',
    tipe: 'Berita',
    judul: 'Kasus DBD Jakarta Barat Tembus 1.538 Kasus Hingga Juli 2026',
    sumber: 'Times Indonesia',
    created_at: '2026-07-26',
    thumbnail: 'https://cdn2.timesmedia.co.id/cdn-times/uploads/news-thumbnail/2026/07/31/kasus-dbd-jakarta-barat-tembus-1538-kasus-hingga-juli-2026-thumbnail-suiiihlp.webp',
    isi: 'JAKARTA - Kasus Demam Berdarah Dengue (DBD) di wilayah Jakarta Barat terus mengalami peningkatan signifikan. Berdasarkan data terbaru dari Suku Dinas Kesehatan Jakarta Barat, tercatat sebanyak 1.538 kasus DBD sejak awal tahun hingga Juli 2026.\n\nPeningkatan ini dipicu oleh faktor cuaca yang sering hujan dan kondisi lingkungan yang mendukung nyamuk berkembang biak. Warga diimbau untuk lebih aktif melakukan kegiatan PSN (Pemberantasan Sarang Nyamuk) dengan metode 3M Plus secara rutin...',
    external_url: 'https://timesindonesia.co.id/kesehatan/601703/kasus-dbd-jakarta-barat-tembus-1538-kasus-hingga-juli-2026'
  },
  {
    id: 'ext-2',
    tipe: 'Berita',
    judul: 'Awal 2026, Sudis Kesehatan Jakbar Catat DBD Menurun',
    sumber: 'Jakarta Barat',
    created_at: '2026-01-29',
    thumbnail: 'https://barat.jakarta.go.id/storage/images/berita/thumbnail/4b65475d10f16badd42f3e4bd89308ed-thumbnail.jpeg',
    isi: 'Suku Dinas Kesehatan Jakarta Barat (Sudiskes Jakbar) mencatat Demam Berdarah Dengue (DBD) sejak 1 hingga 29 Januari 2026 sebanyak 75 kasus. Meskipun ada kasus, angka ini diklaim mengalami penurunan dibanding periode yang sama tahun sebelumnya.\n\nPemerintah kota tetap menggiatkan juru pemantau jentik (jumantik) di tiap kelurahan agar warga tidak lengah terhadap genangan air bersih yang bisa menjadi sarang nyamuk Aedes aegypti...',
    external_url: 'https://barat.jakarta.go.id/berita/awal-2026-sudis-kesehatan-jakbar-catat-dbd-menurun'
  },
  {
    id: 'ext-3',
    tipe: 'Artikel',
    judul: 'Kewaspadaan Masyarakat Perlu Ditingkatkan: Dengue dan ISPA Meningkat pada Minggu ke-7',
    sumber: 'Puskesmas Kuta 1',
    created_at: '2026-03-07',
    thumbnail: 'https://puskesmaskuta1.badungkab.go.id/storage/puskesmaskuta1/image/whatsapp-image-2026-03-07-at-090357-20260307101957-OcpBm.jpeg',
    isi: 'Berdasarkan pengamatan penyakit, tren kasus Dengue (DBD) dan Infeksi Saluran Pernapasan Akut (ISPA) mengalami peningkatan pada minggu ke-7 tahun 2026 di wilayah kerja Puskesmas Kuta 1.\n\nMasyarakat diimbau untuk meningkatkan kewaspadaan, menjaga daya tahan tubuh, serta memperhatikan kebersihan lingkungan terutama tempat-tempat yang berpotensi menampung genangan air agar terhindar dari demam berdarah...',
    external_url: 'https://puskesmaskuta1.badungkab.go.id/artikel/69755-kewaspadaan-masyarakat-perlu-ditingkatkan-dengue-dan-ispa-meningkat-pada-minggu-ke-7-tahun-2026'
  }
]

onMounted(async () => {
  try {
    const data = await educationService.fetchArticleDetail(route.params.id)
    article.value = data
  } catch (e) {
    console.error('Fetch article detail failed, falling back to mockup:', e)
    const fallback = mockupArticles.find(a => a.id === route.params.id)
    if (fallback) {
      article.value = fallback
    } else {
      isError.value = true
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen relative" style="background-color: #F4F9F6;">
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
          {{ article.judul }}
        </h1>

        <!-- Article body (mockup style, very clean plain text) -->
        <div
          class="prose max-w-none text-sm sm:text-base px-2 sm:px-8 mb-12"
          style="line-height: 1.8; color: #4B5563; font-family: 'Satoshi', sans-serif; white-space: pre-wrap;"
        >{{ article.isi }}</div>

        <!-- Read More Button for External Articles -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 pt-8 border-t border-gray-100 mt-8">
          <RouterLink
            to="/edukasi"
            class="px-8 py-4 rounded-full font-bold shadow-md hover:shadow-lg transition-shadow bg-white text-gray-700 border border-gray-200"
          >
            Kembali ke Beranda Edukasi
          </RouterLink>

          <a
            v-if="article.external_url"
            :href="article.external_url"
            target="_blank"
            class="lj-btn-primary inline-flex items-center gap-2 px-8 py-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            Baca Selengkapnya di {{ article.sumber }}
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
        </div>
      </template>
    </div>
  </div>
</template>
