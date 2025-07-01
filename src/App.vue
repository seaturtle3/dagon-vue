<template>
  <div class="layout-wrapper">
    <HeaderNav v-if="!isSwaggerPage" :key="navKey" />
    <div class="spacer" v-if="!isSwaggerPage" /> <!-- 헤더 고정용 여백 -->
    <main class="main-content">
      <router-view @loginSuccess="refreshNav" @logout="refreshNav" />
    </main>
    <Footer v-if="!isSwaggerPage" />
  </div>
</template>

<script>
import HeaderNav from './components/common/HeaderNav.vue';
import Footer from './components/common/Footer.vue';
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
const navKey = ref(0)
function refreshNav() {
  navKey.value += 1
}

export default {
  name: 'Home',
  components: {
    HeaderNav,
    Footer,
  },
  setup() {
    const route = useRoute()
    const isSwaggerPage = computed(() => route.path.startsWith('/admin/swagger'))
    return { navKey, refreshNav, isSwaggerPage }
  }
};
</script>

<script setup>
// Font Awesome CDN 추가
const loadFontAwesome = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
  document.head.appendChild(link);
};

loadFontAwesome();
</script>

<style>
.layout-wrapper {
  position: relative;
  margin-bottom: 3%;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.spacer {
  height: 70px;
}

.main-content {
  flex: 1;
  margin-bottom: 10vh;
}

#app {
  font-family: 'Noto Sans KR', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

</style>