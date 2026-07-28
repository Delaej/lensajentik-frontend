import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { abjService } from '@/services/abjService'

export const useKaderStore = defineStore('kader', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('kader_token'),
    userProfile: {
      name: '',
      email: '',
      phone: '',
      role: '',
      district: '',
      subDistrict: '',
      rt: '',
      rw: '',
      totalHouseTarget: 45,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    },
    quickMetrics: {
      totalRumah: 45,
      diperiksa: 0,
      positifJentik: 0,
      abjScore: 0,
      status: 'Aman', // Aman, Waspada, Bahaya
    },
    abjRecords: [],
    notifications: [
      {
        id: 1,
        title: 'Jadwal Monitoring ABJ Minggu Ini',
        description: 'Target RT 03/RW 05 belum memenuhi target pemeriksaan 45 rumah. Segera lengkapi data.',
        date: 'Hari ini, 08:30 WIB',
        read: false,
        priority: 'high',
        type: 'reminder',
      },
      {
        id: 2,
        title: 'Peringatan Curah Hujan Tinggi!',
        description: 'BMKG memprediksi hujan lebat 3 hari ke depan di Kecamatan Sukajadi. Waspadai potensi genangan baru.',
        date: 'Kemarin, 14:15 WIB',
        read: false,
        priority: 'medium',
        type: 'weather',
      },
      {
        id: 3,
        title: 'Laporan Genangan Warga Masuk',
        description: 'Terdapat 2 laporan genangan air dari warga di sekitar RT 02/RW 05 perlu verifikasi kader.',
        date: '25 Jul 2026',
        read: true,
        priority: 'high',
        type: 'citizen_report',
      },
      {
        id: 4,
        title: 'Rekap Laporan Bulanan Terikirim',
        description: 'Laporan ABJ bulan Juni 2026 telah diverifikasi oleh Puskesmas Sukajadi.',
        date: '20 Jul 2026',
        read: true,
        priority: 'low',
        type: 'system',
      },
    ],
    settings: {
      alertAbjHigh: true,
      weeklyReportReminders: true,
      emailNotifications: false,
    },
  }),

  getters: {
    unreadNotificationsCount: (state) => state.notifications.filter((n) => !n.read).length,
    recentAbjRecords: (state) => state.abjRecords.slice(0, 5),
    averageAbjScore: (state) => {
      if (!state.abjRecords.length) return 0
      const total = state.abjRecords.reduce((acc, curr) => acc + curr.abjScore, 0)
      return (total / state.abjRecords.length).toFixed(1)
    },
  },

  actions: {
    async fetchProfile() {
      try {
        const profile = await authService.getProfile()
        this.userProfile = {
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          role: profile.role === 'kader' ? 'Kader Kesehatan' : profile.role,
          district: profile.wilayah_tugas ? profile.wilayah_tugas.nama : '',
          wilayah_kode: profile.wilayah_kode,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
        }
      } catch (error) {
        console.error('Fetch profile failed:', error)
      }
    },

    async fetchMyAbjRecords() {
      try {
        const response = await abjService.fetchAbjRecords()
        const records = response.data || response
        this.abjRecords = records.map((rec) => {
          return {
            id: rec.id,
            date: rec.tanggal_pemeriksaan,
            weekLabel: rec.tanggal_pemeriksaan,
            location: rec.wilayah ? rec.wilayah.nama : 'Desa Binaan',
            diperiksa: rec.jumlah_rumah_diperiksa,
            positifJentik: rec.jumlah_rumah_positif_jentik,
            abjScore: rec.abj_persen,
            status: rec.abj_persen >= 95 ? 'Aman' : rec.abj_persen >= 90 ? 'Waspada' : 'Bahaya',
            notes: rec.catatan || '',
            kaderName: rec.kader ? rec.kader.name : '',
          }
        })

        if (this.abjRecords.length > 0) {
          const latest = this.abjRecords[0]
          this.quickMetrics.diperiksa = latest.diperiksa
          this.quickMetrics.positifJentik = latest.positifJentik
          this.quickMetrics.abjScore = latest.abjScore
          this.quickMetrics.status = latest.status
        }
      } catch (error) {
        console.error('Fetch ABJ records failed:', error)
      }
    },

    async addAbjRecord(recordData) {
      try {
        const payload = {
          wilayah_kode: recordData.wilayah_kode,
          tanggal_pemeriksaan: recordData.date,
          jumlah_rumah_diperiksa: recordData.diperiksa,
          jumlah_rumah_positif_jentik: recordData.positifJentik,
          catatan: recordData.notes,
        }
        const newRecord = await abjService.storeAbjRecord(payload)
        await this.fetchMyAbjRecords()
        return newRecord
      } catch (error) {
        console.error('Add ABJ record failed:', error)
        throw error
      }
    },

    markNotificationRead(id) {
      const notif = this.notifications.find((n) => n.id === id)
      if (notif) notif.read = true
    },

    markAllNotificationsRead() {
      this.notifications.forEach((n) => (n.read = true))
    },

    updateProfile(updatedData) {
      this.userProfile = { ...this.userProfile, ...updatedData }
    },

    async login(email, password) {
      try {
        const data = await authService.login({ email, password })
        this.isAuthenticated = true
        await this.fetchProfile()
        await this.fetchMyAbjRecords()
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        this.isAuthenticated = false
        this.userProfile = {
          name: '',
          email: '',
          phone: '',
          role: '',
          district: '',
          subDistrict: '',
          rt: '',
          rw: '',
          totalHouseTarget: 45,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
        }
        this.abjRecords = []
      }
    },
  },
})
