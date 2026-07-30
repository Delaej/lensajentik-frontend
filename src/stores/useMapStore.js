import { defineStore } from 'pinia'
import { mapService } from '@/services/mapService'

export const useMapStore = defineStore('map', {
  state: () => ({
    selectedDisease: 'dbd', // 'dbd' | 'malaria' | 'all'
    selectedRiskLevel: 'all', // 'all' | 'high' | 'medium' | 'low'
    searchQuery: '',
    selectedRegion: null,
    subscribedRegions: [],
    searchResults: [],
    diseaseRiskData: [],
  }),

  getters: {
    filteredRegions: (state) => {
      return state.diseaseRiskData.filter((item) => {
        const matchesDisease = state.selectedDisease === 'all' || item.disease === state.selectedDisease
        const matchesRisk = state.selectedRiskLevel === 'all' || item.riskCode === state.selectedRiskLevel
        const matchesSearch =
          !state.searchQuery ||
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.district.toLowerCase().includes(state.searchQuery.toLowerCase())
        return matchesDisease && matchesRisk && matchesSearch
      })
    },
  },

  actions: {
    async fetchRiskMap(params = {}) {
      try {
        const queryParams = {
          tingkat: params.tingkat || 'kecamatan',
          parent_kode: params.parent_kode || '3273', // Default: Kota Bandung
          jenis: this.selectedDisease === 'all' ? 'dbd' : this.selectedDisease,
          ...params,
        }
        
        const response = await mapService.getRiskMap(queryParams)
        const records = response.data || response
        
        this.diseaseRiskData = records.map((rec) => {
          const lat = Number(rec.wilayah.latitude) || -6.9175
          const lng = Number(rec.wilayah.longitude) || 107.6191
          const offset = 0.007 // Offset for dynamic map square bounds
          const latLngs = [
            [lat + offset, lng - offset],
            [lat + offset, lng + offset],
            [lat - offset, lng + offset],
            [lat - offset, lng - offset],
          ]

          return {
            id: rec.wilayah_kode,
            name: rec.wilayah.nama,
            district: rec.wilayah.tingkat === 'desa' ? 'Kelurahan Tugas' : 'Kecamatan',
            city: 'Bandung',
            disease: rec.jenis_penyakit,
            riskLevel: rec.level_risiko === 'tinggi' ? 'Tinggi' : rec.level_risiko === 'sedang' ? 'Sedang' : 'Rendah',
            riskCode: rec.level_risiko === 'tinggi' ? 'high' : rec.level_risiko === 'sedang' ? 'medium' : 'low',
            abj: rec.faktor_perhitungan ? rec.faktor_perhitungan.abj_persen || 92.5 : 92.5,
            casesCurrent: rec.faktor_perhitungan ? Math.round(rec.faktor_perhitungan.skor_laporan || 0) : 0,
            casesPrevious: 0,
            trend: 'stable',
            confidenceLevel: rec.confidence_level === 'kuat' ? 94 : 45,
            coordinates: [lat, lng],
            latLngs: latLngs,
            forecast7Days: rec.prediksi?.[6]
              ? `Prediksi skor: ${rec.prediksi[6].skor}`
              : rec.level_risiko === 'tinggi' ? 'Diprediksi tetap tinggi' : rec.level_risiko === 'sedang' ? 'Diprediksi stabil' : 'Diprediksi tetap rendah',
            forecast14Days: rec.prediksi?.[13]
              ? `Prediksi skor: ${rec.prediksi[13].skor}`
              : rec.level_risiko === 'tinggi' ? 'Perlu kewaspadaan 2 minggu' : 'Kondisi diprediksi aman',
            lastInspection: rec.tanggal,
            positiveContainers: 0,
          }
        })
      } catch (error) {
        console.error('Fetch risk map failed:', error)
      }
    },

    async searchRegions(query) {
      if (!query || query.length < 3) return
      try {
        const response = await mapService.searchWilayah(query)
        this.searchResults = response.data || response
      } catch (error) {
        console.error('Search wilayah failed:', error)
      }
    },

    async fetchRegionDetail(kode) {
      try {
        const response = await mapService.getRiskDetail(kode, this.selectedDisease === 'all' ? 'dbd' : this.selectedDisease)
        const details = response.data || response
        
        const mainScore = details.skor_hari_ini || {}
        const predictions = details.prediksi || []

        let lat = Number(details.wilayah.latitude)
        let lng = Number(details.wilayah.longitude)
        let geojson = null

        // Fetch geocoding & boundary from Nominatim
        try {
          // Use search format to find the boundary of the region, fetching up to 5 results to filter out offices
          // Do not append "Kecamatan" or "Kelurahan" because it causes Nominatim to return POI offices instead of administrative boundaries!
          const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(details.wilayah.nama + ', Indonesia')}&format=json&limit=5&polygon_geojson=1`)
          const geoData = await geo.json()
          if (geoData.length > 0) {
            // Prefer administrative boundaries over POIs (like offices)
            let targetGeo = geoData.find(g => g.class === 'boundary' && g.type === 'administrative')
            // Fallback to any polygon if administrative boundary is not found
            if (!targetGeo) {
              targetGeo = geoData.find(g => g.geojson && g.geojson.type.includes('Polygon')) || geoData[0]
            }

            lat = Number(targetGeo.lat)
            lng = Number(targetGeo.lon)
            if (targetGeo.geojson && targetGeo.geojson.type.includes('Polygon')) {
              geojson = targetGeo.geojson
            }
          } else if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            lat = -6.9175; lng = 107.6191; // Bandung fallback
          }
        } catch (e) {
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            lat = -6.9175; lng = 107.6191; // Bandung fallback
          }
        }

        const offset = 0.007
        const latLngs = [
          [lat + offset, lng - offset],
          [lat + offset, lng + offset],
          [lat - offset, lng + offset],
          [lat - offset, lng - offset],
        ]

        // Predict messages based on 7 days and 14 days forecasts
        const day7 = predictions[6] ? `Skor Prediksi: ${predictions[6].skor} (${predictions[6].level_risiko})` : 'Data prediksi belum tersedia'
        const day14 = predictions[13] ? `Skor Prediksi: ${predictions[13].skor} (${predictions[13].level_risiko})` : 'Data prediksi belum tersedia'

        const faktor = mainScore.faktor_perhitungan || {}
        const hasAbj = mainScore.confidence_level === 'kuat' && faktor.abj_persen != null

        this.selectedRegion = {
          id: details.wilayah.kode,
          name: details.wilayah.nama,
          district: details.wilayah.tingkat === 'desa' ? 'Desa' : 'Kecamatan',
          city: 'Indonesia',
          disease: details.jenis_penyakit,
          riskLevel: mainScore.level_risiko === 'tinggi' ? 'Tinggi' : mainScore.level_risiko === 'sedang' ? 'Sedang' : 'Rendah',
          riskCode: mainScore.level_risiko === 'tinggi' ? 'high' : mainScore.level_risiko === 'sedang' ? 'medium' : 'low',
          // Skor risiko dari backend (0-100,越高越危险)
          riskScore: mainScore.skor != null ? Number(mainScore.skor) : null,
          // ABJ hanya ditampilkan jika data lapangan tersedia
          abj: hasAbj ? Number(faktor.abj_persen) : null,
          confidenceLevel: mainScore.confidence_level || 'lemah',
          coordinates: [lat, lng],
          latLngs: latLngs,
          geojson: geojson,
          forecast7Days: day7,
          forecast14Days: day14,
          // Data cuaca dari faktor_perhitungan backend
          suhu: faktor.suhu != null ? Number(faktor.suhu) : null,
          kelembapan: faktor.kelembapan != null ? Number(faktor.kelembapan) : null,
          curahHujan: faktor.curah_hujan != null ? Number(faktor.curah_hujan) : null,
          hujan7Hari: faktor.akumulasi_hujan_7hari != null ? Number(faktor.akumulasi_hujan_7hari) : null,
          // Komponen skor individual
          fSuhu: faktor.f_suhu != null ? Number(faktor.f_suhu) : null,
          fHujan: faktor.f_hujan != null ? Number(faktor.f_hujan) : null,
          fLembap: faktor.f_lembap != null ? Number(faktor.f_lembap) : null,
          skorCuaca: faktor.skor_cuaca != null ? Number(faktor.skor_cuaca) : null,
          // Prediksi array dari backend (14 hari forecast)
          predictions: predictions.map(p => ({
            tanggal: p.tanggal,
            skor: Number(p.skor),
            level: p.level_risiko,
          })),
        }

        // Add to map if not present so it can be highlighted
        const exists = this.diseaseRiskData.find(r => r.id === this.selectedRegion.id)
        if (!exists) {
          this.diseaseRiskData.push(this.selectedRegion)
        }
      } catch (error) {
        console.error('Fetch region detail failed:', error)
      }
    },

    async fetchSubscribedRegions() {
      try {
        const response = await mapService.getSubscribedWilayah()
        const subs = response.data || response
        this.subscribedRegions = subs.map((sub) => sub.wilayah_kode)
      } catch (error) {
        console.error('Fetch subscriptions failed:', error)
      }
    },

    async toggleSubscription(regionKode) {
      const idx = this.subscribedRegions.indexOf(regionKode)
      try {
        if (idx > -1) {
          await mapService.unsubscribeWilayah(regionKode)
          this.subscribedRegions.splice(idx, 1)
        } else {
          await mapService.subscribeWilayah(regionKode)
          this.subscribedRegions.push(regionKode)
        }
      } catch (error) {
        console.error('Toggle subscription failed:', error)
      }
    },

    setSelectedRegion(region) {
      this.selectedRegion = region
    },
  },
})
