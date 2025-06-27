<template>
  <!-- 공통 모달 적용 -->
  <ModalDialog
    :show="showLoginModal"
    title="로그인 필요"
    message="포인트 및 레벨 조회는 로그인 후 이용 가능합니다."
    confirmText="로그인 페이지로 이동"
    :onConfirm="goToLogin"
  />
  <ModalDialog
    :show="showErrorModal"
    title="오류"
    :message="errorMessage"
    :onConfirm="goToLogin"
  />
  <div class="points-container">
    <h2 class="page-title">포인트 및 레벨</h2>
    
    <div class="points-info">
      <div class="level-card">
        <div class="level-info">
          <div class="level-badge">
            <!-- 레벨별 아이콘 -->
            <span v-if="pointInfo.level === 'BRONZE'" class="level-icon-badge">🥉</span>
            <span v-else-if="pointInfo.level === 'SILVER'" class="level-icon-badge">🥈</span>
            <span v-else-if="pointInfo.level === 'GOLD'" class="level-icon-badge">🥇</span>
            <span v-else-if="pointInfo.level === 'PLATINUM'" class="level-icon-badge">💎</span>
            <span v-else-if="pointInfo.level === 'DIAMOND'" class="level-icon-badge">👑</span>
            <span v-else class="level-icon-badge">⭐</span>
          </div>
          <div class="level-details">
            <h3>현재 레벨</h3>
            <p class="level-name">{{ pointInfo.levelKorean }}</p>
          </div>
        </div>
        <div class="level-icon">
          <!-- 레벨별 이모티콘 -->
          <span v-if="pointInfo.level === 'BRONZE'">🥉</span>
          <span v-else-if="pointInfo.level === 'SILVER'">🥈</span>
          <span v-else-if="pointInfo.level === 'GOLD'">🥇</span>
          <span v-else-if="pointInfo.level === 'PLATINUM'">💎</span>
          <span v-else-if="pointInfo.level === 'DIAMOND'">👑</span>
          <span v-else>⭐</span>
        </div>
      </div>

      <div class="points-card">
        <div class="points-header">
          <div class="points-title">
            <h3>보유 포인트</h3>
            <span class="points-amount">{{ pointInfo.point?.toLocaleString() || 0 }} P</span>
          </div>
          <div class="points-icon">💰</div>
        </div>
        
        <div class="level-progress" v-if="pointInfo.nextLevelPoint">
          <div class="progress-text">
            <span>다음 레벨까지</span>
            <span class="highlight">{{ pointInfo.pointToNextLevel?.toLocaleString() || 0 }} P</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <div class="progress-labels">
            <span>{{ pointInfo.point?.toLocaleString() || 0 }} P</span>
            <span>{{ pointInfo.nextLevelPoint?.toLocaleString() || 0 }} P</span>
          </div>
        </div>
        <p v-else class="max-level">🎉 최고 레벨에 도달했습니다! 🎉</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { myPageAPI } from '@/api/mypage.js';
import { useRouter } from 'vue-router';
import ModalDialog from '@/components/common/ModalDialog.vue';

const pointInfo = ref({
  point: 0,
  level: '',
  levelKorean: '',
  nextLevelPoint: null,
  pointToNextLevel: 0
});

const progressPercentage = computed(() => {
  if (!pointInfo.value.nextLevelPoint) return 100;
  const current = pointInfo.value.point || 0;
  const next = pointInfo.value.nextLevelPoint;
  const prev = next - (pointInfo.value.pointToNextLevel || 0);
  return ((current - prev) / (next - prev)) * 100;
});

const showLoginModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');
const router = useRouter();

onMounted(async () => {
  try {
    const response = await myPageAPI.getPointAndLevel();
    pointInfo.value = response.data;
    // 로그인 정보가 없으면 모달 표시
    const token = localStorage.getItem('token');
    if (!token) showLoginModal.value = true;
  } catch (error) {
    console.error('포인트 정보 조회 실패:', error);
    if (error.response?.status === 401) {
      showLoginModal.value = true;
    } else {
      errorMessage.value = '포인트 정보를 불러오는데 실패했습니다.';
      showErrorModal.value = true;
    }
  }
});

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.points-container {
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

.points-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.level-card, .points-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  backdrop-filter: blur(10px);
}

.level-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid #90caf9;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.level-badge {
  width: 80px;
  height: 80px;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-shadow: none;
  border: 3px solid #000;
  padding-top: 8px;
}

.level-icon-badge {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.level-details h3 {
  font-size: 1rem;
  color: #546e7a;
  margin-bottom: 0.5rem;
}

.level-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0d47a1;
  text-shadow: 0 1px 2px rgba(25, 118, 210, 0.2);
}

.level-icon {
  font-size: 3.5rem;
  margin-right: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e3f2fd;
}

.points-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.points-header h3 {
  font-size: 1.1rem;
  color: #546e7a;
}

.points-amount {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1976d2;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 2px rgba(25, 118, 210, 0.2);
}

.points-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.level-progress {
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #bbdefb;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #546e7a;
}

.highlight {
  color: #1976d2;
  font-weight: 600;
}

.progress-bar {
  height: 12px;
  background: #e3f2fd;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1976d2, #64b5f6);
  border-radius: 6px;
  transition: width 0.3s ease;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #546e7a;
  font-weight: 500;
}

.max-level {
  text-align: center;
  color: #1976d2;
  font-weight: 600;
  margin-top: 1.5rem;
  font-size: 1.3rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid #bbdefb;
  text-shadow: 0 1px 2px rgba(25, 118, 210, 0.2);
}

@media (max-width: 768px) {
  .points-container {
    padding: 1rem;
  }

  .level-card {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .level-info {
    flex-direction: column;
    gap: 1rem;
  }

  .level-badge {
    margin: 0 auto;
  }

  .points-amount {
    font-size: 2rem;
  }

  .points-icon {
    font-size: 2rem;
  }
}
</style> 