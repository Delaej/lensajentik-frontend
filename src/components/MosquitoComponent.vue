<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ── constants ──────────────────────────────────────────────────────
const SPAWN_MIN_MS = 3000             // TODO: kembalikan ke 8 * 60 * 1000 (8 min)
const SPAWN_MAX_MS = 5000             // TODO: kembalikan ke 12 * 60 * 1000 (12 min)
const FLEE_DISTANCE = 150            // px — cursor proximity trigger
const DART_INTERVAL_MIN = 1800       // ms
const DART_INTERVAL_MAX = 4500       // ms
const LERP_SPEED = 0.04              // smooth interpolation factor
const MOSQUITO_SIZE = 64             // px — approximate size for boundary

// ── reactive state ──────────────────────────────────────────────────
const visible = ref(false)
const popping = ref(false)
const imgLoaded = ref(false)          // true when nyamuk.png loads at runtime
const imgSrc = ref('')               // set at runtime to avoid build-time resolution

// position & movement
const x = ref(300)
const y = ref(300)
const targetX = ref(300)
const targetY = ref(300)
const wingPhase = ref('slow')        // 'fast' | 'slow'
const facingRight = ref(true)
const scaleVal = ref(1)
const opacityVal = ref(0)

// internal refs
let animFrameId = null
let dartTimer = null
let spawnTimer = null
let mouseX = -999
let mouseY = -999
let lastDartTime = 0
let dartCooldown = 0
let splatParticles = []              // particle state for pop
let particlesAnimId = null

// ── computed ────────────────────────────────────────────────────────
const mosquitoStyle = computed(() => ({
  transform: `translate(${x.value}px, ${y.value}px) scale(${scaleVal.value}) scaleX(${facingRight.value ? 1 : -1})`,
  opacity: opacityVal.value,
  // No CSS transition — movement is handled by JS lerp via rAF.
  // Only apply transition during entrance pop-in.
}))

const mosquitoClass = computed(() => {
  const classes = []
  if (popping.value) classes.push('is-popping')
  if (wingPhase.value === 'fast') classes.push('is-darting')
  return classes
})

const flutterClass = computed(() => {
  if (popping.value) return 'flutter-pop'
  return wingPhase.value === 'fast' ? 'flutter-fast' : 'flutter-slow'
})

// ── helpers ─────────────────────────────────────────────────────────
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
function rand(min, max) { return Math.random() * (max - min) + min }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1) }
function lerp(a, b, t) { return a + (b - a) * t }

function randomSpawnDelay() {
  return rand(SPAWN_MIN_MS, SPAWN_MAX_MS)
}

function randomViewportPos() {
  const pad = 80
  return {
    x: rand(pad, window.innerWidth - MOSQUITO_SIZE - pad),
    y: rand(pad + 60, window.innerHeight - MOSQUITO_SIZE - pad),
  }
}

// ── spawn ───────────────────────────────────────────────────────────
function spawnMosquito() {
  if (visible.value) return

  const pos = randomViewportPos()
  x.value = pos.x
  y.value = pos.y
  targetX.value = pos.x
  targetY.value = pos.y
  scaleVal.value = 0.3
  opacityVal.value = 0
  popping.value = false
  wingPhase.value = 'fast'
  lastDartTime = performance.now()
  dartCooldown = 800

  visible.value = true

  // entrance: pop-in with CSS transition applied via class
  // After a frame so the browser registers the initial (small) state,
  // then set to full size for smooth transition.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scaleVal.value = 1
      opacityVal.value = 1
    })
  })

  // after entrance, settle into slow flutter
  setTimeout(() => {
    if (!popping.value) wingPhase.value = 'slow'
  }, 1200)

  scheduleDart()
  startAnimationLoop()
}

function killMosquito() {
  visible.value = false
  stopAnimationLoop()
  clearDartTimer()
  stopParticleAnimation()
  scheduleSpawn()
}

// ── timers ──────────────────────────────────────────────────────────
function scheduleSpawn() {
  clearSpawnTimer()
  const delay = randomSpawnDelay()
  spawnTimer = setTimeout(spawnMosquito, delay)
}

function clearSpawnTimer() {
  if (spawnTimer) {
    clearTimeout(spawnTimer)
    spawnTimer = null
  }
}

function scheduleDart() {
  clearDartTimer()
  if (!visible.value || popping.value) return
  const interval = rand(DART_INTERVAL_MIN, DART_INTERVAL_MAX)
  dartTimer = setTimeout(() => {
    pickDartTarget()
    scheduleDart()
  }, interval)
}

function clearDartTimer() {
  if (dartTimer) {
    clearTimeout(dartTimer)
    dartTimer = null
  }
}

function pickDartTarget() {
  const pad = 60
  const maxDart = 200
  let tx = x.value + rand(-maxDart, maxDart)
  let ty = y.value + rand(-maxDart, maxDart)
  tx = clamp(tx, pad, window.innerWidth - MOSQUITO_SIZE - pad)
  ty = clamp(ty, pad + 60, window.innerHeight - MOSQUITO_SIZE - pad)
  targetX.value = tx
  targetY.value = ty
  lastDartTime = performance.now()
  dartCooldown = 400
  wingPhase.value = 'fast'
  facingRight.value = tx > x.value
  setTimeout(() => {
    if (visible.value && !popping.value) wingPhase.value = 'slow'
  }, 500)
}

