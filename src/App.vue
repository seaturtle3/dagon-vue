<template>
  <div class="d-flex flex-column min-vh-100">
    <HeaderNav />
    <div class="router flex-grow-1" style="padding-top: 10%;">
      <router-view />
    </div>
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

<style scoped>
.router {
  width: 80%;
  margin: 0 auto;
}
</style>
