<template>
  <div class="withdrawal-container">
    <h2 class="page-title">회원 탈퇴</h2>
    
    <div class="withdrawal-content">
      <div class="warning-section">
        <span class="material-icons warning-icon">warning</span>
        <h3>회원 탈퇴 전 꼭 확인해주세요!</h3>
        <ul class="warning-list">
          <li>
            <span class="material-icons">check_circle</span>
            탈퇴 시 모든 개인정보가 삭제되며, 복구가 불가능합니다.
          </li>
          <li>
            <span class="material-icons">check_circle</span>
            진행 중인 예약이 있다면 탈퇴가 제한될 수 있습니다.
          </li>
          <li>
            <span class="material-icons">check_circle</span>
            보유하신 포인트는 모두 소멸되며, 환불되지 않습니다.
          </li>
          <li>
            <span class="material-icons">check_circle</span>
            작성하신 게시물과 댓글은 삭제되지 않습니다.
          </li>
        </ul>
      </div>

      <div class="withdrawal-form">
        <div class="form-group">
          <label>탈퇴 사유 선택</label>
          <select v-model="withdrawalReason" class="form-select">
            <option value="">탈퇴 사유를 선택해주세요</option>
            <option value="서비스불만족">서비스 불만족</option>
            <option value="이용빈도낮음">이용 빈도가 낮음</option>
            <option value="개인정보보호">개인정보 보호</option>
            <option value="재가입">재가입을 위해</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div class="form-group" v-if="withdrawalReason === '기타'">
          <label>기타 사유</label>
          <textarea 
            v-model="otherReason" 
            class="form-control" 
            placeholder="탈퇴 사유를 자세히 적어주세요"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>비밀번호 확인</label>
          <input 
            type="password" 
            v-model="password" 
            class="form-control"
            placeholder="현재 비밀번호를 입력해주세요"
          />
        </div>

        <div class="agreement-section">
          <label class="agreement-label">
            <input 
              type="checkbox" 
              v-model="agreed"
              class="agreement-checkbox"
            />
            <span class="agreement-text">
              위 내용을 모두 확인하였으며, 회원 탈퇴에 동의합니다.
            </span>
          </label>
        </div>

        <div class="button-group">
          <button 
            class="btn btn-secondary"
            @click="$router.push('/mypage/profile')"
          >
            취소
          </button>
          <button 
            class="btn btn-danger"
            :disabled="!isFormValid"
            @click="handleWithdrawal"
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { myPageAPI } from '@/api/mypage';

// Material Icons CDN 추가
const materialIconsLink = document.createElement('link');
materialIconsLink.rel = 'stylesheet';
materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
document.head.appendChild(materialIconsLink);

const router = useRouter();
const withdrawalReason = ref('');
const otherReason = ref('');
const password = ref('');
const agreed = ref(false);

const isFormValid = computed(() => {
  if (!withdrawalReason.value) return false;
  if (withdrawalReason.value === '기타' && !otherReason.value.trim()) return false;
  if (!password.value) return false;
  if (!agreed.value) return false;
  return true;
});

const handleWithdrawal = async () => {
  if (!isFormValid.value) return;

  try {
    if (!confirm('정말로 탈퇴하시겠습니까?')) return;

    const reason = withdrawalReason.value === '기타' ? otherReason.value : withdrawalReason.value;
    
    await myPageAPI.withdrawMembership({
      reason,
      password: password.value
    });

    alert('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
    router.push('/');
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    if (error.response?.status === 401) {
      alert('비밀번호가 일치하지 않습니다.');
    } else {
      alert('회원 탈퇴 처리 중 오류가 발생했습니다.');
    }
  }
};
</script>

<style scoped>
.withdrawal-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #0d47a1;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 1rem;
}

.withdrawal-content {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
}

.warning-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 235, 238, 0.8);
  border-radius: 8px;
  border: 2px solid #ef5350;
}

.warning-icon {
  font-size: 3rem;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.warning-section h3 {
  color: #d32f2f;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

ㅋ.warning-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: #d32f2f;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
  border-radius: 6px;
}

.warning-list .material-icons {
  font-size: 1.2rem;
  color: #d32f2f;
}

.withdrawal-form {
  background: rgba(255, 255, 255, 0.6);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #bbdefb;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #0d47a1;
  font-weight: 500;
}

.form-select,
.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #90caf9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-select:focus,
.form-control:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
  outline: none;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.agreement-section {
  margin: 2rem 0;
  padding: 1rem;
  background: rgba(236, 239, 241, 0.6);
  border-radius: 8px;
}

.agreement-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.agreement-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid #90caf9;
  border-radius: 4px;
  cursor: pointer;
}

.agreement-text {
  color: #37474f;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.btn-secondary {
  background: #90caf9;
  color: #0d47a1;
}

.btn-secondary:hover {
  background: #64b5f6;
  transform: translateY(-2px);
}

.btn-danger {
  background: #ef5350;
  color: white;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .withdrawal-content {
    padding: 1rem;
  }

  .warning-section {
    padding: 1rem;
  }

  .withdrawal-form {
    padding: 1rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>