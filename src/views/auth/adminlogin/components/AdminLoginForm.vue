<template>
  <form @submit.prevent="handleLogin" class="admin-form">
    <div class="form-group">
      <label for="aid">아이디</label>
      <div class="input-wrapper">
        <input
          type="text"
          id="aid"
          v-model="loginForm.aid"
          required
          placeholder="관리자 아이디를 입력하세요"
        />
        <span class="input-icon"><i class="fas fa-user"></i></span>
      </div>
    </div>
    <div class="form-group">
      <label for="apw">비밀번호</label>
      <div class="input-wrapper">
        <input
          type="password"
          id="apw"
          v-model="loginForm.apw"
          required
          placeholder="비밀번호를 입력하세요"
        />
        <span class="input-icon"><i class="fas fa-lock"></i></span>
      </div>
    </div>
    <button type="submit" class="admin-btn">로그인</button>
    <div ref="loginSuccessMsg" style="display:none;text-align:center;color:#1976ed;font-weight:700;font-size:1.2rem;margin-top:18px;">로그인 성공</div>
  </form>
</template>

<script>
import api from '@/lib/axios';
import { useAdminAuthStore } from '@/store/auth/auth.js';

export default {
  name: 'AdminLoginForm',
  data() {
    return {
      loginForm: {
        aid: 'admin',
        apw: '1111'
      }
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await api.post('/api/admin/login', this.loginForm);
        if (response.data) {
          // Pinia store를 사용하여 토큰 저장
          const authStore = useAdminAuthStore();
          const token = response.data.token;
          authStore.setToken(token);

          // JWT에서 관리자 정보 파싱 및 저장
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // UTF-8 디코딩 처리
            const decodeUTF8 = (str) => {
              if (!str) return str;
              try {
                return decodeURIComponent(escape(str));
              } catch (e) {
                return str;
              }
            };
            
            const userInfo = {
              uid: payload.sub,
              aid: payload.aid,
              name: decodeUTF8(payload.aname),
              role: payload.role,
              type: 'admin'
            };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            authStore.setUser(userInfo); // 또는 authStore.user = userInfo;
            console.log('저장할 사용자 정보:', userInfo);
          } catch (e) {
            console.error('JWT 파싱 실패:', e);
          }

          // axios 헤더에 토큰 설정
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          console.log('로그인 성공, 토큰 저장됨:', token);
          // 2초간 성공 메시지 후 이동
          this.$root.$emit && this.$root.$emit('show-toast', '로그인 성공'); // 전역 토스트가 있으면 사용
          this.$refs.loginSuccessMsg && (this.$refs.loginSuccessMsg.style.display = 'block');
          setTimeout(() => {
            this.$router.push('/admin/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('로그인 실패:', error);
        if (error.response && error.response.status === 401) {
          alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        } else {
          alert('로그인 중 오류가 발생했습니다.');
        }
      }
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
.admin-form {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.7rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label {
  color: #1976ed;
  font-weight: 600;
  font-size: 1.08rem;
}
.input-wrapper {
  position: relative;
}
input {
  width: 100%;
  padding: 1.1rem 2.7rem 1.1rem 1.1rem;
  border: 1.5px solid #e3eaf5;
  border-radius: 8px;
  font-size: 1.13rem;
  background: #f7fafd;
  transition: border 0.2s;
}
input:focus {
  border: 1.5px solid #1976ed;
  background: #fff;
  outline: none;
}
.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #b0b8c1;
  font-size: 1.2rem;
}
.admin-btn {
  width: 100%;
  padding: 1.15rem;
  background: #1976ed;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.18rem;
  font-weight: 700;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(25, 118, 237, 0.08);
}
.admin-btn:hover {
  background: #1256b8;
}
@media (max-width: 600px) {
  .admin-form {
    padding: 0 0.5rem;
    max-width: 98vw;
  }
  input {
    padding: 0.9rem 2.2rem 0.9rem 0.9rem;
    font-size: 1rem;
  }
  .admin-btn {
    padding: 1rem;
    font-size: 1.1rem;
  }
}
</style>
