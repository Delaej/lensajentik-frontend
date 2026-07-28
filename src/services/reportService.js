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
}
