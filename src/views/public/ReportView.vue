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

// Location — diisi oleh GPS browser saat halaman dimuat
const address = ref('')
const latitude = ref(null)
const longitude = ref(null)
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
  // Minta GPS dulu, baru init map
  await getCurrentPositionAsync()
  if (typeof window !== 'undefined') {
    const L = (await import('leaflet')).default
    const lat = latitude.value || -2.5489
    const lng = longitude.value || 118.0149
    mapInstance = L.map(mapContainer.value, {
      center: [lat, lng],
      zoom: latitude.value ? 15 : 5,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance)

    marker = L.marker([lat, lng], {
      draggable: true,
    }).addTo(mapInstance)

    marker.on('dragend', async (e) => {
      const latlng = e.target.getLatLng()
      latitude.value = latlng.lat
      longitude.value = latlng.lng
      await reverseGeocode(latlng.lat, latlng.lng)
    })
  }
})

/* ─── Methods ─────────────────────────────────────────────────────────────── */

// Promise wrapper untuk GPS
const getCurrentPositionAsync = () => new Promise((resolve) => {
  if (!navigator.geolocation) { resolve(); return }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latitude.value = pos.coords.latitude
      longitude.value = pos.coords.longitude
      reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      resolve()
    },
    () => resolve() // gagal GPS — lanjut saja
  )
})

