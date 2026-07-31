<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  User,
  Shield,
  Bell,
  Camera,
  Save,
  CheckCircle2,
  Lock,
  Smartphone,
  MapPin,
  Mail,
} from 'lucide-vue-next'
import { useKaderStore } from '@/stores/useKaderStore'

const kaderStore = useKaderStore()

// Sync form dari store saat profile sudah diload
const profileForm = ref({
  nama: '',
  email: '',
  phone: '',
  role: '',
  district: '',
})

// Sync when store profile changes (e.g. after login fetches profile)
watch(
  () => kaderStore.userProfile,
  (profile) => {
    profileForm.value.nama = profile.nama || ''
    profileForm.value.email = profile.email || ''
    profileForm.value.phone = profile.phone || ''
    profileForm.value.role = profile.role || ''
    profileForm.value.district = profile.wilayah_binaan || ''
  },
  { immediate: true, deep: true }
)

// Avatar: gunakan inisial nama jika tidak ada foto
const avatarPreview = ref(null) // URL hasil pilih file lokal
const fileInput = ref(null)

const userInitials = computed(() => {
  const name = profileForm.value.nama || kaderStore.userProfile.nama || ''
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
})

const handleAvatarChange = () => {
  fileInput.value?.click()
}

const handleFileSelected = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Hanya file gambar yang diperbolehkan (JPG, PNG, WEBP).')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran file terlalu besar. Maksimum 5MB.')
    return
  }
  // Tampilkan preview lokal
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const isSaved = ref(false)
const showPasswordModal = ref(false)
const isSaving = ref(false)

const handleSaveProfile = async () => {
  isSaving.value = true
  const data = {
    nama: profileForm.value.nama,
    phone: profileForm.value.phone,
  }
  // Sertakan file avatar jika dipilih
  if (fileInput.value?.files?.[0]) {
    data.avatar = fileInput.value.files[0]
  }
  const result = await kaderStore.updateProfile(data)
  isSaving.value = false

  if (result.success) {
    isSaved.value = true
    avatarPreview.value = null // reset preview
    fileInput.value.value = '' // reset input
    setTimeout(() => (isSaved.value = false), 2500)
  } else {
    alert(result.message)
  }
}

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})
const isSavingPassword = ref(false)

const handleSavePassword = async () => {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    alert('Kata sandi baru dan konfirmasi tidak cocok!')
    return
  }
  
  isSavingPassword.value = true
  const result = await kaderStore.updateProfile({
    current_password: passwordForm.value.current_password,
    password: passwordForm.value.password,
    password_confirmation: passwordForm.value.password_confirmation
  })
  isSavingPassword.value = false
  
  if (result.success) {
    showPasswordModal.value = false
    alert('Kata sandi berhasil diperbarui!')
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
  } else {
    alert(result.message)
  }
}

