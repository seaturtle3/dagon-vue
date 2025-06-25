<script setup>
import {BASE_URL} from "@/constants/baseUrl.js";

const props = defineProps({
  product: Object,
})

function openDetail(product) {
  const url = `products/${product.prodId}`
  window.open(url, '_blank')
}

// 썸네일 이미지 URL 생성
function getThumbnailUrl() {
  if (props.product.prodImageNames && props.product.prodImageNames.length > 0) {
    // 배열의 첫 번째 이미지를 썸네일로 사용
    const firstImage = props.product.prodImageNames[0];
    if (firstImage) {
      return `${BASE_URL}${firstImage}`;
    }
  }
  // 이미지가 없으면 null 반환 (CSS로 처리)
  return null;
}

// 이미지가 있는지 확인
function hasImage() {
  return props.product.prodImageNames && 
         props.product.prodImageNames.length > 0 && 
         props.product.prodImageNames[0];
}
</script>

<template>
  <div class="card h-100" @click="openDetail(product)">
    <!-- 이미지가 있는 경우 -->
    <img
        v-if="hasImage()"
        :src="getThumbnailUrl()"
        class="card-img-top"
        alt="썸네일"
        style="height: 150px; object-fit: cover;"
    />
    <!-- 이미지가 없는 경우 플레이스홀더 -->
    <div v-else class="image-placeholder">
      <i class="fas fa-ship"></i>
      <span>이미지 없음</span>
    </div>
    <div class="card-body">
      <h6 class="card-title">{{ product.prodName }}</h6>
      <p class="card-text text-muted" style="font-size: 0.8rem">
        {{ product.prodRegion }}
      </p>
      <small class="text-muted">{{ new Date(product.createdAt).toLocaleDateString() }}</small>
    </div>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.image-placeholder {
  height: 150px;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.image-placeholder i {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #cbd5e0;
}

.image-placeholder span {
  font-size: 0.875rem;
  color: #a0aec0;
}
</style>