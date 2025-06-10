<template>
  <div class="admin-auth-container">
    <div class="admin-auth-box">
      <div class="admin-logo">DAGON</div>
      <div class="admin-title">관리자 로그인</div>
      <AdminLoginForm />
      <div class="admin-link">
        계정이 없으신가요? <router-link to="/admin/register">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AdminLoginForm from './components/AdminLoginForm.vue';

export default {
  name: 'AdminLogin',
  components: {
    AdminLoginForm
  }
};
</script>

<style scoped>
.admin-auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6fbff;
}
.admin-auth-box {
  background: #fff;
  padding: 3.5rem 4.5rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(26, 115, 232, 0.10);
  width: 100%;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.admin-logo {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1976ed;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}
.admin-title {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 2.5rem;
  text-align: center;
}
.admin-link {
  text-align: center;
  margin-top: 2rem;
  color: #888;
  font-size: 1.1rem;
}
.admin-link a {
  color: #1976ed;
  text-decoration: none;
  font-weight: 600;
}
.admin-link a:hover {
  text-decoration: underline;
}
@media (max-width: 700px) {
  .admin-auth-box {
    padding: 1.5rem 0.5rem;
    max-width: 98vw;
  }
  .admin-logo {
    font-size: 1.5rem;
  }
  .admin-title {
    font-size: 1.2rem;
  }
}
</style> 