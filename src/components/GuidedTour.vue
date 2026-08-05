<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
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

// ── Spotlight rect in screen coordinates ──────────────────────────
const spotRect = ref({ top: 0, left: 0, width: 0, height: 0, visible: false })
const tooltipStyle = ref({ left: '50%', top: '50%' })
const tooltipArrow = ref('bottom')
const tooltipCardRef = ref(null)

// SVG viewport dimensions
const svgW = ref(window.innerWidth)
const svgH = ref(window.innerHeight)

let animFrameId = null
let resizeObserver = null
let mutationObserver = null

// ── Compute SVG clip path string for the cutout mask ──────────────
function svgClipPath() {
  const r = spotRect.value
  if (!r.visible) return `M0,0 H${svgW.value} V${svgH.value} H0 Z`
  const rx = 16 // border-radius
  const { top: t, left: l, width: w, height: h } = r
  // Outer rect (full screen) + inner rect (cutout) with rounded corners
  // Uses evenodd fill rule to create a "hole"
  return [
    `M0,0 H${svgW.value} V${svgH.value} H0 Z`,
    `M${l + rx},${t}`,
    `H${l + w - rx} Q${l + w},${t} ${l + w},${t + rx}`,
    `V${t + h - rx} Q${l + w},${t + h} ${l + w - rx},${t + h}`,
    `H${l + rx} Q${l},${t + h} ${l},${t + h - rx}`,
    `V${t + rx} Q${l},${t} ${l + rx},${t}`,
    `Z`,
  ].join(' ')
}

// ── Recalculate target element rect ───────────────────────────────
function calculateRect() {
  const step = currentStep.value
  svgW.value = window.innerWidth
  svgH.value = window.innerHeight

  if (!step) {
    spotRect.value.visible = false
    return
  }

  try {
    const el = document.querySelector(step.selector)
    if (!el) {
      const w = Math.min(window.innerWidth * 0.8, 480)
      const h = 180
      spotRect.value = {
        top: (window.innerHeight - h) / 2,
        left: (window.innerWidth - w) / 2,
        width: w,
        height: h,
        visible: true,
      }
      updateTooltipPosition(step.position || 'bottom')
      return
    }

    const rect = el.getBoundingClientRect()
    const pad = 8
    spotRect.value = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
      visible: true,
    }
    updateTooltipPosition(step.position || 'bottom')
  } catch {
    spotRect.value.visible = false
  }
}

// ── Scroll element into view, then track for 40 frames ────────────
async function updateSpotlight(scroll = true) {
  const step = currentStep.value
  if (!step) return
  await nextTick()

  const el = document.querySelector(step.selector)
  if (el && scroll) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  let frames = 0
  const track = () => {
    calculateRect()
    if (++frames < 40) animFrameId = requestAnimationFrame(track)
  }
  if (animFrameId) cancelAnimationFrame(animFrameId)
  animFrameId = requestAnimationFrame(track)
}

// ── Tooltip position — always fully inside viewport ───────────────
function updateTooltipPosition(preferred = 'bottom') {
  const r = spotRect.value
  if (!r.visible) return

  const cardEl = tooltipCardRef.value
  const TW = cardEl ? cardEl.offsetWidth : 350
  const TH = cardEl ? cardEl.offsetHeight : 210
  const GAP = 14
  const M = 16
  const W = window.innerWidth
  const H = window.innerHeight

  // Decide best side
  let side = preferred
  if (side === 'bottom' && r.top + r.height + TH + GAP > H - M) side = 'top'
  if (side === 'top'    && r.top - TH - GAP < M)               side = 'bottom'
  if (side === 'right'  && r.left + r.width + TW + GAP > W - M) side = 'left'
  if (side === 'left'   && r.left - TW - GAP < M)               side = 'right'
  // Ultimate fallback: just stay bottom with clamping
  tooltipArrow.value = side

  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  let tl, tt

  switch (side) {
    case 'top':    tl = cx - TW / 2; tt = r.top - TH - GAP; break
    case 'right':  tl = r.left + r.width + GAP; tt = cy - TH / 2; break
    case 'left':   tl = r.left - TW - GAP; tt = cy - TH / 2; break
    default:       tl = cx - TW / 2; tt = r.top + r.height + GAP; break
  }

  // Hard clamp — card must never go outside viewport
  tl = Math.max(M, Math.min(W - TW - M, tl))
  tt = Math.max(M, Math.min(H - TH - M, tt))

  tooltipStyle.value = { left: `${tl}px`, top: `${tt}px` }
}

