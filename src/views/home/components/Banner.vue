<template>
  <div class="banner-wrapper rounded-none mb-xl overflow-hidden">
    <div class="banner-container transition-colors relative text-center" :style="{ backgroundColor: banners[currentIndex].color, height: '400px' }">
      <img v-if="banners[currentIndex].img" :src="banners[currentIndex].img" class="banner-bg-img" alt="배너 이미지" />
      <!-- 텍스트(제목, 부제목, 버튼) -->
      <div class="banner-text">
        <h1 class="mb-md text-3xl font-extrabold w-full break-words">{{ banners[currentIndex].title }}</h1>
        <p class="mb-lg text-lg w-full break-words">{{ banners[currentIndex].subtitle }}</p>
        <button class="btn btn-secondary px-lg py-sm rounded-lg mt-md">더 알아보기</button>
      </div>
      <!-- 좌우 네비게이션 버튼 -->
      <div class="nav-buttons nav-center">
        <button class="nav-button btn btn-ghost rounded-full w-12 h-12 flex items-center justify-center text-xl" @click="prevSlide">&#9664;</button>
        <button class="nav-button btn btn-ghost rounded-full w-12 h-12 flex items-center justify-center text-xl" @click="nextSlide">&#9654;</button>
      </div>
      <!-- 하단 막대형 인디케이터 -->
      <div class="bottom-bar-indicator indicator-center">
        <div
            v-for="(banner, index) in banners"
            :key="index"
            class="bar transition-colors"
            :class="{ 'bg-white': currentIndex === index, 'bg-white/50': currentIndex !== index }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
export default {
  name: 'Banner',
  data() {
    return {
      currentIndex: 0,
      banners: [
        { title: '환영합니다!', subtitle: 'DAGON 체험판을 경험해보세요~', img: `${baseUrl}/2025/07/02/banner1_1.jpg` },
        { title: '즐거운 낚시 되세요!', subtitle: '지금 예약하고 떠나보세요~', color: '#ffa07a', img: null },
        { title: '커뮤니티에 참여해보세요!', subtitle: '후기를 남기고 포인트도 받아요!', color: '#90ee90', img: null }
      ]
    };
  },
  methods: {
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    },
    prevSlide() {
      this.currentIndex =
          (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    }
  }
};
</script>

<style scoped>
.banner-wrapper {
  border-radius: 0 !important;
  box-shadow: none !important;
}
.banner-container {
  height: 400px !important;
  border-radius: 0 !important;
  position: relative;
}
.banner-bg-img {
  position: absolute;
  left: 0; top: 0; width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.7;
}
.nav-center {
  position: absolute;
  width: 100%;
  max-width: 1200px;
  justify-content: space-between;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 48px;
  z-index: 2;
}
.banner-text{
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-35%);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 1;
}
.indicator-center {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}
.fishing-footer,
.fishing-footer .container-fluid,
.fishing-footer .row,
.fishing-footer .col-md-4,
.fishing-footer .col {
  border-radius: 0 !important;
}
.bar {
  width: 30px;
  height: 6px;
  border-radius: 3px;
  transition: background 0.3s;
}
</style>