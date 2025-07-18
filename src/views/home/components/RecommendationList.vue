<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGE_BASE_URL } from '@/constants/imageBaseUrl.js'
import { convertToRelativeUrl } from '@/utils/authUtils.js'

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

const getProductImageUrl = (product) => {
  console.log(`🔍 [RecommendationList] 상품 ID ${product.prodId} 이미지 디버깅:`, {
    prodName: product.prodName,
    imagesCount: product.images?.length || 0,
    prodImageDataListCount: product.prodImageDataList?.length || 0,
    prodImageNamesCount: product.prodImageNames?.length || 0
  })

  // 1. images 배열에서 썸네일 우선 (목록보기에서는 thumbnailData 우선)
  if (product.images && product.images.length > 0) {
    // 썸네일 이미지 찾기
    const thumbnailImage = product.images.find(img => img.thumbnail)
    if (thumbnailImage) {
      // 목록보기에서는 thumbnailData 우선 (빠른 로딩)
      if (thumbnailImage.thumbnailData) {
        console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: images[thumbnail].thumbnailData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.thumbnailData}`
      }
      if (thumbnailImage.imageData) {
        console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: images[thumbnail].imageData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.imageData}`
      }
      if (thumbnailImage.imageUrl) {
        console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: images[thumbnail].imageUrl 사용`)
        return convertToRelativeUrl(thumbnailImage.imageUrl)
      }
    }
    
    // 썸네일이 없으면 첫 번째 이미지 사용
    const firstImage = product.images[0]
    if (firstImage.thumbnailData) {
      console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: images[0].thumbnailData 사용`)
      return `data:image/jpeg;base64,${firstImage.thumbnailData}`
    }
    if (firstImage.imageData) {
      console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: images[0].imageData 사용`)
      return `data:image/jpeg;base64,${firstImage.imageData}`
    }
    if (firstImage.imageUrl) {
      console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: images[0].imageUrl 사용`)
      return convertToRelativeUrl(firstImage.imageUrl)
    }
  }
  
  // 2. 기존 방식 (fallback)
  if (product.thumbnailData) {
    console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: thumbnailData 사용 (fallback)`)
    return `data:image/jpeg;base64,${product.thumbnailData}`
  }
  
  if (product.imageData) {
    console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: imageData 사용 (fallback)`)
    return `data:image/jpeg;base64,${product.imageData}`
  }
  
  if (product.thumbnailUrl) {
    console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: thumbnailUrl 사용 (fallback)`)
    return convertToRelativeUrl(product.thumbnailUrl)
  }
  
  if (product.imageUrl) {
    console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: imageUrl 사용 (fallback)`)
    return convertToRelativeUrl(product.imageUrl)
  }
  
  if (product.prodThumbnail) {
    console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: prodThumbnail 사용 (fallback)`)
    return convertToRelativeUrl(product.prodThumbnail)
  }
  
  if (product.prodImageDataList && product.prodImageDataList.length > 0) {
    console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: prodImageDataList 사용 (fallback)`)
    const firstImage = product.prodImageDataList[0]
    if (firstImage.startsWith('data:image')) {
      return firstImage
    }
    return `data:image/jpeg;base64,${firstImage}`
  }
  
  if (product.prodImageNames && product.prodImageNames.length > 0) {
    console.log(`✅ [RecommendationList] 상품 ID ${product.prodId}: prodImageNames 사용 (fallback)`)
    const firstImage = product.prodImageNames[0]
    return convertToRelativeUrl(firstImage)
  }
  
  // 기본 이미지
  console.log(`⚠️ [RecommendationList] 상품 ID ${product.prodId}: 기본 이미지 사용 (no-image.png)`)
  return '/images/no-image.png'
}
</script>

<template>
  <div style="margin-top: 5%">
    <div class="header">
      <h2 class="fw-bold section-title">추천 선사</h2>
    </div>
    <div class="d-grid">
      <div
          v-for="product in products"
          :key="product.prodId"
          class="product-card"
          @click="openDetail(product.prodId)"
      >
        <!-- 썸네일 영역 (60% 고정) -->
        <div class="thumbnail-section">
            <img
              :src="getProductImageUrl(product)"
              class="thumbnail-img"
              @error="e => { e.target.src = '/images/no-image.png' }"
            >
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  position: relative;
}
.view-all {
  font-size: 0.95rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}
.view-all:hover {
  background: #e5e7eb;
}
.product-card {
  cursor: pointer;
  transition: border-color 0.18s, transform 0.12s;
  display: flex;
  flex-direction: column;
  height: 260px;
  /* border: 1.2px solid #e5e7eb; */
  border: none !important;
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

.d-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 1rem;
}
@media (max-width: 1200px) {
  .d-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 600px) {
  .d-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
