import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getMulttaeData, 
  getMulttaeDataByDate, 
  getMulttaeDataWeek,
  getStationsByRegion,
  getRegions,
  getRegionsWithStations,
  getTideStationsWithWaveStation,
  getLinkedWaveStation,
  findNearestStation,
  getMulttaeDataByLocation,
  getStationInfo
} from '@/api/multtae'

export const useMulttaeStore = defineStore('multtae', () => {
  // 상태
  const multtaeData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref('')
  const selectedStationCode = ref('DT_0001')
  const regions = ref([])
  const stations = ref([])
  const currentLocation = ref(null)
  const nearestStation = ref(null)
  const isUsingNearestStation = ref(false)

  // 게터
  const hasData = computed(() => !!multtaeData.value)
  const tideItems = computed(() => multtaeData.value?.tideItems || [])
  const hourlyData = computed(() => multtaeData.value?.hourlyData || [])
  const stationInfo = computed(() => ({
    name: multtaeData.value?.stationName || '',
    code: multtaeData.value?.stationCode || '',
    date: multtaeData.value?.date || '',
    mulName: multtaeData.value?.mulName || ''
  }))
  const weatherInfo = computed(() => ({
    windSpeed: multtaeData.value?.todayWindSpeed || 0,
    windDir: multtaeData.value?.todayWindDir || '',
    lunarAge: multtaeData.value?.lunarAge || 0,
    sunrise: multtaeData.value?.sunrise || '',
    sunset: multtaeData.value?.sunset || ''
  }))

  // 액션
  const fetchMulttaeData = async (stationCode = selectedStationCode.value) => {
    try {
      loading.value = true
      error.value = null
      
      const data = await getMulttaeData(stationCode)
      multtaeData.value = data
      selectedStationCode.value = stationCode
      lastUpdated.value = new Date().toLocaleString('ko-KR')
    } catch (err) {
      console.error('물때 데이터 조회 실패:', err)
      error.value = err.response?.data?.message || '서버 연결에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMulttaeDataByDate = async (stationCode, date) => {
    try {
      loading.value = true
      error.value = null
      
      const data = await getMulttaeDataByDate(stationCode, date)
      multtaeData.value = data
      lastUpdated.value = new Date().toLocaleString('ko-KR')
    } catch (err) {
      console.error('특정 날짜 물때 데이터 조회 실패:', err)
      error.value = err.response?.data?.message || '서버 연결에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMulttaeDataWeek = async (stationCode = selectedStationCode.value) => {
    try {
      loading.value = true
      error.value = null
      
      const data = await getMulttaeDataWeek(stationCode)
      multtaeData.value = data
      lastUpdated.value = new Date().toLocaleString('ko-KR')
    } catch (err) {
      console.error('주간 물때 데이터 조회 실패:', err)
      error.value = err.response?.data?.message || '서버 연결에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchRegions = async () => {
    try {
      const data = await getRegions()
      regions.value = data
    } catch (err) {
      console.error('지역 목록 조회 실패:', err)
      throw err
    }
  }

  const fetchStationsByRegion = async (region) => {
    try {
      console.log('스토어: 지역별 관측소 조회 시작:', region)
      const data = await getStationsByRegion(region)
      console.log('스토어: 지역별 관측소 조회 성공:', data)
      stations.value = data
    } catch (err) {
      console.error('스토어: 지역별 관측소 조회 실패:', err)
      stations.value = []
      throw err
    }
  }

  const fetchRegionsWithStations = async () => {
    try {
      const data = await getRegionsWithStations()
      return data
    } catch (err) {
      console.error('지역별 관측소 존재 여부 조회 실패:', err)
      throw err
    }
  }

  const fetchTideStationsWithWaveStation = async () => {
    try {
      const data = await getTideStationsWithWaveStation()
      return data
    } catch (err) {
      console.error('파고 관측소 연결 조위 관측소 조회 실패:', err)
      throw err
    }
  }

  const fetchLinkedWaveStation = async (stationCode) => {
    try {
      const data = await getLinkedWaveStation(stationCode)
      return data
    } catch (err) {
      console.error('연결된 파고관측소 조회 실패:', err)
      throw err
    }
  }

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          currentLocation.value = location
          resolve(location)
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      )
    })
  }

  // 가까운 관측소 찾기
  const findNearestStationAction = async (latitude, longitude) => {
    try {
      const data = await findNearestStation(latitude, longitude)
      nearestStation.value = data
      return data
    } catch (err) {
      console.error('가까운 관측소 찾기 실패:', err)
      throw err
    }
  }

  // 현재 위치 기반 물때 정보 조회
  const fetchMulttaeDataByLocation = async (latitude, longitude) => {
    try {
      loading.value = true
      error.value = null
      
      const data = await getMulttaeDataByLocation(latitude, longitude)
      multtaeData.value = data
      isUsingNearestStation.value = true
      lastUpdated.value = new Date().toLocaleString('ko-KR')
    } catch (err) {
      console.error('위치 기반 물때 데이터 조회 실패:', err)
      error.value = err.response?.data?.message || '위치 기반 데이터 조회에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 자동으로 가까운 관측소 찾아서 데이터 조회
  const fetchDataWithNearestStation = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('현재 위치 가져오기 시작...')
      // 현재 위치 가져오기
      const location = await getCurrentLocation()
      console.log('현재 위치:', location)
      
      console.log('가까운 관측소 찾기 시작...')
      // 가까운 관측소 찾기
      const nearest = await findNearestStationAction(location.latitude, location.longitude)
      console.log('가까운 관측소:', nearest)
      
      // 가까운 관측소로 데이터 조회
      if (nearest && nearest.stationCode) {
        console.log('가까운 관측소로 데이터 조회 시작:', nearest.stationCode)
        await fetchMulttaeData(nearest.stationCode)
        isUsingNearestStation.value = true
        selectedStationCode.value = nearest.stationCode
        console.log('가까운 관측소 데이터 조회 완료')
      } else {
        throw new Error('가까운 관측소를 찾을 수 없습니다.')
      }
    } catch (err) {
      console.error('가까운 관측소 기반 데이터 조회 실패:', err)
      error.value = err.message || '가까운 관측소를 찾을 수 없습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 관측소 정보 조회
  const fetchStationInfo = async (stationCode) => {
    try {
      const data = await getStationInfo(stationCode)
      return data
    } catch (err) {
      console.error('관측소 정보 조회 실패:', err)
      throw err
    }
  }

  const setSelectedStation = (stationCode) => {
    selectedStationCode.value = stationCode
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    multtaeData.value = null
    loading.value = false
    error.value = null
    lastUpdated.value = ''
    selectedStationCode.value = 'DT_0001'
    regions.value = []
    stations.value = []
  }

  return {
    // 상태
    multtaeData,
    loading,
    error,
    lastUpdated,
    selectedStationCode,
    regions,
    stations,
    currentLocation,
    nearestStation,
    isUsingNearestStation,
    
    // 게터
    hasData,
    tideItems,
    hourlyData,
    stationInfo,
    weatherInfo,
    
    // 액션
    fetchMulttaeData,
    fetchMulttaeDataByDate,
    fetchMulttaeDataWeek,
    fetchRegions,
    fetchStationsByRegion,
    fetchRegionsWithStations,
    fetchTideStationsWithWaveStation,
    fetchLinkedWaveStation,
    fetchDataWithNearestStation,
    fetchStationInfo,
    setSelectedStation,
    clearError,
    reset
  }
}) 