import { defineStore } from 'pinia'
import apiClient from '@/services/apiClient'
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
      wilayah_kode: null,
      wilayah_binaan: '',
    },
    // Dari /kader/dashboard
    quickMetrics: {
      skorRisiko: null,
      levelRisiko: null,
      rataAbj: 0,
      totalRumahDiperiksa: 0,
      totalRumahPositif: 0,
      jumlahLaporanAbj: 0,
    },
    tugasPending: [],
    abjRecords: [],
    notifications: [],
  }),

  getters: {
    unreadNotificationsCount: (state) => state.notifications.filter((n) => !n.read).length,
    recentAbjRecords: (state) => state.abjRecords.slice(0, 5),
    averageAbjScore: (state) => {
      if (!state.abjRecords.length) return 0
      const total = state.abjRecords.reduce((acc, curr) => acc + curr.abjScore, 0)
      return (total / state.abjRecords.length).toFixed(1)
    },
    // Alias untuk kompatibilitas template
    quickMetricsDisplay: (state) => ({
      ...state.quickMetrics,
      diperiksa: state.quickMetrics.totalRumahDiperiksa,
      abjScore: Math.round(state.quickMetrics.rataAbj),
      status: state.quickMetrics.rataAbj >= 95 ? 'Aman' : state.quickMetrics.rataAbj >= 90 ? 'Waspada' : state.quickMetrics.rataAbj > 0 ? 'Bahaya' : 'Belum Data',
      totalHouseTarget: state.quickMetrics.totalRumahDiperiksa > 0 ? state.quickMetrics.totalRumahDiperiksa : null,
    }),
  },

  actions: {
    // ── Auth ────────────────────────────────────────────────────────────
    async login(email, password) {
      try {
        await authService.login({ email, password })
        this.isAuthenticated = true
        await Promise.all([
          this.fetchProfile(),
          this.fetchDashboard(),
          this.fetchMyAbjRecords(),
          this.fetchNotifications(),
        ])
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async logout() {
      try { await authService.logout() } catch { /* abaikan */ }
      this.isAuthenticated = false
      this.userProfile = { name: '', email: '', phone: '', role: '', wilayah_kode: null, wilayah_binaan: '' }
      this.quickMetrics = { skorRisiko: null, levelRisiko: null, rataAbj: 0, totalRumahDiperiksa: 0, totalRumahPositif: 0, jumlahLaporanAbj: 0 }
      this.tugasPending = []
      this.abjRecords = []
      this.notifications = []
    },

    // ── Profile ─────────────────────────────────────────────────────────
    async fetchProfile() {
      try {
        const profile = await authService.getProfile()
        this.userProfile = {
          name: profile.name || profile.nama || '',
          email: profile.email || '',
          phone: profile.phone || profile.telepon || '',
          role: profile.role === 'kader' ? 'Kader Kesehatan' : (profile.role || ''),
          wilayah_kode: profile.wilayah_kode || null,
          wilayah_binaan: profile.wilayah?.nama || profile.wilayah_binaan || '',
        }
      } catch (error) {
        console.error('Fetch profile failed:', error)
      }
    },

    async updateProfile(updatedData) {
      try {
        const response = await authService.updateProfile(updatedData)
        if (response.data) {
          const p = response.data
          this.userProfile = {
            ...this.userProfile,
            name: p.name || p.nama || this.userProfile.name,
            email: p.email || this.userProfile.email,
            phone: p.phone || p.telepon || this.userProfile.phone,
          }
        }
        return { success: true }
      } catch (error) {
        const msg = error.response?.data?.message || 'Gagal memperbarui profil.'
        return { success: false, message: msg }
      }
    },

    // ── Dashboard ───────────────────────────────────────────────────────
    async fetchDashboard() {
      try {
        const res = await apiClient.get('/kader/dashboard')
        const d = res.data?.data || res.data
        if (!d) return
        this.quickMetrics = {
          skorRisiko: d.skor_risiko_terkini?.skor ?? null,
          levelRisiko: d.skor_risiko_terkini?.level ?? null,
          rataAbj: d.ringkasan_abj?.rata_rata_persen ?? 0,
          totalRumahDiperiksa: d.ringkasan_abj?.total_rumah_diperiksa ?? 0,
          totalRumahPositif: d.ringkasan_abj?.total_rumah_positif ?? 0,
          jumlahLaporanAbj: d.ringkasan_abj?.jumlah_laporan ?? 0,
        }
        this.tugasPending = d.tugas_pending || []
      } catch (error) {
        console.error('Fetch dashboard failed:', error)
      }
    },

    // ── ABJ ─────────────────────────────────────────────────────────────
    async fetchMyAbjRecords() {
      try {
        const response = await abjService.fetchAbjRecords()
        const records = response.data || response
        this.abjRecords = records.map((rec) => ({
          id: rec.id,
          date: rec.tanggal_pemeriksaan,
          weekLabel: rec.tanggal_pemeriksaan,
          location: rec.wilayah ? rec.wilayah.nama : 'Wilayah Binaan',
          diperiksa: rec.jumlah_rumah_diperiksa,
          positifJentik: rec.jumlah_rumah_positif_jentik,
          abjScore: rec.abj_persen,
          status: rec.abj_persen >= 95 ? 'Aman' : rec.abj_persen >= 90 ? 'Waspada' : 'Bahaya',
          notes: rec.catatan || '',
        }))
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
        await abjService.storeAbjRecord(payload)
        await Promise.all([this.fetchMyAbjRecords(), this.fetchDashboard()])
      } catch (error) {
        console.error('Add ABJ record failed:', error)
        throw error
      }
    },

    // ── Notifications ───────────────────────────────────────────────────
    async fetchNotifications() {
      try {
        const response = await notificationService.fetchNotifications()
        const paginator = response.data || response
        let records = []
        if (paginator && Array.isArray(paginator.data)) {
          records = paginator.data
        } else if (Array.isArray(paginator)) {
          records = paginator
        }
        this.notifications = records.map((n) => ({
          id: n.id,
          title: n.judul || 'Notifikasi',
          description: n.pesan || '',
          date: n.created_at || new Date().toISOString(),
          read: n.is_read || n.is_dibaca || false,
          priority: n.tipe === 'kenaikan_risiko' || n.tipe === 'cuaca_ekstrem' ? 'high' : 'low',
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
        console.error('Mark all read failed:', error)
      }
    },
  },
})
