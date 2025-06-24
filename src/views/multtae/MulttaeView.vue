<template>
  <div class="multtae-container">
    <div class="multtae-header">
      <h1>오늘의 물때 정보</h1>
      <p>실시간 물때 정보를 확인하세요</p>
    </div>
    
    <!-- 위치 기반 기능 섹션 -->
    <LocationSection 
      :loading="loading" 
      @location-found="handleLocationFound" 
    />

    <!-- 지역 선택 버튼 -->
    <RegionSelector 
      :regions-with-stations="regionsWithStations"
      :selected-region="selectedRegion"
      @region-selected="handleRegionSelected"
    />

    <!-- 관측소 선택 -->
    <StationSelector 
      :selected-region="selectedRegion"
      :stations="stations"
      v-model="selectedStationCode"
      @station-selected="handleStationSelected"
    />

    <!-- 로딩 인디케이터 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <p v-if="isUsingNearestStation">📍 가까운 관측소를 찾는 중...</p>
        <p v-else>물때 정보를 불러오는 중...</p>
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- 물때 데이터 표시 -->
    <div v-if="multtaeData" class="multtae-data">
      <!-- 오늘의 정보 -->
      <MulttaeInfo :multtae-data="multtaeData" />
      
      <!-- 조위 정보 -->
      <TideInfo :tide-items="multtaeData.tideItems || []" />
      
      <!-- 시간대별 기상 정보 -->
      <HourlyTable :hourly-data="multtaeData.hourlyData || []" />
      
      <!-- 조위 그래프 -->
      <TideChart :hourly-data="multtaeData.hourlyData || []" />
      
      <!-- 주간 정보 -->
      <WeeklyTable :weekly-data="weeklyData || []" />
    </div>

    <!-- 에러 메시지 -->
    <div v-if="error" class="error-section">
      <div class="error-content">
        <p>오류가 발생했습니다: {{ error }}</p>
        <p class="debug-info">백엔드 서버(http://localhost:8095)가 실행 중인지 확인해주세요.</p>
        <button @click="retryData" class="retry-btn">다시 시도</button>
      </div>
    </div>

    <!-- 데이터 없음 -->
    <div v-if="!loading && !error && !multtaeData" class="no-data">
      <p>물때 정보가 없습니다.</p>
    </div>

    <div class="multtae-footer">
      <p>※ 물때 정보는 참고용이며, 실제 상황과 다를 수 있습니다.</p>
      <p>마지막 업데이트: {{ lastUpdated }}</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import { useMulttaeStore } from '@/store/multtae/useMulttaeStore'
import { storeToRefs } from 'pinia'
import { 
  getRegionsWithStations, 
  getStationsByRegion, 
  getMulttaeData, 
  getMulttaeDataWeek,
  getMulttaeDataByLocation,
  findNearestStation
} from '@/api/multtae'

// 컴포넌트 import
import LocationSection from '@/components/multtae/LocationSection.vue'
import RegionSelector from '@/components/multtae/RegionSelector.vue'
import StationSelector from '@/components/multtae/StationSelector.vue'
import MulttaeInfo from '@/components/multtae/MulttaeInfo.vue'
import TideInfo from '@/components/multtae/TideInfo.vue'
import HourlyTable from '@/components/multtae/HourlyTable.vue'
import TideChart from '@/components/multtae/TideChart.vue'
import WeeklyTable from '@/components/multtae/WeeklyTable.vue'

export default {
  name: 'MulttaeView',
  components: {
    LocationSection,
    RegionSelector,
    StationSelector,
    MulttaeInfo,
    TideInfo,
    HourlyTable,
    TideChart,
    WeeklyTable
  },
  setup() {
    const multtaeStore = useMulttaeStore()
    const { multtaeData, loading, error, isUsingNearestStation, lastUpdated } = storeToRefs(multtaeStore)
    
    // 지역 및 관측소 선택 상태
    const selectedRegion = ref('')
    const selectedStationCode = ref('')
    const stations = ref([])
    const regionsWithStations = ref({})
    const weeklyData = ref([])

    // 위치 기반 데이터 처리
    const handleLocationFound = async (location) => {
      const { latitude, longitude } = location
      
      try {
        multtaeStore.loading = true
        multtaeStore.error = null
        
        // 위치 기반 물때 정보 조회
        const data = await getMulttaeDataByLocation(latitude, longitude)
        multtaeStore.multtaeData = data
        multtaeStore.isUsingNearestStation = true
        multtaeStore.lastUpdated = new Date().toLocaleString('ko-KR')
        
        // 가까운 관측소 정보
        const nearestStation = await findNearestStation(latitude, longitude)
        multtaeStore.nearestStation = nearestStation
        
        // 주간 데이터 조회
        const weekData = await getMulttaeDataWeek(nearestStation.stationCode)
        weeklyData.value = weekData
        
      } catch (error) {
        console.error('위치 기반 데이터 로드 실패:', error)
        multtaeStore.error = '위치 기반 데이터를 불러올 수 없습니다.'
      } finally {
        multtaeStore.loading = false
      }
    }

    // 지역 선택 처리
    const handleRegionSelected = async (region) => {
      selectedRegion.value = region
      try {
        const result = await getStationsByRegion(region)
        stations.value = result
        // 관측소가 있으면 자동 선택 및 데이터 조회
        if (stations.value.length > 0) {
          selectedStationCode.value = stations.value[0].stationCode
          handleStationSelected(selectedStationCode.value)
        }
      } catch (error) {
        stations.value = []
      }
    }

    // 관측소 선택 처리
    const handleStationSelected = async (stationCode) => {
      if (!stationCode) return
      
      multtaeStore.loading = true
      multtaeStore.error = null
      
      try {
        // 오늘 데이터 조회
        const data = await getMulttaeData(stationCode)
        multtaeStore.multtaeData = data
        multtaeStore.lastUpdated = new Date().toLocaleString('ko-KR')
        
        // 주간 데이터 조회
        const weekData = await getMulttaeDataWeek(stationCode)
        weeklyData.value = weekData
        
      } catch (error) {
        console.error('관측소 데이터 조회 실패:', error)
        multtaeStore.error = error.message
      } finally {
        multtaeStore.loading = false
      }
    }

    // 데이터 재시도
    const retryData = async () => {
      if (selectedStationCode.value) {
        await handleStationSelected(selectedStationCode.value)
      }
    }

    // 초기화
    const initialize = async () => {
      try {
        // 지역별 관측소 존재 여부 조회
        const regionsData = await getRegionsWithStations()
        regionsWithStations.value = regionsData

        // '부산'이 있으면 부산, 없으면 첫 번째 지역 자동 선택
        const defaultRegion = regionsData['부산'] ? '부산' : Object.keys(regionsData)[0]
        if (defaultRegion) {
          selectedRegion.value = defaultRegion
          await handleRegionSelected(defaultRegion)
        }
      } catch (error) {
        console.error('초기화 실패:', error)
        multtaeStore.error = '데이터를 불러올 수 없습니다.'
      }
    }

    // 관측소 목록이 바뀔 때 자동 선택 및 데이터 조회
    watch(stations, (newStations) => {
      if (newStations.length > 0) {
        selectedStationCode.value = newStations[0].stationCode
        handleStationSelected(selectedStationCode.value)
      }
    })

    onMounted(() => {
      initialize()
    })

    watch(() => multtaeStore.multtaeData, (val) => {
      console.log('multtaeData changed:', val)
    }, { immediate: true })

    return {
      // Pinia 스토어의 상태 (storeToRefs를 통해 반응성 유지)
      multtaeData,
      loading,
      error,
      isUsingNearestStation,
      lastUpdated,
      
      // 로컬 상태 및 핸들러 함수
      selectedRegion,
      selectedStationCode,
      stations,
      regionsWithStations,
      weeklyData,
      handleLocationFound,
      handleRegionSelected,
      handleStationSelected,
      retryData
    }
  }
}
</script>

<style scoped>
.multtae-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

.multtae-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
}

.multtae-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.multtae-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-content p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 섹션 */
.error-section {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 20px;
}

.error-content p {
  color: #dc3545;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.debug-info {
  color: #6c757d !important;
  font-size: 0.9rem !important;
  font-style: italic;
  margin-bottom: 15px;
}

.retry-btn {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background: #0b5ed7;
}

/* 데이터 없음 */
.no-data {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 20px;
}

.no-data p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* 푸터 */
.multtae-footer {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  color: #666;
  font-size: 0.9rem;
}

.multtae-footer p {
  margin: 5px 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .multtae-container {
    padding: 15px;
  }
  
  .multtae-header h1 {
    font-size: 2rem;
  }
}
</style> 