import apiClient from './apiClient'

const USE_MOCK = false

export const mapService = {
  /**
   * Fetch Web-GIS Risk Data (/skor-risiko/peta)
   */
  async getRiskMap(params = {}) {
    if (USE_MOCK) {
      return Promise.resolve({
        status: 'success',
        data: [],
      })
    }
    const response = await apiClient.get('/skor-risiko/peta', { params })
    return response.data
  },

  /**
   * Search wilayah by name (kecamatan & kabupaten)
   */
  async searchWilayah(query) {
    const response = await apiClient.get('/wilayah/search', { params: { q: query } })
    return response.data
  },

  /**
   * Get single wilayah risk details (today + 14 days prediction)
   */
  async getRiskDetail(kode, jenis = 'dbd') {
    const response = await apiClient.get(`/skor-risiko/${kode}`, { params: { jenis } })
    return response.data
  },

  /**
   * Fetch subscribed regions
   */
  async getSubscribedWilayah() {
    const response = await apiClient.get('/subscribe-wilayah')
    return response.data
  },

  /**
   * Subscribe to a region
   */
  async subscribeWilayah(wilayahKode) {
    const response = await apiClient.post('/subscribe-wilayah', { wilayah_kode: wilayahKode })
    return response.data
  },

  /**
   * Unsubscribe from a region
   */
  async unsubscribeWilayah(wilayahKode) {
    const response = await apiClient.delete(`/subscribe-wilayah/${wilayahKode}`)
    return response.data
  },
}
