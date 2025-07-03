<template>
  <div class="data-section" v-if="hourlyData && hourlyData.length > 0">
    <div class="section-header">
      <h5>⏰ 시간대별 기상 정보</h5>
      <p class="section-subtitle">24시간 기상 및 조위 정보</p>
    </div>
    
    <div class="table-container">
      <table class="hourly-table">
        <thead>
          <tr>
            <th class="time-header">
              <div class="header-content">
                <span class="header-icon">🕐</span>
                <span>시간</span>
              </div>
            </th>
            <th class="wind-header">
              <div class="header-content">
                <span class="header-icon">💨</span>
                <span>풍향/풍속</span>
                <span class="unit">(m/s)</span>
              </div>
            </th>
            <th class="wave-header">
              <div class="header-content">
                <span class="header-icon">🌊</span>
                <span>파고</span>
                <span class="unit">(m)</span>
              </div>
            </th>
            <th class="temp-header">
              <div class="header-content">
                <span class="header-icon">🌡️</span>
                <span>기온</span>
                <span class="unit">(℃)</span>
              </div>
            </th>
            <th class="tide-header">
              <div class="header-content">
                <span class="header-icon">📊</span>
                <span>조위</span>
                <span class="unit">(cm)</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(hour, index) in hourlyData" :key="index" 
              :class="{ 'even-row': index % 2 === 0, 'current-hour': isCurrentHour(hour.time) }">
            <td class="time-cell">
              <div class="time-content">
                <span class="time-value">{{ formatTime(hour.time) }}</span>
                <span v-if="isCurrentHour(hour.time)" class="current-indicator">현재</span>
              </div>
            </td>
            <td class="wind-cell">
              <div class="wind-info">
                <span class="wind-icon">💨</span>
                <div class="wind-details">
                  <span class="wind-direction-text">{{ getWindDirectionText(hour.wind_dir) }}</span>
                  <span class="wind-speed" :class="getWindSpeedClass(hour.wind_speed)">
                    {{ hour.wind_speed || '-' }}
                  </span>
                </div>
              </div>
            </td>
            <td class="wave-cell" :class="{ 'no-data': hour.wave === null || hour.wave === undefined }">
              <div class="value-with-icon">
                <span class="wave-icon">🌊</span>
                <span class="value">{{ getHourlyWaveDisplay(hour.wave) }}</span>
              </div>
            </td>
            <td class="temp-cell">
              <div class="value-with-icon">
                <span class="temp-icon">🌡️</span>
                <span class="value" :class="getTemperatureClass(hour.air_temp)">
                  {{ hour.air_temp || '-' }}
                </span>
              </div>
            </td>
            <td class="tide-cell">
              <div class="value-with-icon">
                <span class="tide-icon">📊</span>
                <span class="value" :class="getTideLevelClass(hour.tide_level)">
                  {{ hour.tide_level || '-' }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HourlyTable',
  props: {
    hourlyData: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    // 시간대별 파고 표시 함수
    const getHourlyWaveDisplay = (wave) => {
      if (wave !== null && wave !== undefined) {
        return wave + ' m'
      }
      return '데이터 없음'
    }

    // 시간 포맷팅 (HH:mm)
    const formatTime = (time) => {
      if (!time) return '-'
      return time.replace(/^(\d{2}):(\d{2}):(\d{2})$/, '$1:$2')
    }

    // 현재 시간인지 확인
    const isCurrentHour = (time) => {
      if (!time) return false
      const now = new Date()
      const currentHour = now.getHours().toString().padStart(2, '0')
      const currentMinute = now.getMinutes().toString().padStart(2, '0')
      const currentTime = `${currentHour}:${currentMinute}`
      return time.startsWith(currentTime)
    }

    // 풍향 텍스트 변환 (8방위)
    const getWindDirectionText = (direction) => {
      if (!direction || direction === '-' || direction === '') {
        return '-'
      }
      // 각도(숫자)라면 8방위로 변환
      const num = Number(direction)
      if (!isNaN(num)) {
        const dirs = [
          '북풍', '북동풍', '동풍', '남동풍', '남풍', '남서풍', '서풍', '북서풍'
        ]
        // 0~360을 8등분 (각 45도)
        // 북: 337.5~22.5, 북동: 22.5~67.5, 동: 67.5~112.5, 남동: 112.5~157.5, 남: 157.5~202.5, 남서: 202.5~247.5, 서: 247.5~292.5, 북서: 292.5~337.5
        const deg = (num + 22.5) % 360
        const idx = Math.floor(deg / 45)
        return dirs[idx]
      }
      // 영문 약자라면 8방위로 변환
      const dir = String(direction).toUpperCase().trim()
      const directions = {
        'N': '북풍', 'NE': '북동풍', 'E': '동풍', 'SE': '남동풍',
        'S': '남풍', 'SW': '남서풍', 'W': '서풍', 'NW': '북서풍'
      }
      return directions[dir] || dir || '-'
    }

    // 풍속에 따른 클래스 반환
    const getWindSpeedClass = (speed) => {
      if (!speed || speed === '-') return ''
      const numSpeed = parseFloat(speed)
      if (numSpeed < 5) return 'wind-low'
      if (numSpeed < 10) return 'wind-medium'
      return 'wind-high'
    }

    // 기온에 따른 클래스 반환
    const getTemperatureClass = (temp) => {
      if (!temp || temp === '-') return ''
      const numTemp = parseFloat(temp)
      if (numTemp < 10) return 'temp-cold'
      if (numTemp < 20) return 'temp-cool'
      if (numTemp < 30) return 'temp-warm'
      return 'temp-hot'
    }

    // 조위에 따른 클래스 반환
    const getTideLevelClass = (level) => {
      if (!level || level === '-') return ''
      const numLevel = parseFloat(level)
      if (numLevel < 0) return 'tide-low'
      if (numLevel < 100) return 'tide-medium'
      return 'tide-high'
    }

    return {
      getHourlyWaveDisplay,
      formatTime,
      isCurrentHour,
      getWindDirectionText,
      getWindSpeedClass,
      getTemperatureClass,
      getTideLevelClass
    }
  }
}
</script>

