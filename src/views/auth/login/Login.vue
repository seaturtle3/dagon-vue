<template>
  <div class="login-page">
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from './components/LoginForm.vue';

export default {
  name: 'LoginView',
  components: {
    LoginForm
  }
};
</script>

<script setup>
// Font Awesome CDN 추가
const fontAwesomeScript = document.createElement('link');
fontAwesomeScript.rel = 'stylesheet';
fontAwesomeScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
document.head.appendChild(fontAwesomeScript);
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f1f3f5;
}
</style>