<script setup>
import {useRoute, useRouter} from 'vue-router'
import { useProductFishingReportStore } from '@/store/product/product-detail/useProductFishingReportStore.js'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";
import {computed, onMounted} from "vue";

const route = useRoute()
const router = useRouter()
const store = useProductFishingReportStore()
const productId = route.params.prodId

onMounted(() => {
  store.fetchFishingReport(productId)
})

const reportList = computed(() => store.getReportByProductId(productId))

const goToDetail = (report) => {
  router.push(`/fishing-report/${report.frId}`)
}

console.log("-------------ProductId >",productId)
console.log("-------------reportList >",reportList)
</script>

<template>
  <div class="list-container">
    <div v-if="store.loading">로딩중...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <div v-else>

      <div v-if="reportList.length > 0" class="report-grid">
        <div v-for="(report, index) in reportList.slice(0, 15)"
             :key="report.frId"
             class="item-box"
             @click="goToDetail(report)"
        >
          <div class="thumbnail-wrapper">
            <img
          class="thumbnail-img"
          :src="
            report.images && report.images.length
              ? (
                  report.images[0].imageData
                    ? `data:image/jpeg;base64,${report.images[0].imageData}`
                    : (report.images[0].image_data
                        ? `data:image/jpeg;base64,${report.images[0].image_data}`
                        : (report.images[0].imageUrl
                            ? report.images[0].imageUrl
                            : (report.images[0].image_url
                                ? report.images[0].image_url
                                : '/images/no-image.png'
                              )
                          )
                      )
                )
              : '/images/no-image.png'
          "
          alt="썸네일"
      />

          </div>
          <div class="item-content">
            <h3>{{ report.product?.prodName }}</h3>
            <h5>{{ report.title }}</h5>
            <p>{{ report.fishingAt ? report.fishingAt.slice(0, 10) : '날짜 없음' }}</p>
          </div>
        </div>
      </div>
       <div v-else>조황정보가 없습니다.</div>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  width: 100%;
  margin: 0 auto;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 10px 0;
}

.item-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 0;
}

.item-content {
  height: 40%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-content h3 {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.item-content h5 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-content p {
  color: #999;
  font-size: 0.85rem;
  margin: 0;
}

.thumbnail-wrapper {
  height: 60%;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.image-placeholder i {
  font-size: 2rem;
  color: #999;
  margin-bottom: 8px;
}

.image-placeholder span {
  font-size: 0.85rem;
  color: #999;
}
</style>
