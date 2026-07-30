import apiClient from './apiClient'

export const reportService = {
  /**
   * Submit citizen report (multipart/form-data)
   * @param {FormData} formData
   */
  async storeReport(formData) {
    const response = await apiClient.post('/laporan-warga', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    // Return seluruh response body (message, data, poin_didapat)
    return response.data
  },

  /**
   * Fetch all reports
   */
  async fetchReports(params = {}) {
    const response = await apiClient.get('/laporan-warga', { params })
    return response.data
  },

  /**
   * Fetch report detail
   */
  async fetchReportDetail(id) {
    const response = await apiClient.get(`/laporan-warga/${id}`)
    return response.data
  },

  /**
   * Verify a citizen report
   */
  async verifyReport(id) {
    const response = await apiClient.post(`/laporan-warga/${id}/verifikasi`)
    return response.data
  },

  /**
   * Update report status
   */
  async updateReportStatus(id, status) {
    const response = await apiClient.patch(`/laporan-warga/${id}/status`, { status })
    return response.data
  },
}
