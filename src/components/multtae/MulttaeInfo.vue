<template>
  <div class="data-section" v-if="multtaeData">
    <h4><span>{{ multtaeData.stationName }}</span></h4>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">날짜:</span>
        <span class="value">{{ multtaeData.date }}</span>
      </div>
      <div class="info-item">
        <span class="label">물이름:</span>
        <span class="value">{{ multtaeData.mulName }} ({{ multtaeData.lunarAge }}일)</span>
      </div>
      <div class="info-item">
        <span class="label">일출:</span>
        <span class="value">{{ multtaeData.sunrise }}</span>
      </div>
      <div class="info-item">
        <span class="label">일몰:</span>
        <span class="value">{{ multtaeData.sunset }}</span>
      </div>
      <div class="info-item">
        <span class="label">풍속:</span>
        <span class="value">{{ multtaeData.todayWindSpeed || '-' }} m/s</span>
      </div>
      <div class="info-item">
        <span class="label">풍향:</span>
        <span class="value">{{ multtaeData.todayWindDir || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">파고:</span>
        <span class="value" :class="{ 'text-muted': !hasWaveData }">
          {{ getWaveDisplay() }}
        </span>
      </div>
      <div class="info-item">
        <span class="label">기온:</span>
        <span class="value">{{ multtaeData.airTemp || '-' }} ℃</span>
      </div>
    </div>
    
    <!-- 파고 데이터 상태 정보 -->
    <div v-if="!hasWaveData" class="wave-info">
      <div class="alert-info">
        <i class="fas fa-info-circle"></i> 
        <strong>파고 정보 안내:</strong> 이 관측소는 내륙지방에 위치하여 파고 데이터를 제공하지 않습니다. 
        파고 정보가 필요한 경우 해안가 관측소를 선택해주세요.
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'MulttaeInfo',
  props: {
    multtaeData: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    // 파고 데이터 존재 여부 확인
    const hasWaveData = computed(() => {
      if (!props.multtaeData?.hourlyData) return false
      return props.multtaeData.hourlyData.some(h => h.wave !== null && h.wave !== undefined)
    })

    // 파고 표시 함수
    const getWaveDisplay = () => {
      const waveData = props.multtaeData?.hourlyData?.[0]?.wave
      if (waveData !== null && waveData !== undefined) {
        return waveData + ' m'
      }
      return '파고 데이터 없음'
    }

    return {
      hasWaveData,
      getWaveDisplay
    }
  }
}
</script>

<style scoped>
.data-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.data-section h4 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #28a745;
}

.info-item .label {
  font-weight: 600;
  color: #555;
}

.info-item .value {
  font-weight: 700;
  color: #28a745;
  font-size: 1rem;
}

.info-item .value.text-muted {
  color: #6c757d;
}

.wave-info {
  margin-top: 15px;
}

.alert-info {
  background: #d1ecf1;
  color: #0c5460;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #17a2b8;
}

.alert-info i {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style> 