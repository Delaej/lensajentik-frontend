import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { tourSteps } from '@/config/tourSteps.js'

// ── singleton state (shared across component instances) ────────────
const isActive = ref(false)
const currentStepIdx = ref(0)

// ── composable ─────────────────────────────────────────────────────
export function useGuidedTour() {
  const route = useRoute()

  // Derive steps from current route name
  const steps = computed(() => {
    const name = route.name
    if (name && tourSteps[name]) return tourSteps[name]
    // Generic fallback: scan for major sections on the page
    return buildGenericSteps()
  })

  const currentStep = computed(() => {
    const s = steps.value
    if (!s || s.length === 0) return null
    return s[currentStepIdx.value] ?? null
  })

  const totalSteps = computed(() => steps.value?.length ?? 0)
  const isFirstStep = computed(() => currentStepIdx.value === 0)
  const isLastStep = computed(() => currentStepIdx.value >= totalSteps.value - 1)
  const hasSteps = computed(() => totalSteps.value > 0)

  // ── actions ────────────────────────────────────────────────────
  function start() {
    currentStepIdx.value = 0
    isActive.value = true
  }

  function stop() {
    isActive.value = false
    currentStepIdx.value = 0
  }

  function next() {
    if (currentStepIdx.value < totalSteps.value - 1) {
      currentStepIdx.value++
    } else {
      stop()
    }
  }

  function prev() {
    if (currentStepIdx.value > 0) {
      currentStepIdx.value--
    }
  }

  function goTo(idx) {
    if (idx >= 0 && idx < totalSteps.value) {
      currentStepIdx.value = idx
    }
  }

  // ── generic step builder for pages without defined tours ────────
  function buildGenericSteps() {
    // Find major UI sections on the current page
    const sections = []
    const selectors = [
      { sel: 'header, .navbar, nav', title: 'Navigasi', desc: 'Menu navigasi utama untuk berpindah antar halaman.' },
      { sel: 'h1, .page-title, .hero h1', title: 'Judul Halaman', desc: 'Judul utama halaman ini yang menjelaskan konten di dalamnya.' },
      { sel: 'main, .main-content', title: 'Konten Utama', desc: 'Area utama yang menampilkan isi dari halaman ini.' },
      { sel: 'button, .lj-btn-primary, .lj-btn-green, a[role="button"]', title: 'Tombol Aksi', desc: 'Tombol untuk melakukan aksi atau berpindah ke halaman lain.' },
      { sel: 'footer', title: 'Footer', desc: 'Bagian bawah halaman berisi tautan tambahan dan informasi hak cipta.' },
    ]

    for (const s of selectors) {
      try {
        const el = document.querySelector(s.sel)
        if (el && sections.length < 5) {
          if (!sections.some(existing => existing.selector === s.sel)) {
            sections.push({
              selector: s.sel,
              title: s.title,
              description: s.desc,
            })
          }
        }
      } catch { /* skip invalid selectors */ }
    }

    // If nothing found, provide a minimal generic step
    if (sections.length === 0) {
      sections.push({
        selector: 'body',
        title: 'Halaman Ini',
        description: 'Halaman ini belum memiliki panduan langkah-demi-langkah. Gunakan menu navigasi di atas untuk menjelajahi fitur-fitur LensaJentik.',
      })
    }

    return sections
  }

  return {
    isActive,
    currentStepIdx,
    currentStep,
    steps,
    totalSteps,
    isFirstStep,
    isLastStep,
    hasSteps,
    start,
    stop,
    next,
    prev,
    goTo,
  }
}
