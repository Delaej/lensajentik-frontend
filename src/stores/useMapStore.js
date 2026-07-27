import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    selectedDisease: 'dbd', // 'dbd' | 'malaria' | 'all'
    selectedRiskLevel: 'all', // 'all' | 'high' | 'medium' | 'low'
    searchQuery: '',
    selectedRegion: null,
    subscribedRegions: ['Kelurahan Pasteur', 'Sukajadi'],
    diseaseRiskData: [
      {
        id: 'REG-01',
        name: 'Kelurahan Pasteur',
        district: 'Kecamatan Sukajadi',
        city: 'Bandung',
        disease: 'dbd',
        riskLevel: 'Tinggi', // Tinggi, Sedang, Rendah
        riskCode: 'high', // high (red), medium (yellow), low (green)
        abj: 84.5,
        casesCurrent: 14,
        casesPrevious: 8,
        trend: 'up', // 'up' | 'down' | 'stable'
        confidenceLevel: 94,
        coordinates: [-6.892, 107.595],
        latLngs: [
          [-6.885, 107.588],
          [-6.885, 107.602],
          [-6.898, 107.602],
          [-6.898, 107.588],
        ],
        forecast7Days: 'Kenaikan +25% risiko perkembangbiakan jentik akibat genangan hujan.',
        forecast14Days: 'Potensi puncak kasus jika tindakan 3M Plus tidak dilakukan serentak.',
        lastInspection: '2026-07-24',
        positiveContainers: 18,
      },
      {
        id: 'REG-02',
        name: 'Kelurahan Cipaganti',
        district: 'Kecamatan Coblong',
        city: 'Bandung',
        disease: 'dbd',
        riskLevel: 'Sedang',
        riskCode: 'medium',
        abj: 91.2,
        casesCurrent: 6,
        casesPrevious: 7,
        trend: 'stable',
        confidenceLevel: 88,
        coordinates: [-6.888, 107.608],
        latLngs: [
          [-6.882, 107.602],
          [-6.882, 107.615],
          [-6.894, 107.615],
          [-6.894, 107.602],
        ],
        forecast7Days: 'Risiko stabil, namun area taman terbuka memerlukan pemantauan ekstra.',
        forecast14Days: 'Tren melandai jika kegiatan Jumat Bersih terjaga.',
        lastInspection: '2026-07-22',
        positiveContainers: 7,
      },
      {
        id: 'REG-03',
        name: 'Kelurahan Dago',
        district: 'Kecamatan Coblong',
        city: 'Bandung',
        disease: 'dbd',
        riskLevel: 'Rendah',
        riskCode: 'low',
        abj: 96.8,
        casesCurrent: 2,
        casesPrevious: 4,
        trend: 'down',
        confidenceLevel: 92,
        coordinates: [-6.875, 107.616],
        latLngs: [
          [-6.868, 107.609],
          [-6.868, 107.624],
          [-6.881, 107.624],
          [-6.881, 107.609],
        ],
        forecast7Days: 'Tingkat kebersihan sangat baik, risiko rendah.',
        forecast14Days: 'Pertahankan gerakan PSN Mandiri secara rutin.',
        lastInspection: '2026-07-25',
        positiveContainers: 2,
      },
      {
        id: 'REG-04',
        name: 'Kelurahan Sukawarna',
        district: 'Kecamatan Sukajadi',
        city: 'Bandung',
        disease: 'malaria',
        riskLevel: 'Sedang',
        riskCode: 'medium',
        abj: 89.0,
        casesCurrent: 5,
        casesPrevious: 3,
        trend: 'up',
        confidenceLevel: 85,
        coordinates: [-6.895, 107.581],
        latLngs: [
          [-6.890, 107.575],
          [-6.890, 107.587],
          [-6.901, 107.587],
          [-6.901, 107.575],
        ],
        forecast7Days: 'Pengawasan ekstra pada area dekat kolam tak terawat.',
        forecast14Days: 'Penyemprotan larvasida disarankan minggu depan.',
        lastInspection: '2026-07-21',
        positiveContainers: 9,
      },
      {
        id: 'REG-05',
        name: 'Kelurahan Gegerkalong',
        district: 'Kecamatan Sukasari',
        city: 'Bandung',
        disease: 'dbd',
        riskLevel: 'Tinggi',
        riskCode: 'high',
        abj: 82.0,
        casesCurrent: 18,
        casesPrevious: 11,
        trend: 'up',
        confidenceLevel: 96,
        coordinates: [-6.862, 107.594],
        latLngs: [
          [-6.855, 107.586],
          [-6.855, 107.601],
          [-6.868, 107.601],
          [-6.868, 107.586],
        ],
        forecast7Days: 'Zona Merah! Kenaikan cepat larva jentik Aedes aegypti.',
        forecast14Days: 'Risiko kluster penyebaran jika tidak dilakukan PSN masal.',
        lastInspection: '2026-07-23',
        positiveContainers: 24,
      },
    ],
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
    setSelectedRegion(region) {
      this.selectedRegion = region
    },
    toggleSubscription(regionName) {
      const idx = this.subscribedRegions.indexOf(regionName)
      if (idx > -1) {
        this.subscribedRegions.splice(idx, 1)
      } else {
        this.subscribedRegions.push(regionName)
      }
    },
  },
})
