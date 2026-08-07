import { defineStore } from 'pinia'
import apiClient from '@/services/apiClient'
import { authService } from '@/services/authService'
import { abjService } from '@/services/abjService'
import { notificationService } from '@/services/notificationService'

export const useKaderStore = defineStore('kader', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('kader_token'),
    userProfile: {
      nama: '',
      email: '',
      phone: '',
      avatar: '',
      role: '',
      wilayah_kode: null,
      wilayah_binaan: '',
    },
    // Dari /kader/dashboard
    quickMetrics: {
      skorRisiko: null,
      skorRisikoDbd: null,
      skorRisikoMalaria: null,
      levelRisiko: null,
      confidence: null,
      rataAbj: 0,
      totalRumahDiperiksa: 0,
      totalRumahPositif: 0,
      jumlahLaporanAbj: 0,
      persentaseBebasJentik: 0,
      laporanAktif: 0,
      laporanBelumDitangani: 0,
    },
    prediksi7Hari: [],
    laporanWargaStats: { total: 0, aktif: 0, belum_ditangani: 0 },
    wilayahInfo: null,
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
        const response = await authService.login({ email, password })
        // Simpan token — authService sudah menyimpannya di localStorage
        this.isAuthenticated = true
        await Promise.all([
          this.fetchProfile(),
          this.fetchDashboard(),
          this.fetchMyAbjRecords(),
          this.fetchNotifications(),
        ])
        return response
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    async logout() {
      try { await authService.logout() } catch { /* abaikan */ }
      this.isAuthenticated = false
      this.userProfile = { nama: '', email: '', phone: '', role: '', wilayah_kode: null, wilayah_binaan: '' }
      this.quickMetrics = { skorRisiko: null, skorRisikoDbd: null, skorRisikoMalaria: null, levelRisiko: null, confidence: null, rataAbj: 0, totalRumahDiperiksa: 0, totalRumahPositif: 0, jumlahLaporanAbj: 0, persentaseBebasJentik: 0, laporanAktif: 0, laporanBelumDitangani: 0 }
      this.prediksi7Hari = []
      this.laporanWargaStats = { total: 0, aktif: 0, belum_ditangani: 0 }
      this.wilayahInfo = null
      this.tugasPending = []
      this.abjRecords = []
      this.notifications = []
    },

    // ── Profile ─────────────────────────────────────────────────────────
    async fetchProfile() {
      try {
        const profile = await authService.getProfile()
        this.userProfile = {
          nama: profile.nama || profile.name || '',
          email: profile.email || '',
          phone: profile.phone || profile.telepon || '',
          avatar: profile.avatar || '',
          role: profile.role === 'kader' ? 'Kader Kesehatan' : (profile.role || ''),
          wilayah_kode: profile.wilayah_kode || null,
          wilayah_binaan: profile.wilayah_tugas?.nama || profile.wilayah?.nama || profile.wilayah_binaan || '',
        }
      } catch (error) {
        console.error('Fetch profile failed:', error)
      }
    },

    async updateProfile(updatedData) {
      try {
        // Jika ada file avatar, pakai FormData (multipart)
        const hasFile = updatedData.avatar instanceof File
        let response

        if (hasFile) {
          const formData = new FormData()
          if (updatedData.nama !== undefined) formData.append('nama', updatedData.nama)
          if (updatedData.name !== undefined && updatedData.nama === undefined) formData.append('nama', updatedData.name)
          if (updatedData.phone !== undefined) formData.append('phone', updatedData.phone)
          if (updatedData.current_password !== undefined) formData.append('current_password', updatedData.current_password)
          if (updatedData.password !== undefined) formData.append('password', updatedData.password)
          if (updatedData.password_confirmation !== undefined) formData.append('password_confirmation', updatedData.password_confirmation)
          formData.append('_method', 'PATCH')
          if (updatedData.avatar !== undefined) formData.append('avatar', updatedData.avatar)
          response = await apiClient.post('/auth/update-profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          const payload = {}
          if (updatedData.nama !== undefined) payload.nama = updatedData.nama
          if (updatedData.name !== undefined && updatedData.nama === undefined) payload.nama = updatedData.name
          if (updatedData.phone !== undefined) payload.phone = updatedData.phone
          if (updatedData.current_password !== undefined) payload.current_password = updatedData.current_password
          if (updatedData.password !== undefined) payload.password = updatedData.password
          if (updatedData.password_confirmation !== undefined) payload.password_confirmation = updatedData.password_confirmation
          response = await authService.updateProfile(payload)
        }
        const p = (response && response.data) ? response.data : null
        if (p) {
          this.userProfile = {
            ...this.userProfile,
            nama: p.nama || p.name || this.userProfile.nama,
            email: p.email || this.userProfile.email,
            phone: p.phone || p.telepon || this.userProfile.phone,
            avatar: p.avatar || this.userProfile.avatar,
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

        // Skor risiko (backend bisa return dbd & malaria terpisah, atau satu skor)
        const skorUtama = d.skor_risiko_terkini?.dbd || d.skor_risiko_terkini
        this.quickMetrics = {
          skorRisiko: skorUtama?.skor ?? null,
          skorRisikoDbd: d.skor_risiko_terkini?.dbd?.skor ?? null,
          skorRisikoMalaria: d.skor_risiko_terkini?.malaria?.skor ?? null,
          levelRisiko: skorUtama?.level ?? null,
          confidence: skorUtama?.confidence ?? null,
          rataAbj: d.ringkasan_abj?.rata_rata_persen ?? 0,
          totalRumahDiperiksa: d.ringkasan_abj?.total_rumah_diperiksa ?? 0,
          totalRumahPositif: d.ringkasan_abj?.total_rumah_positif ?? 0,
          jumlahLaporanAbj: d.ringkasan_abj?.jumlah_laporan ?? 0,
          persentaseBebasJentik: d.ringkasan_abj?.persentase_bebas_jentik ?? 0,
          laporanAktif: d.laporan_warga?.aktif ?? 0,
          laporanBelumDitangani: d.laporan_warga?.belum_ditangani ?? 0,
        }
        this.prediksi7Hari = d.prediksi || []
        this.laporanWargaStats = d.laporan_warga || { total: 0, aktif: 0, belum_ditangani: 0 }
        this.wilayahInfo = d.wilayah || null
        this.tugasPending = d.tugas_pending || []

        // Update profil juga jika dashboard mengembalikan info kader
        if (d.kader) {
          this.userProfile = {
            ...this.userProfile,
            nama: d.kader.nama || this.userProfile.nama,
            email: d.kader.email || this.userProfile.email,
            phone: d.kader.phone || this.userProfile.phone,
            role: d.kader.role === 'kader' ? 'Kader Kesehatan' : (d.kader.role || this.userProfile.role),
            wilayah_kode: d.kader.wilayah_kode || this.userProfile.wilayah_kode,
            wilayah_binaan: d.kader.wilayah_binaan || this.userProfile.wilayah_binaan,
          }
        }
      } catch (error) {
        console.error('Fetch dashboard failed:', error)
      }
    },

    // ── ABJ ─────────────────────────────────────────────────────────────
    async fetchMyAbjRecords() {
      try {
        const response = await abjService.fetchAbjRecords()
        const paginator = response.data || response
        let records = []
        if (paginator && Array.isArray(paginator.data)) {
          records = paginator.data
        } else if (Array.isArray(paginator)) {
          records = paginator
        } else {
          records = [paginator].filter(Boolean)
        }

        this.abjRecords = records.map((rec) => ({
          id: rec.id,
          date: rec.tanggal_pemeriksaan,
          weekLabel: rec.tanggal_pemeriksaan,
          location: rec.wilayah ? rec.wilayah.nama : 'Wilayah Binaan',
          diperiksa: rec.jumlah_rumah_diperiksa,
          positifJentik: rec.jumlah_rumah_positif,
          abjScore: rec.abj_persen,
          status: rec.abj_persen >= 95 ? 'Aman' : rec.abj_persen >= 90 ? 'Waspada' : 'Bahaya',
          notes: rec.catatan || '',
          kaderName: rec.user ? (rec.user.nama || rec.user.name || 'Kader') : 'Kader',
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
          jumlah_rumah_positif: recordData.positifJentik,
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
          read: n.is_dibaca !== undefined ? n.is_dibaca : (n.is_read || false),
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
