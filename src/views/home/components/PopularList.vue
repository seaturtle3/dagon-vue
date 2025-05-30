<template>
  <div class="mt-4">
    <h2 class="fw-bold fs-5 mb-3">최근 인기 조항</h2>
    <div class="row g-2">
      <div v-for="n in 6" :key="n" class="col-2 d-flex justify-content-center">
        <button class="btn btn-outline-secondary w-100 vertical-rectangle">
          인기 조항{{ n }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vertical-rectangle {
  height: 300px; /* 버튼 높이를 150px로 설정해 세로로 길게 */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>