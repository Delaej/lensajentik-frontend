import apiClient from './apiClient'

export const educationService = {
  /**
   * Fetch educational articles
   */
  async fetchArticles(params = {}) {
    const response = await apiClient.get('/edukasi', { params: { tipe: 'artikel', ...params } })
    return response.data
  },

  /**
   * Fetch article details by slug
   */
  async fetchArticleDetail(slug) {
    const response = await apiClient.get(`/edukasi/${slug}`)
    return response.data.data
  },

  /**
   * Fetch quiz questions
   */
  async fetchQuizQuestions() {
    const response = await apiClient.get('/edukasi/kuis/pertanyaan')
    return response.data
  },

  /**
   * Submit quiz answers and calculate risk level
   * @param {Object} answers - { jawaban: { genangan_air: 'sering', kuras_bak: 'jarang', ... } }
   */
  async submitQuizAnswers(answers) {
    const response = await apiClient.post('/edukasi/kuis/hitung', answers)
    return response.data
  },
}
