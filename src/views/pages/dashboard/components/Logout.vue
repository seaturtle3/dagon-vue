<template>
  <div class="logout">
    <h1>로그아웃</h1>
    <p>정말 로그아웃 하시겠습니까?</p>
    <div class="logout-actions">
      <button @click="logout" class="logout-btn">로그아웃</button>
      <button @click="cancel" class="cancel-btn">취소</button>
    </div>
  </div>
</template>

<script>
import { clearAuthData } from '@/utils/authUtils'
export default {
  name: 'Logout',
  methods: {
    async logout() {
      try {
        // 로그아웃 API 호출 (TODO)
        clearAuthData();
        this.$router.push('/admin/login')
      } catch (error) {
        console.error('로그아웃 중 오류가 발생했습니다:', error)
      }
    },
    cancel() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.logout {
  padding: 2rem;
  text-align: center;
}

.logout h1 {
  margin-bottom: 1rem;
}

.logout p {
  margin-bottom: 2rem;
  color: #666;
}

.logout-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.logout-btn,
.cancel-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}
</style> 