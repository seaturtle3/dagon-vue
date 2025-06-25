<template>
  <div class="banner-bg">
    <div class="banner-content">
      <h1 class="banner-title">환영합니다!</h1>
      <p class="banner-subtitle">DAGON 체험판을 경험해보세요~</p>
      <button class="btn btn-light">더 알아보기</button>
    </div>
    <button class="nav-button left" @click="prevSlide">&#9664;</button>
    <button class="nav-button right" @click="nextSlide">&#9654;</button>
  </div>
</template>

<script>
export default {
  name: 'Banner',
  data() {
    return {
      currentIndex: 0,
      banners: [
        { title: '환영합니다!', subtitle: 'DAGON 체험판을 경험해보세요~' },
        { title: '즐거운 낚시 되세요!', subtitle: '지금 예약하고 떠나보세요~' },
        { title: '커뮤니티에 참여해보세요!', subtitle: '후기를 남기고 포인트도 받아요!' }
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
.banner-bg {
  width: 100%;
  height: 480px;
  background-image: url('https://cdn.pixabay.com/photo/2017/01/31/13/14/fishing-2022635_1280.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.banner-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: #222;
  text-shadow: 0 2px 8px rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.6);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  box-sizing: border-box;
  max-width: 600px;
  margin: 0 auto;
}
.banner-title {
  font-size: 2.8rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}
.banner-subtitle {
  font-size: 1.3rem;
  margin-bottom: 2rem;
}
.btn.btn-light {
  background: white;
  color: #007BFF;
  border: none;
  border-radius: 24px;
  padding: 0.8rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn.btn-light:hover {
  background: #007BFF;
  color: white;
}
.nav-button.left {
  position: absolute;
  top: 50%;
  left: 32px;
  transform: translateY(-50%);
  z-index: 2;
}
.nav-button.right {
  position: absolute;
  top: 50%;
  right: 32px;
  transform: translateY(-50%);
  z-index: 2;
}
.nav-button {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.nav-button:hover {
  background-color: white;
}
</style>