<script setup>
import { ref, onMounted } from 'vue'
import {
  MapPin,
  Filter,
  Search,
  BellRing,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-vue-next'
import { useMapStore } from '@/stores/useMapStore'

const mapStore = useMapStore()
const mapContainer = ref(null)
let mapInstance = null

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const L = (await import('leaflet')).default
    
    // Initialize map centered at Bandung area
    mapInstance = L.map(mapContainer.value, {
      center: [-6.892, 107.595],
      zoom: 13,
      zoomControl: true,
    })

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | LensaJentik GIS',
      maxZoom: 18,
    }).addTo(mapInstance)

    // Render polygon areas and markers
    mapStore.diseaseRiskData.forEach((region) => {
      const color = region.riskCode === 'high' ? '#EF4444' : region.riskCode === 'medium' ? '#F59E0B' : '#10B981'

      const polygon = L.polygon(region.latLngs, {
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2,
      }).addTo(mapInstance)

      polygon.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0; font-weight: bold; font-size: 14px;">${region.name}</h4>
          <p style="margin: 4px 0; font-size: 12px; color: #64748b;">${region.district}</p>
          <div style="display: inline-block; padding: 2px 8px; background: ${color}; color: white; border-radius: 999px; font-weight: bold; font-size: 11px;">
            Risiko: ${region.riskLevel} (${region.abj}% ABJ)
          </div>
        </div>
      `)

      polygon.on('click', () => {
        mapStore.setSelectedRegion(region)
      })
    })
  }
})
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-900 text-white">
    <!-- Left Sidebar Controls & Region Details -->
    <aside class="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-1/2 lg:h-full z-10 shrink-0">
      <!-- Search & Filters -->
      <div class="p-4 border-b border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-black text-lg flex items-center gap-2 text-white">
            <MapPin class="w-5 h-5 text-blue-400" /> Web-GIS Pemetaan
          </h2>
          <span class="text-[10px] font-bold bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700">Live GIS</span>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="mapStore.searchQuery"
            type="text"
            placeholder="Cari Kelurahan / Kecamatan..."
            class="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none text-white"
          />
        </div>

        <!-- Filter Selects -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">Jenis Penyakit</label>
            <select v-model="mapStore.selectedDisease" class="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-xs outline-none">
              <option value="all">Semua Vektor</option>
              <option value="dbd">DBD (Aedes)</option>
              <option value="malaria">Malaria (Anopheles)</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">Tingkat Risiko</label>
            <select v-model="mapStore.selectedRiskLevel" class="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-xs outline-none">
              <option value="all">Semua Tingkat</option>
              <option value="high">Merah (Tinggi)</option>
              <option value="medium">Kuning (Sedang)</option>
              <option value="low">Hijau (Rendah)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Region Details Card or List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- If Region Selected -->
        <div v-if="mapStore.selectedRegion" class="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-extrabold text-base text-white">{{ mapStore.selectedRegion.name }}</h3>
              <p class="text-xs text-slate-400">{{ mapStore.selectedRegion.district }}</p>
            </div>
            <button
              @click="mapStore.toggleSubscription(mapStore.selectedRegion.name)"
              class="p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              :class="mapStore.subscribedRegions.includes(mapStore.selectedRegion.name) ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'"
            >
              <BellRing class="w-3.5 h-3.5" />
              <span>{{ mapStore.subscribedRegions.includes(mapStore.selectedRegion.name) ? 'Subscribed' : 'Subscribe' }}</span>
            </button>
          </div>

          <!-- Confidence Level & ABJ Badge -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-3 bg-slate-900/80 rounded-xl">
              <div class="text-[10px] text-slate-400">Skor ABJ Real-time</div>
              <div class="text-lg font-black" :class="mapStore.selectedRegion.abj >= 95 ? 'text-emerald-400' : 'text-rose-400'">
                {{ mapStore.selectedRegion.abj }}%
              </div>
            </div>
            <div class="p-3 bg-slate-900/80 rounded-xl">
              <div class="text-[10px] text-slate-400">Confidence Level</div>
              <div class="text-lg font-black text-blue-400">{{ mapStore.selectedRegion.confidenceLevel }}%</div>
            </div>
          </div>

          <!-- 7-14 Days Forecast Box -->
          <div class="p-3.5 bg-blue-950/60 border border-blue-800/60 rounded-xl space-y-2 text-xs">
            <div class="font-bold text-blue-300 flex items-center gap-1.5">
              <TrendingUp class="w-4 h-4 text-blue-400" /> Prediksi Tren 7-14 Hari
            </div>
            <div class="text-slate-300 text-[11px] leading-relaxed">
              <strong>7 Hari:</strong> {{ mapStore.selectedRegion.forecast7Days }}
            </div>
            <div class="text-slate-300 text-[11px] leading-relaxed">
              <strong>14 Hari:</strong> {{ mapStore.selectedRegion.forecast14Days }}
            </div>
          </div>
        </div>

        <!-- Region List -->
        <div class="space-y-2">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Wilayah Multi-Risk ({{ mapStore.filteredRegions.length }})</div>
          <div
            v-for="region in mapStore.filteredRegions"
            :key="region.id"
            @click="mapStore.setSelectedRegion(region)"
            class="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs"
          >
            <div>
              <div class="font-bold text-white">{{ region.name }}</div>
              <div class="text-[10px] text-slate-400">{{ region.district }}</div>
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="region.riskCode === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : region.riskCode === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'"
            >
              {{ region.riskLevel }} ({{ region.abj }}%)
            </span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Right Web-GIS Leaflet Map Container -->
    <main class="flex-1 h-1/2 lg:h-full relative">
      <div ref="mapContainer" class="w-full h-full z-0"></div>

      <!-- Map Legend Overlay -->
      <div class="absolute bottom-6 right-6 z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-xs text-white space-y-2 shadow-2xl">
        <div class="font-bold text-slate-300 text-[11px] uppercase">Legenda Kode Warna Risiko</div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>Hijau: Risiko Rendah (ABJ &ge; 95%)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Kuning: Risiko Sedang (ABJ 90-94%)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-rose-500"></span>
          <span>Merah: Risiko Tinggi (ABJ &lt; 90%)</span>
        </div>
      </div>
    </main>
  </div>
</template>
