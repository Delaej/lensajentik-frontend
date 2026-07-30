import { defineStore } from 'pinia'
import { reportService } from '@/services/reportService'

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [],
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

    async verifyReportAction(id) {
      try {
        await reportService.verifyReport(id)
        // Refresh after verified
        await this.fetchReports()
      } catch (error) {
        console.error('Verify report failed:', error)
        throw error
      }
    },

    async updateReportStatusAction(id, status) {
      try {
        const backendStatus = status === 'Terkirim' ? 'belum_ditangani' : status === 'Dalam Proses' ? 'sedang_diproses' : 'selesai'
        await reportService.updateReportStatus(id, backendStatus)
        // Update locally for quick UI feedback
        const report = this.reports.find(r => r.id === id)
        if (report) report.status = status
      } catch (error) {
        console.error('Update report status failed:', error)
        throw error
      }
    },
  },
})
