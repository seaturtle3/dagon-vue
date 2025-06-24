<template>
  <div class="location-section">
    <div class="location-card">
      <div class="card-header">
        <h5>
          <i class="fas fa-map-marker-alt"></i> 위치 기반 관측소 찾기
        </h5>
      </div>
      <div class="card-body">
        <p>현재 위치를 기반으로 가장 가까운 관측소의 물때 정보를 자동으로 조회합니다.</p>
        <button @click="requestLocation" class="location-btn" :disabled="loading">
          <i class="fas fa-location-arrow"></i> 현재 위치로 관측소 찾기
        </button>
        <div v-if="locationInfo" class="location-info" v-html="locationInfo"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'LocationSection',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['location-found'],
  setup(props, { emit }) {
    const locationInfo = ref('')

    const requestLocation = () => {
      if (!navigator.geolocation) {
        locationInfo.value = `
          <div class="alert-warning">
            <i class="fas fa-exclamation-triangle"></i> 
            브라우저가 위치 정보를 지원하지 않습니다.
          </div>
        `
        return
      }

      locationInfo.value = `
        <div class="alert-info">
          <i class="fas fa-spinner fa-spin"></i> 
          위치 권한을 요청하고 있습니다...
        </div>
      `

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          
          locationInfo.value = `
            <div class="alert-success">
              <i class="fas fa-check-circle"></i> 
              위치 정보를 성공적으로 가져왔습니다.
            </div>
          `
          
          emit('location-found', { latitude, longitude })
        },
        (error) => {
          console.error('위치 정보 획득 실패:', error)
          let errorMessage = '위치 정보를 가져올 수 없습니다.'
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.'
              break
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다.'
              break
          }
          
          locationInfo.value = `
            <div class="alert-warning">
              <i class="fas fa-exclamation-triangle"></i> 
              ${errorMessage}
              <button @click="requestLocation" class="retry-btn">다시 시도</button>
            </div>
          `
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }

    return {
      locationInfo,
      requestLocation
    }
  }
}
</script>

<style scoped>
.location-section {
  margin-bottom: 30px;
}

.location-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
}

.card-header h5 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.card-body {
  padding: 20px;
}

.card-body p {
  margin-bottom: 15px;
  color: #666;
}

.location-btn {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s;
}

.location-btn:hover:not(:disabled) {
  background: #0b5ed7;
}

.location-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.location-info {
  margin-top: 15px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.alert-warning {
  background: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.alert-info {
  background: #d1ecf1;
  color: #0c5460;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #17a2b8;
}

.retry-btn {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background: #0b5ed7;
}
</style> 