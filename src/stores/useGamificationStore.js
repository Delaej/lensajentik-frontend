import { defineStore } from 'pinia'
import apiClient from '@/services/apiClient'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    poin: 0,
    loaded: false,
  }),

  getters: {
    levelName: (state) => {
      if (state.poin >= 500) return 'Pahlawan Lingkungan'
      if (state.poin >= 200) return 'Pejuang PSN'
      if (state.poin >= 50) return 'Pelapor Aktif'
      return 'Warga Peduli'
    },
    level: (state) => {
      if (state.poin >= 500) return 4
      if (state.poin >= 200) return 3
      if (state.poin >= 50) return 2
      return 1
    },
  },

  actions: {
    async fetchPoin() {
      try {
        const token = localStorage.getItem('kader_token')
        if (!token) return
        const res = await apiClient.get('/auth/me')
        this.poin = res.data?.data?.poin || res.data?.poin || 0
        this.loaded = true
      } catch {
        // Tidak login — tidak perlu gamification
      }
    },

    addPoints(amount) {
      this.poin += amount
    },
  },
})
