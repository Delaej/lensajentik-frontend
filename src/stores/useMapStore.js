import { defineStore } from 'pinia'
import { mapService } from '@/services/mapService'

export const useMapStore = defineStore('map', {
  state: () => ({
    selectedDisease: 'dbd',
    selectedRiskLevel: 'all',
    searchQuery: '',
    selectedRegion: null,       // region yang sedang dilihat detailnya
    parentRegion: null,         // kabupaten induk (jika sedang lihat per-kecamatan)
    subscribedRegions: [],
    searchResults: [],
    diseaseRiskData: [],        // polygon di peta (bisa kecamatan dalam kabupaten)
  }),

  getters: {
    filteredRegions: (state) => {
      return state.diseaseRiskData.filter((item) => {
        const matchesDisease = state.selectedDisease === 'all' || item.disease === state.selectedDisease
        const matchesRisk = state.selectedRiskLevel === 'all' || item.riskCode === state.selectedRiskLevel
        const matchesSearch =
          !state.searchQuery ||
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          (item.district && item.district.toLowerCase().includes(state.searchQuery.toLowerCase()))
        return matchesDisease && matchesRisk && matchesSearch
      })
    },
  },

  actions: {
    async fetchRiskMap(params = {}) {
      try {
        const queryParams = {
          tingkat: params.tingkat || 'kabupaten', // Default: nasional (semua kabupaten/kota)
          jenis: this.selectedDisease === 'all' ? 'dbd' : this.selectedDisease,
          ...params,
        }
        // Hanya sertakan parent_kode jika diberikan (mode per-daerah)
        if (params.parent_kode) {
          queryParams.parent_kode = params.parent_kode
        }
        const response = await mapService.getRiskMap(queryParams)
        const records = response.data || response
        
        this.diseaseRiskData = records.map((rec) => {
          const lat = Number(rec.wilayah.latitude) || null
          const lng = Number(rec.wilayah.longitude) || null
          // Fallback: jika tidak ada koordinat, tidak bisa render polygon — pakai koordinat default pusat Indonesia
          const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)
          const finalLat = hasCoords ? lat : -2.5489
          const finalLng = hasCoords ? lng : 118.0149
          const offset = 0.007
          const latLngs = [
            [finalLat + offset, finalLng - offset],
            [finalLat + offset, finalLng + offset],
            [finalLat - offset, finalLng + offset],
            [finalLat - offset, finalLng - offset],
          ]

          // Tentukan tingkat wilayah dari response backend (jika ada) atau dari query params
          const tingkat = rec.wilayah.tingkat || rec.tingkat || 'kabupaten'
          const tingkatLabel =
            tingkat === 'desa' ? 'Desa' :
            tingkat === 'kecamatan' ? 'Kecamatan' :
            tingkat === 'kabupaten' ? 'Kabupaten/Kota' :
            tingkat === 'provinsi' ? 'Provinsi' : 'Wilayah'

          return {
            id: rec.wilayah_kode,
            name: rec.wilayah.nama,
            district: tingkatLabel,
            disease: rec.jenis_penyakit || 'dbd',
            riskLevel: rec.level_risiko === 'tinggi' ? 'Tinggi' : rec.level_risiko === 'sedang' ? 'Sedang' : rec.level_risiko === 'rendah' ? 'Rendah' : 'Belum Ada Data',
            riskCode: rec.level_risiko === 'tinggi' ? 'high' : rec.level_risiko === 'sedang' ? 'medium' : rec.level_risiko === 'rendah' ? 'low' : 'no_data',
            // Hanya tampilkan ABJ jika benar-benar ada dari backend (data lapangan)
            abj: rec.faktor_perhitungan?.abj_persen != null ? Number(rec.faktor_perhitungan.abj_persen) : null,
            // Data dari backend — tidak ada, set null
            casesCurrent: null,
            casesPrevious: null,
            trend: null,
            // Confidence: simpan string asli dari backend, bukan angka arbitrary
            confidenceLevel: rec.confidence_level || 'belum_ada_data',
            coordinates: [finalLat, finalLng],
            latLngs: latLngs,
            // Overview tidak punya prediksi — kosongkan, akan diisi saat klik detail
            forecast7Days: null,
            forecast14Days: null,
            // Overview tidak punya data inspeksi
            lastInspection: null,
            positiveContainers: null,
            // Data tambahan dari backend
            skor: rec.skor != null ? Number(rec.skor) : null,
            jumlahKecamatan: rec.faktor_perhitungan?.jumlah_kecamatan || null,
            kecamatanDenganData: rec.faktor_perhitungan?.kecamatan_dengan_data || null,
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
          district: details.wilayah.tingkat === 'desa' ? 'Desa' : details.wilayah.tingkat === 'kecamatan' ? 'Kecamatan' : details.wilayah.tingkat === 'kabupaten' ? 'Kabupaten/Kota' : 'Provinsi',
          city: details.wilayah.kota || details.wilayah.provinsi || 'Indonesia',
          disease: details.jenis_penyakit,
          riskLevel: mainScore.level_risiko === 'tinggi' ? 'Tinggi' : mainScore.level_risiko === 'sedang' ? 'Sedang' : mainScore.level_risiko === 'rendah' ? 'Rendah' : 'Belum Ada Data',
          riskCode: mainScore.level_risiko === 'tinggi' ? 'high' : mainScore.level_risiko === 'sedang' ? 'medium' : mainScore.level_risiko === 'rendah' ? 'low' : 'no_data',
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
            tanggal: p.tanggal || p.tanggal_prediksi,
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

    /**
     * Load semua kecamatan dalam satu kabupaten — untuk view per-kecamatan
     * dengan warna risiko masing-masing.
     */
    async loadKecamatanUntukKabupaten(kabupaten) {
      this.parentRegion = {
        kode: kabupaten.kode,
        nama: kabupaten.nama,
        tingkat: 'kabupaten',
      }
      this.selectedRegion = null
      this.diseaseRiskData = [] // reset dulu
      try {
        // Ambil data semua kecamatan
        await this.fetchRiskMap({ tingkat: 'kecamatan', parent_kode: kabupaten.kode })
        // Hitung ringkasan kabupaten dari data kecamatan
        const items = this.diseaseRiskData
        const itemsDenganData = items.filter(i => i.skor != null)
        const skorTotal = itemsDenganData.reduce((s, i) => s + (i.skor || 0), 0)
        const skorRata = itemsDenganData.length > 0 ? Math.round(skorTotal / itemsDenganData.length) : null
        const level = skorRata != null
          ? (skorRata >= 70 ? 'tinggi' : skorRata >= 40 ? 'sedang' : 'rendah')
          : null
        this.selectedRegion = {
          id: kabupaten.kode,
          name: kabupaten.nama,
          district: 'Kabupaten/Kota',
          riskLevel: level === 'tinggi' ? 'Tinggi' : level === 'sedang' ? 'Sedang' : level === 'rendah' ? 'Rendah' : 'Belum Ada Data',
          riskCode: level || 'no_data',
          riskScore: skorRata,
          abj: null,
          confidenceLevel: 'lemah',
          coordinates: items.length > 0 ? items[0].coordinates : [-2.54, 118.01],
          geojson: null,
          forecast7Days: null,
          forecast14Days: null,
          predictions: [],
          suhu: null,
          kelembapan: null,
          curahHujan: null,
          hujan7Hari: null,
          // Extra: ringkasan untuk kabupaten
          jumlahKecamatan: items.length,
          kecamatanDenganData: items.filter(i => i.skor != null).length,
          kecamatanList: items.map(i => ({ kode: i.id, nama: i.name, skor: i.skor, level: i.riskCode })),
        }
      } catch (e) {
        console.error('Load kecamatan for kabupaten failed:', e)
      }
    },

    /** Kembali ke tampilan nasional */
    clearView() {
      this.parentRegion = null
      this.selectedRegion = null
      this.fetchRiskMap()
    },

    /**
     * Fetch GeoJSON boundary untuk KABUPATEN saja (1 request, cepat).
     */
    async fetchKabupatenBoundary(kabupatenNama) {
      try {
        const { default: apiClient } = await import('@/services/apiClient')
        const res = await apiClient.get('/geocode/boundary', { params: { q: kabupatenNama + ', Indonesia' } })
        const geojson = res.data?.geojson
        if (geojson && this.parentRegion) {
          this.parentRegion = { ...this.parentRegion, geojson }
        }
      } catch (e) {
        console.warn('Boundary fetch failed:', e.message || e)
      }
    },

    /**
     * Fetch GeoJSON per kecamatan via backend batch (satu request).
     * Polygon akan update otomatis begitu data datang.
     */
    async fetchKecamatanBoundaries(kabupatenNama) {
      const regions = this.diseaseRiskData
      if (!regions.length) return
      try {
        const { default: apiClient } = await import('@/services/apiClient')
        // Gunakan format "Nama Kecamatan, Nama Kabupaten, Indonesia" agar Nominatim
        // menemukan batas administratif kecamatan, bukan titik POI
        const names = regions.map(r => r.name + ', ' + kabupatenNama + ', Indonesia')
        const res = await apiClient.post('/geocode/boundary-batch', { queries: names })
        const results = res.data?.results || {}

        let foundCount = 0
        // Trigger Vue reactivity dengan mengganti seluruh array
        const updated = this.diseaseRiskData.map(region => {
          // Coba exact match dulu, lalu lowercase trim sebagai fallback
          const geo = results[region.name]
            ?? results[region.name.trim()]
            ?? results[region.name.toLowerCase()]
            ?? results[region.name.toLowerCase().trim()]
          if (geo) {
            foundCount++
            return { ...region, geojson: geo }
          }
          return region
        })
        console.log(`[Boundary] ${foundCount}/${regions.length} kecamatan mendapat GeoJSON`)
        this.diseaseRiskData = updated
      } catch (e) {
        console.warn('Kecamatan boundaries fetch failed:', e.message || e)
      }
    },
  },
})
