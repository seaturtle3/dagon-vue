<template>
  <HeaderNav/>
  <router-view/>
  <Footer/>
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