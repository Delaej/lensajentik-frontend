import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { abjService } from '@/services/abjService'
import { notificationService } from '@/services/notificationService'

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
    notifications: [],
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

    async fetchNotifications() {
      try {
        const response = await notificationService.fetchNotifications()
        const records = response.data || response
        this.notifications = records.map((n) => ({
          id: n.id,
          title: n.judul || 'Notifikasi',
          description: n.pesan || '',
          date: n.created_at || new Date().toISOString(),
          read: n.sudah_dibaca || false,
          priority: n.prioritas || 'low', // from backend or default
          type: n.tipe || 'system',
        }))
      } catch (error) {
        console.error('Fetch notifications failed:', error)
      }
    },

    async markNotificationRead(id) {
      try {
        await notificationService.markAsRead(id)
        const notif = this.notifications.find((n) => n.id === id)
        if (notif) notif.read = true
      } catch (error) {
        console.error('Mark notification read failed:', error)
      }
    },

    async markAllNotificationsRead() {
      try {
        await notificationService.markAllAsRead()
        this.notifications.forEach((n) => (n.read = true))
      } catch (error) {
        console.error('Mark all notifications read failed:', error)
      }
    },

    async updateProfile(updatedData) {
      try {
        const response = await authService.updateProfile(updatedData)
        // Jika sukses, perbarui state lokal dengan data dari response backend
        if (response.data) {
          const profile = response.data
          this.userProfile = {
            ...this.userProfile,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || '',
          }
        } else {
          // Fallback kalau struktur response beda
          this.userProfile = { ...this.userProfile, ...updatedData }
        }
        return { success: true }
      } catch (error) {
        console.error('Update profile failed:', error)
        // Ambil pesan error dari backend
        const errorMessage = error.response?.data?.message || 'Gagal memperbarui profil.'
        return { success: false, message: errorMessage }
      }
    },

    async login(email, password) {
      try {
        await authService.login({ email, password })
        this.isAuthenticated = true
        await this.fetchProfile()
        await this.fetchMyAbjRecords()
        await this.fetchNotifications()
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
