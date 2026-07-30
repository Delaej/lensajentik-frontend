<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Search, Filter, BellRing, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, AlertTriangle,
  TrendingUp, Thermometer, Droplets, MapPin, Map
} from 'lucide-vue-next'
import { useMapStore } from '@/stores/useMapStore'

const mapStore = useMapStore()
const mapContainer = ref(null)
let mapInstance = null
let activeLayers = []
const isMaximized = ref(false)
const hoverPopupVisible = ref(false)
const hoverPopupIndex = ref(0)
const hoverPopupX = ref(0)
const hoverPopupY = ref(0)

const riskLegend = [
  { color: '#EF4444', label: 'Merah — Risiko Tinggi', desc: 'ABJ < 90%. Wilayah ini memiliki banyak titik genangan aktif. Kader perlu segera turun lapangan.' },
  { color: '#F59E0B', label: 'Kuning — Risiko Sedang', desc: 'ABJ 90–94%. Perlu kewaspadaan. Warga diminta melakukan 3M Plus secara mandiri.' },
  { color: '#22C55E', label: 'Hijau — Risiko Rendah', desc: 'ABJ ≥ 95%. Wilayah relatif aman, namun tetap jaga kebersihan lingkungan.' },
]

const drawLayers = (L) => {
  activeLayers.forEach((l) => mapInstance.removeLayer(l))
  activeLayers = []
  mapStore.diseaseRiskData.forEach((region) => {
    const color = region.riskCode === 'high' ? '#EF4444' : region.riskCode === 'medium' ? '#F59E0B' : '#22C55E'
    
    let polygon;
    if (region.geojson) {
      polygon = L.geoJSON(region.geojson, {
        style: { color, fillColor: color, fillOpacity: 0.32, weight: 2 }
      }).addTo(mapInstance)
    } else {
      polygon = L.polygon(region.latLngs, {
        color,
        fillColor: color,
        fillOpacity: 0.32,
        weight: 2,
      }).addTo(mapInstance)
    }
    
    polygon.regionId = region.id
    polygon.defaultColor = color

    polygon.on('mouseover', (e) => {
      hoverPopupVisible.value = true
      hoverPopupIndex.value = region.riskCode === 'high' ? 0 : region.riskCode === 'medium' ? 1 : 2
      // e.latlng is the mouse position
      const point = mapInstance.latLngToContainerPoint(e.latlng)
      hoverPopupX.value = point.x + 20
      hoverPopupY.value = point.y - 40
      
      // Highlight on hover
      if (polygon.setStyle) {
        polygon.setStyle({ fillColor: '#4E63DA', fillOpacity: 0.8, color: '#1E2B5B', weight: 3 })
      }
    })
    
    polygon.on('mousemove', (e) => {
      const point = mapInstance.latLngToContainerPoint(e.latlng)
      hoverPopupX.value = point.x + 20
      hoverPopupY.value = point.y - 40
    })
    
    polygon.on('mouseout', (e) => {
      hoverPopupVisible.value = false
      // Revert style if not selected
      if (mapStore.selectedRegion?.id !== region.id) {
        if (polygon.setStyle) {
          polygon.setStyle({ fillColor: color, fillOpacity: 0.32, color: color, weight: 2 })
        }
      }
    })

    polygon.on('click', () => {
      mapStore.fetchRegionDetail(region.id)
      mapInstance.flyTo(region.coordinates, 14, { duration: 1.2 })
    })
    
    // Initial highlight if already selected
    if (mapStore.selectedRegion?.id === region.id) {
      if (polygon.setStyle) {
        polygon.setStyle({ fillColor: '#4E63DA', fillOpacity: 0.8, color: '#1E2B5B', weight: 3 })
      }
    }
    
    activeLayers.push(polygon)
  })
}

