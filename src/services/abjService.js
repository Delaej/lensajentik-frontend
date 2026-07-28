import apiClient from './apiClient'

const USE_MOCK = false

export const abjService = {
  /**
   * Fetch ABJ Records (/abj/saya)
   */
  async fetchAbjRecords(params = {}) {
    if (USE_MOCK) {
      return Promise.resolve({
        status: 'success',
        data: [
          { id: 'REC-001', date: '2026-07-24', location: 'RT 03 / RW 05', diperiksa: 45, positifJentik: 3, abjScore: 93.3, status: 'Aman' },
          { id: 'REC-002', date: '2026-07-17', location: 'RT 02 / RW 05', diperiksa: 42, positifJentik: 5, abjScore: 88.1, status: 'Waspada' },
        ],
      })
    }
    const response = await apiClient.get('/abj/saya', { params })
    return response.data
  },

  /**
   * Store new ABJ Inspection Data (/abj)
   */
  async storeAbjRecord(payload) {
    if (USE_MOCK) {
      return Promise.resolve({
        status: 'success',
        message: 'Data ABJ berhasil disimpan ke database',
        data: payload,
      })
    }
    const response = await apiClient.post('/abj', payload)
    return response.data
  },

  /**
   * Fetch list of villages (desa/kelurahan) under a kecamatan
   */
  async fetchDesaByKecamatan(kecamatanKode) {
    const response = await apiClient.get(`/wilayah/${kecamatanKode}/desa`)
    return response.data
  },
}