// Reverse geocode + auto-resolve wilayah terdekat
const reverseGeocode = async (lat, lng) => {
  let addressData = null

  // 1. Cari alamat + admin boundary dari Nominatim (lebih lengkap)
  try {
    const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`)
    addressData = await geo.json()
  } catch { /* lanjut */ }

  if (addressData?.display_name) {
    address.value = addressData.display_name
  } else {
    // Fallback ke backend
    try {
      const { default: apiClient } = await import('@/services/apiClient')
      const res = await apiClient.get('/geocode/reverse', { params: { lat, lng } })
      if (res.data?.success && res.data.address) {
        address.value = res.data.address
      }
    } catch { /* biarkan kosong */ }
  }

  // 2. Auto-resolve wilayah: coba backend dulu, fallback ke Nominatim address
  try {
    const { default: apiClient } = await import('@/services/apiClient')
    const res = await apiClient.get('/wilayah/terdekat', { params: { lat, lng } })
    const wilayah = res.data?.data
    if (wilayah?.kecamatan?.kode) {
      selectedWilayahKode.value = wilayah.kecamatan.kode
      selectedRegionName.value = `${wilayah.kecamatan.nama}, ${wilayah.kabupaten?.nama || ''}`
      return // berhasil
    }
  } catch { /* fallback ke Nominatim */ }

  // 3. Fallback: ambil kecamatan/kabupaten dari Nominatim address
  if (addressData?.address) {
    const a = addressData.address
    // Nominatim memetakan: county/city → kabupaten, state → provinsi
    const namaKec = a.suburb || a.village || a.town || a.city_district || a.county || ''
    const namaKab = a.city || a.county || a.state_district || ''
    if (namaKec) {
      selectedRegionName.value = [namaKec, namaKab].filter(Boolean).join(', ')
      // Coba cari kode via search API
      try {
        const { default: apiClient } = await import('@/services/apiClient')
        const searchRes = await apiClient.get('/wilayah/search', { params: { q: namaKec } })
        const results = searchRes.data?.data || []
        if (results.length > 0) {
          selectedWilayahKode.value = results[0].kode
        }
      } catch { /* gak apa-apa, yg penting nama kecamatan tampil */ }
    }
  }
}

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
      await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      await updateMapMarker(latitude.value, longitude.value)
    },
    () => {
      isLocating.value = false
      // GPS gagal — tidak ada fallback hardcode, user harus pilih manual
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
  searchResults.value = []
  searchQuery.value = ''

  let lat = Number(region.latitude)
  let lng = Number(region.longitude)

  // Jika koordinat tidak tersedia dari search, fetch detail wilayah
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    try {
      const { default: apiClient } = await import('@/services/apiClient')
      const res = await apiClient.get(`/wilayah/${region.kode}`)
      const detail = res.data?.data || res.data
      lat = Number(detail?.latitude)
      lng = Number(detail?.longitude)
      console.log('📍 Koordinat dari detail wilayah:', lat, lng)
    } catch (e) {
      console.warn('Gagal fetch detail wilayah:', e)
    }
  }

  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    latitude.value = lat
    longitude.value = lng
    address.value = region.nama
    await updateMapMarker(lat, lng)
  } else {
    // Fallback: geocode via Nominatim
    try {
      const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region.nama)}&format=json&limit=1`)
      const geoData = await geo.json()
      if (geoData.length > 0) {
        lat = Number(geoData[0].lat)
        lng = Number(geoData[0].lon)
        latitude.value = lat
        longitude.value = lng
        address.value = region.nama
        await updateMapMarker(lat, lng)
        console.log('📍 Koordinat dari Nominatim:', lat, lng)
      } else {
        console.warn('Koordinat tidak ditemukan untuk:', region.nama)
        address.value = region.nama
      }
    } catch (e) {
      console.warn('Nominatim geocoding gagal:', e)
      address.value = region.nama
    }
  }
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
    const result = await reportStore.addReport({
      userName: reportMode.value === 'anonim' ? 'Anonim' : (userName.value || 'Warga'),
      address: address.value,
      description: description.value,
      wilayah_kode: selectedWilayahKode.value || undefined,
      latitude: latitude.value,
      longitude: longitude.value,
      foto: selectedFile.value,
    })
    // Ambil poin dari response backend (hanya untuk user login)
    if (result?.poin_didapat) {
      gamificationStore.addPoints(result.poin_didapat)
    }
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
    <!-- ─── Header illustration (Lottie full-width) ─── -->
    <div class="hero-full-width relative overflow-hidden" style="height: 550px; border-radius: 0; background: var(--lj-blue-pale);">
      <!-- Lottie fills full width left to right -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <Vue3Lottie
          animationLink="/illustrasi_laporan.json"
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

    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      <!-- ════════════════════════════════════════════════════ -->
      <!-- STEP: FORM                                          -->
      <!-- ════════════════════════════════════════════════════ -->
      <div v-if="step === 'form'" :key="'form'">
        
        <!-- Page Title -->
        <div class="text-center animate-on-scroll mb-8">
          <div class="lj-section-label mb-3 mx-auto" style="width: fit-content;">LAPORAN JENTIK</div>
          <h1 class="lj-heading">Buat <span class="font-garamond" style="color: var(--lj-blue);">Laporan</span></h1>
          <p class="text-sm mt-3 mx-auto" style="color: var(--lj-muted); max-width: 460px;">Bantu komunitas dengan melaporkan temuan jentik nyamuk di sekitarmu. Setiap laporan berarti bagi pencegahan wabah.</p>
        </div>

        <!-- Form (no floating card) -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border" style="border-color: var(--lj-border);">

        <!-- Map GIS Section -->
        <div class="animate-on-scroll space-y-0" style="border: 2px solid var(--lj-green-dk); border-radius: 20px;">

          <!-- Search bar OUTSIDE overflow-hidden card (above map) -->
          <div class="p-3 border-b bg-white relative" style="border-color: var(--lj-border); border-radius: 18px 18px 0 0; z-index: 9999;">
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
              <!-- Dropdown di sini, BUKAN di dalam overflow:hidden -->
              <div
                v-if="searchResults.length > 0"
                class="absolute left-0 right-0 top-full z-50 mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto text-xs"
                style="border-color: var(--lj-border);"
              >
                <div
                  v-for="r in searchResults"
                  :key="r.kode"
                  @click="selectRegion(r)"
                  class="p-3 hover:bg-[--lj-blue-pale] cursor-pointer flex justify-between items-center font-medium border-b last:border-b-0"
                  style="color: var(--lj-navy); border-color: var(--lj-border);"
                >
                  <span>{{ r.nama }} ({{ r.tingkat }})</span>
                  <span style="color: var(--lj-blue); font-weight: 700;">Pilih →</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Map (overflow hidden HANYA di sini agar tiles tidak bocor) -->
          <div class="overflow-hidden relative" style="border-radius: 0 0 18px 18px; z-index: 10;">
            <div ref="mapContainer" style="height: 260px;" class="w-full relative">
              <!-- GPS overlay button -->
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
              <span class="font-bold" style="color: var(--lj-navy);">📍 {{ selectedRegionName }}</span>
            </div>
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
            class="lj-btn-primary w-full justify-center py-4 text-base disabled:opacity-50 mt-4 shadow-lg hover:scale-[1.02]"
          >
            <FileText class="w-5 h-5" />
            {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
          </button>
        </form>
        </div> <!-- End of Big Card Container -->
      </div>

      <!-- ════════════════════════════════════════════════════ -->
      <!-- STEP: SUCCESS                                       -->
      <!-- ════════════════════════════════════════════════════ -->
      <div v-else :key="'success'">
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
        <div class="lj-card overflow-hidden animate-on-scroll border-2" style="border-color: var(--lj-green);">
          <button
            @click="openReward1 = !openReward1"
            class="w-full flex items-center justify-between p-5 hover:bg-[--lj-blue-pale] transition-colors"
          >
            <span class="text-base font-bold" style="color: var(--lj-navy);">Share ke media sosial anda</span>
            <ChevronDown v-if="!openReward1" class="w-5 h-5" style="color: var(--lj-blue);" />
            <ChevronUp v-else class="w-5 h-5" style="color: var(--lj-blue);" />
          </button>
          <Transition name="accordion-content">
            <div v-if="openReward1" class="p-5 pt-0 space-y-4">
              <div class="p-5 rounded-2xl text-sm leading-relaxed font-medium" style="background: var(--lj-green); color: var(--lj-navy);">
                Ceritakan ke temanmu bahwa kamu baru saja bantu jaga lingkungan dari DBD. Bagikan lewat story Instagram atau status WhatsApp.
              </div>
              <button
                class="lj-btn-green w-full justify-center py-3.5 shadow-md"
                @click="alert('Template dibuka!')"
              >
                <Share2 class="w-5 h-5" /> Bagikan Sekarang
              </button>
            </div>
          </Transition>
        </div>

        <!-- Reward 2: Bonus Kuota Subscribe -->
        <div class="lj-card overflow-hidden animate-on-scroll border-2" style="border-color: #F59E0B;">
          <button
            @click="openReward2 = !openReward2"
            class="w-full flex items-center justify-between p-5 hover:bg-amber-50 transition-colors"
          >
            <span class="text-base font-bold" style="color: var(--lj-navy);">Bonus Kuota Subscribe Wilayah</span>
            <ChevronDown v-if="!openReward2" class="w-5 h-5" style="color: #F59E0B;" />
            <ChevronUp v-else class="w-5 h-5" style="color: #F59E0B;" />
          </button>
          <Transition name="accordion-content">
            <div v-if="openReward2" class="p-5 pt-0 space-y-4">
              <div class="p-5 rounded-2xl text-sm leading-relaxed font-medium" style="background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A;">
                Biasanya warga hanya bisa mengikuti notifikasi 1 wilayah. Berkat laporan ini, kamu dapat bonus untuk memantau 1 wilayah tambahan — pantau rumah dan sekolah anak sekaligus, misalnya.
              </div>
              <RouterLink to="/peta-resiko" class="lj-btn-primary w-full justify-center py-3.5 shadow-md" style="background: #F59E0B; color: white;">
                <MapPin class="w-5 h-5" /> Pilih Wilayah
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
      </div>
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
