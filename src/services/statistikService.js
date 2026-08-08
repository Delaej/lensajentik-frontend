import apiClient from '@/services/apiClient'

/**
 * Centralized API service for all statistics endpoints.
 * Every feature component fetches through here.
 */
export const statistikService = {
  /** GET /statistik/ringkasan */
  async getRingkasan(params = {}) {
    const res = await apiClient.get('/statistik/ringkasan', { params })
    return res.data
  },

  /** GET /statistik/bandingkan */
  async getBandingkan(params = {}) {
    const res = await apiClient.get('/statistik/bandingkan', { params })
    return res.data
  },

  /** GET /statistik/kelengkapan-data */
  async getKelengkapanData() {
    const res = await apiClient.get('/statistik/kelengkapan-data')
    return res.data
  },

  /** GET /statistik/gap-abj */
  async getGapAbj(params = {}) {
    const res = await apiClient.get('/statistik/gap-abj', { params })
    return res.data
  },

  /** GET /statistik/gap-abj/export */
  getGapAbjExportUrl(params = {}) {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
    const qs = new URLSearchParams(params).toString()
    return `${base}/statistik/gap-abj/export?${qs}`
  },

  /** GET /statistik/korelasi-cuaca */
  async getKorelasiCuaca(params = {}) {
    const res = await apiClient.get('/statistik/korelasi-cuaca', { params })
    return res.data
  },

  /** GET /statistik/lonjakan-risiko */
  async getLonjakanRisiko(params = {}) {
    const res = await apiClient.get('/statistik/lonjakan-risiko', { params })
    return res.data
  },

  /** GET /statistik/export-riset */
  getExportRisetUrl(params = {}, format = 'xlsx') {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
    // Serialize array params (jenis_data[]) with the [] suffix Laravel expects.
    const qs = new URLSearchParams()
    Object.entries({ ...params, format }).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => qs.append(`${key}[]`, v))
      } else if (val !== undefined && val !== null && val !== '') {
        qs.append(key, val)
      }
    })
    return `${base}/statistik/export-riset?${qs.toString()}`
  },

  /** GET /statistik/laporan-ringkas/{kode} */
  async getLaporanRingkas(kode, params = {}) {
    const res = await apiClient.get(`/statistik/laporan-ringkas/${kode}`, { params })
    return res.data
  },

  /** GET /statistik/laporan-ringkas/{kode}/pdf */
  getLaporanRingkasPdfUrl(kode, params = {}) {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
    const qs = new URLSearchParams(params).toString()
    return `${base}/statistik/laporan-ringkas/${kode}/pdf?${qs}`
  },
}
