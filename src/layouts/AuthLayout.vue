<script setup>
import { RouterView } from 'vue-router'
import GuidedTour from '@/components/GuidedTour.vue'
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 font-sans antialiased relative">
    <RouterView v-slot="{ Component, route }">
      <Transition name="child-fade">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>

    <!-- ─── Guided Tour (Tombol "?") ──────────────────────────────── -->
    <GuidedTour />
  </div>
</template>