// ── Observers ─────────────────────────────────────────────────────
function onScrollOrResize() { if (isActive.value) calculateRect() }

function startObserving() {
  window.addEventListener('scroll', onScrollOrResize, { passive: true })
  window.addEventListener('resize', onScrollOrResize, { passive: true })
  resizeObserver = new ResizeObserver(onScrollOrResize)
  resizeObserver.observe(document.body)
  mutationObserver = new MutationObserver(onScrollOrResize)
  mutationObserver.observe(document.body, { childList: true, subtree: true })
}

function stopObserving() {
  window.removeEventListener('scroll', onScrollOrResize)
  window.removeEventListener('resize', onScrollOrResize)
  resizeObserver?.disconnect(); resizeObserver = null
  mutationObserver?.disconnect(); mutationObserver = null
  if (animFrameId) cancelAnimationFrame(animFrameId)
}

// ── Keyboard shortcuts ────────────────────────────────────────────
function onKey(e) {
  if (!isActive.value) return
  if (e.key === 'Escape')      stop()
  if (e.key === 'ArrowRight')  next()
  if (e.key === 'ArrowLeft')   prev()
}

// ── Chat bubble ────────────────────────────────────────────────────
const showBubble = ref(false)
const bubbleDismissed = ref(false)
let bubbleTimer = null
let bubbleShowTimer = null

function startBubbleCycle() {
  if (bubbleDismissed.value || isActive.value) return
  // Show bubble after 5 seconds
  bubbleShowTimer = setTimeout(() => {
    if (!bubbleDismissed.value && !isActive.value) {
      showBubble.value = true
      // Auto-hide after 8 seconds
      bubbleTimer = setTimeout(() => {
        showBubble.value = false
        // Cycle again after 45 seconds
        setTimeout(startBubbleCycle, 45_000)
      }, 8_000)
    }
  }, 5_000)
}

function dismissBubble() {
  showBubble.value = false
  bubbleDismissed.value = true
  // Re-enable after 3 minutes
  setTimeout(() => {
    bubbleDismissed.value = false
    startBubbleCycle()
  }, 3 * 60_000)
  if (bubbleTimer) clearTimeout(bubbleTimer)
  if (bubbleShowTimer) clearTimeout(bubbleShowTimer)
}

// Stop bubble when tour starts
watch(isActive, (val) => {
  if (val) {
    showBubble.value = false
    if (bubbleTimer) clearTimeout(bubbleTimer)
    if (bubbleShowTimer) clearTimeout(bubbleShowTimer)
  }
})

// ── Watchers ──────────────────────────────────────────────────────
watch([currentStepIdx, isActive], async ([, active]) => {
  if (active) await updateSpotlight(true)
})

watch(isActive, val => val ? startObserving() : stopObserving())

onMounted(() => {
  window.addEventListener('keydown', onKey)
  startBubbleCycle()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  stopObserving()
  if (bubbleTimer) clearTimeout(bubbleTimer)
  if (bubbleShowTimer) clearTimeout(bubbleShowTimer)
})
</script>

