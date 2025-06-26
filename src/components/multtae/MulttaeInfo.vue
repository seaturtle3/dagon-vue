<template>
  <div class="data-section" v-if="multtaeData">
    <!-- 지역명과 날짜 헤더 -->
    <div class="header-info">
      <h4><span>{{ multtaeData.stationName }}</span></h4>
      <div class="date-info">{{ multtaeData.date }}</div>
    </div>

    <!-- 주요 요약 정보 카드들 -->
    <div class="summary-cards">
      <!-- 물때 정보 카드 -->
      <div class="summary-card tide-card">
        <div class="card-icon">🌊</div>
        <div class="card-content">
          <div class="card-label">물때</div>
          <div class="card-value">{{ multtaeData.mulName }}</div>
          <div class="card-subtitle">{{ multtaeData.lunarAge }}일</div>
        </div>
      </div>

      <!-- 기온 카드 -->
      <div class="summary-card temp-card">
        <div class="card-icon">🌡️</div>
        <div class="card-content">
          <div class="card-label">기온</div>
          <div class="card-value">{{ multtaeData.airTemp || '-' }}°C</div>
        </div>
      </div>

      <!-- 풍속 카드 -->
      <div class="summary-card wind-card">
        <div class="card-icon">💨</div>
        <div class="card-content">
          <div class="card-label">풍속</div>
          <div class="card-value">{{ multtaeData.todayWindSpeed || '-' }} m/s</div>
          <div class="card-subtitle">{{ multtaeData.todayWindDir || '-' }}</div>
        </div>
      </div>

      <!-- 파고 카드 -->
      <div class="summary-card wave-card" :class="{ 'no-data': !hasWaveData }">
        <div class="card-icon">🌊</div>
        <div class="card-content">
          <div class="card-label">파고</div>
          <div class="card-value">{{ getWaveDisplay() }}</div>
        </div>
      </div>
    </div>

    <!-- 일출/일몰 정보 -->
    <div class="sun-info">
      <div class="sun-item">
        <div class="sun-icon">🌅</div>
        <div class="sun-content">
          <div class="sun-label">일출</div>
          <div class="sun-time">{{ multtaeData.sunrise }}</div>
        </div>
      </div>
      <div class="sun-item">
        <div class="sun-icon">🌇</div>
        <div class="sun-content">
          <div class="sun-label">일몰</div>
          <div class="sun-time">{{ multtaeData.sunset }}</div>
        </div>
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
      return '데이터 없음'
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
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 헤더 정보 */
.header-info {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.header-info h4 {
  color: #333;
  margin-bottom: 8px;
  font-size: 1.5rem;
  font-weight: 700;
}

.date-info {
  color: #666;
  font-size: 1.1rem;
  font-weight: 500;
}

/* 요약 카드들 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 25px;
}

.summary-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(13, 110, 253, 0.1);
}

.tide-card .card-icon {
  background: rgba(40, 167, 69, 0.1);
}

.temp-card .card-icon {
  background: rgba(220, 53, 69, 0.1);
}

.wind-card .card-icon {
  background: rgba(255, 193, 7, 0.1);
}

.wave-card .card-icon {
  background: rgba(23, 162, 184, 0.1);
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.card-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2px;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #888;
  font-weight: 500;
}

/* 파고 데이터 없음 스타일 */
.wave-card.no-data .card-value {
  color: #6c757d;
  font-size: 1.1rem;
}

/* 일출/일몰 정보 */
.sun-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border-radius: 12px;
  border: 1px solid #ffe6e6;
}

.sun-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sun-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 193, 7, 0.1);
}

.sun-content {
  text-align: center;
}

.sun-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.sun-time {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

/* 파고 정보 안내 */
.wave-info {
  margin-top: 20px;
}

.alert-info {
  background: #d1ecf1;
  color: #0c5460;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #17a2b8;
  font-size: 0.9rem;
}

.alert-info i {
  margin-right: 8px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .summary-card {
    padding: 15px;
    gap: 12px;
  }
  
  .card-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
  }
  
  .card-value {
    font-size: 1.2rem;
  }
  
  .sun-info {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .data-section {
    padding: 20px;
  }
}
</style> 