<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetailStore } from '@/store/product/product-detail/useProductDetailStore.js'
import ProductInfo from '@/views/product/product-detail/components/ProductInfo.vue'
import ProductFishingCenter from '@/views/product/product-detail/components/ProductFishingCenter.vue'
import ProductFishingReport from '@/views/product/product-detail/components/ProductFishingReport.vue'
import ProductFishingDiary from '@/views/product/product-detail/components/ProductFishingDiary.vue'

const route = useRoute()
const router = useRouter()
const prodId = route.params.prodId
const store = useProductDetailStore()
const product = computed(() => store.product)

const activeTab = ref('조황센터')
const activeSubTab = ref('전체')

onMounted(() => {
  store.fetchProductDetail(prodId)
})

onUnmounted(() => {
  store.clearProduct()
})

const setTab = (tab) => {
  activeTab.value = tab
  if (tab === '조황센터') {
    activeSubTab.value = '전체'
  }
  goToReservation()
}

const goToReservation = () => {
  router.push(`/reservation/${prodId}`)
}
</script>

<template>
  <div class="center">
    <ProductInfo v-if="product" :product="product" />

    <div class="main">
      <!-- 상위 탭 -->
      <div class="top-nav">
        <button
            class="nav-btn"
            :class="{ active: activeTab === '조황센터' }"
            @click="setTab('조황센터')"
        >
          조황센터
        </button>
        <button
            class="nav-btn"
            :class="{ active: activeTab === '결제하기' }"
            @click="setTab('결제하기')"
        >
          결제하기
        </button>
      </div>

      <!-- 하위 탭 -->
      <div v-if="activeTab === '조황센터'" class="sub-nav">
        <button
            class="sub-btn"
            :class="{ active: activeSubTab === '전체' }"
            @click="activeSubTab = '전체'"
        >
          전체
        </button>
        <button
            class="sub-btn"
            :class="{ active: activeSubTab === '조황정보' }"
            @click="activeSubTab = '조황정보'"
        >
          조황정보
        </button>
        <button
            class="sub-btn"
            :class="{ active: activeSubTab === '조행기' }"
            @click="activeSubTab = '조행기'"
        >
          조행기
        </button>
      </div>
    </div>

    <!-- 콘텐츠 영역 -->
    <div v-if="activeTab === '조황센터'">
      <ProductFishingCenter v-if="activeSubTab === '전체'" />
      <ProductFishingReport v-if="activeSubTab === '조황정보'" />
      <ProductFishingDiary v-if="activeSubTab === '조행기'" />
    </div>
  </div>
</template>


<style scoped>
.center {
  width: 80%;
  margin: 4% auto;
}

.main{
  width: 100%;
  margin: 5% 0;
}

/* 상위 버튼 */
.top-nav {
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.nav-btn {
  flex: 1;
  padding: 12px;
  font-size: 1.1rem;
  background-color: #e0e0e0; /* 연한 회색 */
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.nav-btn.active {
  background-color: #2c3e70; /* 딥 블루 */
  color: white;
  box-shadow: 0 2px 6px rgba(58, 129, 241, 0.6);
}

/* 하위 버튼 */
.sub-nav {
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.sub-btn {
  flex: 1;
  padding: 10px;
  font-size: 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.sub-btn.active {
  background-color: #3a81f1; /* 세련된 파란색 */
  color: white;
  box-shadow: 0 3px 8px rgba(106, 79, 156, 0.5);
}

.reservation-btn {
  display: block;
  width: 200px;
  margin: 20px auto;
  padding: 15px 30px;
  font-size: 1.2rem;
  background-color: #2c3e70;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reservation-btn:hover {
  background-color: #1a237e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 62, 112, 0.3);
}
</style>
