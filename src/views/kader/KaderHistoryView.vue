<script setup>
import { ref, computed } from 'vue'
import {
  TrendingUp,
  Filter,
  BarChart2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Search,
} from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'

const kaderStore = useKaderStore()

const selectedFilterMonth = ref('all')
const searchKeyword = ref('')

// Comparison widget state
const regionA = ref('RT 03 / RW 05 (Pasteur)')
const regionB = ref('RT 02 / RW 05 (Pasteur)')

const regionScores = {
  'RT 03 / RW 05 (Pasteur)': 93.3,
  'RT 02 / RW 05 (Pasteur)': 88.1,
  'RT 01 / RW 05 (Pasteur)': 95.0,
  'RT 04 / RW 05 (Pasteur)': 89.4,
}

const filteredRecords = computed(() => {
  return kaderStore.abjRecords.filter((rec) => {
    const matchesSearch =
      !searchKeyword.value ||
      rec.location.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      rec.notes.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchesSearch
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
      <div>
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp class="w-6 h-6 text-blue-600" />
          Riwayat & Grafik Tren ABJ Mingguan
        </h2>
        <p class="text-xs text-slate-500 mt-1">Evaluasi tren kebersihan jentik per minggu dan perbandingan antar RT/RW</p>
      </div>

      <!-- Month Filter Dropdown -->
      <div class="flex items-center gap-2">
        <Filter class="w-4 h-4 text-slate-500" />
        <select
          v-model="selectedFilterMonth"
          class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
        >
          <option value="all">Semua Periode (Juli 2026)</option>
          <option value="this_month">Bulan Ini (Juli)</option>
          <option value="last_month">Bulan Lalu (Juni)</option>
        </select>
      </div>
    </div>

    <!-- Main Grid: Bar Chart + Bandingkan Wilayah -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 2 Cols: Grafik Bar Penemuan Jentik -->
      <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 class="w-5 h-5 text-indigo-600" />
              Grafik Penemuan Rumah Positif Jentik
            </h3>
            <p class="text-xs text-slate-500">Jumlah rumah dengan jentik aktif per minggu survey</p>
          </div>
          <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
            Kecamatan Sukajadi
          </span>
        </div>

        <div class="h-56 flex items-end justify-around gap-4 pt-6 pb-2 border-b border-slate-100">
          <div
            v-for="rec in kaderStore.abjRecords"
            :key="rec.id"
            class="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
          >
            <span class="text-xs font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {{ rec.positifJentik }} Rumah
            </span>
            <div
              class="w-full max-w-[40px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl transition-all shadow-sm group-hover:scale-105"
              :style="{ height: `${Math.max(15, (rec.positifJentik / 10) * 100)}%` }"
            >
              <div class="text-[10px] text-white font-black text-center pt-1">{{ rec.positifJentik }}</div>
            </div>
            <span class="text-[11px] font-bold text-slate-600 truncate max-w-[60px]">{{ rec.weekLabel }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Target Ideal: 0 Rumah Positif Jentik</span>
          <span class="font-bold text-slate-700">Rata-rata ABJ: {{ kaderStore.averageAbjScore }}%</span>
        </div>
      </div>

      <!-- 1 Col: Widget Bandingkan Wilayah -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            ⚖️ Bandingkan Perbandingan Wilayah
          </h3>
          <p class="text-xs text-slate-500 my-2">Bandingkan rata-rata ABJ antar RT untuk intervensi prioritas</p>

          <div class="space-y-4 mt-4">
            <!-- Region A Select -->
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Wilayah A</label>
              <select v-model="regionA" class="w-full bg-white p-2 rounded-xl text-xs font-bold text-slate-800 border outline-none">
                <option v-for="(score, name) in regionScores" :key="name" :value="name">{{ name }}</option>
              </select>
              <div class="mt-2 text-xl font-extrabold text-slate-900">
                {{ regionScores[regionA] }}% <span class="text-xs font-normal text-slate-500">ABJ</span>
              </div>
            </div>

            <div class="text-center font-black text-xs text-slate-400">VS</div>

            <!-- Region B Select -->
            <div class="p-3 bg-blue-50/70 rounded-2xl border border-blue-200">
              <label class="block text-[10px] font-bold text-blue-700 uppercase mb-1">Wilayah B</label>
              <select v-model="regionB" class="w-full bg-white p-2 rounded-xl text-xs font-bold text-slate-800 border outline-none">
                <option v-for="(score, name) in regionScores" :key="name" :value="name">{{ name }}</option>
              </select>
              <div class="mt-2 text-xl font-extrabold text-blue-700">
                {{ regionScores[regionB] }}% <span class="text-xs font-normal text-blue-500">ABJ</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-3 bg-slate-900 text-white rounded-2xl text-xs space-y-1">
          <span class="font-bold text-amber-400">Kesimpulan Komparasi:</span>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            {{ regionA }} memiliki skor ABJ {{ regionScores[regionA] > regionScores[regionB] ? 'lebih tinggi' : 'lebih rendah' }} dibanding {{ regionB }}.
          </p>
        </div>
      </div>
    </div>

    <!-- Tabel Riwayat Pemeriksaan Terbaru -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet class="w-5 h-5 text-emerald-600" />
            Tabel Riwayat Pemeriksaan Lapangan
          </h3>
          <p class="text-xs text-slate-500">Seluruh catatan survey yang telah tersimpan dalam database</p>
        </div>

        <!-- Search Table Input -->
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Cari RT/RW atau catatan..."
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- Table View -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th class="py-3.5 px-6">Tanggal</th>
              <th class="py-3.5 px-4">Lokasi (RT/RW)</th>
              <th class="py-3.5 px-4 text-center">Diperiksa</th>
              <th class="py-3.5 px-4 text-center">Positif Jentik</th>
              <th class="py-3.5 px-4">Status ABJ</th>
              <th class="py-3.5 px-6">Petugas Kader</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            <tr v-for="rec in filteredRecords" :key="rec.id" class="hover:bg-slate-50 transition-colors">
              <td class="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <Calendar class="w-4 h-4 text-slate-400" />
                  <span>{{ rec.date }}</span>
                </div>
              </td>
              <td class="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <MapPin class="w-4 h-4 text-indigo-500" />
                  <span>{{ rec.location }}</span>
                </div>
              </td>
              <td class="py-4 px-4 text-center font-bold text-slate-900">{{ rec.diperiksa }} Rumah</td>
              <td class="py-4 px-4 text-center font-bold" :class="rec.positifJentik > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-600'">
                {{ rec.positifJentik }} Rumah
              </td>
              <td class="py-4 px-4 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1"
                  :class="[
                    rec.status === 'Aman' ? 'bg-emerald-100 text-emerald-800' :
                    rec.status === 'Waspada' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  ]"
                >
                  <CheckCircle2 v-if="rec.status === 'Aman'" class="w-3.5 h-3.5" />
                  <AlertTriangle v-else class="w-3.5 h-3.5" />
                  {{ rec.abjScore }}% ({{ rec.status }})
                </span>
              </td>
              <td class="py-4 px-6 text-slate-600 whitespace-nowrap">{{ rec.kaderName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
