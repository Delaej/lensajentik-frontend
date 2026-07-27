import apiClient from './apiClient'

const USE_MOCK = true

export const mapService = {
  /**
   * Fetch Web-GIS Risk Data (/api/v1/public/map-risk)
   */
  async getRiskMap(params = {}) {
    if (USE_MOCK) {
      return Promise.resolve({
        status: 'success',
        data: [],
      })
    }
    const response = await apiClient.get('/public/map-risk', { params })
    return response.data
  },
}
