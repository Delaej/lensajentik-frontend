import { defineStore } from 'pinia'

export const useKaderStore = defineStore('kader', {
  state: () => ({
    isAuthenticated: true,
    userProfile: {
      name: 'Nayla Salsabila',
      email: 'nayla@gmail.com',
      phone: '0812-3456-7890',
      role: 'Kader Kesehatan Utama',
      district: 'Kecamatan Sukajadi',
      subDistrict: 'Kelurahan Pasteur',
      rt: '03',
      rw: '05',
      totalHouseTarget: 45,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    },
    quickMetrics: {
      totalRumah: 45,
      diperiksa: 38,
      positifJentik: 3,
      abjScore: 92.1,
      status: 'Aman', // Aman, Waspada, Bahaya
    },
    abjRecords: [
      {
        id: 'REC-001',
        date: '2026-07-24',
        weekLabel: 'Mg 4 (Jul)',
        location: 'RT 03 / RW 05',
        rt: '03',
        rw: '05',
        diperiksa: 45,
        positifJentik: 3,
        abjScore: 93.3,
        status: 'Aman',
        notes: 'Pemeriksaan rutin minggu ke-4. Tempat penampungan air sudah dikuras warga.',
        kaderName: 'Nayla Salsabila',
      },
      {
        id: 'REC-002',
        date: '2026-07-17',
        weekLabel: 'Mg 3 (Jul)',
        location: 'RT 02 / RW 05',
        rt: '02',
        rw: '05',
        diperiksa: 42,
        positifJentik: 5,
        abjScore: 88.1,
        status: 'Waspada',
        notes: 'Ditemukan jentik di pot bunga outdoor & bak kamar mandi rumah pak RT.',
        kaderName: 'Nayla Salsabila',
      },
      {
        id: 'REC-003',
        date: '2026-07-10',
        weekLabel: 'Mg 2 (Jul)',
        location: 'RT 01 / RW 05',
        rt: '01',
        rw: '05',
        diperiksa: 40,
        positifJentik: 2,
        abjScore: 95.0,
        status: 'Aman',
        notes: 'Sosialisasi Abate berjalan baik. Kesadaran warga tinggi.',
        kaderName: 'Nayla Salsabila',
      },
      {
        id: 'REC-004',
        date: '2026-07-03',
        weekLabel: 'Mg 1 (Jul)',
        location: 'RT 04 / RW 05',
        rt: '04',
        rw: '05',
        diperiksa: 38,
        positifJentik: 4,
        abjScore: 89.4,
        status: 'Waspada',
        notes: 'Perlu pengawasan berulang pada area genangan drum bekas warga.',
        kaderName: 'Nayla Salsabila',
      },
      {
        id: 'REC-005',
        date: '2026-06-26',
        weekLabel: 'Mg 4 (Jun)',
        location: 'RT 03 / RW 05',
        rt: '03',
        rw: '05',
        diperiksa: 44,
        positifJentik: 1,
        abjScore: 97.7,
        status: 'Aman',
        notes: 'Kondisi sanitasi sangat bersih.',
        kaderName: 'Nayla Salsabila',
      },
    ],
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
    addAbjRecord(recordData) {
      const total = Number(recordData.diperiksa) || 0
      const positif = Number(recordData.positifJentik) || 0
      const abjScore = total > 0 ? Number((((total - positif) / total) * 100).toFixed(1)) : 0

      let status = 'Aman'
      if (abjScore < 90) status = 'Bahaya'
      else if (abjScore < 95) status = 'Waspada'

      const newRecord = {
        id: `REC-${Date.now().toString().slice(-4)}`,
        date: recordData.date || new Date().toISOString().split('T')[0],
        weekLabel: `Input Baru (${new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })})`,
        location: `RT ${recordData.rt} / RW ${recordData.rw}`,
        rt: recordData.rt,
        rw: recordData.rw,
        diperiksa: total,
        positifJentik: positif,
        abjScore,
        status,
        notes: recordData.notes || '',
        kaderName: this.userProfile.name,
      }

      this.abjRecords.unshift(newRecord)
      this.quickMetrics.diperiksa = total
      this.quickMetrics.positifJentik = positif
      this.quickMetrics.abjScore = abjScore
      this.quickMetrics.status = status
      return newRecord
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

    login(email, password) {
      if (email && password) {
        this.isAuthenticated = true
        return true
      }
      return false
    },

    logout() {
      this.isAuthenticated = false
    },
  },
})
