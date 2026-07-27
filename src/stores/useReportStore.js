import { defineStore } from 'pinia'

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
    addReport(reportData) {
      const newReport = {
        id: `LPR-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 8)}-${Math.floor(Math.random() * 900 + 100)}`,
        user: reportData.userName || 'Warga Anonim',
        address: reportData.address || 'Lokasi terdeteksi GPS',
        coordinates: reportData.coordinates || { lat: -6.892, lng: 107.595 },
        description: reportData.description || '',
        imageUrl: reportData.imageUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=600&auto=format&fit=crop',
        status: 'Terkirim',
        pointsEarned: 50,
        createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        kaderAssigned: 'Belum Ditugaskan',
      }
      this.reports.unshift(newReport)
      return newReport
    },
  },
})
