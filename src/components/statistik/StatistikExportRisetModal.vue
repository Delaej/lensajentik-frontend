<script setup>
import { ref } from 'vue'
import { Download, X, Search, MapPin } from 'lucide-vue-next'
import { statistikService } from '@/services/statistikService'
import { mapService } from '@/services/mapService'

const emit = defineEmits(['close'])

/* ── Form state ─────────────────────────────────────────────── */
const selectedWilayah = ref(null)   // { kode, nama, tingkat } | null → Semua Indonesia
const dari = ref('')
const sampai = ref('')
const jenisData = ref([])
const format = ref('xlsx')
const error = ref('')

/* ── Wilayah search (reuse /wilayah/search) ─────────────────── */
const wilayahQuery = ref('')
const wilayahResults = ref([])
const isSearching = ref(false)

const handleWilayahSearch = async () => {
  if (wilayahQuery.value.length < 3) {
    wilayahResults.value = []
    return
  }
  isSearching.value = true
  try {
    const res = await mapService.searchWilayah(wilayahQuery.value)
    wilayahResults.value = (res.data || res).filter((r) =>
      ['provinsi', 'kabupaten', 'kecamatan'].includes(r.tingkat)
    )
  } catch {
    wilayahResults.value = []
  } finally {
    isSearching.value = false
  }
}

const selectWilayah = (w) => {
  selectedWilayah.value = w
  wilayahQuery.value = ''
  wilayahResults.value = []
  error.value = ''
}

const clearWilayah = () => {
  selectedWilayah.value = null
  error.value = ''
}

/* ── Jenis data checkboxes ──────────────────────────────────── */
const dataOptions = [
  { value: 'skor_risiko', label: 'Skor Risiko', desc: 'Skor & level risiko harian per kecamatan' },
  { value: 'data_abj', label: 'Data ABJ', desc: 'Angka bebas jentik dari pemeriksaan kader' },
  { value: 'laporan_warga', label: 'Laporan Warga', desc: 'Laporan warga tentang potensi DBD/malaria' },
  { value: 'data_cuaca', label: 'Data Cuaca', desc: 'Curah hujan, suhu & kelembapan' },
]

const toggleJenis = (value) => {
  const i = jenisData.value.indexOf(value)
  if (i >= 0) jenisData.value.splice(i, 1)
  else jenisData.value.push(value)
  error.value = ''
}

/* ── Download ───────────────────────────────────────────────── */
const buildParams = () => {
  const params = {}
  if (selectedWilayah.value) params.wilayah_kode = selectedWilayah.value.kode
  if (dari.value) params.dari = dari.value
  if (sampai.value) params.sampai = sampai.value
  if (jenisData.value.length > 0) params.jenis_data = [...jenisData.value]
  return params
}

const handleDownload = () => {
  if (jenisData.value.length === 0) {
    error.value = 'Pilih minimal satu jenis data terlebih dahulu.'
    return
  }
  error.value = ''
  const url = statistikService.getExportRisetUrl(buildParams(), format.value)
  window.open(url, '_blank')
  emit('close')
}