function fleeFromCursor() {
  const dx = x.value - mouseX
  const dy = y.value - mouseY
  const d = Math.hypot(dx, dy) || 1
  const fleeDist = 180 + rand(0, 120)
  const pad = 60
  let tx = x.value + (dx / d) * fleeDist
  let ty = y.value + (dy / d) * fleeDist
  tx = clamp(tx, pad, window.innerWidth - MOSQUITO_SIZE - pad)
  ty = clamp(ty, pad + 60, window.innerHeight - MOSQUITO_SIZE - pad)
  targetX.value = tx
  targetY.value = ty
  lastDartTime = performance.now()
  dartCooldown = 700
  facingRight.value = tx > x.value
  wingPhase.value = 'fast'
  setTimeout(() => {
    if (visible.value && !popping.value) wingPhase.value = 'slow'
  }, 700)
}

// ── animation loop ──────────────────────────────────────────────────
function startAnimationLoop() {
  stopAnimationLoop()
  function tick(now) {
    if (!visible.value && !popping.value) {
      animFrameId = null
      return
    }

    // Smooth lerp toward target
    const speed = popping.value ? LERP_SPEED * 0.3 : LERP_SPEED
    x.value = lerp(x.value, targetX.value, speed)
    y.value = lerp(y.value, targetY.value, speed)

    // Add micro-jitter when hovering (slow flutter phase)
    if (wingPhase.value === 'slow' && now - lastDartTime > 600) {
      x.value += Math.sin(now * 0.007 + x.value * 0.01) * 0.6
      y.value += Math.cos(now * 0.009 + y.value * 0.01) * 0.5
    }

    // Cursor avoidance
    if (!popping.value) {
      const cx = x.value + MOSQUITO_SIZE / 2
      const cy = y.value + MOSQUITO_SIZE / 2
      const cursorDist = dist(cx, cy, mouseX, mouseY)
      if (cursorDist < FLEE_DISTANCE && now - lastDartTime > dartCooldown) {
        fleeFromCursor()
      }
    }

    // Determine facing direction (only when moving significantly)
    if (Math.abs(targetX.value - x.value) > 1.5) {
      facingRight.value = targetX.value > x.value
    }

    // Soft boundary clamp
    const pad = 8
    if (x.value < pad) targetX.value = pad + 30
    if (x.value > window.innerWidth - MOSQUITO_SIZE - pad) targetX.value = window.innerWidth - MOSQUITO_SIZE - pad - 30
    if (y.value < pad + 60) targetY.value = pad + 80
    if (y.value > window.innerHeight - MOSQUITO_SIZE - pad) targetY.value = window.innerHeight - MOSQUITO_SIZE - pad - 30

    animFrameId = requestAnimationFrame(tick)
  }
  animFrameId = requestAnimationFrame(tick)
}

function stopAnimationLoop() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
}

// ── mouse tracking ──────────────────────────────────────────────────
function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function onTouchMove(e) {
  if (e.touches.length > 0) {
    mouseX = e.touches[0].clientX
    mouseY = e.touches[0].clientY
  }
}

// ── click handler ───────────────────────────────────────────────────
function onMosquitoClick(e) {
  e.stopPropagation()
  e.preventDefault()
  if (!visible.value || popping.value) return

  popping.value = true
  wingPhase.value = 'fast'
  createSplatParticles()

  // Pop: quick scale-up → shrink to nothing
  scaleVal.value = 1.4
  opacityVal.value = 0.9

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scaleVal.value = 0
      opacityVal.value = 0
    })
  })

  // Cleanup after animation
  setTimeout(() => {
    popping.value = false
    scaleVal.value = 1
    opacityVal.value = 0
    splatParticles = []
    killMosquito()
  }, 500)
}

// ── splat particles (pure JS animation, no CSS transitions) ────────
function createSplatParticles() {
  stopParticleAnimation()
  const count = 12
  const cx = x.value + MOSQUITO_SIZE / 2
  const cy = y.value + MOSQUITO_SIZE / 2
  const particles = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3)
    const speed = rand(35, 90)
    particles.push({
      id: i,
      sx: cx,
      sy: cy,
      x: cx,
      y: cy,
      tx: cx + Math.cos(angle) * speed,
      ty: cy + Math.sin(angle) * speed,
      size: rand(3, 6),
      color: i % 3 === 0 ? '#EF4444' : i % 3 === 1 ? '#1B2347' : '#4F5FD6',
      opacity: 1,
    })
  }
  splatParticles = particles

  const start = performance.now()
  const duration = 380
  function animParticles(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // ease-out quad
    const t = 1 - (1 - progress) * (1 - progress)
    for (const p of splatParticles) {
      p.x = lerp(p.sx, p.tx, t)
      p.y = lerp(p.sy, p.ty, t)
      p.opacity = 1 - progress
    }
    if (progress < 1) {
      particlesAnimId = requestAnimationFrame(animParticles)
    }
  }
  particlesAnimId = requestAnimationFrame(animParticles)
}

