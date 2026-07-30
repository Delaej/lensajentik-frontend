import apiClient from './apiClient'

export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('kader_token', response.data.token)
    }
    return response.data
  },

  async logout() {
    const response = await apiClient.post('/auth/logout')
    localStorage.removeItem('kader_token')
    return response.data
  },

  async getProfile() {
    const response = await apiClient.get('/auth/me')
    return response.data.data || response.data
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(data) {
    const response = await apiClient.post('/auth/reset-password', data)
    return response.data
  },

  async updateProfile(data) {
    const response = await apiClient.patch('/auth/update-profile', data)
    return response.data
  },
}
