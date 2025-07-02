<template>
  <div class="layout-wrapper">
    <HeaderNav v-if="!isSwaggerPage" :key="navKey" />
    <div class="spacer" v-if="!isSwaggerPage" /> <!-- 헤더 고정용 여백 -->
    <main class="main-content">
      <router-view @loginSuccess="refreshNav" @logout="refreshNav" />
    </main>
    <SideButtons v-if="!isSwaggerPage" />
    <TopButton v-if="!isSwaggerPage" />
    <Footer v-if="!isSwaggerPage" />
  </div>
</template>

<script>
import HeaderNav from './components/common/HeaderNav.vue';
import Footer from './components/common/Footer.vue';
import SideButtons from './components/common/SideButtons.vue';
import TopButton from './components/common/TopButton.vue';
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
    SideButtons,
    TopButton,
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
  overflow: hidden;
}

.spacer {
  height: 70px;
}
</style>