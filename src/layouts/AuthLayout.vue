<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 font-sans antialiased relative">
    <RouterView v-slot="{ Component, route }">
      <Transition name="child-fade">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </div>
</template>
