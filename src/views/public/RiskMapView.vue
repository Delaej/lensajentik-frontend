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
    const polygon = L.polygon(region.latLngs, {
      color,
      fillColor: color,
      fillOpacity: 0.32,
      weight: 2,
    }).addTo(mapInstance)

    polygon.on('mouseover', (e) => {
      hoverPopupVisible.value = true
      hoverPopupIndex.value = region.riskCode === 'high' ? 0 : region.riskCode === 'medium' ? 1 : 2
    })
    polygon.on('mouseout', () => {
      hoverPopupVisible.value = false
    })

    polygon.bindPopup(`
      <div style="font-family:'Satoshi',sans-serif;padding:6px 4px;min-width:180px;">
        <div style="font-weight:700;font-size:14px;color:#1E2B5B;">${region.name}</div>
        <div style="font-size:11px;color:#6B7280;margin-bottom:6px;">${region.district}</div>
        <div style="display:inline-block;padding:2px 10px;background:${color};color:white;border-radius:999px;font-weight:700;font-size:11px;">
          Risiko ${region.riskLevel} · ABJ ${region.abj}%
        </div>
      </div>
    `)
    polygon.on('click', () => mapStore.fetchRegionDetail(region.id))
    activeLayers.push(polygon)
  })
}

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

const riskColor = (code) => code === 'high' ? '#EF4444' : code === 'medium' ? '#F59E0B' : '#22C55E'
const riskLabel = (code) => code === 'high' ? 'Tinggi' : code === 'medium' ? 'Sedang' : 'Rendah'
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

    <!-- ─── Hero banner (Lottie placeholder) ─── -->
    <div class="lottie-placeholder animate-on-scroll flex-col" style="height: 180px; border-radius: 24px;">
      <Map class="w-12 h-12 mb-2 text-[--lj-blue]" />
      <span class="font-semibold text-sm" style="color: var(--lj-blue);">Lottie: Ilustrasi Peta Risiko Nyamuk</span>
    </div>

    <!-- ─── Search + Filter Bar ─── -->
    <div class="animate-on-scroll flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--lj-blue);" />
        <input
          v-model="mapStore.searchQuery"
          type="text"
          placeholder="Cari kecamatan anda...."
          class="w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all focus:ring-2"
          style="border-color: var(--lj-blue); focus:ring-color: var(--lj-blue); background: white;"
        />
      </div>
      <div class="relative">
        <select
          v-model="mapStore.selectedRiskLevel"
          class="appearance-none pl-4 pr-10 py-3.5 rounded-2xl border text-sm font-bold cursor-pointer outline-none transition-all"
          style="border-color: var(--lj-blue); color: var(--lj-blue); background: white;"
        >
          <option value="all">Semua level risiko</option>
          <option value="high">Risiko Tinggi (Merah)</option>
          <option value="medium">Risiko Sedang (Kuning)</option>
          <option value="low">Risiko Rendah (Hijau)</option>
        </select>
        <Filter class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--lj-blue);" />
      </div>
      <div class="relative">
        <select
          v-model="mapStore.selectedDisease"
          class="appearance-none pl-4 pr-10 py-3.5 rounded-2xl border text-sm font-bold cursor-pointer outline-none"
          style="border-color: var(--lj-border); color: var(--lj-muted); background: white;"
        >
          <option value="all">Semua penyakit</option>
          <option value="dbd">DBD</option>
          <option value="malaria">Malaria</option>
        </select>
        <Filter class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--lj-muted);" />
      </div>
    </div>

    <!-- ─── Map Container ─── -->
    <div
      class="animate-on-scroll relative lj-card overflow-hidden"
      :class="{ 'map-maximized': isMaximized }"
      style="border: 2px solid var(--lj-blue);"
    >
      <!-- Map -->
      <div ref="mapContainer" :style="{ height: isMaximized ? '100vh' : '420px' }" class="w-full z-0" />

      <!-- Maximize toggle -->
      <button
        @click="toggleMaximize"
        class="absolute top-3 right-3 z-20 w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        style="border: 1px solid var(--lj-border);"
      >
        <Maximize2 v-if="!isMaximized" class="w-4 h-4" style="color: var(--lj-blue);" />
        <Minimize2 v-else class="w-4 h-4" style="color: var(--lj-blue);" />
      </button>

      <!-- Legend overlay (hover popup) -->
      <Transition name="slide-up">
        <div
          v-if="hoverPopupVisible"
          class="absolute top-3 right-14 z-20 bg-white rounded-2xl p-4 shadow-xl text-xs space-y-3"
          style="border: 1.5px solid var(--lj-blue); min-width: 220px;"
        >
          <!-- Slider dots for popup -->
          <div class="flex gap-1.5 mb-2">
            <button
              v-for="(_, i) in riskLegend"
              :key="i"
              @click="hoverPopupIndex = i"
              class="rounded-full transition-all"
              :style="{ width: hoverPopupIndex === i ? '16px' : '8px', height: '8px', background: riskLegend[i].color }"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ background: riskLegend[hoverPopupIndex].color }" />
            <span class="font-bold" :style="{ color: riskLegend[hoverPopupIndex].color }">{{ riskLegend[hoverPopupIndex].label }}</span>
          </div>
          <p style="color: var(--lj-muted);">{{ riskLegend[hoverPopupIndex].desc }}</p>
          <div class="flex justify-between pt-1">
            <button @click="hoverPopupIndex = Math.max(0, hoverPopupIndex - 1)" class="text-[--lj-blue] font-bold">←</button>
            <button @click="hoverPopupIndex = Math.min(riskLegend.length - 1, hoverPopupIndex + 1)" class="text-[--lj-blue] font-bold">→</button>
          </div>
        </div>
      </Transition>

      <!-- Static legend bottom left -->
      <div class="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow text-xs space-y-1.5" style="border: 1px solid var(--lj-border);">
        <div class="font-bold mb-1" style="color: var(--lj-navy); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Legenda</div>
        <div v-for="item in riskLegend" :key="item.color" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: item.color }" />
          <span style="color: var(--lj-muted);">{{ item.label.split('—')[0] }}</span>
        </div>
      </div>
    </div>

    <!-- ─── Hasil Pemeriksaan ─── -->
    <div v-if="mapStore.selectedRegion" class="animate-on-scroll space-y-6">
      <div class="text-center">
        <div class="lj-section-label mb-3 mx-auto" style="width: fit-content;">HASIL PEMERIKSAAN</div>
        <h2 class="text-2xl sm:text-3xl font-bold" style="color: var(--lj-navy);">
          {{ mapStore.selectedRegion.name }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Kondisi Wilayah Card -->
        <div class="lj-card p-6 space-y-4">
          <h3 class="font-bold text-base" style="color: var(--lj-navy);">Keadaan Wilayah</h3>
          <p class="text-sm leading-relaxed" style="color: var(--lj-muted);">
            Kondisi lingkungan di wilayah ini saat ini cukup mendukung bagi nyamuk untuk berkembang biak.
            Terdapat beberapa titik genangan air di area permukiman.
          </p>

          <!-- Kondisi Iklim -->
          <div class="p-4 rounded-2xl space-y-2" style="background: var(--lj-blue-pale);">
            <div class="text-xs font-bold" style="color: var(--lj-blue);">Kondisi Iklim:</div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 text-sm">
                <Thermometer class="w-4 h-4" style="color: var(--risk-high);" />
                <span class="font-bold">28.5°C</span>
                <span class="text-xs" style="color: var(--lj-blue);">Sering Berawan</span>
              </div>
              <div class="flex items-center gap-1.5 text-sm">
                <Droplets class="w-4 h-4" style="color: var(--lj-blue);" />
                <span class="font-bold">{{ mapStore.selectedRegion.abj }}% ABJ</span>
              </div>
            </div>
          </div>

          <!-- Sumber Info -->
          <div class="text-xs" style="color: var(--lj-muted);">
            <span class="font-bold" style="color: var(--lj-navy);">Sumber Informasi:</span> Data ABJ diperoleh dari pemeriksaan langsung kader di {{ mapStore.selectedRegion.name }}.
          </div>
        </div>

        <!-- Risk Gauge Card -->
        <div class="lj-card p-6 flex flex-col items-center justify-center gap-4">
          <!-- Circular gauge -->
          <div class="relative w-32 h-32">
            <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E9F5" stroke-width="12" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                :stroke="riskColor(mapStore.selectedRegion.riskCode)"
                stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="`${mapStore.selectedRegion.abj * 3.14} 999`"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold" :style="{ color: riskColor(mapStore.selectedRegion.riskCode) }">
                {{ mapStore.selectedRegion.abj }}%
              </span>
            </div>
          </div>
          <div class="text-center">
            <div class="font-bold text-sm" style="color: var(--lj-navy);">
              Peluang <span style="color: var(--lj-green-dk);">nyamuk bertelur</span>
            </div>
            <button
              @click="handleSubscribe"
              class="mt-3 lj-btn-primary text-xs"
              :style="isSubscribed ? 'background: var(--lj-green-dk); color: var(--lj-navy);' : ''"
            >
              <BellRing class="w-4 h-4" />
              {{ isSubscribed ? '✓ Wilayah Dipantau' : 'Beri Kabar Wilayah Ini' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Prediction Card -->
      <div class="lj-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Prediction map placeholder (Lottie) -->
        <div>
          <div class="lottie-placeholder flex-col" style="height: 180px; border-radius: 16px;">
            <TrendingUp class="w-10 h-10 mb-2 text-[--lj-blue]" />
            <span class="text-xs font-semibold text-[--lj-blue]">Lottie: Peta Prediksi Mingguan</span>
          </div>
        </div>

        <!-- Prediction text -->
        <div class="space-y-4">
          <div>
            <div class="lj-section-label mb-2" style="width: fit-content; font-size: 11px;">Prediksi Keadaan Wilayah</div>
            <div class="flex items-start gap-2">
              <TrendingUp class="w-5 h-5 mt-0.5 shrink-0" style="color: var(--risk-high);" />
              <div>
                <p class="text-sm font-bold" style="color: var(--lj-navy);">
                  {{ mapStore.selectedRegion.forecast7Days }}
                </p>
                <p class="text-xs mt-1" style="color: var(--lj-muted);">
                  {{ mapStore.selectedRegion.forecast14Days }}
                </p>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-2xl" style="background: var(--lj-blue-pale);">
            <div class="text-xs font-bold mb-2" style="color: var(--lj-blue);">Tindakan Cepat Perlindungan Keluarga:</div>
            <ul class="text-xs space-y-1" style="color: var(--lj-muted);">
              <li>✓ Kuras bak mandi minimal seminggu sekali</li>
              <li>✓ Tutup tempat penampungan air rapat-rapat</li>
              <li>✓ Daur ulang barang bekas yang dapat menampung air</li>
              <li>✓ Pasang kelambu dan gunakan lotion anti nyamuk</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Region List when no selection -->
    <div v-else-if="mapStore.filteredRegions.length > 0" class="animate-on-scroll">
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
    <div v-else class="animate-on-scroll text-center py-12 lj-card">
      <MapPin class="w-10 h-10 mx-auto mb-3" style="color: var(--lj-blue-lt);" />
      <p class="text-sm font-bold" style="color: var(--lj-muted);">Ketik nama wilayah di kolom pencarian untuk melihat data risiko.</p>
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
