import axios from 'axios'

// Axios instance structure ready to plug in Laravel backend REST API endpoints later
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

// Request interceptor to attach bearer token once backend is live
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kader_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
