<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Camera, MapPin, Navigation, Search, CheckCircle2,
  User, FileText, UserX, Share2, ChevronDown, ChevronUp,
  ArrowLeft, Award, Image as ImageIcon, Map
} from 'lucide-vue-next'
import { useReportStore } from '@/stores/useReportStore'
import { useGamificationStore } from '@/stores/useGamificationStore'
import { mapService } from '@/services/mapService'

const reportStore = useReportStore()
const gamificationStore = useGamificationStore()

/* ─── Form state ──────────────────────────────────────────────────────────── */
const reportMode = ref('identitas') // 'identitas' | 'anonim'
const userName = ref('')
const description = ref('')
const isLocating = ref(false)
const isSubmitting = ref(false)

// Location
const address = ref('')
const latitude = ref(-6.892)
const longitude = ref(107.595)
const searchQuery = ref('')
const searchResults = ref([])
const selectedWilayahKode = ref('')
const selectedRegionName = ref('')

// File
const fileInput = ref(null)
const selectedFile = ref(null)
const imagePreview = ref(null)

// Step: 'form' | 'success'
const step = ref('form')

// Reward accordion
const openReward1 = ref(false)
const openReward2 = ref(false)

/* ─── Map (Leaflet) ───────────────────────────────────────────────────────── */
const mapContainer = ref(null)
let mapInstance = null
let marker = null

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const L = (await import('leaflet')).default
    mapInstance = L.map(mapContainer.value, {
      center: [latitude.value, longitude.value],
      zoom: 15,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance)

    marker = L.marker([latitude.value, longitude.value], {
      draggable: true,
    }).addTo(mapInstance)

    marker.on('dragend', (e) => {
      const latlng = e.target.getLatLng()
      latitude.value = latlng.lat
      longitude.value = latlng.lng
      address.value = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`
    })
  }
})

/* ─── Methods ─────────────────────────────────────────────────────────────── */
const updateMapMarker = async (lat, lng) => {
  if (!mapInstance || !marker) return
  const { default: L } = await import('leaflet')
  marker.setLatLng([lat, lng])
  mapInstance.flyTo([lat, lng], 15, { duration: 1.2 })
}

const handleGetGps = () => {
  isLocating.value = true
  navigator.geolocation?.getCurrentPosition(
    async (pos) => {
      isLocating.value = false
      latitude.value = pos.coords.latitude
      longitude.value = pos.coords.longitude
      address.value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
      if (!selectedWilayahKode.value) {
        selectedWilayahKode.value = '3201010'
        selectedRegionName.value = 'Lokasi GPS terdeteksi'
      }
      await updateMapMarker(latitude.value, longitude.value)
    },
    async () => {
      isLocating.value = false
      address.value = 'Jl. Kamper, Babakan, Kec. Dramaga, Kabupaten Bogor'
      selectedWilayahKode.value = '3201010'
      selectedRegionName.value = 'Kec. Dramaga (Simulasi)'
      await updateMapMarker(-6.5571, 106.7248)
    }
  )
}

const handleSearch = async () => {
  if (searchQuery.value.length < 3) { searchResults.value = []; return }
  try {
    const res = await mapService.searchWilayah(searchQuery.value)
    searchResults.value = res.data || res
  } catch (e) { console.error(e) }
}

const selectRegion = async (region) => {
  selectedWilayahKode.value = region.kode
  selectedRegionName.value = `${region.nama} (${region.tingkat})`
  const lat = Number(region.latitude) || latitude.value
  const lng = Number(region.longitude) || longitude.value
  latitude.value = lat
  longitude.value = lng
  address.value = region.nama
  searchResults.value = []
  searchQuery.value = ''
  await updateMapMarker(lat, lng)
}

const triggerFileInput = () => fileInput.value?.click()
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const handleSubmit = async () => {
  if (!selectedWilayahKode.value) return alert('Silakan pilih wilayah terlebih dahulu.')
  if (!selectedFile.value) return alert('Silakan unggah foto genangan terlebih dahulu.')
  if (!description.value) return alert('Silakan isi deskripsi singkat.')
  if (!address.value) return alert('Silakan lengkapi alamat lokasi.')

  isSubmitting.value = true
  try {
    await reportStore.addReport({
      userName: reportMode.value === 'anonim' ? 'Anonim' : (userName.value || 'Warga'),
      address: address.value,
      description: description.value,
      wilayah_kode: selectedWilayahKode.value,
      latitude: latitude.value,
      longitude: longitude.value,
      foto: selectedFile.value,
    })
    gamificationStore.addPoints(50)
    step.value = 'success'
  } catch (err) {
    alert('Gagal mengirim laporan: ' + (err.response?.data?.message || err.message))
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  step.value = 'form'
  userName.value = ''
  description.value = ''
  selectedFile.value = null
  imagePreview.value = null
  selectedWilayahKode.value = ''
  selectedRegionName.value = ''
  address.value = ''
  openReward1.value = false
  openReward2.value = false
}
</script>

<template>
  <div>
    <!-- ─── Header illustration (Lottie placeholder) ─── -->
    <div class="lottie-placeholder" style="height: 220px; border-radius: 0;">
      <Map class="w-12 h-12 mb-2 mx-auto text-[--lj-blue]" />
      <span class="font-semibold" style="color: var(--lj-blue);">Lottie: Ilustrasi Laporan Warga</span>
    </div>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- ════════════════════════════════════════════════════ -->
      <!-- STEP: FORM                                          -->
      <!-- ════════════════════════════════════════════════════ -->
      <template v-if="step === 'form'">
        <!-- Section label -->
        <div class="text-center animate-on-scroll">
          <div class="lj-section-label mb-2 mx-auto" style="width: fit-content;">LENGKAPI LAPORAN ANDA</div>
        </div>

        <!-- Map GIS -->
        <div class="lj-card overflow-hidden animate-on-scroll" style="border: 2px solid var(--lj-green-dk);">
          <!-- Search bar inside card -->
          <div class="p-3 border-b" style="border-color: var(--lj-border);">
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style="color: var(--lj-muted);" />
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Cari kelurahan / kecamatan..."
                class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none"
                style="border-color: var(--lj-border);"
              />
            </div>
            <div v-if="searchResults.length > 0" class="absolute z-30 mt-1 w-full max-w-[calc(100%-2rem)] bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto text-xs">
              <div
                v-for="r in searchResults"
                :key="r.kode"
                @click="selectRegion(r)"
                class="p-3 hover:bg-[--lj-blue-pale] cursor-pointer flex justify-between items-center font-medium"
                style="color: var(--lj-navy);"
              >
                <span>{{ r.nama }} ({{ r.tingkat }})</span>
                <span style="color: var(--lj-blue); font-weight: 700;">Pilih</span>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div ref="mapContainer" style="height: 240px;" class="w-full relative">
            <!-- Detect GPS overlay button -->
            <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <button
                @click="handleGetGps"
                class="lj-btn-primary pointer-events-auto text-xs px-5 py-2.5 shadow-xl"
                :disabled="isLocating"
              >
                <Navigation class="w-4 h-4" />
                {{ isLocating ? 'Mendeteksi...' : 'Deteksi Lokasi Saya' }}
              </button>
            </div>
          </div>

          <!-- Address display -->
          <div v-if="selectedRegionName" class="px-4 py-2 flex items-center gap-2 text-xs" style="background: var(--lj-blue-pale);">
            <CheckCircle2 class="w-3.5 h-3.5" style="color: var(--lj-green-dk);" />
            <span class="font-bold" style="color: var(--lj-navy);">{{ selectedRegionName }}</span>
          </div>
        </div>

        <!-- Alamat Edit Manual -->
        <div class="animate-on-scroll">
          <label class="block text-sm font-bold mb-2" style="color: var(--lj-navy);">Alamat Lokasi Genangan</label>
          <p class="text-xs text-gray-500 mb-2">Anda dapat mengedit alamat yang terdeteksi agar lebih spesifik.</p>
          <textarea
            v-model="address"
            rows="2"
            placeholder="Contoh: Jl. Diponegoro No 10, di samping selokan..."
            class="w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all focus:ring-2 resize-none"
            style="border-color: var(--lj-border); focus-ring-color: var(--lj-blue); background: white;"
          ></textarea>
        </div>

        <!-- Identity toggle -->
        <div class="grid grid-cols-2 gap-3 animate-on-scroll">
          <button
            @click="reportMode = 'identitas'"
            class="py-3 rounded-2xl text-sm font-bold transition-all"
            :style="reportMode === 'identitas'
              ? 'background: var(--lj-blue); color: white;'
              : 'background: white; color: var(--lj-muted); border: 1.5px solid var(--lj-border);'"
          >
            <User class="w-4 h-4 inline mr-1.5" />
            Lapor dengan identitas
          </button>
          <button
            @click="reportMode = 'anonim'"
            class="py-3 rounded-2xl text-sm font-bold transition-all"
            :style="reportMode === 'anonim'
              ? 'background: var(--lj-blue); color: white;'
              : 'background: white; color: var(--lj-muted); border: 1.5px solid var(--lj-border);'"
          >
            <UserX class="w-4 h-4 inline mr-1.5" />
            Lapor sebagai anonim
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6 animate-on-scroll">

          <!-- Name (only if identitas) -->
          <Transition name="slide-toggle">
            <div v-if="reportMode === 'identitas'">
              <label class="block text-sm font-bold mb-2" style="color: var(--lj-navy);">Nama Pelapor</label>
              <input
                v-model="userName"
                type="text"
                placeholder="Masukkan nama anda disini..."
                class="w-full px-4 py-3.5 rounded-2xl border text-sm outline-none transition-all focus:ring-2"
                style="border-color: var(--lj-border); focus-ring-color: var(--lj-blue); background: white;"
              />
            </div>
          </Transition>

          <!-- Photo Upload -->
          <div>
            <label class="block text-sm font-bold mb-2" style="color: var(--lj-navy);">Foto Genangan Air/Sarang Nyamuk</label>
            <div
              @click="triggerFileInput"
              class="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
              :style="imagePreview
                ? 'border-color: var(--lj-green-dk); background: #f0fdf4;'
                : 'border-color: var(--lj-blue); background: var(--lj-blue-pale);'"
            >
              <div v-if="!imagePreview" class="space-y-3">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style="background: var(--lj-green); color: var(--lj-navy);">
                  <Camera class="w-7 h-7" />
                </div>
                <div>
                  <p class="text-sm font-bold" style="color: var(--lj-navy);">Unggah foto anda disini</p>
                  <p class="text-xs mt-1" style="color: var(--lj-muted);">Mendukung format JPG, PNG dan WEBP dengan ukuran file dibawah 10MB</p>
                </div>
                <button type="button" class="lj-btn-green text-xs px-5 py-2">Pilih Foto</button>
              </div>
              <div v-else class="relative">
                <img :src="imagePreview" alt="Preview" class="max-h-48 mx-auto rounded-xl object-cover" />
                <button
                  type="button"
                  @click.stop="selectedFile = null; imagePreview = null"
                  class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-xs font-bold"
                  style="color: var(--risk-high);"
                >✕</button>
              </div>
            </div>
            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-bold mb-2" style="color: var(--lj-navy);">Deskripsi Singkat</label>
            <textarea
              v-model="description"
              rows="3"
              required
              placeholder="Contoh: Genangan di ban bekas dekat selokan, sudah 3 hari tidak surut..."
              class="w-full px-4 py-3.5 rounded-2xl border text-sm outline-none transition-all focus:ring-2 resize-none"
              style="border-color: var(--lj-border); background: white;"
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="lj-btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
          >
            <FileText class="w-5 h-5" />
            {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
          </button>
        </form>
      </template>

      <!-- ════════════════════════════════════════════════════ -->
      <!-- STEP: SUCCESS                                       -->
      <!-- ════════════════════════════════════════════════════ -->
      <template v-else>
        <!-- Section label -->
        <div class="text-center animate-on-scroll">
          <div class="lj-section-label mb-2 mx-auto" style="width: fit-content;">LAPORAN ANDA TERKIRIM</div>
        </div>

        <!-- Success illustration (Lottie placeholder) -->
        <div class="text-center animate-on-scroll">
          <div class="lottie-placeholder mx-auto flex-col" style="width: 200px; height: 200px; border-radius: 50%;">
            <Award class="w-16 h-16 text-[--lj-blue]" />
            <span class="text-xs font-semibold text-[--lj-blue] mt-2">Lottie: Sukses</span>
          </div>
        </div>

        <div class="text-center animate-on-scroll space-y-3">
          <h2 class="text-2xl sm:text-3xl font-bold" style="color: var(--lj-navy);">
            Terima kasih. <span style="color: var(--lj-green-dk);">Laporanmu</span><br>Sudah Kami Terima!
          </h2>
          <p class="text-sm leading-relaxed" style="color: var(--lj-muted); max-width: 400px; margin: 0 auto;">
            Satu laporanmu bisa jadi awal dari genangan yang lebih cepat ditangani.
            Tim kami akan menindaklanjuti titik ini. Sebagai ucapan terima kasih, ini reward yang kamu dapat.
          </p>
        </div>

        <!-- Reward 1: Share Sosmed -->
        <div class="lj-card overflow-hidden animate-on-scroll" style="border-color: var(--lj-green);">
          <button
            @click="openReward1 = !openReward1"
            class="w-full flex items-center justify-between p-4 hover:bg-[--lj-blue-pale] transition-colors"
          >
            <span class="text-sm font-bold" style="color: var(--lj-navy);">Share ke media sosial anda</span>
            <ChevronDown v-if="!openReward1" class="w-5 h-5" style="color: var(--lj-blue);" />
            <ChevronUp v-else class="w-5 h-5" style="color: var(--lj-blue);" />
          </button>
          <Transition name="accordion-content">
            <div v-if="openReward1" class="p-4 pt-0 space-y-3">
              <div class="p-4 rounded-2xl text-sm leading-relaxed" style="background: var(--lj-green); color: var(--lj-navy);">
                Ceritakan ke temanmu bahwa kamu baru saja bantu jaga lingkungan dari DBD. Bagikan lewat story Instagram atau status WhatsApp.
              </div>
              <div class="flex gap-2">
                <button
                  @click="alert('Template Instagram Story siap diunduh!')"
                  class="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 flex justify-center items-center gap-2"
                  style="background: #E1306C;"
                >
                  <ImageIcon class="w-4 h-4" /> IG Story
                </button>
                <button
                  @click="alert('Template WhatsApp Status siap dibagikan!')"
                  class="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 flex justify-center items-center gap-2"
                  style="background: #25D366;"
                >
                  <Share2 class="w-4 h-4" /> WA Status
                </button>
              </div>
              <button
                class="lj-btn-green w-full justify-center"
                @click="alert('Template dibuka!')"
              >
                <Share2 class="w-4 h-4" /> Bagikan Sekarang
              </button>
            </div>
          </Transition>
        </div>

        <!-- Reward 2: Bonus Kuota Subscribe -->
        <div class="lj-card overflow-hidden animate-on-scroll" style="border-color: #F59E0B;">
          <button
            @click="openReward2 = !openReward2"
            class="w-full flex items-center justify-between p-4 hover:bg-amber-50 transition-colors"
          >
            <span class="text-sm font-bold" style="color: var(--lj-navy);">Bonus Kuota Subscribe Wilayah</span>
            <ChevronDown v-if="!openReward2" class="w-5 h-5" style="color: #F59E0B;" />
            <ChevronUp v-else class="w-5 h-5" style="color: #F59E0B;" />
          </button>
          <Transition name="accordion-content">
            <div v-if="openReward2" class="p-4 pt-0 space-y-3">
              <div class="p-4 rounded-2xl text-sm leading-relaxed" style="background: #FFFBEB; color: #92400E;">
                Biasanya warga hanya bisa mengikuti notifikasi 1 wilayah. Berkat laporan ini, kamu dapat bonus untuk memantau 1 wilayah tambahan — pantau rumah dan sekolah anak sekaligus, misalnya.
              </div>
              <RouterLink to="/peta-resiko" class="lj-btn-primary w-full justify-center" style="background: #F59E0B;">
                <MapPin class="w-4 h-4" /> Pilih Wilayah
              </RouterLink>
            </div>
          </Transition>
        </div>

        <!-- Back to home -->
        <div class="text-center animate-on-scroll">
          <button @click="resetForm" class="lj-btn-primary px-8">
            <ArrowLeft class="w-4 h-4" /> Kembali ke Beranda
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.slide-toggle-enter-active, .slide-toggle-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.slide-toggle-enter-from, .slide-toggle-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-toggle-enter-to, .slide-toggle-leave-from {
  max-height: 200px;
  opacity: 1;
}
</style>
