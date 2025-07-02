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
    <h2 class="fw-bold section-title">추천 선사</h2>
    <div class="d-grid" style="grid-template-columns: repeat(6, 1fr); gap: 1rem;">
      <div
          v-for="product in products"
          :key="product.prodId"
          class="product-card"
          @click="openDetail(product.prodId)"
      >
        <!-- 썸네일 영역 (60% 고정) -->
        <div class="thumbnail-section">
            <!-- 1. prodImageDataList가 있으면 첫 장만 보여줌 -->
            <template v-if="product.prodImageDataList && product.prodImageDataList.length > 0">
              <img
                :src="product.prodImageDataList[0].startsWith('data:image') ? product.prodImageDataList[0] : `data:image/jpeg;base64,${product.prodImageDataList[0]}`"
                class="thumbnail-img"
                @error="e => { e.target.src = defaultImage }"
              >
            </template>
            <!-- 2. prodImageNames가 있으면 첫 장만 보여줌 -->
            <template v-else-if="product.prodImageNames && product.prodImageNames.length > 0">
              <img
                :src="product.prodImageNames[0].startsWith('/') ? product.prodImageNames[0] : `${BASE_URL}/uploads/products/${product.prodImageNames[0]}`"
                class="thumbnail-img"
                @error="e => { e.target.src = defaultImage }"
              >
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
  transition: border-color 0.18s, transform 0.12s;
  display: flex;
  flex-direction: column;
  height: 260px;
  /* border: 1.2px solid #e5e7eb; */
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: none !important;
}
.product-card:hover {
  border-color: #bfc5cb;
  transform: translateY(-2px) scale(1.01);
  box-shadow: none !important;
}

.thumbnail-section {
  height: 60%;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bfc5cb;
  font-size: 1rem;
}
.image-placeholder i {
  font-size: 1.7rem;
  margin-bottom: 8px;
  color: #d1d5db;
}
.image-placeholder span {
  font-size: 0.85rem;
  color: #bfc5cb;
}

.product-info {
  height: 40%;
  padding: 14px 12px 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
  text-align: center;
  background-color: #f7f8fa;
}

.product-name {
  font-weight: 700;
  font-size: 1rem;
  color: #222;
  margin-bottom: 6px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-address {
  font-size: 0.92rem;
  color: #6b7280;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

h2.fw-bold {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

@media (max-width: 900px) {
  .d-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
  }
  .product-card {
    height: 200px;
  }
}
</style>
