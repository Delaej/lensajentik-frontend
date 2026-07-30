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
const hoverPopupData = ref(null)

const riskLegend = [
  { color: '#EF4444', label: 'Merah — Risiko Tinggi', desc: 'ABJ < 90%. Wilayah ini memiliki banyak titik genangan aktif. Kader perlu segera turun lapangan.' },
  { color: '#F59E0B', label: 'Kuning — Risiko Sedang', desc: 'ABJ 90–94%. Perlu kewaspadaan. Warga diminta melakukan 3M Plus secara mandiri.' },
  { color: '#22C55E', label: 'Hijau — Risiko Rendah', desc: 'ABJ ≥ 95%. Wilayah relatif aman, namun tetap jaga kebersihan lingkungan.' },
  { color: '#9CA3AF', label: 'Abu-abu — Belum Ada Data', desc: 'Wilayah ini belum memiliki data skor risiko. Jalankan skor-risiko:refresh-cuaca untuk generate data.' },
]

const drawLayers = (L) => {
  activeLayers.forEach((l) => mapInstance.removeLayer(l))
  activeLayers = []

  // Outline kabupaten (jika ada GeoJSON parent)
  if (mapStore.parentRegion?.geojson) {
    const parentLayer = L.geoJSON(mapStore.parentRegion.geojson, {
      style: { color: '#1E2B5B', fillColor: 'transparent', fillOpacity: 0, weight: 3, dashArray: '8 4', opacity: 0.8 },
    }).addTo(mapInstance)
    activeLayers.push(parentLayer)
  }

  mapStore.diseaseRiskData.forEach((region) => {
    const color = region.riskCode === 'high' ? '#EF4444' : region.riskCode === 'medium' ? '#F59E0B' : region.riskCode === 'low' ? '#22C55E' : '#9CA3AF'
    
    let polygon;
    const baseStyle = mapStore.parentRegion
      ? { color: '#1E2B5B', fillColor: color, fillOpacity: 0.35, weight: 2.5, opacity: 0.7 }
      : { color, fillColor: color, fillOpacity: 0.32, weight: 2 }
    if (region.geojson) {
      polygon = L.geoJSON(region.geojson, { style: baseStyle }).addTo(mapInstance)
    } else {
      polygon = L.polygon(region.latLngs, baseStyle).addTo(mapInstance)
    }
    
    polygon.regionId = region.id
    polygon.defaultColor = color

    polygon.on('mouseover', (e) => {
      hoverPopupVisible.value = true
      hoverPopupIndex.value = region.riskCode === 'high' ? 0 : region.riskCode === 'medium' ? 1 : region.riskCode === 'low' ? 2 : 3
      // Simpan info kecamatan untuk popup
      hoverPopupData.value = {
        name: region.name,
        skor: region.skor,
        riskLevel: region.riskLevel,
        abj: region.abj,
        confidenceLevel: region.confidenceLevel,
        jumlahKecamatan: region.jumlahKecamatan,
        kecamatanDenganData: region.kecamatanDenganData,
      }
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
      hoverPopupData.value = null
      if (mapStore.selectedRegion?.id !== region.id) {
        if (polygon.setStyle) {
          polygon.setStyle({
            fillColor: color, fillOpacity: 0.32,
            color: mapStore.parentRegion ? '#1E2B5B' : color,
            weight: mapStore.parentRegion ? 2.5 : 2,
            opacity: mapStore.parentRegion ? 0.6 : 1,
          })
        }
      }
    })

    polygon.on('click', async () => {
      await mapStore.fetchRegionDetail(region.id)
      // Update warna polygon sesuai data terbaru dari detail
      if (mapStore.selectedRegion?.id === region.id) {
        const newColor = riskColor(mapStore.selectedRegion.riskCode)
        polygon.setStyle({
          fillColor: newColor, fillOpacity: 0.35,
          color: mapStore.parentRegion ? '#1E2B5B' : newColor,
          weight: mapStore.parentRegion ? 2.5 : 2,
          opacity: mapStore.parentRegion ? 0.7 : 1,
        })
        polygon.defaultColor = newColor
        // Update data di store juga
        region.riskCode = mapStore.selectedRegion.riskCode
        region.riskLevel = mapStore.selectedRegion.riskLevel
        region.skor = mapStore.selectedRegion.riskScore
      }
      mapInstance.flyTo(region.coordinates, zoomForTingkat(region.district), { duration: 0.8 })
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
    mapInstance.flyTo(newRegion.coordinates, zoomForTingkat(newRegion.district), { duration: 1.2 })
  }
})

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const L = (await import('leaflet')).default
    mapInstance = L.map(mapContainer.value, {
      center: [-2.5489, 118.0149], // Pusat Indonesia (skala nasional)
      zoom: 5,
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
    watch(() => mapStore.parentRegion?.geojson, () => { if (mapStore.parentRegion?.geojson) drawLayers(L) })
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

// Region yang dipilih dari dropdown (belum dieksekusi)
const selectedRegion = ref(null)

// Pilih dari dropdown → isi chip, jangan eksekusi dulu
const pickRegion = (region) => {
  selectedRegion.value = region
  mapStore.searchQuery = ''
  mapStore.searchResults = []
}

// Clear chip
const clearSelection = () => {
  selectedRegion.value = null
  mapStore.parentRegion = null
  mapStore.selectedRegion = null
  mapStore.diseaseRiskData = []
  mapStore.fetchRiskMap() // balik ke nasional
}

// Eksekusi pencarian (klik Cari atau Enter)
const handleSearchSubmit = async () => {
  // Jika ada chip terpilih → eksekusi
  if (selectedRegion.value) {
    await executeSearch(selectedRegion.value)
    return
  }
  // Jika tidak ada chip → cari dari teks
  const q = mapStore.searchQuery.trim()
  if (q.length < 3) return
  await mapStore.searchRegions(q)
  if (mapStore.searchResults.length > 0) {
    pickRegion(mapStore.searchResults[0])
    await executeSearch(mapStore.searchResults[0])
  }
}

const executeSearch = async (region) => {
  if (region.tingkat === 'kabupaten') {
    await mapStore.loadKecamatanUntukKabupaten(region)
    if (mapStore.diseaseRiskData.length > 0) {
      mapInstance.flyTo(mapStore.diseaseRiskData[0].coordinates, 11, { duration: 1.2 })
    }
    // Async: GeoJSON tidak blocking — polygon update otomatis begitu data datang
    mapStore.fetchKabupatenBoundary(region.nama)
    mapStore.fetchKecamatanBoundaries(region.nama)
  } else {
    await mapStore.fetchRegionDetail(region.kode)
    if (mapStore.selectedRegion?.coordinates && mapInstance) {
      mapInstance.flyTo(mapStore.selectedRegion.coordinates, zoomForTingkat(mapStore.selectedRegion.district), { duration: 1.2 })
    }
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
  {
    color: 'bg-gray-400', shadow: 'shadow-[0_0_15px_rgba(156,163,175,0.8)]', glow: 'bg-gray-400',
    label: 'Belum Ada Data', desc: 'Warna abu-abu menunjukkan bahwa wilayah ini belum memiliki data skor risiko. Klik untuk melihat estimasi cuaca real-time.'
  },
]

/* ─── Helper functions ──────────────────────────────────────────────────── */
const riskColor = (code) => {
  if (code === 'high') return '#EF4444'
  if (code === 'medium') return '#F59E0B'
  if (code === 'low') return '#22C55E'
  return '#9CA3AF'
}
const riskLabel = (code) => {
  if (code === 'high') return 'Tinggi'
  if (code === 'medium') return 'Sedang'
  if (code === 'low') return 'Rendah'
  return 'Belum Ada Data'
}

// Zoom berdasarkan tingkat wilayah: provinsi=8, kabupaten=10, kecamatan=14, desa=16
const zoomForTingkat = (district) => {
  if (!district) return 14
  const d = district.toLowerCase()
  if (d.includes('provinsi')) return 8
  if (d.includes('kabupaten') || d.includes('kota')) return 10
  if (d.includes('desa') || d.includes('kelurahan')) return 16
  return 14 // default kecamatan
}

/* ─── Computed dari selectedRegion ──────────────────────────────────────── */
// Skor risiko sebagai gauge utama (0-100,越高越危险)
const gaugePercent = computed(() => {
  const r = mapStore.selectedRegion
  if (!r || r.riskScore == null) return 0
  return Math.round(r.riskScore)
})

// Warna gauge berdasarkan level risiko
const gaugeColor = computed(() => {
  const r = mapStore.selectedRegion
  if (!r) return '#9CA3AF'
  if (r.riskCode === 'high') return '#EF4444'
  if (r.riskCode === 'medium') return '#F59E0B'
  if (r.riskCode === 'low') return '#22C55E'
  return '#9CA3AF' // no_data
})

const suhuDisplay = computed(() => {
  const s = mapStore.selectedRegion?.suhu
  return s != null ? `${s.toFixed(1)}°C` : '—°C'
})

const kondisiCuaca = computed(() => {
  const h = mapStore.selectedRegion?.curahHujan
  if (h == null) return 'Data belum tersedia'
  if (h > 15) return 'Hujan Lebat'
  if (h > 5) return 'Gerimis'
  if (h > 0) return 'Cerah Berawan'
  return 'Cerah'
})

const hujan7Display = computed(() => {
  const h = mapStore.selectedRegion?.hujan7Hari
  return h != null ? `${h.toFixed(0)} mm` : '—'
})

const kelembapanDisplay = computed(() => {
  const k = mapStore.selectedRegion?.kelembapan
  return k != null ? `${k.toFixed(0)}%` : '—'
})

const isDataKuat = computed(() => mapStore.selectedRegion?.confidenceLevel === 'kuat')

const prediksiText = computed(() => {
  const p = mapStore.selectedRegion?.predictions
  if (!p || p.length === 0) return 'Data prediksi belum tersedia untuk wilayah ini.'
  const nextWeek = p[6] || p[Math.min(6, p.length - 1)]
  if (!nextWeek) return 'Data prediksi belum mencukupi.'
  const level = nextWeek.level === 'tinggi' ? 'meningkat tajam' : nextWeek.level === 'sedang' ? 'stabil' : 'menurun'
  return `Berdasarkan data cuaca 14 hari terakhir dan prediksi Open-Meteo, populasi nyamuk pembawa virus DBD diprediksi akan ${level} dalam 7 hari ke depan (skor risiko: ${nextWeek.skor}/100). ${nextWeek.level === 'tinggi' ? 'Segera lakukan 3M Plus dan laporkan genangan air.' : nextWeek.level === 'sedang' ? 'Tetap waspada dan jaga kebersihan lingkungan. Kuras bak mandi rutin.' : 'Pertahankan kondisi lingkungan yang sudah bersih. Lanjutkan 3M Plus.'}`
})

const rekomendasiText = computed(() => {
  const r = mapStore.selectedRegion?.riskCode
  if (r === 'high') return 'Segera lakukan kerja bakti 3M Plus: Menguras, Menutup, Mendaur Ulang. Laporkan genangan air melalui fitur Laporan. Koordinasi dengan kader setempat untuk fogging.'
  if (r === 'medium') return 'Tingkatkan kewaspadaan. Kuras bak mandi minggu ini, tutup rapat tempat air, dan bersihkan talang yang tersumbat. Pantau terus notifikasi LensaJentik.'
  if (r === 'low') return 'Lanjutkan kebiasaan baik! Kuras bak mandi rutin, jaga kebersihan selokan, dan pastikan tidak ada genangan di sekitar rumah.'
  return 'Data risiko untuk wilayah ini belum tersedia. Tunggu sistem menghitung skor risiko berdasarkan data cuaca terbaru.'
})

// Data untuk prediction chart
const predictionChartData = computed(() => {
  const p = mapStore.selectedRegion?.predictions
  if (!p || p.length === 0) return []
  return p.slice(0, 14).map((x, i) => ({
    label: `+${i + 1}`,
    skor: x.skor,
    level: x.level,
    color: x.level === 'tinggi' ? '#EF4444' : x.level === 'sedang' ? '#F59E0B' : '#22C55E',
  }))
})
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

    <!-- ─── Search Bar ─── -->
    <div class="animate-on-scroll flex gap-3 bg-white p-3 rounded-3xl shadow-sm border mx-auto max-w-2xl relative z-40 -mt-16" style="border-color: var(--lj-border);">
      <div class="relative flex-1 flex items-center">
        <Search class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 z-10" style="color: var(--lj-blue);" />

        <!-- Chip: wilayah terpilih -->
        <div v-if="selectedRegion" class="flex items-center gap-2 pl-12 pr-3 py-2 w-full">
          <span class="px-3 py-1.5 rounded-xl text-sm font-bold" style="background: #EEF2FF; color: #4E63DA;">
            📍 {{ selectedRegion.nama }}
            <span class="text-xs font-normal opacity-70 ml-1">({{ selectedRegion.tingkat }})</span>
          </span>
          <button @click="clearSelection" class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" title="Hapus pilihan">
            <X class="w-3.5 h-3.5" style="color: #4B5563;" />
          </button>
        </div>

        <!-- Input: ketik nama wilayah -->
        <input
          v-else
          v-model="mapStore.searchQuery"
          @input="handleSearch"
          @keyup.enter="handleSearchSubmit"
          type="text"
          placeholder="Cari wilayah anda..."
          class="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[--lj-bg] text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[--lj-blue]"
        />

        <!-- Search Dropdown -->
        <div
          v-if="!selectedRegion && mapStore.searchResults && mapStore.searchResults.length > 0"
          class="absolute left-0 right-0 top-full mt-2 bg-white border rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 text-sm"
          style="border-color: var(--lj-border);"
        >
          <div
            v-for="res in mapStore.searchResults"
            :key="res.kode"
            @click="pickRegion(res)"
            class="p-4 hover:bg-[--lj-blue-pale] cursor-pointer flex flex-col border-b last:border-b-0"
            style="border-color: var(--lj-border);"
          >
            <span class="font-bold text-gray-800">{{ res.nama }}</span>
            <span class="text-xs text-gray-500">{{ res.tingkat }}</span>
          </div>
        </div>
      </div>
      <button
        @click="handleSearchSubmit"
        :disabled="!selectedRegion && !mapStore.searchQuery.trim()"
        class="px-6 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        style="background: #4E63DA; color: white;"
      >
        {{ selectedRegion ? 'Tampilkan' : 'Cari' }}
      </button>
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

      <!-- Hover Popup: Ringkasan Kecamatan -->
      <div
        v-if="hoverPopupVisible && hoverPopupData"
        class="absolute z-30 pointer-events-none transition-opacity duration-150 w-56 rounded-2xl p-4 text-white shadow-2xl"
        :style="{ background: '#4E63DA', left: hoverPopupX + 'px', top: hoverPopupY + 'px', transform: 'translate(0, -50%)' }"
      >
        <div class="space-y-2">
          <p class="text-[11px] font-bold leading-tight">{{ hoverPopupData.name }}</p>
          <div class="flex items-center gap-2 text-[10px]">
            <span class="px-2 py-0.5 rounded-full font-bold text-[10px]"
              :style="{ background: hoverPopupData.riskLevel === 'Tinggi' ? '#EF4444' : hoverPopupData.riskLevel === 'Sedang' ? '#F59E0B' : hoverPopupData.riskLevel === 'Rendah' ? '#22C55E' : '#9CA3AF' }">
              {{ hoverPopupData.riskLevel }}
            </span>
            <span v-if="hoverPopupData.skor != null" class="font-bold">{{ hoverPopupData.skor }}/100</span>
          </div>
          <div v-if="hoverPopupData.abj != null" class="text-[10px] opacity-80">
            ABJ: {{ Number(hoverPopupData.abj).toFixed(1) }}%
          </div>
          <div v-if="hoverPopupData.confidenceLevel === 'kuat'" class="text-[10px] opacity-80">✓ Data Lapangan</div>
          <div v-else-if="hoverPopupData.confidenceLevel === 'lemah'" class="text-[10px] opacity-80">📡 Estimasi Cuaca</div>
          <div v-if="hoverPopupData.kecamatanDenganData != null" class="text-[10px] opacity-80">
            {{ hoverPopupData.kecamatanDenganData }}/{{ hoverPopupData.jumlahKecamatan }} kec dengan data
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Hasil Pemeriksaan ─── -->
    <div v-if="mapStore.selectedRegion" class="space-y-8 mt-12">
      <!-- Kabupaten summary bar -->
      <div v-if="mapStore.parentRegion" class="flex items-center justify-center gap-3 flex-wrap">
        <button @click="mapStore.clearView()" class="text-xs font-bold px-3 py-1.5 rounded-full border hover:bg-gray-50 transition-colors" style="border-color: var(--lj-border); color: var(--lj-muted);">
          ← Kembali ke Nasional
        </button>
        <span class="text-xs px-3 py-1 rounded-full font-bold" style="background: #EEF2FF; color: #4E63DA;">
          📌 {{ mapStore.parentRegion.nama }}
        </span>
        <span class="text-xs px-3 py-1 rounded-full font-bold" :style="{ background: '#D1FAE5', color: '#065F46' }">
          {{ mapStore.diseaseRiskData.length }} kecamatan
        </span>
      </div>

      <div class="text-center">
        <div class="px-4 py-1 rounded-full text-[10px] font-bold mb-3 mx-auto" style="width: fit-content; border: 1.5px solid #4E63DA; color: var(--lj-navy); background: white;">HASIL PEMERIKSAAN</div>
        <h2 class="text-3xl sm:text-4xl font-bold" style="color: var(--lj-navy);">
          {{ mapStore.parentRegion ? 'Kabupaten' : mapStore.selectedRegion.district }} {{ mapStore.selectedRegion.name }}
        </h2>
        <!-- Kabupaten ringkasan -->
        <p v-if="mapStore.parentRegion" class="text-sm mt-2" style="color: var(--lj-muted);">
          Rata-rata skor risiko dari {{ mapStore.selectedRegion.kecamatanDenganData || 0 }}/{{ mapStore.selectedRegion.jumlahKecamatan || mapStore.diseaseRiskData.length }} kecamatan dengan data
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <!-- Kondisi Wilayah Card (Figma style) -->
        <div class="lj-card p-8 flex flex-col justify-between" style="border-radius: 28px; background: white;">
          <div class="space-y-3">
            <h3 class="font-bold text-lg text-left" style="color: var(--lj-navy);">Keadaan Wilayah</h3>
            <p class="text-[11px] leading-relaxed text-left" style="color: var(--lj-navy); opacity: 0.85;">
              <!-- Kabupaten summary -->
              <template v-if="mapStore.parentRegion">
                <template v-if="mapStore.selectedRegion?.kecamatanDenganData > 0">
                  Skor risiko rata-rata <strong>{{ gaugePercent }}/100</strong> dari
                  <strong>{{ mapStore.selectedRegion?.kecamatanDenganData }}</strong> kecamatan dengan data
                  (total {{ mapStore.selectedRegion?.jumlahKecamatan || mapStore.diseaseRiskData.length }} kecamatan).
                  <template v-if="mapStore.selectedRegion?.riskCode === 'high'">
                    ⚠ Mayoritas kecamatan menunjukkan risiko tinggi.
                  </template>
                  <template v-else-if="mapStore.selectedRegion?.riskCode === 'medium'">
                    Beberapa kecamatan perlu kewaspadaan. Pantau kecamatan merah.
                  </template>
                  <template v-else>
                    Kondisi relatif terkendali. Pertahankan pencegahan rutin.
                  </template>
                </template>
                <template v-else>
                  <strong>{{ mapStore.diseaseRiskData.length }}</strong> kecamatan terdeteksi.
                  🔍 Klik kecamatan untuk melihat detail & menghitung skor.
                </template>
              </template>
              <!-- Single region (kecamatan) -->
              <template v-else-if="mapStore.selectedRegion?.riskCode === 'high'">
                Skor risiko <strong>{{ gaugePercent }}/100</strong> — kondisi lingkungan saat ini sangat mendukung perkembangbiakan nyamuk. Curah hujan 7 hari terakhir ({{ hujan7Display }}) menciptakan banyak genangan air. Segera lakukan pemeriksaan dan pengurasan wadah air di sekitar lingkungan.
              </template>
              <template v-else-if="mapStore.selectedRegion?.riskCode === 'medium'">
                Skor risiko <strong>{{ gaugePercent }}/100</strong> — kondisi lingkungan cukup terkendali namun masih ada potensi genangan. Dengan curah hujan {{ hujan7Display }} dalam seminggu terakhir, beberapa wadah air mungkin masih menjadi sarang jentik jika tidak rutin dikuras.
              </template>
              <template v-else-if="mapStore.selectedRegion?.riskCode === 'low'">
                Skor risiko <strong>{{ gaugePercent }}/100</strong> — kondisi lingkungan relatif aman. Suhu {{ suhuDisplay }} dan curah hujan rendah ({{ hujan7Display }}) membuat potensi perkembangbiakan nyamuk terbatas. Pertahankan kebiasaan 3M Plus.
              </template>
              <template v-else>
                Data skor risiko untuk wilayah ini <strong>belum tersedia</strong>. Sistem sedang memproses data cuaca dari Open-Meteo. Klik untuk menghitung skor risiko secara real-time.
              </template>
            </p>
          </div>

          <!-- Kondisi Udara box -->
          <div class="mt-6 mb-5">
            <div class="text-[11px] font-bold mb-2 text-left" style="color: var(--lj-navy);">Kondisi Udara (Data Open-Meteo)</div>
            <div class="flex items-center gap-4">
              <div class="border-2 rounded-2xl p-4 text-center min-w-[120px]" style="border-color: #4E63DA; background: white;">
                <div class="text-2xl font-black" style="color: var(--lj-navy);">{{ suhuDisplay }}</div>
                <div class="text-[10px] font-bold" style="color: #4E63DA;">{{ kondisiCuaca }}</div>
              </div>
              <p class="text-[11px] leading-relaxed flex-1" style="color: var(--lj-navy); opacity: 0.85;">
                <template v-if="mapStore.selectedRegion?.curahHujan != null && mapStore.selectedRegion.curahHujan > 10">
                  Hujan {{ mapStore.selectedRegion.curahHujan.toFixed(1) }} mm hari ini. Suhu {{ suhuDisplay }} sangat ideal bagi nyamuk <em>Aedes aegypti</em> untuk berkembang biak. Genangan air hujan perlu segera dikuras.
                </template>
                <template v-else>
                  Suhu {{ suhuDisplay }} dengan kelembapan {{ kelembapanDisplay }}.
                  <template v-if="mapStore.selectedRegion?.suhu != null">
                    Kondisi ini {{ mapStore.selectedRegion.suhu > 25 && mapStore.selectedRegion.suhu < 30 ? 'cukup ideal' : 'kurang ideal' }} untuk perkembangbiakan nyamuk.
                  </template>
                </template>
              </p>
            </div>
          </div>

          <!-- Sumber Informasi -->
          <div>
            <div class="text-[11px] font-bold mb-1 text-left" style="color: var(--lj-navy);">Sumber Data</div>
            <p class="text-[11px] leading-relaxed text-left" style="color: var(--lj-navy); opacity: 0.85;">
              <template v-if="isDataKuat">
                Data skor risiko dihitung dari <strong>data cuaca Open-Meteo + data ABJ kader</strong> (pemeriksaan jentik langsung). Confidence level: <span style="color: #059669; font-weight: 700;">KUAT</span>.
              </template>
              <template v-else>
                Data skor risiko dihitung dari <strong>data cuaca Open-Meteo</strong> (suhu, curah hujan, kelembapan). Belum ada data ABJ kader untuk wilayah ini. Confidence level: <span style="color: #D97706; font-weight: 700;">LEMAH</span> — estimasi berbasis cuaca.
              </template>
            </p>
          </div>
        </div>

        <!-- Risk Gauge Card -->
        <div class="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#F9FAFB] to-[#eefcf2] rounded-[28px]" style="min-height: 380px;">
          <div class="absolute inset-0 opacity-20 blur-[80px] rounded-full transform scale-75" :style="{ background: gaugeColor }"></div>

          <!-- Confidence badge -->
          <div class="absolute top-4 right-4 z-10">
            <span
              class="px-3 py-1 rounded-full text-[10px] font-bold"
              :style="isDataKuat
                ? 'background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0;'
                : 'background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;'"
            >
              {{ isDataKuat ? '✓ Data Lapangan' : '📡 Estimasi Cuaca' }}
            </span>
          </div>

          <!-- Circular gauge -->
          <div class="relative w-52 h-52 z-10 mb-6">
            <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90 drop-shadow-sm overflow-visible">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#F3F4F6" stroke-width="12" />
              <circle
                cx="60" cy="60" r="45" fill="none"
                :stroke="gaugeColor"
                stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="`${(gaugePercent / 100) * 282.7} 999`"
              />
              <circle cx="60" cy="15" r="5" fill="white" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-[48px] font-black" :style="{ color: gaugeColor, letterSpacing: '-2px' }">
                {{ gaugePercent }}
              </span>
              <span class="text-[11px] font-bold text-gray-400 -mt-1">/ 100</span>
            </div>
          </div>
          <div class="text-center z-10 space-y-1">
            <div class="text-sm font-bold" style="color: var(--lj-navy);">
              Skor Risiko <span class="highlight-green px-2 py-0.5 rounded-lg font-bold" :style="{ background: gaugeColor + '22', color: gaugeColor }">{{ mapStore.selectedDisease === 'malaria' ? 'Malaria' : 'DBD' }}</span>
            </div>
            <p class="text-[10px]" style="color: var(--lj-muted);">
              {{ mapStore.selectedRegion?.riskCode === 'no_data' ? 'Data belum tersedia — klik untuk menghitung' : gaugePercent < 40 ? 'Risiko rendah — lingkungan relatif aman' : gaugePercent <= 70 ? 'Risiko sedang — perlu kewaspadaan' : 'Risiko tinggi — segera lakukan tindakan!' }}
            </p>
            <button
              @click="handleSubscribe"
              class="mt-3 px-6 py-2.5 rounded-full text-[11px] font-bold transition-transform hover:scale-105 shadow-sm"
              :style="isSubscribed ? 'background: var(--lj-green-dk); color: var(--lj-navy);' : 'background: #4E63DA; color: white;'"
            >
              {{ isSubscribed ? '✓ Wilayah Dipantau' : 'Ikuti Kabar Wilayah ini' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Prediction Card with REAL chart -->
      <div class="lj-card p-0 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0 border-2" style="border-color: #E5E7EB; border-radius: 28px;">
        <!-- Real prediction bar chart -->
        <div class="relative bg-gradient-to-b from-[#F8FAFC] to-white flex items-center justify-center p-6 min-h-[240px]">
          <div v-if="predictionChartData.length > 0" class="w-full h-full flex flex-col">
            <div class="text-[10px] font-bold text-gray-400 mb-2 text-center">PREDIKSI 14 HARI KE DEPAN (Skor Risiko)</div>
            <div class="flex-1 flex items-end gap-1 px-2">
              <div
                v-for="(bar, i) in predictionChartData"
                :key="i"
                class="flex-1 flex flex-col items-center gap-1"
                style="min-width: 0;"
              >
                <span class="text-[8px] font-bold" :style="{ color: bar.color }">{{ bar.skor }}</span>
                <div
                  class="w-full rounded-t transition-all duration-300"
                  :style="{
                    height: Math.max(4, (bar.skor / 100) * 140) + 'px',
                    background: bar.color,
                    opacity: 0.85,
                  }"
                />
                <span class="text-[8px] text-gray-400 font-medium">{{ bar.label }}h</span>
              </div>
            </div>
            <!-- Legend -->
            <div class="flex justify-center gap-3 mt-3 text-[8px] font-bold">
              <span style="color: #22C55E;">■ Rendah</span>
              <span style="color: #F59E0B;">■ Sedang</span>
              <span style="color: #EF4444;">■ Tinggi</span>
            </div>
          </div>
          <div v-else class="text-center text-xs text-gray-400">
            <div class="text-3xl mb-2">📊</div>
            Data prediksi belum tersedia.<br>Jalankan <code class="text-[10px] bg-gray-100 px-1 rounded">skor-risiko:refresh-cuaca</code>
          </div>
        </div>

        <!-- Prediction text -->
        <div class="p-8 space-y-5 flex flex-col justify-center bg-white">
          <div>
            <div class="font-bold text-lg mb-3" style="color: var(--lj-navy);">Prediksi Keadaan Wilayah</div>
            <p class="text-[11px] font-medium leading-relaxed" style="color: var(--lj-navy); opacity: 0.85;">
              {{ prediksiText }}
            </p>
          </div>

          <!-- Weather factor breakdown -->
          <div v-if="mapStore.selectedRegion?.suhu != null" class="space-y-2">
            <div class="text-[10px] font-bold text-gray-400">FAKTOR CUACA (7 hari terakhir)</div>
            <div class="grid grid-cols-3 gap-2">
              <div class="text-center p-2 rounded-lg" style="background: #EEF2FF;">
                <div class="text-[11px] font-black" style="color: #4E63DA;">{{ suhuDisplay }}</div>
                <div class="text-[8px] text-gray-400">Suhu Rata²</div>
              </div>
              <div class="text-center p-2 rounded-lg" style="background: #ECFDF5;">
                <div class="text-[11px] font-black" style="color: #059669;">{{ hujan7Display }}</div>
                <div class="text-[8px] text-gray-400">Curah Hujan 7H</div>
              </div>
              <div class="text-center p-2 rounded-lg" style="background: #FFFBEB;">
                <div class="text-[11px] font-black" style="color: #D97706;">{{ kelembapanDisplay }}</div>
                <div class="text-[8px] text-gray-400">Kelembapan</div>
              </div>
            </div>
          </div>

          <div
            class="p-4 rounded-xl"
            :style="{
              background: mapStore.selectedRegion?.riskCode === 'high' ? '#FEE2E2' : mapStore.selectedRegion?.riskCode === 'medium' ? '#FEF3C7' : mapStore.selectedRegion?.riskCode === 'low' ? '#BBF7D0' : '#F3F4F6',
              border: '1px solid ' + (mapStore.selectedRegion?.riskCode === 'high' ? '#FECACA' : mapStore.selectedRegion?.riskCode === 'medium' ? '#FDE68A' : mapStore.selectedRegion?.riskCode === 'low' ? '#86EFAC' : '#E5E7EB')
            }"
          >
            <div class="text-[11px] font-bold mb-1 text-center" :style="{ color: mapStore.selectedRegion?.riskCode === 'no_data' ? '#6B7280' : '#065F46' }">{{ mapStore.selectedRegion?.riskCode === 'no_data' ? 'Data Belum Tersedia' : 'Tindakan Cepat Pelindung Keluarga' }}</div>
            <p class="text-[10px] leading-relaxed text-center" :style="{ color: mapStore.selectedRegion?.riskCode === 'no_data' ? '#6B7280' : '#064E3B', opacity: 0.85 }">
              {{ rekomendasiText }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Region List: mode nasional -->
    <div v-else-if="!mapStore.parentRegion && mapStore.filteredRegions.length > 0" class="space-y-4">
      <div class="lj-section-label mb-4" style="width: fit-content;">DAFTAR WILAYAH ({{ mapStore.filteredRegions.length }})</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="region in mapStore.filteredRegions.slice(0, 6)"
          :key="region.id"
          @click="mapStore.fetchRegionDetail(region.id)"
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

    <!-- Kecamatan list: mode kabupaten -->
    <div v-else-if="mapStore.parentRegion && mapStore.diseaseRiskData.length > 0" class="space-y-4">
      <div class="lj-section-label mb-4" style="width: fit-content;">KECAMATAN DI {{ mapStore.parentRegion.nama.toUpperCase() }} ({{ mapStore.diseaseRiskData.length }})</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="region in mapStore.diseaseRiskData"
          :key="region.id"
          @click="mapStore.fetchRegionDetail(region.id); mapInstance?.flyTo(region.coordinates, 14, { duration: 0.8 })"
          class="lj-card p-4 cursor-pointer flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
        >
          <div>
            <div class="font-bold text-sm" style="color: var(--lj-navy);">{{ region.name }}</div>
            <div class="text-xs" style="color: var(--lj-muted);">
              Skor: {{ region.skor != null ? `${region.skor}/100` : '—' }}
              <span v-if="region.abj != null">· ABJ: {{ Number(region.abj).toFixed(1) }}%</span>
            </div>
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
