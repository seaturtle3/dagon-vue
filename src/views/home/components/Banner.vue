<script>
export default {
  name: 'HomeBanner'
};
</script>

<template>
  <div class="banner-container text-black d-flex align-items-center justify-content-center">
    <div class="text-center">
      <h1 class="mb-3">환영합니다!</h1>
      <p class="mb-4">아무나 꾸며주세요~</p>
      <button class="btn btn-light">더 알아보기</button>
    </div>
  </div>
</template>

<style scoped>
.banner-container {
  height: 400px;
  background-color: #66b2ff;
  border-radius: 0 0 12px 12px;
  margin-bottom: 3%;
}
</style>