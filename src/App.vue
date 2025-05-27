<template>
  <div class="d-flex flex-column min-vh-100">
    <HeaderNav />
    <div class="flex-grow-1" style="padding-top: 10%;">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script>
import HeaderNav from './components/HeaderNav.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'Home',
  components: {
    HeaderNav,
    Footer,
  }
};
</script>

<style scoped>

</style>
