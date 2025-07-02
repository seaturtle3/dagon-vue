<script setup>
import Banner from '@/views/home/components/Banner.vue'
import NoticeBox from '@/views/home/components/NoticeBox.vue'
import SideButtons from '@/components/common/SideButtons.vue'
import RecommendationList from '@/views/home/components/RecommendationList.vue'
import PopularList from '@/views/home/components/PopularList.vue'

import { ref, onMounted, computed } from 'vue'
import { useFishingCenterStore } from '@/store/fishing-center/useFishingCenterStore.js'
import { useProductListStore } from '@/store/product/all-products/useProductListStore.js'
import { useFishingReportStore} from "@/store/fishing-center/useFishingReportStore.js";

// emits 옵션 추가
defineEmits(['loginSuccess', 'logout'])

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
  <div class="container home-container mx-auto">
    <SideButtons />
    <section class="section-block">
      <PopularList :reports="reportStore.reports" />
    </section>
    <section class="section-block">
      <RecommendationList :products="recommendedProducts" />
    </section>
    <!-- 공지사항 섹션 -->
    <section class="section-block">
      <NoticeBox />
    </section>
  </div>
</template>

<style>
.home-container {
  padding: 32px 0 48px 0;
  max-width: 1200px;
}
.section-block {
  margin-top: 20px;
  margin-bottom: 60px;
}
@media (max-width: 900px) {
  .home-container {
    padding: 16px 0 24px 0;
  }
  .section-block {
    margin-bottom: 24px;
  }
}
</style>
