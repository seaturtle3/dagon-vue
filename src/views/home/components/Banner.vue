<template>
  <div class="banner-wrapper">
    <div class="banner-container" :style="{ backgroundColor: banners[currentIndex].color }">

      <!-- 상단 텍스트 인디케이터 -->
      <div class="top-indicator">
        {{ currentIndex + 1 }} / {{ banners.length }}
      </div>

      <!-- 텍스트와 버튼 -->
      <div class="text-center text-black">
        <h1 class="mb-3">{{ banners[currentIndex].title }}</h1>
        <p class="mb-4">{{ banners[currentIndex].subtitle }}</p>
        <button class="btn btn-light">더 알아보기</button>
      </div>

      <!-- 좌우 버튼 -->
      <div class="nav-buttons">
        <button class="nav-button" @click="prevSlide">&#9664;</button>
        <button class="nav-button" @click="nextSlide">&#9654;</button>
      </div>

      <!-- 하단 막대형 인디케이터 -->
      <div class="bottom-bar-indicator">
        <div
            v-for="(banner, index) in banners"
            :key="index"
            class="bar"
            :class="{ active: currentIndex === index }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Banner',
  data() {
    return {
      currentIndex: 0,
      banners: [
        { title: '환영합니다!', subtitle: 'DAGON 체험판을 경험해보세요~', color: '#66b2ff' },
        { title: '즐거운 낚시 되세요!', subtitle: '지금 예약하고 떠나보세요~', color: '#ffa07a' },
        { title: '커뮤니티에 참여해보세요!', subtitle: '후기를 남기고 포인트도 받아요!', color: '#90ee90' }
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
  position: relative;
  margin-bottom: 3%;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}
.banner-container {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: background-color 0.5s ease;
  position: relative;
  text-align: center;
}

/* 상단 텍스트 인디케이터 */
.top-indicator {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  background: rgba(255, 255, 255, 0.85);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* 좌우 버튼 묶음 */
.nav-buttons {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 1500px;
}
.nav-button {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0; /* 정원형 */
  transition: background-color 0.3s;
}
.nav-button:hover {
  background-color: white;
}

/* 하단 막대형 인디케이터 */
.bottom-bar-indicator {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}
.bar {
  width: 30px;
  height: 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  transition: background 0.3s;
}
.bar.active {
  background: white;
}
</style>