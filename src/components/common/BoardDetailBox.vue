<script setup>
defineProps({
  title: String,
  createdAt: String,
  views: Number,
  adminName: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="board-detail-box">
  <div class="p-4 border rounded bg-white shadow-sm">
    <h4 class="fw-bold mb-2">
      <slot name="title" />
    </h4>

    <div class="text-muted small mb-3">
      <slot name="info" />
    </div>

    <div class="mb-4">
      <slot />
    </div>

    <div class="text-end">
      <slot name="action" />
    </div>
  </div>
  </div>
</template>

<style scoped>

</style>