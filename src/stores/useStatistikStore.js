import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Shared filter state for the entire Statistics page.
 * Every feature section watches `reloadToken` to know when to re-fetch.
 */
export const useStatistikStore = defineStore('statistik', () => {
  /* ── Global Filters ──────────────────────────────────────────── */
  const jenisPenyakit = ref('dbd')        // 'dbd' | 'malaria'
  const rentangWaktu = ref('hari-ini')    // 'hari-ini' | '7-hari' | '30-hari' | 'custom'
  const dariTanggal = ref(null)            // ISO date string (only for custom)
  const sampaiTanggal = ref(null)          // ISO date string (only for custom)

  /* ── Selected Wilayah (shared across detail panel, tren chart, laporan) ── */
  const selectedWilayah = ref(null)        // { kode, nama, tingkat }

  /* ── Reload Token ─────────────────────────────────────────────── */
  // Every component that fetches data watches this.
  // When any filter changes, increment → all sections refetch.
  const reloadToken = ref(0)

  function triggerReload() {
    reloadToken.value++
  }

  function setJenisPenyakit(val) {
    jenisPenyakit.value = val
    triggerReload()
  }

  function setRentangWaktu(val) {
    rentangWaktu.value = val
    if (val !== 'custom') {
      dariTanggal.value = null
      sampaiTanggal.value = null
    }
    triggerReload()
  }

  function setCustomRange(dari, sampai) {
    dariTanggal.value = dari
    sampaiTanggal.value = sampai
    triggerReload()
  }

  function setSelectedWilayah(wilayah) {
    selectedWilayah.value = wilayah
  }

  function clearSelectedWilayah() {
    selectedWilayah.value = null
  }

  /* ── Computed date params ─────────────────────────────────────── */
  const dateParams = computed(() => {
    const today = new Date()
    // Format pakai komponen WAKTU LOKAL (bukan toISOString/UTC) agar tidak
    // bergeser -1 hari untuk zona waktu +7 (WIB).
    const fmt = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    switch (rentangWaktu.value) {
      case 'hari-ini':
        return { dari: fmt(today), sampai: fmt(today) }
      case '7-hari': {
        const d = new Date(today)
        d.setDate(d.getDate() - 7)
        return { dari: fmt(d), sampai: fmt(today) }
      }
      case '30-hari': {
        const d = new Date(today)
        d.setDate(d.getDate() - 30)
        return { dari: fmt(d), sampai: fmt(today) }
      }
      case 'custom':
        return { dari: dariTanggal.value, sampai: sampaiTanggal.value }
      default:
        return { dari: fmt(today), sampai: fmt(today) }
    }
  })

  return {
    jenisPenyakit, rentangWaktu, dariTanggal, sampaiTanggal,
    selectedWilayah, reloadToken,
    setJenisPenyakit, setRentangWaktu, setCustomRange,
    setSelectedWilayah, clearSelectedWilayah,
    dateParams, triggerReload,
  }
})
