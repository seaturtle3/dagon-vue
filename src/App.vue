<template>
  <HeaderNav />
  <div class="main-container">
    <router-view />
  </div>
  <Footer />
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
  margin-top: 10%; /* 상단 마진 추가 */
}
</style>