// Watch selectedRegion from store to fly to it and highlight it when selected from list/search
watch(() => mapStore.selectedRegion, (newRegion, oldRegion) => {
  if (mapInstance && activeLayers.length > 0) {
    activeLayers.forEach(polygon => {
      if (newRegion && polygon.regionId === newRegion.id) {
        polygon.setStyle({ fillColor: '#4E63DA', fillOpacity: 0.8, color: '#1E2B5B', weight: 3 })
      } else {
        polygon.setStyle({ fillColor: polygon.defaultColor, fillOpacity: 0.32, color: polygon.defaultColor, weight: 2 })
      }
    })
  }

  if (newRegion && newRegion.coordinates && mapInstance) {
    mapInstance.flyTo(newRegion.coordinates, 14, { duration: 1.2 })
  }
})

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const L = (await import('leaflet')).default
    mapInstance = L.map(mapContainer.value, {
      center: [-6.9175, 107.6191],
      zoom: 13,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | LensaJentik',
      maxZoom: 18,
    }).addTo(mapInstance)

    await mapStore.fetchRiskMap()
    await mapStore.fetchSubscribedRegions()
    drawLayers(L)

    watch(() => mapStore.diseaseRiskData, () => drawLayers(L), { deep: true })
  }
})

watch(() => mapStore.selectedDisease, async () => { await mapStore.fetchRiskMap() })

const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value
  setTimeout(() => mapInstance?.invalidateSize(), 300)
}

const handleSubscribe = () => {
  if (mapStore.selectedRegion) {
    mapStore.toggleSubscription(mapStore.selectedRegion.id)
  }
}

const isSubscribed = computed(() =>
  mapStore.selectedRegion && mapStore.subscribedRegions.includes(mapStore.selectedRegion.id)
)

const handleSearch = async () => {
  if (mapStore.searchQuery.length >= 3) {
    await mapStore.searchRegions(mapStore.searchQuery)
  } else {
    mapStore.searchResults = []
  }
}

const selectRegionFromSearch = async (region) => {
  mapStore.searchQuery = region.nama
  mapStore.searchResults = []
  
  // Call backend detail API to get data & coords
  await mapStore.fetchRegionDetail(region.kode)
  
  // Also fly to coords if available
  if (mapStore.selectedRegion && mapStore.selectedRegion.coordinates && mapInstance) {
    mapInstance.flyTo(mapStore.selectedRegion.coordinates, 14, { duration: 1.2 })
  }
}

const tooltipLegend = [
  { 
    color: 'bg-rose-500', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]', glow: 'bg-rose-500', 
    label: 'Tinggi', desc: 'Warna merah menunjukkan bahwa wilayah yang ditunjukkan memiliki banyak genangan air & sarang nyamuk aktif. Segera lakukan kerja bakti 3M Plus!' 
  },
  { 
    color: 'bg-amber-500', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.8)]', glow: 'bg-amber-400',
    label: 'Sedang', desc: 'Warna kuning menunjukkan bahwa wilayah yang ditunjukkan memiliki potensi sarang jentik tersembunyi. Perlu dikuras dan dibersihkan minggu ini.' 
  },
  { 
    color: 'bg-emerald-500', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]', glow: 'bg-emerald-400',
    label: 'Rendah', desc: 'Warna hijau menunjukkan bahwa wilayah yang ditunjukkan memiliki lingkungan bersih dan bebas jentik. Pertahankan terus pola hidup sehat Anda!' 
  },
]
</script>

