import apiClient from './apiClient'

export const abjService = {
  async fetchAbjRecords(params = {}) {
    const response = await apiClient.get('/abj/saya', { params })
    return response.data
  },

  async storeAbjRecord(payload) {
    const response = await apiClient.post('/abj', payload)
    return response.data
  },

  async fetchDesaByKecamatan(kecamatanKode) {
    const response = await apiClient.get(`/wilayah/${kecamatanKode}/desa`)
    return response.data
  },
}
