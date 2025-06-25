<script setup>
import {BASE_URL} from "@/constants/baseUrl.js";
import {useRouter} from "vue-router";

const props = defineProps({
  product: Object,
})

const router = useRouter()

function openDetail(product) {
  router.push(`/products/${product.prodId}`)
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
  <div class="card" @click="openDetail(product)">
    <!-- 썸네일 영역 (60% 고정) -->
    <div class="thumbnail-section">
      <!-- 이미지가 있는 경우 -->
      <img
          v-if="hasImage()"
          :src="getThumbnailUrl()"
          class="card-img-top"
          alt="썸네일"
      />
      <!-- 이미지가 없는 경우 플레이스홀더 -->
      <div v-else class="image-placeholder">
        <i class="fas fa-ship"></i>
        <span>이미지 없음</span>
      </div>
    </div>
    
    <!-- 내용 영역 (40%) -->
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
  display: flex;
  flex-direction: column;
  height: 360px;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.thumbnail-section {
  height: 60%;
  overflow: hidden;
  flex-shrink: 0;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
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

.card-body {
  height: 40%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-shrink: 0;
  overflow: hidden;
}

.card-title {
  font-size: 1rem;
  color: #2d3748;
  margin: 0 0 6px 0;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-text {
  font-size: 0.85rem;
  color: #718096;
  margin: 0 0 6px 0;
  font-weight: 500;
  flex-grow: 1;
}

.card-body small {
  color: #a0aec0;
  font-size: 0.8rem;
  margin-top: auto;
}
</style>