<script setup>
import {BASE_URL} from "@/constants/baseUrl.js";
import {useRouter} from "vue-router";
import { ref, onMounted, onUnmounted } from 'vue';
import { convertToRelativeUrl } from '@/utils/authUtils.js'

const props = defineProps({
  product: Object,
})

const router = useRouter()
const currentImageIndex = ref(0)
const slideInterval = ref(null)

// 이미지 배열 가져오기
function getImageUrls() {
  if (props.product.prodImageNames && props.product.prodImageNames.length > 0) {
    return props.product.prodImageNames.map(imageName => convertToRelativeUrl(imageName));
  }
  return [];
}

// 이미지가 있는지 확인
function hasImages() {
  return props.product.prodImageNames && props.product.prodImageNames.length > 0;
}

// 이미지 개수 확인
function getImageCount() {
  return props.product.prodImageNames ? props.product.prodImageNames.length : 0;
}

// 슬라이드 시작
function startSlide() {
  const imageCount = getImageCount();
  if (imageCount > 1) {
    slideInterval.value = setInterval(() => {
      currentImageIndex.value = (currentImageIndex.value + 1) % imageCount;
    }, 3000); // 3초마다 슬라이드
  }
}

// 슬라이드 정지
function stopSlide() {
  if (slideInterval.value) {
    clearInterval(slideInterval.value);
    slideInterval.value = null;
  }
}

// 수동 슬라이드
function goToSlide(index) {
  currentImageIndex.value = index;
}

function openDetail(product) {
  router.push(`/products/${product.prodId}`)
}

onMounted(() => {
  startSlide();
});

onUnmounted(() => {
  stopSlide();
});
</script>

<template>
  <div class="product-card" @click="openDetail(product)">
    <!-- 썸네일 영역 -->
    <div class="thumbnail-section" @mouseenter="stopSlide" @mouseleave="startSlide">
      <!-- 이미지가 있는 경우 -->
      <div v-if="hasImages()" class="image-slider">
        <img
            :src="getImageUrls()[currentImageIndex]"
            class="product-image"
            alt="상품 이미지"
        />
        
        <!-- 이미지가 여러 개일 때 인디케이터 표시 -->
        <div v-if="getImageCount() > 1" class="image-indicators">
          <div
              v-for="(image, index) in getImageUrls()"
              :key="index"
              class="indicator"
              :class="{ active: index === currentImageIndex }"
              @click.stop="goToSlide(index)"
          ></div>
        </div>
        
        <!-- 이미지 개수 표시 -->
        <div v-if="getImageCount() > 1" class="image-counter">
          {{ currentImageIndex + 1 }} / {{ getImageCount() }}
        </div>
      </div>
      
      <!-- 이미지가 없는 경우 플레이스홀더 -->
      <div v-else class="image-placeholder">
        <i class="fas fa-ship"></i>
        <span>이미지 없음</span>
      </div>
    </div>
    
    <!-- 내용 영역 -->
    <div class="card-content">
      <h3 class="product-title">{{ product.prodName }}</h3>
      <p class="product-region">{{ product.prodRegion }}</p>
      <div class="product-meta">
        <span class="created-date">{{ new Date(product.createdAt).toLocaleDateString() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  cursor: pointer;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 105, 192, 0.2);
}

.thumbnail-section {
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f8fafc;
}

.image-slider {
  position: relative;
  width: 100%;
  height: 100%;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.image-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1976d2;
}

.image-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}

.image-placeholder span {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.8;
}

/* 이미지 인디케이터 */
.image-indicators {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.indicator.active {
  background: #1976d2;
  transform: scale(1.2);
}

/* 이미지 카운터 */
.image-counter {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
}

.card-content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0d47a1;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.product-region {
  font-size: 0.875rem;
  color: #1976d2;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.product-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.created-date {
  font-size: 0.75rem;
  color: #90a4ae;
  font-weight: 500;
}

@media (max-width: 768px) {
  .thumbnail-section {
    height: 180px;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .product-title {
    font-size: 1rem;
  }
  
  .product-region {
    font-size: 0.8rem;
  }
  
  .indicator {
    width: 6px;
    height: 6px;
  }
  
  .image-counter {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .thumbnail-section {
    height: 160px;
  }
  
  .card-content {
    padding: 0.875rem;
  }
  
  .product-title {
    font-size: 0.95rem;
  }
}
</style>