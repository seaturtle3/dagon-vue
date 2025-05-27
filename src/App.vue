<template>
  <div class="d-flex flex-column min-vh-100">
    <HeaderNav />
    <div class="main-container flex-grow-1">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script>
import HeaderNav from './components/HeaderNav.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'FishingReservationPage',
  components: {
    HeaderNav,
    Footer,
  }
};
</script>

<style scoped>
.main-container {
  padding-top: 10%;
}
footer {
  margin-top: 10%;
}
</style>
