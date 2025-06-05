<template>
  <div class="points-container">
    <h2 class="page-title">포인트 및 레벨</h2>
    
    <div class="points-info">
      <div class="level-card">
        <div class="level-info">
          <div class="level-badge">
            <span class="level-text">{{ pointInfo.levelKorean }}</span>
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
import { myPageAPI } from '@/api/mypage';

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

onMounted(async () => {
  try {
    const response = await myPageAPI.getPointAndLevel();
    pointInfo.value = response.data;
  } catch (error) {
    console.error('포인트 정보 조회 실패:', error);
    alert('포인트 정보를 불러오는데 실패했습니다.');
  }
});
</script>

<style scoped>
.points-container {
  max-width: 800px;
  padding: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.points-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.level-card, .points-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.level-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.level-badge {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
}

.level-text {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.level-details h3 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.level-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.level-icon {
  font-size: 3rem;
  margin-right: 1rem;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.points-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.points-header h3 {
  font-size: 1rem;
  color: #666;
}

.points-amount {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a73e8;
  letter-spacing: -0.5px;
}

.points-icon {
  font-size: 2.5rem;
}

.level-progress {
  margin-top: 1rem;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.highlight {
  color: #1a73e8;
  font-weight: 600;
}

.progress-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a73e8, #64b5f6);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.max-level {
  text-align: center;
  color: #1a73e8;
  font-weight: 600;
  margin-top: 1rem;
  font-size: 1.2rem;
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

  .level-icon {
    margin: 0;
  }

  .points-amount {
    font-size: 2rem;
  }

  .points-icon {
    font-size: 2rem;
  }
}
</style> 