<template>
  <div class="layout-wrapper">
    <HeaderNav />

    <div class="spacer" /> <!-- 헤더 고정용 여백 -->

    <main class="main-content">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script>
import HeaderNav from './components/common/HeaderNav.vue';
import Footer from './components/common/Footer.vue';

export default {
  name: 'Home',
  components: {
    HeaderNav,
    Footer,
  }
};
</script>

<style>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.spacer {
  height: 70px;
}

.main-content {
  flex: 1;
  margin-bottom: 10vh;
}
</style>