<script setup>
import { ref, watch, computed } from 'vue'
import { FileText, Download, X } from 'lucide-vue-next'
import { statistikService } from '@/services/statistikService'
import { useStatistikStore } from '@/stores/useStatistikStore'

const store = useStatistikStore()

/* ── Modal state ─────────────────────────────────────────────── */
const showModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const hasil = ref(null) // respons backend { narasi, ringkasan, wilayah }

/* ── Form state ──────────────────────────────────────────────── */
const dari = ref('')
const sampai = ref('')
const jenis = ref('dbd')

/* ── Wilayah aktif ───────────────────────────────────────────── */
const kode = computed(() => store.selectedWilayah?.kode || null)
const namaWilayah = computed(() => store.selectedWilayah?.nama || '')

/* ── Params untuk API ────────────────────────────────────────── */
const params = computed(() => {
  const p = { jenis: jenis.value }
  if (dari.value) p.dari = dari.value
  if (sampai.value) p.sampai = sampai.value
  return p
})

/* Isi form dari filter global saat modal dibuka */
const isiDariFilterGlobal = () => {
  jenis.value = store.jenisPenyakit || 'dbd'
  const { dari: d, sampai: s } = store.dateParams
  dari.value = d || ''
  sampai.value = s || ''
}

/* Saat wilayah berubah, hasil laporan lama tidak relevan lagi */
watch(() => store.selectedWilayah, () => {
  hasil.value = null
  error.value = ''
})

const openModal = () => {
  isiDariFilterGlobal()
  hasil.value = null
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const generate = async () => {
  if (!kode.value) return
  isLoading.value = true
  error.value = ''
  try {
    hasil.value = await statistikService.getLaporanRingkas(kode.value, params.value)
  } catch (e) {
    error.value = 'Gagal membuat laporan ringkas. Silakan coba lagi.'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const downloadPdf = () => {
  if (!kode.value || !hasil.value) return
  window.open(statistikService.getLaporanRingkasPdfUrl(kode.value, params.value), '_blank')
}
</script>

<template>
  <!-- ── Tombol pemicu (hanya saat kecamatan dipilih) ── -->
  <button
    v-if="store.selectedWilayah"
    @click="openModal"
    class="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-opacity hover:opacity-90"
    style="background: #4E63DA; box-shadow: 0 2px 8px rgba(78, 99, 218, 0.3);"
  >
    📄 Buat Laporan Ringkas
  </button>

  <!-- ── Modal (Teleport ke body) ── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style="background: rgba(30, 43, 91, 0.75); backdrop-filter: blur(4px);"
        @click.self="closeModal"
      >
        <div
          class="bg-white rounded-[32px] w-full max-w-2xl p-6 sm:p-8 shadow-2xl border relative max-h-[90vh] overflow-y-auto"
          style="border-color: var(--lj-border);"
        >
          <!-- Header modal -->
          <div class="flex items-start justify-between gap-3 mb-6">
            <div class="min-w-0">
              <h3 class="text-xl font-bold" style="color: var(--lj-navy);">Buat Laporan Ringkas</h3>
              <p class="text-xs mt-1 truncate" style="color: var(--lj-muted);">
                Kecamatan: {{ namaWilayah }}
              </p>
            </div>
            <button
              @click="closeModal"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Tutup"
            >
              <X class="w-5 h-5" style="color: var(--lj-muted);" />
            </button>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <!-- Rentang tanggal -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold mb-1 block" style="color: var(--lj-muted);">Dari</label>
                <input
                  v-model="dari"
                  type="date"
                  class="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                  style="border-color: var(--lj-border); color: var(--lj-navy);"
                />
              </div>
              <div>
                <label class="text-xs font-bold mb-1 block" style="color: var(--lj-muted);">Sampai</label>
                <input
                  v-model="sampai"
                  type="date"
                  class="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                  style="border-color: var(--lj-border); color: var(--lj-navy);"
                />
              </div>
            </div>

            <!-- Jenis penyakit -->
            <div>
              <label class="text-xs font-bold mb-1 block" style="color: var(--lj-muted);">Jenis Penyakit</label>
              <div class="flex items-center gap-1 bg-gray-100 rounded-full p-1 w-fit">
                <button
                  @click="jenis = 'dbd'"
                  class="px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                  :style="jenis === 'dbd' ? 'background: var(--lj-blue); color: white;' : 'color: var(--lj-muted);'"
                >DBD</button>
                <button
                  @click="jenis = 'malaria'"
                  class="px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                  :style="jenis === 'malaria' ? 'background: var(--lj-blue); color: white;' : 'color: var(--lj-muted);'"
                >Malaria</button>
              </div>
            </div>

            <!-- Generate -->
            <button
              @click="generate"
              :disabled="isLoading"
              class="w-full bg-[#4E63DA] text-white rounded-xl px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText class="w-4 h-4" />
              {{ isLoading ? 'Membuat laporan...' : 'Generate Laporan' }}
            </button>

            <!-- Error -->
            <div
              v-if="error"
              class="text-xs font-bold px-4 py-3 rounded-xl"
              style="background: #FEE2E2; color: #991B1B;"
            >{{ error }}</div>
          </div>

          <!-- Pratinjau narasi + unduh PDF -->
          <div v-if="hasil" class="mt-6">
            <div class="flex items-center justify-between flex-wrap gap-3 mb-3">
              <h4 class="text-sm font-bold" style="color: var(--lj-navy);">Pratinjau Narasi</h4>
              <button
                @click="downloadPdf"
                class="bg-[#DC2626] text-white rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-1.5 transition-opacity hover:opacity-90"
              >
                <Download class="w-4 h-4" /> Unduh sebagai PDF
              </button>
            </div>
            <div
              class="bg-gray-50 rounded-2xl p-6 max-h-64 overflow-y-auto text-sm leading-relaxed"
              style="color: var(--lj-navy);"
            >
              {{ hasil.narasi }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