/* ── Close helpers ──────────────────────────────────────────── */
const closeModal = () => emit('close')
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 overflow-y-auto"
      style="position: fixed; inset: 0; background: rgba(30, 43, 91, 0.75); backdrop-filter: blur(4px); z-index: 100;"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full mx-auto mt-20 mb-20 shadow-lg">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-black" style="color: var(--lj-navy);">Unduh Dataset Riset</h2>
          <button
            @click="closeModal"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" style="color: var(--lj-muted);" />
          </button>
        </div>

        <!-- 1. Pilih Wilayah -->
        <div class="mb-5">
          <label class="block text-xs font-bold mb-2" style="color: var(--lj-navy);">Pilih Wilayah</label>

          <div
            v-if="selectedWilayah"
            class="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
            style="background: #EEF2FF;"
          >
            <span class="text-sm font-bold inline-flex items-center gap-1.5 min-w-0" style="color: #4E63DA;">
              <MapPin class="w-4 h-4 shrink-0" />
              <span class="truncate">{{ selectedWilayah.nama }}</span>
            </span>
            <button
              @click="clearWilayah"
              class="text-xs font-bold px-2 py-1 rounded-lg hover:bg-white transition-colors shrink-0"
              style="color: #4E63DA;"
            >Ganti</button>
          </div>

          <template v-else>
            <div class="relative">
              <div class="flex items-center gap-2 border rounded-xl px-3 py-2.5" style="border-color: var(--lj-border);">
                <Search class="w-4 h-4 shrink-0" style="color: #4E63DA;" />
                <input
                  v-model="wilayahQuery"
                  type="text"
                  placeholder="Ketik nama wilayah (min. 3 huruf)"
                  class="flex-1 bg-transparent outline-none text-sm font-medium min-w-0"
                  style="color: var(--lj-navy);"
                  @input="handleWilayahSearch"
                />
              </div>
              <div
                v-if="wilayahResults.length > 0"
                class="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-xl overflow-hidden"
                style="border-color: var(--lj-border);"
              >
                <div
                  v-for="r in wilayahResults"
                  :key="r.kode"
                  @click="selectWilayah(r)"
                  class="px-3 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b last:border-0 text-sm"
                >
                  <span class="font-bold truncate" style="color: var(--lj-navy);">{{ r.nama }}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0" style="background: #EEF2FF; color: #4E63DA;">{{ r.tingkat }}</span>
                </div>
              </div>
            </div>
          </template>

          <p class="text-[11px] mt-1.5" style="color: var(--lj-muted);">
            {{ selectedWilayah ? selectedWilayah.nama : 'Semua Indonesia' }}
          </p>
        </div>

        <!-- 2. Rentang Tanggal -->
        <div class="mb-5">
          <label class="block text-xs font-bold mb-2" style="color: var(--lj-navy);">Rentang Tanggal</label>
          <div class="flex items-center gap-2">
            <input
              v-model="dari"
              type="date"
              class="flex-1 border rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
              style="border-color: var(--lj-border); color: var(--lj-navy);"
            />
            <span class="text-xs" style="color: var(--lj-muted);">s/d</span>
            <input
              v-model="sampai"
              type="date"
              class="flex-1 border rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
              style="border-color: var(--lj-border); color: var(--lj-navy);"
            />
          </div>
          <p class="text-[11px] mt-1.5" style="color: var(--lj-muted);">Kosongkan untuk semua data.</p>
        </div>

        <!-- 3. Pilih Jenis Data -->
        <div class="mb-5">
          <label class="block text-xs font-bold mb-2" style="color: var(--lj-navy);">
            Pilih Jenis Data <span style="color: #EF4444;">*</span>
          </label>
          <div class="space-y-2">
            <label
              v-for="opt in dataOptions"
              :key="opt.value"
              class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
              :style="jenisData.includes(opt.value) ? 'background:#EEF2FF; border-color:#4E63DA;' : 'border-color:var(--lj-border);'"
            >
              <input
                type="checkbox"
                class="mt-0.5 w-4 h-4 shrink-0"
                style="accent-color: #4E63DA;"
                :checked="jenisData.includes(opt.value)"
                @change="toggleJenis(opt.value)"
              />
              <span class="min-w-0">
                <span class="block text-sm font-bold" style="color: var(--lj-navy);">{{ opt.label }}</span>
                <span class="block text-[11px]" style="color: var(--lj-muted);">{{ opt.desc }}</span>
              </span>
            </label>
          </div>
          <p v-if="error" class="text-[11px] font-bold mt-2" style="color: #EF4444;">{{ error }}</p>
        </div>

        <!-- 4. Format -->
        <div class="mb-7">
          <label class="block text-xs font-bold mb-2" style="color: var(--lj-navy);">Format</label>
          <div class="flex gap-3">
            <label
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors"
              :style="format === 'csv' ? 'background:#EEF2FF; border-color:#4E63DA;' : 'border-color:var(--lj-border);'"
            >
              <input v-model="format" type="radio" value="csv" class="w-4 h-4" style="accent-color: #4E63DA;" />
              <span class="text-sm font-bold" style="color: var(--lj-navy);">CSV</span>
            </label>
            <label
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors"
              :style="format === 'xlsx' ? 'background:#EEF2FF; border-color:#4E63DA;' : 'border-color:var(--lj-border);'"
            >
              <input v-model="format" type="radio" value="xlsx" class="w-4 h-4" style="accent-color: #4E63DA;" />
              <span class="text-sm font-bold" style="color: var(--lj-navy);">Excel (.xlsx)</span>
            </label>
          </div>
        </div>

        <!-- Unduh -->
        <button
          @click="handleDownload"
          class="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90"
          style="background: #4E63DA; box-shadow: 0 8px 20px rgba(78, 99, 218, 0.3);"
        >
          <Download class="w-4 h-4" /> Unduh Dataset
        </button>
      </div>
    </div>
  </Teleport>
</template>
