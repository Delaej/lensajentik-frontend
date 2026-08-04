<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// ── router ──────────────────────────────────────────────────────
const router = useRouter()

// ── reactive state ───────────────────────────────────────────────
const stage = ref('blank')          // blank | loading | wipe | mosquito-enter | mosquito-idle | entering | entered
const progress = ref(0)
const progressPct = ref('0%')
const canEnter = ref(false)

// ── template refs ────────────────────────────────────────────────
const mosquitoWrap = ref(null)

// ── helpers ──────────────────────────────────────────────────────
function setStage(s) { stage.value = s }

function startProgress() {
  let pct = 0
  const timer = setInterval(() => {
    pct += Math.random() * 14 + 6
    if (pct >= 100) {
      pct = 100
      clearInterval(timer)
      setTimeout(startWipe, 260)
    }
    progress.value = pct
    progressPct.value = Math.round(pct) + '%'
  }, 160)
}

function startWipe() {
  setStage('wipe')
  setTimeout(startMosquito, 900)        // matches --dur-wipe
}

function startMosquito() {
  setStage('mosquito-enter')
  // listen for animationend on the mosquito-wrap element
  const el = mosquitoWrap.value
  if (el) {
    el.addEventListener('animationend', onFlightEnd, { once: true })
  } else {
    // fallback: wait the flight duration
    setTimeout(onFlightEnd, 1700)
  }
}

function onFlightEnd() {
  setStage('mosquito-idle')
  canEnter.value = true
}

async function enterSite() {
  if (!canEnter.value) return
  canEnter.value = false
  setStage('entering')
  // Wait for iris-close animation to finish
  setTimeout(() => {
    // Hide the splash overlay so content behind becomes visible
    setStage('entered')
    // Ensure the browser has applied display:none before navigating
    requestAnimationFrame(() => {
      router.replace({ name: 'home' }).catch(err => {
        // Navigation failed — revert splash so user can try again
        console.error('Splash navigation failed:', err)
        setStage('mosquito-idle')
        canEnter.value = true
      })
    })
  }, 650)  // matches --dur-close
}

// ── lifecycle ────────────────────────────────────────────────────
onMounted(() => {
  // small delay so the page never "pops" straight into the loader
  setTimeout(() => {
    setStage('loading')
    setTimeout(startProgress, 550)      // matches --dur-blank
  }, 200)
})
</script>

<template>
  <!-- The preloader sits on top; hidden via is-entered class before route change -->
  <div
    id="splash-preloader"
    :data-stage="stage"
    :class="{ 'is-entered': stage === 'entered' }"
    aria-live="polite"
  >
    <!-- ── background blobs ────────────────────────────────── -->
    <div class="bg-blob top-right"></div>
    <div class="bg-blob bottom-left"></div>

    <!-- ── Stage 1: logo + progress bar ──────────────────── -->
    <div class="loader-stage">
      <div class="mark">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 12C34 20 26 34 30 52C33 65 45 72 50 72C50 50 50 30 50 12Z" fill="var(--green)"/>
          <circle cx="66" cy="24" r="7" fill="var(--navy)"/>
          <path d="M62 40C74 46 80 58 74 72C71 79 62 84 58 82C58 68 58 54 62 40Z" fill="var(--indigo)"/>
        </svg>
      </div>

      <div class="loader-copy">
        <p class="brand">Lensa<span>Jentik</span></p>
        <p class="tagline">Menyiapkan data lingkunganmu...</p>
      </div>

      <div class="progress-row">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-pct">{{ progressPct }}</span>
      </div>
    </div>

    <!-- ── Iris wipe transition (stage 1 → 2) ────────────── -->
    <div class="iris-wipe"></div>

    <!-- ── Stage 2: mosquito scene ───────────────────────── -->
    <div class="scene">
      <div class="ambient-glow"></div>
      <div class="spotlight-overlay"></div>

      <button
        class="mosquito-btn"
        id="mosquitoBtn"
        aria-label="Klik nyamuk untuk masuk ke LensaJentik"
        @click="enterSite"
        @keydown.enter.prevent="enterSite"
        @keydown.space.prevent="enterSite"
      >
        <div class="hit-ring"></div>
        <div class="mosquito-wrap" ref="mosquitoWrap" id="mosquitoWrap">
          <div class="flutter">
            <!-- Primary mosquito visual — inline SVG, always visible -->
            <svg
              class="mosquito-svg"
              viewBox="0 0 120 120"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="46" cy="30" rx="26" ry="14" fill="rgba(79,95,214,.28)" transform="rotate(-24 46 30)"/>
              <ellipse cx="76" cy="34" rx="26" ry="14" fill="rgba(126,217,87,.28)" transform="rotate(18 76 34)"/>
              <path d="M60 34C64 46 66 60 64 76C63 88 58 96 54 100" stroke="var(--navy)" stroke-width="5" stroke-linecap="round" fill="none"/>
              <path d="M56 96 L44 108 M56 96 L50 112 M64 96 L76 108 M64 96 L70 112 M58 60 L40 58 M62 60 L80 58" stroke="var(--navy)" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M56 34 C44 32 34 30 24 26" stroke="var(--navy)" stroke-width="4" stroke-linecap="round"/>
              <circle cx="59" cy="33" r="6" fill="var(--navy)"/>
            </svg>
          </div>
        </div>
      </button>

      <div class="cta-text">
        <p>Ketuk <span>nyamuk</span> untuk masuk</p>
      </div>
    </div>

    <!-- ── Iris close on click ───────────────────────────── -->
    <div class="iris-close"></div>
  </div>
