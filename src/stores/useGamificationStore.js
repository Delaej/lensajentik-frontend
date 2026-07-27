import { defineStore } from 'pinia'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    userPoints: 250,
    levelName: 'Duta bebas Jentik', // Level 1: Warga Peduli, Level 2: Pejuang PSN, Level 3: Duta bebas Jentik
    level: 3,
    nextLevelPoints: 500,
    badges: [
      { id: 1, name: 'Pelapor Pertama', icon: 'Award', unlocked: true, desc: 'Melaporkan 1 genangan jentik' },
      { id: 2, name: 'Pahlawan PSN', icon: 'ShieldCheck', unlocked: true, desc: 'Berpartisipasi dalam 5 kali pelaporan' },
      { id: 3, name: 'Detektif Jentik', icon: 'Search', unlocked: true, desc: 'Skor akurasi laporan di atas 90%' },
      { id: 4, name: 'Master Twibbon', icon: 'Share2', unlocked: false, desc: 'Bagikan gerakan 3M Plus ke media sosial' },
    ],
  }),

  actions: {
    addPoints(amount = 50) {
      this.userPoints += amount
      if (this.userPoints >= 500) {
        this.level = 4
        this.levelName = 'Pahlawan Lingkungan'
      }
    },
  },
})
