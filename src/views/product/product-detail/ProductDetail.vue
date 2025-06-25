<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetailStore } from '@/store/product/product-detail/useProductDetailStore.js'

import ProductDetailInfo from '@/views/product/product-detail/components/ProductDetailInfo.vue'
import ProductFishingCenter from '@/views/product/product-detail/components/ProductFishingCenter.vue'
import ProductFishingReport from '@/views/product/product-detail/components/ProductFishingReport.vue'
import ProductFishingDiary from '@/views/product/product-detail/components/ProductFishingDiary.vue'
import ReservationCalendar from '@/components/calendar/ReservationCalendar.vue'

const route = useRoute()
const router = useRouter()
const prodId = route.params.prodId
const store = useProductDetailStore()
const product = computed(() => store.product)

const activeTab = ref('info')
const activeSubTab = ref('center')
const selectedOptionId = ref(null)

onMounted(async () => {
  await store.fetchProductDetail(prodId)
  console.log('onMounted product:', store.product)
})

watch(product, (val) => {
  if (val && val.options && val.options.length > 0) {
    selectedOptionId.value = val.options[0].option_id
  }
})

onUnmounted(() => {
  store.clearProduct()
})

const setTab = (tab) => {
  activeTab.value = tab
  if (tab === 'info') {
    activeSubTab.value = 'center'
  }
}
</script>

<template>
  <div class="product-detail-container">
    <!-- 상품 정보 섹션 -->
    <div class="product-info-section">
      <ProductDetailInfo v-if="product" :product="product" />
    </div>

    <!-- 메인 콘텐츠 영역 -->
    <div class="main-content">
      <!-- 탭 네비게이션 -->
      <div class="tab-navigation">
        <div class="tab-list">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'info' }"
            @click="setTab('info')"
          >
            <span class="tab-icon">📊</span>
            <span class="tab-text">조황정보</span>
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'reservation' }"
            @click="setTab('reservation')"
          >
            <span class="tab-icon">📅</span>
            <span class="tab-text">예약하기</span>
          </button>
        </div>
      </div>

      <!-- 서브 탭 (조황정보 탭에서만 표시) -->
      <div v-if="activeTab === 'info'" class="sub-tab-navigation">
        <div class="sub-tab-list">
          <button
            class="sub-tab-button"
            :class="{ active: activeSubTab === 'center' }"
            @click="activeSubTab = 'center'"
          >
            전체보기
          </button>
          <button
            class="sub-tab-button"
            :class="{ active: activeSubTab === 'report' }"
            @click="activeSubTab = 'report'"
          >
            조황정보
          </button>
          <button
            class="sub-tab-button"
            :class="{ active: activeSubTab === 'diary' }"
            @click="activeSubTab = 'diary'"
          >
            조행기
          </button>
        </div>
      </div>

      <!-- 탭 콘텐츠 -->
      <div class="tab-content">
        <!-- 조황정보 탭 콘텐츠 -->
        <div v-if="activeTab === 'info'" class="info-content">
          <div v-if="activeSubTab === 'center'" class="content-section">
            <h3 class="section-title">전체 조황 정보</h3>
            <ProductFishingCenter />
          </div>
          <div v-if="activeSubTab === 'report'" class="content-section">
            <h3 class="section-title">조황 정보</h3>
            <ProductFishingReport />
          </div>
          <div v-if="activeSubTab === 'diary'" class="content-section">
            <h3 class="section-title">조행기</h3>
            <ProductFishingDiary />
          </div>
        </div>

        <!-- 예약하기 탭 콘텐츠 -->
        <div v-if="activeTab === 'reservation'" class="reservation-content">
          <div class="content-section">
            <h3 class="section-title">예약 캘린더</h3>
            <ReservationCalendar :product="product" :option-id="selectedOptionId" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.product-info-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
  margin-top: 5%;
}

.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 탭 네비게이션 */
.tab-navigation {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab-list {
  display: flex;
  gap: 0;
}

.tab-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-button.active {
  background: white;
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-icon {
  font-size: 24px;
}

.tab-text {
  font-size: 14px;
  font-weight: 600;
}

/* 서브 탭 네비게이션 */
.sub-tab-navigation {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0 20px;
}

.sub-tab-list {
  display: flex;
  gap: 0;
}

.sub-tab-button {
  flex: 1;
  padding: 16px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sub-tab-button:hover {
  color: #495057;
  background: #f8f9fa;
}

.sub-tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  background: #f8f9fa;
}

/* 탭 콘텐츠 */
.tab-content {
  padding: 0;
}

.content-section {
  padding: 24px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: #212529;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 12px;
}

.info-content, .reservation-content {
  /* min-height: 400px; */
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .product-detail-container {
    padding: 12px;
  }
  
  .tab-button {
    padding: 16px 12px;
  }
  
  .tab-icon {
    font-size: 20px;
  }
  
  .tab-text {
    font-size: 12px;
  }
  
  .sub-tab-button {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .section-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .tab-list {
    flex-direction: column;
  }
  
  .sub-tab-list {
    flex-direction: column;
  }
  
  .tab-button, .sub-tab-button {
    border-bottom: none;
    border-right: 2px solid transparent;
  }
  
  .tab-button.active, .sub-tab-button.active {
    border-bottom: none;
    border-right-color: #007bff;
  }
}

.go-payment-btn {
  margin-left: 12px;
  padding: 8px 18px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.go-payment-btn:hover {
  background: #1251a3;
}

.inquiry-btn {
  margin-top: 18px;
  padding: 10px 28px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.inquiry-btn:hover {
  background: #1251a3;
}
</style> 