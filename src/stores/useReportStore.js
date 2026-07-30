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
          user: rec.user ? rec.user.nama || rec.user.name : 'Warga Anonim',
          address: rec.wilayah ? rec.wilayah.nama : (rec.alamat_text || 'Lokasi GPS'),
          coordinates: { lat: Number(rec.latitude), lng: Number(rec.longitude) },
          description: rec.deskripsi || '',
          imageUrl: rec.foto_path || '',
          status: rec.status === 'belum_ditangani' ? 'Terkirim' : rec.status === 'diproses' ? 'Dalam Proses' : 'Selesai Ditindak',
          statusCode: rec.status,
          createdAt: rec.created_at,
          jumlahVerifikasi: rec.jumlah_verifikasi || 0,
        }))
      } catch (error) {
        console.error('Fetch reports failed:', error)
      }
    },

    async addReport(reportData) {
      try {
        const formData = new FormData()
        if (reportData.wilayah_kode) {
          formData.append('wilayah_kode', reportData.wilayah_kode)
        }
        formData.append('latitude', reportData.latitude)
        formData.append('longitude', reportData.longitude)
        formData.append('foto', reportData.foto)
        if (reportData.description) {
          formData.append('deskripsi', reportData.description)
        }

        const response = await reportService.storeReport(formData)
        const result = response.data || response
        const newReport = result.data || result
        const poinDidapat = response.poin_didapat || result.poin_didapat || 0

        this.reports.unshift({
          id: newReport.id,
          user: reportData.userName || 'Warga Anonim',
          address: reportData.address || 'Lokasi GPS',
          coordinates: { lat: Number(reportData.latitude), lng: Number(reportData.longitude) },
          description: newReport.deskripsi || reportData.description || '',
          imageUrl: newReport.foto_path || '',
          status: 'Terkirim',
          statusCode: 'belum_ditangani',
          createdAt: newReport.created_at || new Date().toISOString(),
          jumlahVerifikasi: 0,
        })
        return { ...newReport, poin_didapat: poinDidapat }
      } catch (error) {
        console.error('Submit report failed:', error)
        throw error
      }
    },

    async verifyReportAction(id) {
      try {
        await reportService.verifyReport(id)
        await this.fetchReports()
      } catch (error) {
        console.error('Verify report failed:', error)
        throw error
      }
    },

    async updateReportStatusAction(id, status) {
      try {
        const backendStatus = status === 'Terkirim' ? 'belum_ditangani' : status === 'Dalam Proses' ? 'diproses' : 'selesai'
        await reportService.updateReportStatus(id, backendStatus)
        const report = this.reports.find(r => r.id === id)
        if (report) report.status = status
      } catch (error) {
        console.error('Update report status failed:', error)
        throw error
      }
    },
  },
})
