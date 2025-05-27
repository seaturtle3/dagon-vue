<template>
  <div class="mt-4">
    <h2 class="fw-bold fs-5 mb-4">추천 선사</h2>
    <div class="d-grid" style="grid-template-columns: repeat(4, 1fr); gap: 1rem;">
      <div
          v-for="n in 8"
          :key="n"
          class="border p-4 text-center d-flex flex-column justify-content-center align-items-center"
          style="min-height: 180px;"
      >
        <div class="fw-semibold">추천 조항{{ n }}</div>
        <div class="text-secondary small mt-2">추천 조항 이미지.jpg</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecommendationList'
};
</script>
