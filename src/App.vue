<template>
  <HeaderNav />
  <div class="container-fluid py-4 pt-5">
    <router-view />
  </div>
</template>

<script>
import HeaderNav from './components/HeaderNav.vue';
import Home from './views/Home.vue';

export default {
  name: 'FishingReservationPage',
  components: {
    HeaderNav,
    Home,
  }
};
</script>

<style scoped>
.main-container {
  padding-top: 10%;
}
</style>
