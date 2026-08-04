<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()

// Only animate when the top-level layout changes, not on every child-route nav
const layoutKey = computed(() => {
  const matched = route.matched
  return matched.length > 0 ? matched[0].path : route.path
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="layoutKey" />
    </Transition>
  </RouterView>
</template>

<style scoped></style>
