import { defineStore } from 'pinia'
import { reportService } from '@/services/reportService'

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [
      {
        id: 'LPR-20260726-001',
        user: 'Rian Pratama',
        address: 'Jl. Pasteur No. 42, Kel. Pasteur, Sukajadi',
        coordinates: { lat: -6.8912, lng: 107.5942 },
        description: 'Genangan air jernih di ban bekas samping selokan warga. Sudah mulai ada larva jentik bergerombol.',
        imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=600&auto=format&fit=crop',
        status: 'Dalam Proses', // 'Terkirim', 'Dalam Proses', 'Selesai Ditindak'
        pointsEarned: 50,
        createdAt: '2026-07-26 10:15 WIB',
        kaderAssigned: 'Nayla Salsabila',
      },
      {
        id: 'LPR-20260724-002',
        user: 'Siti Aminah',
        address: 'Gg. Masjid RT 02/RW 05, Pasteur',
        coordinates: { lat: -6.8895, lng: 107.5961 },
        description: 'Pot tanaman hias tetangga tergenang air hujan berturut-turut 4 hari.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=600&auto=format&fit=crop',
        status: 'Selesai Ditindak',
        pointsEarned: 50,
        createdAt: '2026-07-24 16:40 WIB',
        kaderAssigned: 'Nayla Salsabila',
      },
    ],
  }),

  actions: {
    async fetchReports() {
      try {
        const response = await reportService.fetchReports()
        const records = response.data || response
        this.reports = records.map((rec) => ({
          id: rec.id,
          user: rec.user ? rec.user.name : 'Warga Anonim',
          address: rec.wilayah ? rec.wilayah.nama : 'Lokasi Terdaftar',
          coordinates: { lat: Number(rec.latitude), lng: Number(rec.longitude) },
          description: rec.deskripsi || '',
          imageUrl: rec.foto_path || '',
          status: rec.status === 'belum_ditangani' ? 'Terkirim' : rec.status === 'sedang_diproses' ? 'Dalam Proses' : 'Selesai Ditindak',
          pointsEarned: 50,
          createdAt: rec.created_at,
          kaderAssigned: 'Kader Wilayah',
        }))
      } catch (error) {
        console.error('Fetch reports failed:', error)
      }
    },

    async addReport(reportData) {
      try {
        const formData = new FormData()
        formData.append('wilayah_kode', reportData.wilayah_kode)
        formData.append('latitude', reportData.latitude)
        formData.append('longitude', reportData.longitude)
        formData.append('foto', reportData.foto) // File object
        if (reportData.description) {
          formData.append('deskripsi', reportData.description)
        }

        const response = await reportService.storeReport(formData)
        const newReport = response.data || response

        const added = {
          id: newReport.id,
          user: reportData.userName || 'Warga Anonim',
          address: reportData.address || 'Lokasi terdeteksi GPS',
          coordinates: { lat: Number(reportData.latitude), lng: Number(reportData.longitude) },
          description: newReport.deskripsi || '',
          imageUrl: newReport.foto_path || '',
          status: 'Terkirim',
          pointsEarned: 50,
          createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
          kaderAssigned: 'Belum Ditugaskan',
        }
        this.reports.unshift(added)
        return newReport
      } catch (error) {
        console.error('Submit report failed:', error)
        throw error
      }
    },
  },
})