<style scoped>
.data-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  margin-bottom: 20px;
  text-align: center;
}

.section-header h5 {
  color: #333;
  margin-bottom: 6px;
  font-size: 1.3rem;
  font-weight: 700;
}

.section-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.hourly-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

/* 헤더 스타일 */
.hourly-table th {
  background: #f8f9fa;
  color: #333;
  font-weight: 600;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.header-icon {
  font-size: 1.1rem;
}

.unit {
  font-size: 0.7rem;
  opacity: 0.7;
  font-weight: 400;
}

/* 셀 스타일 */
.hourly-table td {
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #dee2e6;
  transition: background-color 0.2s ease;
}

/* 행 구분 */
.even-row {
  background: #f8f9fa;
}

.odd-row {
  background: white;
}

/* 현재 시간 강조 */
.current-hour {
  background: #fff3cd !important;
  border-left: 3px solid #ffc107;
}

.current-hour td {
  font-weight: 600;
}

/* 시간 셀 */
.time-cell {
  font-weight: 600;
  color: #333;
  min-width: 70px;
}

.time-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.time-value {
  font-size: 1rem;
}

.current-indicator {
  background: #ffc107;
  color: #333;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
}

/* 풍향/풍속 정보 */
.wind-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.wind-icon {
  font-size: 0.9rem;
  opacity: 0.7;
}

.wind-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.wind-direction-text {
  font-size: 0.8rem;
  color: #333;
  font-weight: 500;
}

.wind-speed {
  font-size: 0.9rem;
  font-weight: 600;
}

/* 값과 아이콘 */
.value-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.value-with-icon .value {
  font-weight: 600;
  font-size: 0.95rem;
}

/* 풍속 클래스 */
.wind-low { color: #28a745; }
.wind-medium { color: #ffc107; }
.wind-high { color: #dc3545; }

/* 기온 클래스 */
.temp-cold { color: #17a2b8; }
.temp-cool { color: #28a745; }
.temp-warm { color: #ffc107; }
.temp-hot { color: #dc3545; }

/* 조위 클래스 */
.tide-low { color: #6c757d; }
.tide-medium { color: #28a745; }
.tide-high { color: #0d6efd; }

/* 데이터 없음 */
.no-data .value {
  color: #6c757d;
  font-style: italic;
}

/* 아이콘 */
.wave-icon, .temp-icon, .tide-icon {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 호버 효과 */
.hourly-table tbody tr:hover {
  background: #e3f2fd !important;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .hourly-table {
    font-size: 0.8rem;
  }
  
  .hourly-table th, .hourly-table td {
    padding: 8px 5px;
  }
  
  .header-content {
    gap: 2px;
  }
  
  .header-icon {
    font-size: 0.9rem;
  }
  
  .unit {
    font-size: 0.65rem;
  }
  
  .wind-info {
    gap: 4px;
  }
  
  .wind-direction-text {
    font-size: 0.75rem;
  }
  
  .wind-speed {
    font-size: 0.85rem;
  }
  
  .value-with-icon {
    gap: 3px;
  }
  
  .time-value {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .data-section {
    padding: 15px;
  }
  
  .section-header h5 {
    font-size: 1.1rem;
  }
  
  .hourly-table th, .hourly-table td {
    padding: 6px 3px;
  }
}
</style> 