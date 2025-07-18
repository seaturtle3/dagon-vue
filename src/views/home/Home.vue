<script setup>
import Banner from '@/views/home/components/Banner.vue'
import NoticeBox from '@/views/home/components/NoticeBox.vue'
import SideButtons from '@/components/common/SideButtons.vue'
import RecommendationList from '@/views/home/components/RecommendationList.vue'
import PopularList from '@/views/home/components/PopularList.vue'
import EventBox from '@/views/home/components/EventBox.vue'

import { ref, onMounted, computed } from 'vue'
import { useFishingCenterStore } from '@/store/fishing-center/useFishingCenterStore.js'
import { useHomeProductStore } from '@/store/product/all-products/useHomeProductStore.js'

// emits 옵션 추가
defineEmits(['loginSuccess', 'logout'])

const centerStore = useFishingCenterStore()
const homeProductStore = useHomeProductStore()

onMounted(async () => {
  try {
    // 조황센터 데이터 로드 (조황정보와 조행기 모두 포함)
    await centerStore.fetchFishingCenterData()
  } catch (error) {
    console.error('Home.vue - 조황센터 데이터 로드 실패:', error)
  }
  
  try {
    // 추천 상품 데이터 로드 (4개만)
    await homeProductStore.fetchRecommendedProducts()
  } catch (error) {
    console.error('Home.vue - 추천 상품 데이터 로드 실패:', error)
  }
})

const paginatedProducts = computed(() => {
  const sorted = [...centerStore.reportList].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  return sorted.slice(0, 8) // 8개만 반환
})

const recommendedProducts = computed(() => {
  return homeProductStore.products
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
})

</script>

<template>
  <Banner />
  <div class="container home-container mx-auto">
    <SideButtons />
    <section class="section-block">
      <PopularList :reports="centerStore.reportList" />
    </section>
    <section class="section-block">
      <RecommendationList :products="recommendedProducts" />
    </section>
    <!-- 공지사항 + 이벤트 박스 -->
    <section class="section-block notice-event-row">
      <div class="notice-event-col notice-col"><NoticeBox /></div>
      <div class="notice-event-col event-col"><EventBox /></div>
    </section>
  </div>
</template>

<style>
.home-container {
  padding: 32px 0 48px 0;
  max-width: 1400px;
}
.section-block {
  margin-top: 60px;
  margin-bottom: 120px;
}
.notice-event-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
  justify-content: center;
  align-items: stretch;
}
.notice-event-col {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.notice-col {
  flex: 1.5 1 0;
}
.event-col {
  flex: 2 1 0;
}
@media (max-width: 900px) {
  .home-container {
    padding: 16px 0 24px 0;
  }
  .section-block {
    margin-bottom: 24px;
  }
  .notice-event-row {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  .notice-event-col {
    max-width: 100%;
  }
}
</style>
