<template>
  <div class="data-section" v-if="hourlyData && hourlyData.length > 0">
    <h5>시간대별 기상 정보</h5>
    <div class="table-container">
      <table class="hourly-table">
        <thead>
          <tr>
            <th>시간</th>
            <th>풍속 (m/s)</th>
            <th>풍향</th>
            <th>파고 (m)</th>
            <th>기온 (℃)</th>
            <th>조위 (cm)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(hour, index) in hourlyData" :key="index">
            <td>{{ hour.time }}</td>
            <td>{{ hour.wind_speed || '-' }}</td>
            <td>{{ hour.wind_dir || '-' }}</td>
            <td :class="{ 'text-muted': hour.wave === null || hour.wave === undefined }">
              {{ getHourlyWaveDisplay(hour.wave) }}
            </td>
            <td>{{ hour.air_temp || '-' }}</td>
            <td>{{ hour.tide_level || '-' }}</td>
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

    const initialize = async () => {
      const regionsData = await getRegionsWithStations()
      console.log('regionsData:', regionsData)
      regionsWithStations.value = regionsData

      try {
        // 추가적인 초기화 로직
      } catch (error) {
        console.error('초기화 실패:', error)
      }
    }

    return {
      getHourlyWaveDisplay
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

.data-section h5 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 10px;
}

.table-container {
  overflow-x: auto;
}

.hourly-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.hourly-table th, .hourly-table td {
  padding: 10px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.hourly-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.hourly-table td {
  background: white;
}

.hourly-table td.text-muted {
  color: #6c757d;
}

@media (max-width: 768px) {
  .hourly-table {
    font-size: 0.9rem;
  }
  
  .hourly-table th, .hourly-table td {
    padding: 8px 5px;
  }
}
</style> 