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
  start,
  stop,
  next,
  prev,
  goTo,
} = useGuidedTour()

// ── spotlight rectangle (viewport relative) ───────────────────────
const spotRect = ref({ top: 0, left: 0, width: 0, height: 0, visible: false })
const tooltipStyle = ref({})
const tooltipArrow = ref('bottom')
let animFrameId = null
let resizeObserver = null
let mutationObserver = null

// ── recalculate target element position ────────────────────────────
function calculateRect() {
  const step = currentStep.value
  if (!step) {
    spotRect.value.visible = false
    return null
  }

  try {
    const el = document.querySelector(step.selector)
    if (!el) {
      // Fallback: center of screen
      const w = Math.min(window.innerWidth * 0.8, 500)
      const h = 200
      spotRect.value = {
        top: (window.innerHeight - h) / 2,
        left: (window.innerWidth - w) / 2,
        width: w,
        height: h,
        visible: true,
      }
      updateTooltipPosition(step.position || 'bottom')
      return null
    }

    const rect = el.getBoundingClientRect()
    const pad = 10

    spotRect.value = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
      visible: true,
    }

    updateTooltipPosition(step.position || 'bottom')
    return el
  } catch (err) {
    spotRect.value.visible = false
    return null
  }
}

// ── update spotlight on step change with smooth scroll ─────────────
async function updateSpotlight(shouldScroll = true) {
  const step = currentStep.value
  if (!step) return

  await nextTick()
  const el = document.querySelector(step.selector)

  if (el && shouldScroll) {
    // Scroll page smoothly to bring element into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  // Continuously track element position during animation / scrolling
  let frames = 0
  const track = () => {
    calculateRect()
    frames++
    if (frames < 30) {
      animFrameId = requestAnimationFrame(track)
    }
  }
  if (animFrameId) cancelAnimationFrame(animFrameId)
  animFrameId = requestAnimationFrame(track)
}

// ── tooltip positioning math ───────────────────────────────────────
function updateTooltipPosition(preferred = 'bottom') {
  const r = spotRect.value
  const tooltipW = 340
  const tooltipH = 160
  const gap = 16
  const margin = 16

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
      tLeft = clamp(centerX - tooltipW / 2, margin, window.innerWidth - tooltipW - margin)
      tTop = r.top + r.height + gap
  }

  tooltipStyle.value = {
    left: `${tLeft}px`,
    top: `${tTop}px`,
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

// ── scroll & resize listeners for real-time tracking ───────────────
function onWindowScrollOrResize() {
  if (!isActive.value) return
  calculateRect()
}

// ── keyboard shortcuts ─────────────────────────────────────────────
function onKeydown(e) {
  if (!isActive.value) return
  if (e.key === 'Escape') stop()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

// ── watch step changes ─────────────────────────────────────────────
watch([currentStepIdx, isActive], async ([newIdx, active]) => {
  if (active) {
    await updateSpotlight(true)
  }
})

// ── observe DOM changes ─────────────────────────────────────────────
function startObserving() {
  window.addEventListener('scroll', onWindowScrollOrResize, { passive: true })
  window.addEventListener('resize', onWindowScrollOrResize, { passive: true })

  resizeObserver = new ResizeObserver(() => calculateRect())
  resizeObserver.observe(document.body)

  mutationObserver = new MutationObserver(() => calculateRect())
  mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true })
}

function stopObserving() {
  window.removeEventListener('scroll', onWindowScrollOrResize)
  window.removeEventListener('resize', onWindowScrollOrResize)
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
  if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null }
  if (animFrameId) cancelAnimationFrame(animFrameId)
}