<template>
  <!-- ── Floating ? FAB (always visible) ──────────────────────────── -->
  <button
    v-if="!isActive"
    class="tour-fab"
    aria-label="Panduan Interaktif Halaman"
    title="Panduan fitur halaman ini"
    @click="start"
  >
    <HelpCircle class="w-6 h-6" />
    <span class="tour-fab-ping" />

    <!-- Chat bubble ajakan -->
    <Transition name="bubble-pop">
      <div v-if="showBubble" class="tour-bubble" @click.stop>
        <button class="tour-bubble-close" @click.stop="dismissBubble" aria-label="Tutup">&times;</button>
        <p>Butuh bantuan?</p>
        <span class="tour-bubble-sub">Klik di sini untuk panduan halaman</span>
      </div>
    </Transition>
  </button>

  <!-- ── Active Tour ───────────────────────────────────────────────── -->
  <Teleport to="body">
    <template v-if="isActive">

      <!-- SVG Backdrop with cut-out hole (no box-shadow bleed) -->
      <svg
        class="tour-svg-backdrop"
        :viewBox="`0 0 ${svgW} ${svgH}`"
        :width="svgW"
        :height="svgH"
        @click.self="stop"
      >
        <!-- Dark mask with cutout using evenodd fill rule -->
        <path
          :d="svgClipPath()"
          fill="rgba(15,23,42,0.68)"
          fill-rule="evenodd"
        />
        <!-- Glowing border around spotlight -->
        <rect
          v-if="spotRect.visible"
          :x="spotRect.left - 3"
          :y="spotRect.top - 3"
          :width="spotRect.width + 6"
          :height="spotRect.height + 6"
          rx="19"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          stroke-width="2.5"
          style="filter: drop-shadow(0 0 10px rgba(78,99,218,0.6))"
        />
      </svg>

      <!-- Tooltip Card — lives ABOVE svg backdrop -->
      <div
        v-if="currentStep && spotRect.visible"
        ref="tooltipCardRef"
        class="tour-tooltip"
        :class="'arrow-' + tooltipArrow"
        :style="tooltipStyle"
      >
        <!-- Close X -->
        <button class="tour-close-x" @click.stop="stop" title="Tutup panduan">
          <X class="w-3.5 h-3.5" />
        </button>

        <!-- Header -->
        <div class="tour-header">
          <span class="tour-badge">LANGKAH {{ currentStepIdx + 1 }} / {{ totalSteps }}</span>
          <div class="tour-dots">
            <button
              v-for="(_, i) in totalSteps"
              :key="i"
              class="tour-dot"
              :class="{ active: currentStepIdx === i }"
              @click="goTo(i)"
            />
          </div>
        </div>

        <!-- Content -->
        <h3 class="tour-title">{{ currentStep.title }}</h3>
        <p class="tour-desc">{{ currentStep.description }}</p>

        <!-- Actions -->
        <div class="tour-actions">
          <button v-if="!isFirstStep" class="tour-btn tour-prev" @click.stop="prev">
            <ChevronLeft class="w-3.5 h-3.5" /> Sebelumnya
          </button>
          <div style="flex:1" />
          <button v-if="!isLastStep" class="tour-btn tour-next" @click.stop="next">
            Lanjutkan <ChevronRight class="w-3.5 h-3.5" />
          </button>
          <button v-else class="tour-btn tour-done" @click.stop="stop">
            Selesai <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Skip button -->
      <button class="tour-skip" @click="stop">Lewati panduan</button>

    </template>
  </Teleport>
</template>

<style scoped>
/* ── FAB ──────────────────────────────────────────────────────────── */
.tour-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9996;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.9);
  background: var(--lj-blue, #4E63DA);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(78,99,218,0.45);
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.tour-fab:hover  { transform: scale(1.12); box-shadow: 0 12px 32px rgba(78,99,218,0.55); }
.tour-fab:active { transform: scale(0.93); }

.tour-fab-ping {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--lj-blue, #4E63DA);
  opacity: 0.6;
  animation: ping 2.5s cubic-bezier(0,0,0.2,1) infinite;
  pointer-events: none;
}
@keyframes ping {
  75%, 100% { transform: scale(1.4); opacity: 0; }
}

/* ── Chat bubble ─────────────────────────────────────────────────── */
.tour-bubble {
  position: absolute;
  bottom: 64px;
  right: -4px;
  width: 210px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px 12px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0,0,0,0.06);
  text-align: left;
  animation: bubbleBounce 2s ease-in-out infinite;
  cursor: default;
  z-index: 9995;
}
/* Little tail pointing down-right to the FAB */
.tour-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 18px;
  width: 16px;
  height: 16px;
  background: #fff;
  transform: rotate(45deg);
  box-shadow: 2px 2px 6px rgba(15, 23, 42, 0.08);
  z-index: -1;
}

.tour-bubble p {
  margin: 0 0 3px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--lj-navy, #1E2B5B);
  line-height: 1.3;
}

.tour-bubble-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: #6B7280;
  line-height: 1.4;
}

