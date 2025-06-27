import api from '@/lib/axios'

const BASE_URL = ''

// 물때 정보 조회 (오늘) - stationCode 파라미터 필요
export const getMulttaeData = async (stationCode = 'DT_0001') => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/today`, {
      params: { stationCode }
    })
    return response.data
  } catch (error) {
    console.error('물때 데이터 조회 실패:', error)
    throw error
  }
}

// 특정 날짜의 물때 정보 조회 (daily 엔드포인트 사용)
export const getMulttaeDataByDate = async (stationCode, date) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/daily`, {
      params: { 
        stationCode,
        date: date.toISOString().split('T')[0] // YYYY-MM-DD 형식
      }
    })
    return response.data
  } catch (error) {
    console.error('특정 날짜 물때 데이터 조회 실패:', error)
    throw error
  }
}

// 주간 물때 정보 조회
export const getMulttaeDataWeek = async (stationCode) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/week`, {
      params: { stationCode }
    })
    return response.data
  } catch (error) {
    console.error('주간 물때 데이터 조회 실패:', error)
    throw error
  }
}

// 지역별 관측소 목록 조회
export const getStationsByRegion = async (region) => {
  try {
    console.log('API: 지역별 관측소 조회 시작:', region)
    const response = await api.get(`${BASE_URL}/api/multtae/stations`, {
      params: { region }
    })
    console.log('API: 지역별 관측소 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('API: 지역별 관측소 조회 실패:', error)
    console.error('API: 에러 상세:', error.response?.data || error.message)
    throw error
  }
}

// 지역 목록 조회
export const getRegions = async () => {
  try {
    console.log('API: 지역 목록 조회 시작')
    const response = await api.get(`${BASE_URL}/api/multtae/regions`)
    console.log('API: 지역 목록 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('API: 지역 목록 조회 실패:', error)
    console.error('API: 에러 상세:', error.response?.data || error.message)
    throw error
  }
}

// 지역별 조위관측소 존재 여부
export const getRegionsWithStations = async () => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/regions/with-station`)
    return response.data
  } catch (error) {
    console.error('지역별 관측소 존재 여부 조회 실패:', error)
    throw error
  }
}

// 파고 관측소가 연결된 조위 관측소 목록 조회
export const getTideStationsWithWaveStation = async () => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/stations/with-wave`)
    return response.data
  } catch (error) {
    console.error('파고 관측소 연결 조위 관측소 조회 실패:', error)
    throw error
  }
}

// 조위관측소와 연결된 파고관측소 확인
export const getLinkedWaveStation = async (stationCode) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/stations/${stationCode}/wave`)
    return response.data
  } catch (error) {
    console.error('연결된 파고관측소 조회 실패:', error)
    throw error
  }
}

// 테스트용 API (개발용)
export const testWind = async (windStationCode, date) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/test-wind`, {
      params: { 
        windStationCode,
        date: date.toISOString().split('T')[0]
      }
    })
    return response.data
  } catch (error) {
    console.error('풍속 테스트 데이터 조회 실패:', error)
    throw error
  }
}

export const testWave = async (waveStationCode, date) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/test-wave`, {
      params: { 
        waveStationCode,
        date: date.toISOString().split('T')[0]
      }
    })
    return response.data
  } catch (error) {
    console.error('파고 테스트 데이터 조회 실패:', error)
    throw error
  }
}

// 내일 물때 정보 조회
export const getMulttaeDataTomorrow = async () => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/tomorrow`)
    return response.data
  } catch (error) {
    console.error('내일 물때 데이터 조회 실패:', error)
    throw error
  }
}

// 특정 지역의 물때 정보 조회
export const getMulttaeDataByRegion = async (location) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/location/${location}`)
    return response.data
  } catch (error) {
    console.error('특정 지역 물때 데이터 조회 실패:', error)
    throw error
  }
}

// 현재 위치 기반 물때 정보 조회
export const getMulttaeDataByLocation = async (latitude, longitude) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/location`, {
      params: { latitude, longitude }
    })
    return response.data
  } catch (error) {
    console.error('위치 기반 물때 데이터 조회 실패:', error)
    throw error
  }
}

// 관측소 정보 조회 (상세)
export const getStationInfo = async (stationCode) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/stations/${stationCode}/info`)
    return response.data
  } catch (error) {
    console.error('관측소 정보 조회 실패:', error)
    throw error
  }
}

// 현재 시간별 데이터 조회
export const getHourlyData = async () => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/hourly`)
    return response.data
  } catch (error) {
    console.error('시간별 데이터 조회 실패:', error)
    throw error
  }
}

// 물때 정보 업데이트 (관리자용)
export const updateMulttaeData = async (data) => {
  try {
    const response = await api.put(`${BASE_URL}/api/multtae`, data)
    return response.data
  } catch (error) {
    console.error('물때 데이터 업데이트 실패:', error)
    throw error
  }
}

// 물때 정보 삭제 (관리자용)
export const deleteMulttaeData = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/api/multtae/${id}`)
    return response.data
  } catch (error) {
    console.error('물때 데이터 삭제 실패:', error)
    throw error
  }
}

// 가까운 관측소 찾기 (위도/경도 기반)
export const findNearestStation = async (latitude, longitude) => {
  try {
    const response = await api.get(`${BASE_URL}/api/multtae/nearest-station`, {
      params: { latitude, longitude }
    })
    return response.data
  } catch (error) {
    console.error('가까운 관측소 조회 실패:', error)
    throw error
  }
} 