watch(isActive, (val) => {
  if (val) {
    startObserving()
  } else {
    stopObserving()
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  stopObserving()
})
</script>

<template>
  <!-- ── Floating "?" FAB button (always fixed bottom right) ──────── -->
  <button
    v-if="!isActive"
    class="tour-fab"
    aria-label="Panduan Interaktif Halaman"
    title="Klik untuk melihat panduan fitur halaman ini"
    @click="start"
  >
    <HelpCircle class="w-6 h-6" />
    <span class="tour-fab-ping" />
  </button>

  <!-- ── Active Tour Overlay ─────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="isActive" class="tour-overlay" @click.self="stop">

      <!-- Spotlight Cutout -->
      <div
        v-if="spotRect.visible"
        class="tour-spotlight"
        :style="{
          top: spotRect.top + 'px',
          left: spotRect.left + 'px',
          width: spotRect.width + 'px',
          height: spotRect.height + 'px',
        }"
      />

      <!-- Tooltip Card -->
      <div
        v-if="currentStep && spotRect.visible"
        class="tour-tooltip"
        :class="'arrow-' + tooltipArrow"
        :style="tooltipStyle"
      >
        <!-- Step Indicator & Progress Dots -->
        <div class="tour-header">
          <div class="tour-step-badge">
            Langkah {{ currentStepIdx + 1 }} dari {{ totalSteps }}
          </div>

          <!-- Progress dots -->
          <div class="tour-dots">
            <button
              v-for="(_, idx) in totalSteps"
              :key="idx"
              class="tour-dot"
              :class="{ active: currentStepIdx === idx }"
              :title="`Pergi ke langkah ${idx + 1}`"
              @click="goTo(idx)"
            />
          </div>
        </div>

        <!-- Content -->
        <h3 class="tour-step-title">{{ currentStep.title }}</h3>
        <p class="tour-step-desc">{{ currentStep.description }}</p>

        <!-- Actions -->
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

      <!-- Skip Tour Button -->
      <button class="tour-skip-all" @click="stop">
        Lewati Panduan ✕
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Floating FAB button ────────────────────────────────────────── */
.tour-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9996;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: var(--lj-blue, #4E63DA);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(78, 99, 218, 0.4);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.tour-fab:hover {
  transform: scale(1.12);
  box-shadow: 0 12px 32px rgba(78, 99, 218, 0.55);
}

.tour-fab:active {
  transform: scale(0.95);
}

/* Subtle pulse ring on FAB */
.tour-fab-ping {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--lj-blue, #4E63DA);
  opacity: 0.6;
  animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* ── Overlay ───────────────────────────────────────────────────── */
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: auto;
}

/* ── Spotlight Cutout ──────────────────────────────────────────── */
.tour-spotlight {
  position: fixed;
  z-index: 10001;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.65);
  pointer-events: none;
  transition: top 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              left 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              width 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              height 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Outer glowing accent ring */
.tour-spotlight::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  border: 3px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 24px rgba(78, 99, 218, 0.45);
  pointer-events: none;
}

/* ── Tooltip Card ──────────────────────────────────────────────── */
.tour-tooltip {
  position: fixed;
  z-index: 10002;
  width: 340px;
  max-width: calc(100vw - 32px);
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 22px 18px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8);
  transition: left 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              top 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  font-family: 'Satoshi', 'Inter', system-ui, sans-serif;
  animation: tooltipFadeIn 0.25s ease-out;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

/* Arrow indicator */
.tour-tooltip::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: #ffffff;
  transform: rotate(45deg);
}

.tour-tooltip.arrow-bottom::before {
  top: -7px;
  left: calc(50% - 7px);
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
}

.tour-tooltip.arrow-top::before {
  bottom: -7px;
  left: calc(50% - 7px);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
}

.tour-tooltip.arrow-right::before {
  left: -7px;
  top: calc(50% - 7px);
}

.tour-tooltip.arrow-left::before {
  right: -7px;
  top: calc(50% - 7px);
}

/* ── Header & Dots ─────────────────────────────────────────────── */
.tour-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tour-step-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--lj-blue, #4E63DA);
  background: var(--lj-blue-pale, #EEF1FD);
  padding: 3px 10px;
  border-radius: 999px;
}

.tour-dots {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tour-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #cbd5e1;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tour-dot.active {
  width: 18px;
  border-radius: 999px;
  background: var(--lj-blue, #4E63DA);
}

/* ── Title & Description ────────────────────────────────────────── */
.tour-step-title {
  margin: 0 0 6px;
  font-size: 16.5px;
  font-weight: 700;
  color: var(--lj-navy, #1E2B5B);
  line-height: 1.3;
}

.tour-step-desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
}

/* ── Actions ────────────────────────────────────────────────────── */
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
  font-family: inherit;
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
  filter: brightness(1.08);
  box-shadow: 0 4px 16px rgba(90, 246, 31, 0.4);
}

/* ── Skip Button ────────────────────────────────────────────────── */
.tour-skip-all {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 10003;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.tour-skip-all:hover {
  background: rgba(15, 23, 42, 0.9);
  transform: translateY(-1px);
}

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .tour-tooltip {
    width: calc(100vw - 32px);
    left: 16px !important;
  }

  .tour-fab {
    bottom: 20px;
    right: 20px;
    width: 46px;
    height: 46px;
  }

  .tour-skip-all {
    bottom: 20px;
    right: 20px;
  }
}
</style>
