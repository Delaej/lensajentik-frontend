<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { HelpCircle, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { useGuidedTour } from '@/composables/useGuidedTour'

const {
  isActive,
  currentStepIdx,
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  hasSteps,
  start,
  stop,
  next,
  prev,
} = useGuidedTour()

// ── spotlight rectangle (position + size of target element) ───────
const spotRect = ref({ top: 0, left: 0, width: 0, height: 0 })
const tooltipStyle = ref({})
const tooltipArrow = ref('bottom')    // which side the arrow is on
let resizeObserver = null
let mutationObserver = null

// ── track the target element ───────────────────────────────────────
async function updateSpotlight() {
  const step = currentStep.value
  if (!step) return

  try {
    const el = document.querySelector(step.selector)
    if (!el) {
      // fallback: highlight body center
      spotRect.value = {
        top: window.innerHeight * 0.3,
        left: window.innerWidth * 0.3,
        width: window.innerWidth * 0.4,
        height: window.innerHeight * 0.3,
      }
      updateTooltipPosition(step.position || 'bottom')
      return
    }

    // Scroll the target into view (smooth, centered)
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

    // Wait for scroll to settle, then position spotlight
    await waitForScrollSettle(el)

    const rect = el.getBoundingClientRect()
    // add padding around the target
    const pad = 8
    spotRect.value = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    }
    updateTooltipPosition(step.position || 'bottom')
  } catch {
    // ignore errors from invalid selectors
  }
}

// ── wait for scroll to finish ──────────────────────────────────────
function waitForScrollSettle(targetEl) {
  return new Promise((resolve) => {
    let lastY = window.scrollY
    let stableCount = 0
    const check = () => {
      const currentY = window.scrollY
      if (Math.abs(currentY - lastY) < 2) {
        stableCount++
        if (stableCount >= 4) {
          // Double-check the element is visible
          const rect = targetEl.getBoundingClientRect()
          const isVisible = rect.top > -50 && rect.bottom < window.innerHeight + 50
          if (isVisible || stableCount >= 8) {
            resolve()
            return
          }
        }
      } else {
        stableCount = 0
      }
      lastY = currentY
      requestAnimationFrame(check)
    }
    // Start checking after a short delay to let the smooth scroll begin
    setTimeout(() => requestAnimationFrame(check), 80)
  })
}

function updateTooltipPosition(preferred) {
  const r = spotRect.value
  const tooltipW = 340
  const tooltipH = 140
  const gap = 16
  const margin = 16

  // Determine best position (preferred first, then fallback)
  const positions = [preferred, 'bottom', 'top', 'right', 'left']
  let best = 'bottom'

  for (const pos of positions) {
    let fits = false
    switch (pos) {
      case 'bottom':
        fits = r.top + r.height + tooltipH + gap + margin < window.innerHeight
        break
      case 'top':
        fits = r.top - tooltipH - gap - margin > 0
        break
      case 'right':
        fits = r.left + r.width + tooltipW + gap + margin < window.innerWidth
        break
      case 'left':
        fits = r.left - tooltipW - gap - margin > 0
        break
    }
    if (fits) {
      best = pos
      break
    }
  }

  tooltipArrow.value = best

  let tLeft, tTop
  const centerX = r.left + r.width / 2
  const centerY = r.top + r.height / 2

  switch (best) {
    case 'bottom':
      tLeft = clamp(centerX - tooltipW / 2, margin, window.innerWidth - tooltipW - margin)
      tTop = r.top + r.height + gap
      break
    case 'top':
      tLeft = clamp(centerX - tooltipW / 2, margin, window.innerWidth - tooltipW - margin)
      tTop = r.top - tooltipH - gap
      break
    case 'right':
      tLeft = r.left + r.width + gap
      tTop = clamp(centerY - tooltipH / 2, margin + 60, window.innerHeight - tooltipH - margin)
      break
    case 'left':
      tLeft = r.left - tooltipW - gap
      tTop = clamp(centerY - tooltipH / 2, margin + 60, window.innerHeight - tooltipH - margin)
      break
    default:
      tLeft = centerX - tooltipW / 2
      tTop = r.top + r.height + gap
  }

  tooltipStyle.value = {
    left: `${tLeft}px`,
    top: `${tTop}px`,
  }
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

// ── keyboard ────────────────────────────────────────────────────────
function onKeydown(e) {
  if (!isActive.value) return
  if (e.key === 'Escape') stop()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

// ── watch for step changes ──────────────────────────────────────────
watch([currentStepIdx, isActive], async () => {
  if (isActive.value) {
    await nextTick()
    await updateSpotlight()
  }
})

// ── observe DOM mutations while tour is active ──────────────────────
function startObserving() {
  resizeObserver = new ResizeObserver(() => {
    const step = currentStep.value
    if (!step) return
    try {
      const el = document.querySelector(step.selector)
      if (el) {
        const rect = el.getBoundingClientRect()
        const pad = 8
        spotRect.value = {
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }
        updateTooltipPosition(step.position || 'bottom')
      }
    } catch { /* ignore */ }
  })
  resizeObserver.observe(document.body)

  mutationObserver = new MutationObserver(() => {
    // small delay to let DOM settle, then update (no scroll needed for mutations)
    requestAnimationFrame(() => {
      const step = currentStep.value
      if (!step) return
      try {
        const el = document.querySelector(step.selector)
        if (el) {
          const rect = el.getBoundingClientRect()
          const pad = 8
          spotRect.value = {
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }
          updateTooltipPosition(step.position || 'bottom')
        }
      } catch { /* ignore */ }
    })
  })
  mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true })
}

function stopObserving() {
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null }
}