</template>

<style scoped>
/* ============================================================
   LENSAJENTIK — SPLASH / OPENING PAGE (Vue 3 SFC)
   Alur: kosong → loading (logo + %) → iris wipe → nyamuk
         terbang → melayang → spotlight → ketuk → iris tutup
         → router.replace('/beranda') → masuk ke situs.
   ============================================================ */

:root {
  --mint-1: #eaf6ec;
  --mint-2: #dcefe1;
  --green: #7ed957;
  --green-dark: #4caf3d;
  --indigo: #4f5fd6;
  --navy: #1b2347;
  --ink: #16213e;
  --paper: #ffffff;

  --dur-load: 2200ms;
  --dur-wipe: 900ms;
  --dur-fly: 1700ms;
  --dur-spot: 900ms;
  --dur-close: 650ms;
  --dur-blank: 550ms;
}

/* Use local CSS vars so scoped styles can reference them */
#splash-preloader {
  --green: #7ed957;
  --green-dark: #4caf3d;
  --indigo: #4f5fd6;
  --navy: #1b2347;
  --ink: #16213e;
  --paper: #ffffff;
  --dur-wipe: 900ms;
  --dur-fly: 1700ms;
  --dur-spot: 900ms;
  --dur-close: 650ms;
  --dur-blank: 550ms;

  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--paper);
  overflow: hidden;
  font-family: 'Inter', 'Satoshi', sans-serif;
}

/* Hide once iris closes — ensures content beneath is visible before route change */
#splash-preloader.is-entered {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* ── background blobs ──────────────────────────────────────────── */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  pointer-events: none;
  z-index: 0;
}
.bg-blob.top-right {
  width: 520px;
  height: 520px;
  top: -160px;
  right: -140px;
  background: radial-gradient(circle, #7ed957 0%, rgba(126, 217, 87, 0) 72%);
}
.bg-blob.bottom-left {
  width: 560px;
  height: 560px;
  bottom: -180px;
  left: -160px;
  background: radial-gradient(circle, #4f5fd6 0%, rgba(79, 95, 214, 0) 72%);
}

/* ── Stage 1: loader ────────────────────────────────────────────── */
.loader-stage {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  opacity: 0;
  transform: translateY(16px) scale(0.96);
  transition: opacity var(--dur-blank) ease, transform 650ms cubic-bezier(0.22, 0.9, 0.3, 1);
  pointer-events: none;
}
[data-stage='loading'] .loader-stage {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
[data-stage='wipe'] .loader-stage,
[data-stage='mosquito-enter'] .loader-stage,
[data-stage='mosquito-idle'] .loader-stage,
[data-stage='entering'] .loader-stage {
  opacity: 0;
  pointer-events: none;
}

.mark {
  position: relative;
  width: 96px;
  height: 96px;
}
.mark svg {
  width: 100%;
  height: 100%;
  animation: breathe 1.8s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.06); }
}

.loader-copy { text-align: center; }
.loader-copy .brand {
  font-family: 'Poppins', 'Satoshi', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: var(--navy);
  margin: 0 0 4px;
  letter-spacing: 0.2px;
}
.loader-copy .brand span { color: var(--green-dark); }
.loader-copy .tagline { font-size: 13px; color: #5b6580; margin: 0; }

.progress-track {
  width: 220px;
  height: 6px;
  border-radius: 999px;
  background: rgba(27, 35, 71, 0.08);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--green) 0%, var(--indigo) 100%);
  transition: width 120ms linear;
}
.progress-pct {
  font-family: 'Poppins', 'Satoshi', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: var(--indigo);
  min-width: 38px;
  text-align: center;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Iris / lens wipe transition ────────────────────────────────── */
.iris-wipe {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: var(--paper);
  clip-path: circle(0% at 50% 50%);
  pointer-events: none;
}
[data-stage='wipe'] .iris-wipe {
  animation: irisOpen var(--dur-wipe) cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
[data-stage='mosquito-enter'] .iris-wipe,
[data-stage='mosquito-idle'] .iris-wipe,
[data-stage='entering'] .iris-wipe {
  clip-path: circle(150% at 50% 50%);
}
@keyframes irisOpen {
  from { clip-path: circle(0% at 50% 50%); }
  to   { clip-path: circle(150% at 50% 50%); }
}

/* ── Stage 2: mosquito scene ────────────────────────────────────── */
.scene {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  opacity: 0;
}
[data-stage='mosquito-enter'] .scene,
[data-stage='mosquito-idle'] .scene,
[data-stage='entering'] .scene {
  opacity: 1;
}

/* ambient glow */
.ambient-glow {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(126, 217, 87, 0.28) 0%,
    rgba(79, 95, 214, 0.10) 45%,
    transparent 72%
  );
  filter: blur(4px);
  opacity: 0;
  transition: opacity 700ms ease;
}
[data-stage='mosquito-idle'] .ambient-glow,
[data-stage='entering'] .ambient-glow {
  opacity: 1;
}

/* spotlight vignette */
.spotlight-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle 170px at 50% 48%,
    transparent 0%,
    transparent 55%,
    rgba(16, 21, 46, 0.38) 100%
  );
  opacity: 0;
  transition: opacity var(--dur-spot) ease;
  pointer-events: none;
}
[data-stage='mosquito-idle'] .spotlight-overlay,
[data-stage='entering'] .spotlight-overlay {
  opacity: 1;
}

