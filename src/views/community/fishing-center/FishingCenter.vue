<script setup>
import {onMounted} from 'vue'
import {useFishingCenterStore} from '@/store/fishing-center/useFishingCenterStore.js'
import FishingCenterList from './components/FishingCenterList.vue'

const store = useFishingCenterStore()

onMounted(async () => {
  store.fetchFishingCenterData()
})

</script>

<template>
  <div class="center">
    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>조황센터 데이터를 불러오는 중...</p>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="error-container">
      <h3>데이터 로드 실패</h3>
      <p>{{ store.error }}</p>
      <button @click="store.fetchFishingCenterData()" class="retry-button">
        다시 시도
      </button>
    </div>
    
    <!-- 정상 상태 -->
    <div v-else>
      <div class="page-header">
        <h2 class="page-title">
          📊 조황센터
          <span class="count">({{ (store.reportList?.length || 0) + (store.diaryList?.length || 0) }})</span>
        </h2>
      </div>
      <FishingCenterList :centers="[{ reports: store.reportList, diaries: store.diaryList }]" />
    </div>
  </div>
</template>

<style>
.center {
  width: 80%;
  margin: 5% auto;
}

.loading-container {
  text-align: center;
  padding: 50px 0;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 50px 0;
  color: #e74c3c;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}

.retry-button:hover {
  background-color: #2980b9;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 2px solid #e2e8f0;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a365d;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.count {
  color: #4a90e2;
  font-weight: 600;
  margin-left: 8px;
}
</style>