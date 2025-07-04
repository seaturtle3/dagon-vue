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
  <div class="container fishing-center-container mx-auto">
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
      <section class="section-block">
        <div class="page-header">
          <h2 class="page-title">
            조황센터
            <span class="count">({{ (store.reportList?.length || 0) + (store.diaryList?.length || 0) }})</span>
          </h2>
          <div class="header-actions">
            <button @click="$router.push('/fishing-report')" class="go-btn">조황정보 바로가기</button>
            <button @click="$router.push('/fishing-diary')" class="go-btn">조행기 바로가기</button>
          </div>
        </div>
        <FishingCenterList :centers="[{ reports: store.reportList, diaries: store.diaryList }]" />
      </section>
    </div>
  </div>
</template>

<style>
.fishing-center-container {
  padding: 32px 0 48px 0;
  max-width: 1200px;
}

.section-block {
  margin-top: 60px;
  margin-bottom: 120px;
}

.loading-container {
  text-align: center;
  padding: 80px 0;
  color: #6b7280;
}

.loading-spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
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
  padding: 80px 0;
  color: #ef4444;
}

.retry-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 0;
  border-bottom: 2px solid #e5e7eb;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.count {
  color: #3b82f6;
  font-weight: 600;
  margin-left: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.go-btn {
  background: #fff;
  color: #2563eb;
  border: 1px solid #d1d5db;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.go-btn:hover {
  background: #fff;
  border-color: #2563eb;
}

@media (max-width: 900px) {
  .fishing-center-container {
    padding: 16px 0 24px 0;
  }
  
  .section-block {
    margin-bottom: 24px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}

/* 페이징 버튼 - 동그란 스타일, 사이트 메인 컬러 적용 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}
.pagination button {
  background: transparent;
  color: #222;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination button.active,
.pagination button:focus {
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}
.pagination button:hover:not(.active):not(:disabled) {
  background: #f3f4f6;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination .arrow-btn {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #2563eb;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: border-color 0.18s;
}
.pagination .arrow-btn:hover:not(:disabled) {
  border-color: #2563eb;
}
</style>