/* mosquito button */
.mosquito-btn {
  position: relative;
  background: none;
  border: none;
  padding: 36px;
  margin: 0;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
[data-stage='mosquito-idle'] .mosquito-btn {
  cursor: pointer;
}

/* mosquito wrap + flight animation */
.mosquito-wrap {
  width: 120px;
  height: 120px;
  transform: translate(64vw, -46vh) rotate(-28deg) scale(0.55);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
[data-stage='mosquito-enter'] .mosquito-wrap {
  animation: flyIn var(--dur-fly) cubic-bezier(0.22, 0.9, 0.3, 1) forwards;
}
[data-stage='mosquito-idle'] .mosquito-wrap,
[data-stage='entering'] .mosquito-wrap {
  transform: translate(0, 0) rotate(0deg) scale(1);
  opacity: 1;
  animation: hover 2.6s ease-in-out infinite;
}
@keyframes flyIn {
  0%   { transform: translate(64vw, -46vh) rotate(-28deg) scale(0.55); opacity: 0; }
  12%  { opacity: 1; }
  42%  { transform: translate(24vw, -14vh) rotate(14deg) scale(0.85); }
  68%  { transform: translate(-6vw, 6vh) rotate(-10deg) scale(1.06); }
  86%  { transform: translate(2.5vw, -2vw) rotate(5deg) scale(0.97); }
  100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
}
@keyframes hover {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50%       { transform: translate(0, -8px) rotate(-2deg) scale(1); }
}

/* wing flutter */
.flutter {
  width: 100%;
  height: 100%;
  animation: flutterFast 0.12s linear infinite;
  position: relative;
}
[data-stage='mosquito-idle'] .flutter,
[data-stage='entering'] .flutter {
  animation: flutterSlow 0.9s ease-in-out infinite;
}
@keyframes flutterFast {
  0%, 100% { transform: rotate(-4deg); }
  50%      { transform: rotate(4deg); }
}
@keyframes flutterSlow {
  0%, 100% { transform: rotate(-1.5deg); }
  50%      { transform: rotate(1.5deg); }
}

/* Primary mosquito visual — inline SVG, always visible */
.mosquito-svg {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
/* click ripple ring */
.hit-ring {
  position: absolute;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 1.5px solid rgba(79, 95, 214, 0.35);
  opacity: 0;
  pointer-events: none;
}
[data-stage='mosquito-idle'] .hit-ring {
  opacity: 1;
  animation: ping 1.8s ease-out infinite;
}
@keyframes ping {
  0%   { transform: scale(0.8); opacity: 0.55; }
  80%  { transform: scale(1.35); opacity: 0; }
  100% { opacity: 0; }
}

/* CTA text */
.cta-text {
  text-align: center;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 500ms ease 150ms, transform 500ms ease 150ms;
  pointer-events: none;
}
[data-stage='mosquito-idle'] .cta-text,
[data-stage='entering'] .cta-text {
  opacity: 1;
  transform: translateY(0);
}
.cta-text p {
  margin: 0;
  padding: 9px 20px;
  border-radius: 999px;
  font-family: 'Poppins', 'Satoshi', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
  background: rgba(27, 35, 71, 0.82);
  backdrop-filter: blur(4px);
  box-shadow: 0 6px 18px rgba(27, 35, 71, 0.18);
  animation: pulseText 1.8s ease-in-out infinite;
}
.cta-text span { color: var(--green); }
@keyframes pulseText {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 1; }
}

/* ── Stage 3: iris close on click ───────────────────────────────── */
.iris-close {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: var(--navy);
  clip-path: circle(150% at 50% 48%);
  opacity: 0;
  pointer-events: none;
}
[data-stage='entering'] .iris-close {
  animation: irisClose var(--dur-close) cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
@keyframes irisClose {
  0%   { clip-path: circle(150% at 50% 48%); opacity: 1; }
  100% { clip-path: circle(0% at 50% 48%); opacity: 1; }
}
</style>