.tour-bubble-close {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.tour-bubble-close:hover {
  background: #e2e8f0;
  color: #475569;
}

/* Bouncing animation */
@keyframes bubbleBounce {
  0%, 100% { transform: translateY(0); }
  15%       { transform: translateY(-10px); }
  30%       { transform: translateY(0); }
  45%       { transform: translateY(-6px); }
  60%       { transform: translateY(0); }
}

/* Transition for show/hide */
.bubble-pop-enter-active { animation: bubbleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-pop-leave-active { animation: bubbleOut 0.2s ease-in; }
@keyframes bubbleIn {
  from { opacity: 0; transform: scale(0.5) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes bubbleOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.8); }
}

/* ── SVG Backdrop ─────────────────────────────────────────────────── */
.tour-svg-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: auto;
  cursor: default;
}

/* ── Tooltip Card ─────────────────────────────────────────────────── */
.tour-tooltip {
  position: fixed;
  z-index: 10002;          /* above SVG */
  width: 350px;
  max-width: calc(100vw - 32px);
  background: #fff;
  border-radius: 20px;
  padding: 20px 22px 18px;
  box-shadow: 0 20px 50px rgba(15,23,42,0.28), 0 0 0 1px rgba(255,255,255,0.8);
  font-family: 'Satoshi','Inter',system-ui,sans-serif;
  box-sizing: border-box;
  transition: left 0.18s cubic-bezier(0.22,0.61,0.36,1),
              top  0.18s cubic-bezier(0.22,0.61,0.36,1);
  animation: tfIn 0.2s ease-out;
}
@keyframes tfIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

/* Arrow nub */
.tour-tooltip::before {
  content: '';
  position: absolute;
  width: 14px; height: 14px;
  background: #fff;
  transform: rotate(45deg);
}
.tour-tooltip.arrow-bottom::before { top: -7px;    left: calc(50% - 7px); box-shadow: -2px -2px 4px rgba(0,0,0,0.06); }
.tour-tooltip.arrow-top::before    { bottom: -7px; left: calc(50% - 7px); box-shadow:  2px  2px 4px rgba(0,0,0,0.06); }
.tour-tooltip.arrow-right::before  { left: -7px;   top:  calc(50% - 7px); }
.tour-tooltip.arrow-left::before   { right: -7px;  top:  calc(50% - 7px); }

/* Close X */
.tour-close-x {
  position: absolute;
  top: 13px; right: 13px;
  width: 26px; height: 26px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.tour-close-x:hover { background: #e2e8f0; color: #0f172a; }

/* Header */
.tour-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-right: 26px;
}
.tour-badge {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--lj-blue, #4E63DA);
  background: var(--lj-blue-pale, #EEF1FD);
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.tour-dots { display: flex; align-items: center; gap: 4px; }
.tour-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  border: none; padding: 0;
  cursor: pointer;
  transition: all 0.2s;
}
.tour-dot.active {
  width: 16px;
  border-radius: 999px;
  background: var(--lj-blue, #4E63DA);
}

/* Content */
.tour-title {
  margin: 0 0 6px;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--lj-navy, #1E2B5B);
  line-height: 1.3;
}
.tour-desc {
  margin: 0 0 16px;
  font-size: 12.5px;
  line-height: 1.65;
  color: #475569;
}

/* Actions */
.tour-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tour-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  border-radius: 999px;
  padding: 7px 16px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.tour-prev { background: #f1f5f9; color: #475569; }
.tour-prev:hover { background: #e2e8f0; color: #1e293b; }
.tour-next { background: var(--lj-blue, #4E63DA); color: #fff; }
.tour-next:hover { background: var(--lj-navy, #1E2B5B); box-shadow: 0 4px 14px rgba(78,99,218,0.35); }
.tour-done { background: var(--lj-green-dk, #5AF61F); color: var(--lj-navy, #1E2B5B); }
.tour-done:hover { filter: brightness(1.08); }

/* Skip */
.tour-skip {
  position: fixed;
  bottom: 28px; right: 28px;
  z-index: 10003;
  background: rgba(15,23,42,0.75);
  backdrop-filter: blur(8px);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
}
.tour-skip:hover { background: rgba(15,23,42,0.92); transform: translateY(-1px); }

/* Mobile */
@media (max-width: 480px) {
  .tour-tooltip { width: calc(100vw - 32px); left: 16px !important; }
  .tour-fab, .tour-skip { bottom: 18px; right: 18px; }
  .tour-fab { width: 46px; height: 46px; }
}
</style>
