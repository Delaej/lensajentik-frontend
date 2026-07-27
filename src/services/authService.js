import apiClient from './apiClient'

// Mock mode toggle (Set to false when Laravel API endpoint is live)
const USE_MOCK = true

export const authService = {
  /**
   * Login Kader via Laravel REST API (/api/v1/auth/login)
   */
  async login(credentials) {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockToken = 'mock_jwt_token_kader_12345'
          localStorage.setItem('kader_token', mockToken)
          resolve({
            success: true,
            token: mockToken,
            user: {
              name: 'Nayla Salsabila',
              email: credentials.email,
              role: 'Kader Kesehatan',
              district: 'Kecamatan Sukajadi',
              rt: '03',
              rw: '05',
            },
          })
        }, 500)
      })
    }
    const response = await apiClient.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('kader_token', response.data.token)
    }
    return response.data
  },

  /**
   * Logout Kader (/api/v1/auth/logout)
   */
  async logout() {
    if (USE_MOCK) {
      localStorage.removeItem('kader_token')
      return { success: true }
    }
    const response = await apiClient.post('/auth/logout')
    localStorage.removeItem('kader_token')
    return response.data
  },

  /**
   * Get current Kader Profile (/api/v1/kader/profile)
   */
  async getProfile() {
    if (USE_MOCK) {
      return {
        name: 'Nayla Salsabila',
        email: 'nayla@gmail.com',
        phone: '0812-3456-7890',
        district: 'Kecamatan Sukajadi',
        rt: '03',
        rw: '05',
      }
    }
    const response = await apiClient.get('/kader/profile')
    return response.data
  },
}