const localSettings = ref({
  alertAbjHigh: true,
  weeklyReportReminders: true,
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
      <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
        <User class="w-6 h-6 text-blue-600" />
        Pengaturan Akun & Profil Kader
      </h2>
      <p class="text-xs text-slate-500 mt-1">Kelola informasi pribadi, wilayah tugas, keamanan akun, dan preferensi notifikasi</p>
    </div>

    <!-- Alert Saved Notification -->
    <div v-if="isSaved" class="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
      <CheckCircle2 class="w-5 h-5 text-emerald-600" />
      <span>Perubahan profil berhasil disimpan!</span>
    </div>

    <!-- Card 1: Informasi Profil -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      <div class="border-b border-slate-100 pb-4">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <User class="w-5 h-5 text-indigo-600" />
          Informasi Profil Kader
        </h3>
        <p class="text-xs text-slate-500">Data ini akan ditampilkan di laporan ABJ dan sistem monitoring Puskesmas</p>
      </div>

      <!-- Avatar & Photo Upload -->
      <div class="flex items-center gap-5">
        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelected"
        />

        <div class="relative">
          <!-- If photo preview exists, show it; otherwise show initials -->
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Foto Profil"
            class="w-20 h-20 rounded-3xl object-cover ring-4 ring-blue-500/20"
          />
          <div
            v-else
            class="w-20 h-20 rounded-3xl ring-4 ring-blue-500/20 flex items-center justify-center font-black text-2xl text-white select-none"
            style="background: linear-gradient(135deg, #4E63DA 0%, #5AF61F 100%);"
          >
            {{ userInitials }}
          </div>

          <button
            @click="handleAvatarChange"
            class="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-500 transition-transform active:scale-95"
            title="Ubah Foto Profil"
          >
            <Camera class="w-4 h-4" />
          </button>
        </div>

        <div>
          <div class="font-bold text-slate-900 text-base">{{ profileForm.nama || '—' }}</div>
          <div class="text-xs text-slate-500">{{ profileForm.role || 'Kader Kesehatan' }}</div>
          <button @click="handleAvatarChange" class="text-xs text-blue-600 font-bold hover:underline mt-1">
            {{ avatarPreview ? 'Ganti Foto' : 'Unggah Foto' }}
          </button>
          <p v-if="avatarPreview" class="text-[10px] text-amber-600 mt-0.5">Preview lokal. Simpan profil untuk menggunakan foto ini.</p>
        </div>
      </div>


      <!-- Form Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Lengkap</label>
          <div class="relative">
            <User class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="profileForm.nama"
              type="text"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nomor Telepon / WA</label>
          <div class="relative">
            <Smartphone class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="profileForm.phone"
              type="text"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Akun</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="profileForm.email"
              type="email"
              disabled
              class="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 cursor-not-allowed outline-none"
            />
          </div>
          <p class="text-[10px] text-slate-400 mt-1">Email tidak dapat diubah (digunakan untuk login).</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Wilayah Tugas (Kecamatan)</label>
          <div class="relative">
            <MapPin class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="profileForm.district"
              type="text"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="handleSaveProfile"
          :disabled="isSaving"
          class="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save class="w-4 h-4" v-if="!isSaving" />
          <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
        </button>
      </div>
    </div>

    <!-- Card 2: Keamanan -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield class="w-5 h-5 text-rose-600" />
            Keamanan & Kata Sandi
          </h3>
          <p class="text-xs text-slate-500">Perbarui kata sandi secara berkala untuk menjaga kerahasiaan data</p>
        </div>
        <button
          @click="showPasswordModal = true"
          class="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Lock class="w-4 h-4" /> Ubah Kata Sandi
        </button>
      </div>
    </div>

    <!-- Card 3: Preferensi Notifikasi Toggle Switches -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <Bell class="w-5 h-5 text-amber-500" />
          Preferensi Notifikasi & Peringatan Dini
        </h3>
        <p class="text-xs text-slate-500">Atur notifikasi pengingat yang ingin Anda terima</p>
      </div>

      <div class="space-y-4 divide-y divide-slate-100">
        <!-- Toggle 1: Peringatan ABJ Tinggi -->
        <div class="flex items-center justify-between pt-2">
          <div>
            <div class="font-bold text-xs text-slate-800">Peringatan ABJ Rendah (&lt;90%)</div>
            <p class="text-[11px] text-slate-500">Kirim notifikasi otomatis jika status wilayah binaan berubah menjadi Bahaya</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="localSettings.alertAbjHigh" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <!-- Toggle 2: Laporan Mingguan -->
        <div class="flex items-center justify-between pt-3">
          <div>
            <div class="font-bold text-xs text-slate-800">Pengingat Laporan Mingguan</div>
            <p class="text-[11px] text-slate-500">Pengingat berkala setiap hari Kamis sore untuk penyelesaian survey jentik</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="localSettings.weeklyReportReminders" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-900">Ubah Kata Sandi Kader</h3>
        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kata Sandi Lama</label>
            <input v-model="passwordForm.current_password" type="password" class="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
            <input v-model="passwordForm.password" type="password" class="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Minimal 8 karakter" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
            <input v-model="passwordForm.password_confirmation" type="password" class="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Minimal 8 karakter" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showPasswordModal = false" :disabled="isSavingPassword" class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50">Batal</button>
          <button @click="handleSavePassword" :disabled="isSavingPassword" class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
            <span>{{ isSavingPassword ? 'Menyimpan...' : 'Simpan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
