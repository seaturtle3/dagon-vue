<script>
export default {
  name: 'HomeBanner'
};
</script>

<template>
  <div id="carouselExampleIndicators" class="carousel slide banner-container text-black" data-bs-ride="carousel">
    <!-- 인디케이터 (하단 점) -->
    <div class="carousel-indicators">
      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"
              aria-current="true" aria-label="Slide 1"></button>
      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"
              aria-label="Slide 2"></button>
      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"
              aria-label="Slide 3"></button>
    </div>

    <!-- 슬라이드 이미지/내용 -->
    <div class="carousel-inner">
      <div class="carousel-item active vh-100 d-flex align-items-start justify-content-center position-relative"
           style="background-image: url('/images/banner1.jpg'); background-size: cover; background-position: center;">
        <div class="z-2 text-white text-center pt-5">
          <div class="d-flex align-items-start justify-content-center vh-100 bg-primary text-white">
            <div class="text-center">
              <h1 class="mb-3">첫 번째 배너</h1>
              <p class="mb-4">설명 문구를 여기에 추가하세요</p>
              <button class="btn btn-light">더 알아보기</button>
            </div>
          </div>
        </div>

        <div class="carousel-item">
          <div class="d-flex align-items-start justify-content-center vh-100 bg-success text-white">
            <div class="text-center">
              <h1 class="mb-3">두 번째 배너</h1>
              <p class="mb-4">설명 문구를 여기에 추가하세요</p>
              <button class="btn btn-light">자세히 보기</button>
            </div>
          </div>
        </div>
        <div class="carousel-item">
          <div class="d-flex align-items-start justify-content-center vh-100 bg-warning text-dark">
            <div class="text-center">
              <h1 class="mb-3">세 번째 배너</h1>
              <p class="mb-4">추가 배너를 원하는 대로 설정하세요</p>
              <button class="btn btn-dark">자세히 보기</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 좌우 컨트롤 버튼 -->
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators"
              data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">이전</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators"
              data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">다음</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.carousel-item {
  height: 50vh;
}

.banner-container {
  overflow: hidden;
}
</style>