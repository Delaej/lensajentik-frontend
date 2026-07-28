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
            forecast7Days: 'Tren stabil ke depan.',
            forecast14Days: 'Tetap lakukan 3M Plus.',
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

        const lat = Number(details.wilayah.latitude) || -6.9175
        const lng = Number(details.wilayah.longitude) || 107.6191
        const offset = 0.007
        const latLngs = [
          [lat + offset, lng - offset],
          [lat + offset, lng + offset],
          [lat - offset, lng + offset],
          [lat - offset, lng - offset],
        ]

        // Predict messages based on 7 days and 14 days forecasts
        const day7 = predictions[6] ? `Skor Prediksi: ${predictions[6].skor} (${predictions[6].level_risiko})` : 'Informasi prediksi cuaca stabil.'
        const day14 = predictions[13] ? `Skor Prediksi: ${predictions[13].skor} (${predictions[13].level_risiko})` : 'Informasi prediksi stabil.'

        this.selectedRegion = {
          id: details.wilayah.kode,
          name: details.wilayah.nama,
          district: details.wilayah.tingkat === 'desa' ? 'Desa' : 'Kecamatan',
          city: 'Indonesia',
          disease: details.jenis_penyakit,
          riskLevel: mainScore.level_risiko === 'tinggi' ? 'Tinggi' : mainScore.level_risiko === 'sedang' ? 'Sedang' : 'Rendah',
          riskCode: mainScore.level_risiko === 'tinggi' ? 'high' : mainScore.level_risiko === 'sedang' ? 'medium' : 'low',
          abj: mainScore.faktor_perhitungan ? mainScore.faktor_perhitungan.abj_persen || 92.5 : 92.5,
          confidenceLevel: mainScore.confidence_level === 'kuat' ? 94 : 45,
          coordinates: [lat, lng],
          latLngs: latLngs,
          forecast7Days: day7,
          forecast14Days: day14,
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