function stopParticleAnimation() {
  if (particlesAnimId) {
    cancelAnimationFrame(particlesAnimId)
    particlesAnimId = null
  }
}

// ── image loading (runtime — won't fail build if nyamuk.png missing) ─
function tryLoadPng() {
  imgSrc.value = '/nyamuk.png'
  const img = new Image()
  img.onload = () => { imgLoaded.value = true }
  img.onerror = () => { imgLoaded.value = false }
  img.src = imgSrc.value
}

// ── lifecycle ───────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  tryLoadPng()
  scheduleSpawn()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('touchmove', onTouchMove)
  stopAnimationLoop()
  stopParticleAnimation()
  clearDartTimer()
  clearSpawnTimer()
})
</script>

<template>
  <!-- ── splat particles ────────────────────────────────────────── -->
  <div
    v-for="p in splatParticles"
    :key="'splat-' + p.id"
    class="splat-particle"
    :style="{
      left: p.x + 'px',
      top: p.y + 'px',
      width: p.size + 'px',
      height: p.size + 'px',
      background: p.color,
      opacity: p.opacity,
    }"
  />

  <!-- ── mosquito ───────────────────────────────────────────────── -->
  <div
    v-show="visible || popping"
    class="mosquito-container"
    :class="mosquitoClass"
    :style="mosquitoStyle"
    @mousedown="onMosquitoClick"
    @touchstart.prevent="onMosquitoClick"
  >
    <!-- wings flutter layer -->
    <div :class="['flutter-layer', flutterClass]">
      <!-- use nyamuk.png if available at runtime, otherwise SVG fallback -->
      <img
        v-if="imgLoaded"
        :src="imgSrc"
        alt="Nyamuk"
        class="mosquito-img"
      />
      <svg
        v-else
        class="mosquito-svg"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="46" cy="30" rx="26" ry="14" fill="rgba(79,95,214,.28)" transform="rotate(-24 46 30)"/>
        <ellipse cx="76" cy="34" rx="26" ry="14" fill="rgba(126,217,87,.28)" transform="rotate(18 76 34)"/>
        <path d="M60 34C64 46 66 60 64 76C63 88 58 96 54 100" stroke="#1B2347" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M56 96 L44 108 M56 96 L50 112 M64 96 L76 108 M64 96 L70 112 M58 60 L40 58 M62 60 L80 58" stroke="#1B2347" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M56 34 C44 32 34 30 24 26" stroke="#1B2347" stroke-width="4" stroke-linecap="round"/>
        <circle cx="59" cy="33" r="6" fill="#1B2347"/>
      </svg>
    </div>

    <!-- subtle shadow below -->
    <div class="mosquito-shadow" />
  </div>
</template>

<style scoped>
/* ── container ──────────────────────────────────────────────────── */
.mosquito-container {
  position: fixed;
  z-index: 9998;
  width: 64px;
  height: 64px;
  cursor: pointer;
  pointer-events: auto;
  /* Entrance transition (scale + opacity) — movement via JS */
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.35s ease-out;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* When darting or popping, speed up / change easing */
.mosquito-container.is-darting {
  transition: transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1),
              opacity 0.2s ease-out;
}

.mosquito-container.is-popping {
  transition: transform 0.4s cubic-bezier(0.55, 0, 1, 0.45),
              opacity 0.35s ease-in;
  pointer-events: none;
}

/* ── flutter layer ──────────────────────────────────────────────── */
.flutter-layer {
  width: 100%;
  height: 100%;
  position: relative;
}

.flutter-fast {
  animation: wingFlutterFast 0.08s linear infinite;
}

.flutter-slow {
  animation: wingFlutterSlow 0.7s ease-in-out infinite;
}

.flutter-pop {
  animation: wingFlutterFast 0.05s linear infinite;
}

@keyframes wingFlutterFast {
  0%, 100% { transform: rotate(-5deg) scaleY(0.9); }
  50%      { transform: rotate(5deg) scaleY(1.05); }
}

@keyframes wingFlutterSlow {
  0%, 100% { transform: rotate(-1.2deg); }
  50%      { transform: rotate(1.2deg); }
}

/* ── mosquito image / svg ──────────────────────────────────────── */
.mosquito-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.mosquito-svg {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18));
}

/* ── subtle drop shadow on ground ───────────────────────────────── */
.mosquito-shadow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.10);
  filter: blur(3px);
  pointer-events: none;
}

/* ── splat particles ────────────────────────────────────────────── */
.splat-particle {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  /* No transitions — fully driven by JS */
}

/* ── hover state ────────────────────────────────────────────────── */
@media (hover: hover) {
  .mosquito-container:hover:not(.is-popping) {
    filter: brightness(1.1) drop-shadow(0 2px 8px rgba(79,95,214,0.35));
  }
}
</style>
