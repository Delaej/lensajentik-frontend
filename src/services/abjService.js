import apiClient from './apiClient'

const USE_MOCK = true

export const abjService = {
  /**
   * Fetch ABJ Records (/api/v1/kader/abj)
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
    const response = await apiClient.get('/kader/abj', { params })
    return response.data
  },

  /**
   * Store new ABJ Inspection Data (/api/v1/kader/abj)
   */
  async storeAbjRecord(payload) {
    if (USE_MOCK) {
      return Promise.resolve({
        status: 'success',
        message: 'Data ABJ berhasil disimpan ke database',
        data: payload,
      })
    }
    const response = await apiClient.post('/kader/abj', payload)
    return response.data
  },
}
