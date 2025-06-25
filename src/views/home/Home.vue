<script setup>
import Banner from '@/views/home/components/Banner.vue'
import NoticeBox from '@/views/home/components/NoticeBox.vue'
import SideButtons from '@/views/home/components/SideButtons.vue'
import RecommendationList from '@/views/home/components/RecommendationList.vue'
import PopularList from '@/views/home/components/PopularList.vue'

import { ref, onMounted, computed } from 'vue'
import { useFishingCenterStore } from '@/store/fishing-center/useFishingCenterStore.js'
import { useProductListStore } from '@/store/product/all-products/useProductListStore.js'
import { useFishingReportStore} from "@/store/fishing-center/useFishingReportStore.js";

const centerStore = useFishingCenterStore()
const currentPage = ref(0)
const pageSize = 8
const productListStore = useProductListStore()
const reportStore = useFishingReportStore()

onMounted(async () => {
  try {
    // 조황센터 데이터 로드
    await centerStore.fetchFishingCenterData()
  } catch (error) {
    console.error('Home.vue - 조황센터 데이터 로드 실패:', error)
  }
  
  try {
    // 상품 데이터 로드
    await productListStore.fetchProducts()
  } catch (error) {
    console.error('Home.vue - 상품 데이터 로드 실패:', error)
  }
})

const paginatedProducts = computed(() => {
  const sorted = [...centerStore.reportList].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  const start = currentPage.value * pageSize
  return sorted.slice(start, start + pageSize)
})

const recommendedProducts = computed(() => {
  return productListStore.products
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .slice(0, 6)
})

</script>

<template>
  <Banner />
  <div class="home">
    <div class="top-section">
      <!-- 공지사항 섹션 -->
      <div class="notice-section">
        <NoticeBox />
      </div>
    </div>
    <PopularList :reports="reportStore.reports" />
    <RecommendationList :products="recommendedProducts" />
    <SideButtons />
  </div>
</template>

<style>
.home {
  width: 80%;
  margin: 0 auto;
}

.top-section {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.notice-section {
  flex: 1;
}

.notice-section {
  margin: 0;
}
</style>