<template>
  <div class="space-y-8 pb-24">

    <!-- ─── Hero banner (Lottie placeholder) ─── -->
    <div class="hero-full-width lottie-placeholder animate-on-scroll flex-col relative" style="height: 320px; border-radius: 0;">
      <Map class="w-16 h-16 mb-2 text-[--lj-blue]" />
      <span class="font-semibold text-lg text-glow" style="color: var(--lj-blue);">Lottie: Ilustrasi Peta Risiko Nyamuk</span>
      
      <!-- Sway wave bottom -->
      <div class="absolute bottom-0 left-0 w-full z-10" style="transform: translateY(1px);">
        <img src="/sway-hadapatas.svg" alt="" aria-hidden="true" class="w-full block" style="height: 70px; object-fit: fill;" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      <!-- Page Title -->
      <div class="text-center py-8 animate-on-scroll">
        <div class="lj-section-label mb-3 mx-auto" style="width: fit-content;">PETA RISIKO</div>
        <h1 class="lj-heading">Peta <span class="font-garamond" style="color: var(--lj-blue);">Risiko</span> Nyamuk</h1>
        <p class="text-sm mt-3 mx-auto" style="color: var(--lj-muted); max-width: 520px;">Lihat tingkat risiko wilayahmu berdasarkan data cuaca real-time, laporan warga, dan pemantauan jentik kader kesehatan.</p>
      </div>

    <!-- ─── Search + Filter Bar ─── -->
    <div class="animate-on-scroll flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-3xl shadow-sm border mx-auto max-w-4xl relative z-40 -mt-16" style="border-color: var(--lj-border);">
      <div class="relative flex-1">
        <Search class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--lj-blue);" />
        <input
          v-model="mapStore.searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Cari kecamatan anda...."
          class="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[--lj-bg] text-sm font-medium outline-none transition-all focus:ring-2"
          style="focus:ring-color: var(--lj-blue);"
        />
        
        <!-- Search Dropdown -->
        <div
          v-if="mapStore.searchResults && mapStore.searchResults.length > 0"
          class="absolute left-0 right-0 top-full mt-2 bg-white border rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 text-sm"
          style="border-color: var(--lj-border);"
        >
          <div
            v-for="res in mapStore.searchResults"
            :key="res.kode"
            @click="selectRegionFromSearch(res)"
            class="p-4 hover:bg-[--lj-blue-pale] cursor-pointer flex flex-col border-b last:border-b-0"
            style="border-color: var(--lj-border);"
          >
            <span class="font-bold text-gray-800">{{ res.nama }}</span>
            <span class="text-xs text-gray-500">{{ res.tingkat }}</span>
          </div>
        </div>
      </div>
      <div class="relative min-w-[200px]">
        <select
          v-model="mapStore.selectedRiskLevel"
          class="w-full appearance-none pl-4 pr-10 py-3.5 rounded-2xl bg-white border text-sm font-bold cursor-pointer outline-none transition-all"
          style="border-color: var(--lj-green-dk); color: var(--lj-navy);"
        >
          <option value="all">Semua level resiko</option>
          <option value="high">Risiko Tinggi (Merah)</option>
          <option value="medium">Risiko Sedang (Kuning)</option>
          <option value="low">Risiko Rendah (Hijau)</option>
        </select>
        <div class="w-2.5 h-2.5 rounded-full absolute right-4 top-1/2 -translate-y-1/2 bg-[--lj-green-dk] pointer-events-none"></div>
      </div>
    </div>

    <!-- ─── Map Container ─── -->
    <div
      class="animate-on-scroll relative lj-card overflow-hidden"
      :class="{ 'map-maximized': isMaximized }"
      style="border: 2px solid var(--lj-green-dk); z-index: 10;"
    >
      <!-- Map -->
      <div ref="mapContainer" :style="{ height: isMaximized ? '100vh' : '480px' }" class="w-full z-0" />

      <!-- Maximize toggle -->
      <button
        @click="toggleMaximize"
        class="absolute top-3 right-3 z-20 w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        style="border: 1px solid var(--lj-border);"
      >
        <Maximize2 v-if="!isMaximized" class="w-4 h-4" style="color: var(--lj-blue);" />
        <Minimize2 v-else class="w-4 h-4" style="color: var(--lj-blue);" />
      </button>

      <!-- Hover Custom Tooltip (Figma Style) -->
      <div
        v-if="hoverPopupVisible"
        class="absolute z-30 pointer-events-none transition-opacity duration-200 w-48 rounded-3xl p-5 text-center text-white overflow-hidden shadow-2xl"
        :style="{ background: '#4E63DA', left: hoverPopupX + 'px', top: hoverPopupY + 'px', transform: 'translate(0, -50%)' }"
      >
        <div class="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-40" :class="tooltipLegend[hoverPopupIndex].glow"></div>
        <div class="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-white/10 backdrop-blur border border-white/20 relative z-10">
           <div class="w-6 h-6 rounded-full" :class="[tooltipLegend[hoverPopupIndex].color, tooltipLegend[hoverPopupIndex].shadow]"></div>
        </div>
        <p class="text-[10px] font-medium leading-relaxed relative z-10 opacity-90">
          {{ tooltipLegend[hoverPopupIndex].desc }}
        </p>
      </div>
    </div>

    <!-- ─── Hasil Pemeriksaan ─── -->
    <div v-if="mapStore.selectedRegion" class="space-y-8 mt-12">
      <div class="text-center">
        <div class="px-4 py-1 rounded-full text-[10px] font-bold mb-3 mx-auto" style="width: fit-content; border: 1.5px solid #4E63DA; color: var(--lj-navy); background: white;">HASIL PEMERIKSAAN</div>
        <h2 class="text-3xl sm:text-4xl font-bold" style="color: var(--lj-navy);">
          Kecamatan {{ mapStore.selectedRegion.name }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <!-- Kondisi Wilayah Card (Figma style) -->
        <div class="lj-card p-8 flex flex-col justify-between" style="border-radius: 28px; background: white;">
          <div class="space-y-3">
            <h3 class="font-bold text-lg text-left" style="color: var(--lj-navy);">Keadaan Wilayah</h3>
            <p class="text-[11px] leading-relaxed text-left" style="color: var(--lj-navy); opacity: 0.85;">
              Kondisi lingkungan di sekitar kita saat ini cukup mendukung bagi nyamuk untuk berkembang biak.
              Sederhananya, jika ada 10 wadah air terbuka di halaman rumah, 6 di antaranya berpotensi besar menjadi tempat bertelur nyamuk jika dibiarkan.
            </p>
          </div>

          <!-- Kondisi Udara box -->
          <div class="mt-6 mb-5">
            <div class="text-[11px] font-bold mb-2 text-left" style="color: var(--lj-navy);">Kondisi Udara</div>
            <div class="flex items-center gap-4">
              <div class="border-2 rounded-2xl p-4 text-center min-w-[120px]" style="border-color: #4E63DA; background: white;">
                <div class="text-2xl font-black" style="color: var(--lj-navy);">28.5 c</div>
                <div class="text-[10px] font-bold" style="color: #4E63DA;">Sering Gerimis</div>
              </div>
              <p class="text-[11px] leading-relaxed flex-1" style="color: var(--lj-navy); opacity: 0.85;">
                Suhu hangat + air hujan membuat wadah liar menampung genangan air ideal.
              </p>
            </div>
          </div>

          <!-- Sumber Informasi -->
          <div>
            <div class="text-[11px] font-bold mb-1 text-left" style="color: var(--lj-navy);">Sumber Informasi</div>
            <p class="text-[11px] leading-relaxed text-left" style="color: var(--lj-navy); opacity: 0.85;">
              Ibu Kader kesehatan {{ mapStore.selectedRegion.name }} sudah melakukan pemeriksaan langsung ke rumah-rumah warga setempat minggu ini.
            </p>
          </div>
        </div>

        <!-- Risk Gauge Card (Figma style) -->
        <div class="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#F9FAFB] to-[#eefcf2] rounded-[28px]" style="min-height: 380px;">
          <!-- Green soft glow behind the gauge -->
          <div class="absolute inset-0 bg-emerald-300 opacity-20 blur-[80px] rounded-full transform scale-75"></div>
          
          <!-- Circular gauge 60% -->
          <div class="relative w-52 h-52 z-10 mb-6">
            <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90 drop-shadow-sm overflow-visible">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#F3F4F6" stroke-width="12" />
              <!-- Using 60% for the specific gauge requested in figma -->
              <circle
                cx="60" cy="60" r="45" fill="none"
                stroke="url(#gradient-green-blue)"
                stroke-width="12"
                stroke-linecap="round"
                stroke-dasharray="169.6 999"
              />
              <circle cx="60" cy="15" r="5" fill="white" />
              <defs>
                <linearGradient id="gradient-green-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#4E63DA" />
                  <stop offset="100%" stop-color="#22C55E" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-[54px] font-black" style="color: var(--lj-navy); letter-spacing: -2px;">
                60%
              </span>
            </div>
          </div>
          <div class="text-center z-10 space-y-4">
            <div class="text-xl" style="color: var(--lj-navy);">
              Peluang <span class="highlight-green px-2 py-0.5 rounded-lg font-bold" style="background: #A7F3D0;">nyamuk bertelur</span>
            </div>
            <button
              @click="handleSubscribe"
              class="px-6 py-2.5 rounded-full text-[11px] font-bold transition-transform hover:scale-105 shadow-sm"
              :style="isSubscribed ? 'background: var(--lj-green-dk); color: var(--lj-navy);' : 'background: #4E63DA; color: white;'"
            >
              {{ isSubscribed ? '✓ Wilayah Dipantau' : 'Ikuti Kabar Wilayah ini' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Prediction Card (Figma style) -->
      <div class="lj-card p-0 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0 border-2" style="border-color: #E5E7EB; border-radius: 28px;">
        <!-- Prediction map/chart (Figma graphic) -->
        <div class="relative bg-gradient-to-b from-[#8ab4f8]/30 to-[#8ab4f8]/10 flex items-center justify-center p-8 overflow-hidden min-h-[220px]">
          <!-- Raindrops decorative -->
          <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at center, white 2px, transparent 2px); background-size: 20px 40px; transform: rotate(15deg);"></div>
          
          <!-- Decorative SVG wave line (Figma match) -->
          <svg class="absolute inset-0 w-full h-full z-10 drop-shadow-md" preserveAspectRatio="none">
            <!-- Smooth green wave -->
            <path d="M-10,180 C80,120 120,200 200,100 C280,150 350,220 500,130" fill="none" stroke="#22C55E" stroke-width="6" stroke-linecap="round"/>
            
            <!-- Minggu ke-2 (Orange blob) -->
            <circle cx="45%" cy="45%" r="28" fill="#F59E0B" opacity="0.3" class="blur-md"/>
            <circle cx="45%" cy="45%" r="12" fill="#F59E0B" />
            
            <!-- Minggu ke-3 (Green blob) -->
            <circle cx="20%" cy="75%" r="28" fill="#22C55E" opacity="0.3" class="blur-md"/>
            <circle cx="20%" cy="75%" r="12" fill="#22C55E" />
          </svg>

          <!-- Labels -->
          <div class="absolute inset-0 z-20 pointer-events-none">
            <div class="absolute px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm" style="background: #F59E0B; top: 32%; left: 45%; transform: translateX(-50%);">Minggu ke-2</div>
            <div class="absolute px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm" style="background: #22C55E; top: 82%; left: 20%; transform: translateX(-50%);">Minggu ke-3</div>
          </div>
        </div>

        <!-- Prediction text (Figma style) -->
        <div class="p-8 space-y-5 flex flex-col justify-center bg-white">
          <div>
            <div class="font-bold text-lg mb-3" style="color: var(--lj-navy);">Prediksi Keadaan Wilayah</div>
            <p class="text-[11px] font-medium leading-relaxed" style="color: var(--lj-navy); opacity: 0.85;">
              Harap Siaga! Populasi nyamuk pembawa virus DBD diramal akan meningkat tajam minggu depan akibat genangan sisa hujan. Lorem ipsum dolor sit amet, aliquip irure sed labore. In nostrud fugiat qui adipiscing ut culpa elit deserunt proident est ut. Ut ex aliqua nisi proident veniam consequat magna id. Pariatur culpa quis minim pariatur esse ea sed.
            </p>
          </div>

          <div class="p-4 rounded-xl" style="background: #BBF7D0; border: 1px solid #86EFAC;">
            <div class="text-[11px] font-bold mb-1 text-center" style="color: #065F46;">Tindakan Cepat Pelindung Keluarga</div>
            <p class="text-[10px] leading-relaxed text-center" style="color: #064E3B; opacity: 0.85;">
              Lorem ipsum dolor sit amet, aliquip irure sed labore. In nostrud fugiat qui adipiscing ut culpa elit deserunt proident est ut. Ut ex aliqua nisi proident veniam consequat magna id. Pariatur culpa quis minim pariatur.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Region List when no selection -->
    <div v-else-if="mapStore.filteredRegions.length > 0" class="space-y-4">
      <div class="lj-section-label mb-4" style="width: fit-content;">DAFTAR WILAYAH ({{ mapStore.filteredRegions.length }})</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="region in mapStore.filteredRegions.slice(0, 6)"
          :key="region.id"
          @click="mapStore.setSelectedRegion(region)"
          class="lj-card p-4 cursor-pointer flex items-center justify-between gap-3"
        >
          <div>
            <div class="font-bold text-sm" style="color: var(--lj-navy);">{{ region.name }}</div>
            <div class="text-xs" style="color: var(--lj-muted);">{{ region.district }}</div>
          </div>
          <div
            class="px-3 py-1 rounded-full text-xs font-bold text-white shrink-0"
            :style="{ background: riskColor(region.riskCode) }"
          >
            {{ riskLabel(region.riskCode) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 lj-card">
      <MapPin class="w-10 h-10 mx-auto mb-3" style="color: var(--lj-blue-lt);" />
      <p class="text-sm font-bold" style="color: var(--lj-muted);">Ketik nama wilayah di kolom pencarian untuk melihat data risiko.</p>
    </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
