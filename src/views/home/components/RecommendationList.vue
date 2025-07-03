<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGE_BASE_URL } from '@/constants/imageBaseUrl.js'

const props = defineProps({
  products: {
    type: Array,
    required: true
  }
})

const router = useRouter()

function openDetail(productId) {
  router.push(`/products/${productId}`)
}
</script>

<template>
  <div style="margin-top: 5%">
    <h2 class="fw-bold fs-5 mb-3">추천 선사</h2>
    <div class="d-grid" style="grid-template-columns: repeat(6, 1fr); gap: 1rem;">
      <div
          v-for="product in products"
          :key="product.prodId"
          class="product-card"
          @click="openDetail(product.prodId)"
      >
        <!-- 썸네일 영역 (60% 고정) -->
        <div class="thumbnail-section">
            <!-- 1. prodImageDataList가 있으면 첫 번째 이미지만 보여줌 -->
            <template v-if="product.prodImageDataList && product.prodImageDataList.length > 0">
              <img
                :src="product.prodImageDataList[0].startsWith('data:image') ? product.prodImageDataList[0] : `data:image/jpeg;base64,${product.prodImageDataList[0]}`"
                class="thumbnail-img"
                @error="e => { e.target.src = '/images/default-product.jpg' }"
              >
            </template>
            <!-- 2. prodImageNames가 있으면 첫 번째 이미지만 보여줌 -->
            <template v-else-if="product.prodImageNames && product.prodImageNames.length > 0">
              <img
                :src="product.prodImageNames[0].startsWith('/') ? product.prodImageNames[0] : `${IMAGE_BASE_URL}/uploads/products/${product.prodImageNames[0]}`"
                class="thumbnail-img"
                @error="e => { e.target.src = '/images/default-product.jpg' }"
              >
            </template>
            <!-- 3. 이미지가 없으면 기본 이미지 표시 -->
            <template v-else>
              <div class="image-placeholder">
                <i class="fas fa-ship"></i>
                <span>이미지 없음</span>
              </div>
            </template>
        </div>
        
        <div class="product-info">
          <div class="product-name">
            {{ product.prodName }}
          </div>
          <div class="product-address">
            {{ product.prodAddress }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 300px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.thumbnail-section {
  height: 60%;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail-img {
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

.product-info {
  height: 40%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
  text-align: center;
}

.product-name {
  font-weight: 600;
  font-size: 1rem;
  color: #2d3748;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-address {
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
