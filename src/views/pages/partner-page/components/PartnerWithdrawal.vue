<template>
  <div class="withdrawal-page">
    <h2>파트너 탈퇴</h2>
    
    <div class="withdrawal-content">
      <div class="warning-box">
        <h3>탈퇴 전 꼭 확인해주세요!</h3>
        <ul>
          <li>탈퇴 시 모든 파트너 정보가 삭제됩니다.</li>
          <li>등록된 상품 정보가 모두 삭제됩니다.</li>
          <li>예약 내역이 모두 삭제됩니다.</li>
          <li>탈퇴 후에는 복구가 불가능합니다.</li>
        </ul>
      </div>

      <div class="confirmation-box">
        <div class="checkbox-group">
          <input type="checkbox" id="confirm1" v-model="confirmations.confirm1">
          <label for="confirm1">위 내용을 모두 확인했습니다.</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="confirm2" v-model="confirmations.confirm2">
          <label for="confirm2">탈퇴 후 복구가 불가능함을 인지합니다.</label>
        </div>
      </div>

      <div class="button-group">
        <button 
          class="withdrawal-button" 
          @click="handleWithdrawal" 
          :disabled="!isAllConfirmed"
        >
          탈퇴하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {BASE_URL} from "@/constants/baseUrl.js";

export default {
  name: 'PartnerWithdrawal',
  data() {
    return {
      confirmations: {
        confirm1: false,
        confirm2: false
      }
    };
  },
  computed: {
    isAllConfirmed() {
      return this.confirmations.confirm1 && this.confirmations.confirm2;
    }
  },
  methods: {
    getUnoFromToken(token) {
      if (!token) return null;
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.uno;
      } catch (e) {
        return null;
      }
    },
    async handleWithdrawal() {
      if (!this.isAllConfirmed) {
        alert('모든 확인사항에 동의해주세요.');
        return;
      }

      if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const uno = this.getUnoFromToken(token);
        if (!uno) {
          alert('유저 정보를 확인할 수 없습니다.');
          return;
        }
        const response = await fetch(`${BASE_URL}/api/partner/my_page/${uno}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('탈퇴가 완료되었습니다.');
          localStorage.removeItem('token');
          this.$router.push('/');
        } else {
          alert('탈퇴 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('탈퇴 처리 실패:', error);
        alert('탈퇴 처리 중 오류가 발생했습니다.');
      }
    }
  }
};
</script>

<style scoped>
.withdrawal-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: var(--primary-color);
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.withdrawal-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.warning-box {
  background-color: #fff5f5;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.warning-box h3 {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.warning-box ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  color: #d32f2f;
}

.warning-box li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.confirmation-box {
  margin-bottom: 2rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.checkbox-group label {
  color: var(--text-color);
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  justify-content: center;
}

.withdrawal-button {
  background-color: #dc3545;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.withdrawal-button:hover:not(:disabled) {
  background-color: #c82333;
}

.withdrawal-button:disabled {
  background-color: #dc354580;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .withdrawal-page {
    padding: 1rem;
  }

  .withdrawal-content {
    padding: 1.5rem;
  }
}
</style> 