watch(isActive, (val) => {
  if (val) {
    startObserving()
    document.body.style.overflow = 'hidden'
  } else {
    stopObserving()
    document.body.style.overflow = ''
  }
})

// ── lifecycle ───────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  stopObserving()
  document.body.style.overflow = ''
})
</script>

<template>
  <!-- ── Floating "?" button ─────────────────────────────────────── -->
  <button
    v-if="!isActive"
    class="tour-fab"
    aria-label="Bantuan panduan halaman"
    title="Panduan halaman ini"
    @click="start"
  >
    <HelpCircle class="w-5 h-5" />
  </button>

  <!-- ── Active tour overlay ─────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="isActive" class="tour-overlay" @click.self="stop">
      <!-- spotlight cutout -->
      <div
        class="tour-spotlight"
        :style="{
          top: spotRect.top + 'px',
          left: spotRect.left + 'px',
          width: spotRect.width + 'px',
          height: spotRect.height + 'px',
        }"
      />

      <!-- tooltip card -->
      <div
        v-if="currentStep"
        class="tour-tooltip"
        :class="'arrow-' + tooltipArrow"
        :style="tooltipStyle"
      >
        <!-- step indicator -->
        <div class="tour-step-badge">
          Langkah {{ currentStepIdx + 1 }} / {{ totalSteps }}
        </div>

        <!-- content -->
        <h3 class="tour-step-title">{{ currentStep.title }}</h3>
        <p class="tour-step-desc">{{ currentStep.description }}</p>

        <!-- actions -->
        <div class="tour-actions">
          <button
            v-if="!isFirstStep"
            class="tour-btn tour-btn-prev"
            @click.stop="prev"
          >
            <ChevronLeft class="w-4 h-4" />
            Sebelumnya
          </button>
          <div class="tour-spacer" />
          <button class="tour-btn tour-btn-close" @click.stop="stop">
            <X class="w-4 h-4" />
            Tutup
          </button>
          <button
            v-if="!isLastStep"
            class="tour-btn tour-btn-next"
            @click.stop="next"
          >
            Lanjutkan
            <ChevronRight class="w-4 h-4" />
          </button>
          <button
            v-else
            class="tour-btn tour-btn-done"
            @click.stop="stop"
          >
            Selesai
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- skip all -->
      <button class="tour-skip-all" @click="stop">Lewati panduan</button>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── FAB button ────────────────────────────────────────────────── */
.tour-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9996;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--lj-blue, #4E63DA);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(78, 99, 218, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.tour-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(78, 99, 218, 0.5);
}

.tour-fab:active {
  transform: scale(0.95);
}

/* ── overlay ───────────────────────────────────────────────────── */
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: transparent;
}

/* ── spotlight cutout ──────────────────────────────────────────── */
.tour-spotlight {
  position: fixed;
  z-index: 10001;
  border-radius: 10px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* subtle highlight ring */
.tour-spotlight::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 12px;
  border: 2.5px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 20px rgba(78, 99, 218, 0.25);
  pointer-events: none;
}

/* ── tooltip card ──────────────────────────────────────────────── */
.tour-tooltip {
  position: fixed;
  z-index: 10002;
  width: 340px;
  max-width: calc(100vw - 32px);
  background: #ffffff;
  border-radius: 16px;
  padding: 22px 24px 18px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.5);
  transition: left 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
              top 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
  font-family: 'Satoshi', system-ui, sans-serif;
}

/* ── arrow ─────────────────────────────────────────────────────── */
.tour-tooltip::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: #ffffff;
  transform: rotate(45deg);
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.06);
}

.tour-tooltip.arrow-bottom::before {
  top: -7px;
  left: calc(50% - 7px);
}

.tour-tooltip.arrow-top::before {
  bottom: -7px;
  left: calc(50% - 7px);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.06);
}

.tour-tooltip.arrow-right::before {
  left: -7px;
  top: calc(50% - 7px);
}

.tour-tooltip.arrow-left::before {
  right: -7px;
  top: calc(50% - 7px);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.06);
}

/* ── step badge ────────────────────────────────────────────────── */
.tour-step-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--lj-blue, #4E63DA);
  background: var(--lj-blue-pale, #EEF1FD);
  padding: 3px 12px;
  border-radius: 999px;
  margin-bottom: 10px;
}

/* ── title & description ────────────────────────────────────────── */
.tour-step-title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 700;
  color: var(--lj-navy, #1E2B5B);
  line-height: 1.3;
}

.tour-step-desc {
  margin: 0 0 16px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #4b5670;
}

/* ── actions row ────────────────────────────────────────────────── */
.tour-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tour-spacer {
  flex: 1;
}

.tour-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  border-radius: 999px;
  padding: 7px 15px;
  font-family: 'Satoshi', system-ui, sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.tour-btn-prev,
.tour-btn-close {
  background: #f1f5f9;
  color: #475569;
}
.tour-btn-prev:hover,
.tour-btn-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.tour-btn-next {
  background: var(--lj-blue, #4E63DA);
  color: #ffffff;
}
.tour-btn-next:hover {
  background: var(--lj-navy, #1E2B5B);
  box-shadow: 0 4px 16px rgba(78, 99, 218, 0.35);
}

.tour-btn-done {
  background: var(--lj-green-dk, #5AF61F);
  color: var(--lj-navy, #1E2B5B);
}
.tour-btn-done:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 16px rgba(90, 246, 31, 0.4);
}

/* ── skip all ───────────────────────────────────────────────────── */
.tour-skip-all {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 10003;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tour-skip-all:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ── responsive ─────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .tour-tooltip {
    width: calc(100vw - 32px);
    left: 16px !important;
    right: 16px;
  }

  .tour-fab {
    bottom: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
  }

  .tour-skip-all {
    bottom: 20px;
    right: 20px;
  }
}
</style>
