<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {IMAGE_BASE_URL} from '@/constants/imageBaseUrl.js'
import {useRouter} from "vue-router";
import Pagination from "@/components/common-function/Pagination.vue";
import { convertToRelativeUrl } from '@/utils/authUtils.js'

const props = defineProps({
  centers: {
    type: Array,
    required: true,
    default: () => []
  }
})

const router = useRouter()  // 라우터 인스턴스 생성

const itemsPerPage = ref(16)
const currentPage = ref(1)

function getResponsivePageSize() {
  const width = window.innerWidth
  if (width > 1200) return 16   // 4x4
  if (width > 900) return 8     // 2x4
  if (width > 480) return 4     // 1x4
  return 2                      // 모바일 최소
}

const updatePageSize = () => {
  const newSize = getResponsivePageSize()
  if (itemsPerPage.value !== newSize) {
    itemsPerPage.value = newSize
    currentPage.value = 1 // 페이지 리셋
  }
}

onMounted(() => {
  updatePageSize()
  window.addEventListener('resize', updatePageSize)
})
onUnmounted(() => {
  window.removeEventListener('resize', updatePageSize)
})

const combinedList = computed(() => {
  if (!Array.isArray(props.centers)) return []

  return props.centers.flatMap(center => {
    const reports = (center.reports || []).map(r => ({
      ...r,
      _type: 'report',
    }))
    const diaries = (center.diaries || []).map(d => ({
      ...d,
      _type: 'diary',
    }))
    return [...reports, ...diaries]
  }).sort((a, b) => {
    if (!a.fishingAt && !b.fishingAt) return 0
    if (!a.fishingAt) return 1
    if (!b.fishingAt) return -1
    return new Date(b.fishingAt) - new Date(a.fishingAt)
  })
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return combinedList.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() =>
    Math.ceil(combinedList.value.length / itemsPerPage.value)
)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 상세 페이지로 이동 함수
const goToDetail = (item) => {
  if (item._type === 'report') {
    router.push(`/fishing-report/${item.frId}`)
  } else if (item._type === 'diary') {
    router.push(`/fishing-diary/${item.fdId}`)
  }
}

// 이미지 URL 생성 함수 (목록보기에서는 thumbnailData 우선)
const getImageUrl = (item) => {
  console.log(`🔍 [FishingCenterList] ${item._type} ID ${item.frId || item.fdId} 이미지 디버깅:`, {
    title: item.title,
    imagesCount: item.images?.length || 0
  })

  // images 배열에서 썸네일 우선 (목록보기에서는 thumbnailData 우선)
  if (item.images && item.images.length > 0) {
    // 썸네일 이미지 찾기
    const thumbnailImage = item.images.find(img => img.isThumbnail)
    if (thumbnailImage) {
      // 목록보기에서는 thumbnailData 우선 (빠른 로딩)
      if (thumbnailImage.thumbnailData) {
        console.log(`✅ [FishingCenterList] ${item._type} ID ${item.frId || item.fdId}: images[thumbnail].thumbnailData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.thumbnailData}`
      }
      if (thumbnailImage.imageData) {
        console.log(`✅ [FishingCenterList] ${item._type} ID ${item.frId || item.fdId}: images[thumbnail].imageData 사용`)
        return `data:image/jpeg;base64,${thumbnailImage.imageData}`
      }
      if (thumbnailImage.imageUrl) {
        console.log(`✅ [FishingCenterList] ${item._type} ID ${item.frId || item.fdId}: images[thumbnail].imageUrl 사용`)
        return convertToRelativeUrl(thumbnailImage.imageUrl)
      }
    }
    
    // 썸네일이 없으면 첫 번째 이미지 사용
    const firstImage = item.images[0]
    if (firstImage.thumbnailData) {
      console.log(`✅ [FishingCenterList] ${item._type} ID ${item.frId || item.fdId}: images[0].thumbnailData 사용`)
      return `data:image/jpeg;base64,${firstImage.thumbnailData}`
    }
    if (firstImage.imageData) {
      console.log(`✅ [FishingCenterList] ${item._type} ID ${item.frId || item.fdId}: images[0].imageData 사용`)
      return `data:image/jpeg;base64,${firstImage.imageData}`
    }
    if (firstImage.imageUrl) {
      console.log(`✅ [FishingCenterList] ${item._type} ID ${item.frId || item.fdId}: images[0].imageUrl 사용`)
      return convertToRelativeUrl(firstImage.imageUrl)
    }
  }
  
  // 기본 이미지
  console.log(`⚠️ [FishingCenterList] ${item._type} ID ${item.frId || item.fdId}: 기본 이미지 사용 (no-image.png)`)
  return '/images/no-image.png'
}
</script>

<template>
  <div>
    <div class="combined-grid" v-if="pagedList.length > 0">
      <div
          v-for="item in pagedList"
          :key="item._type + '-' + (item.frId || item.fdId)"
          class="combined-box"
          @click="goToDetail(item)"
          style="cursor: pointer;"
      >
        <!-- 썸네일 -->
        <div class="thumbnail-wrapper">
          <img
              class="thumbnail"
              :src="getImageUrl(item)"
              alt="썸네일"
              v-if="item.images && item.images.length > 0"
          />
          <div v-else class="image-placeholder">
            <i class="fas fa-image"></i>
            <span>이미지 없음</span>
          </div>
          <div
              class="badge"
              :class="item._type === 'report' ? 'badge-report' : 'badge-diary'"
          >
            {{ item._type === 'report' ? '조황정보' : '조행기' }}
          </div>
        </div>

        <div class="content">
          <h3 class="product-name">{{ item.product?.prodName }}</h3>
          <h5 class="item-title">{{ item.title }}</h5>
          <small class="item-date">{{ item.fishingAt ? item.fishingAt.slice(0, 10) : '날짜 없음' }}</small>
        </div>
      </div>
    </div>

    <div v-else class="empty-message">표시할 조황정보나 조행기가 없습니다.</div>

    <Pagination
      :page="currentPage"
      :total-pages="totalPages"
      :zero-based="false"
      @page-change="goToPage"
    />
  </div>
</template>

<style scoped>
.combined-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 10px 0;
  margin-bottom: 40px;
}

.combined-box {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 260px;
  transition: border-color 0.18s, transform 0.12s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.combined-box:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  height: 60%;
  overflow: hidden;
  flex-shrink: 0;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
  margin-bottom: 6px;
  color: #d1d5db;
}

.image-placeholder span {
  font-size: 0.8rem;
  color: #bfc5cb;
}

.badge {
  position: absolute;
  top:0;
  left: 0;
  color: white;
  font-size: 0.9rem;
  padding: 6px 8px;
  z-index: 1;
  line-height: 1;
  border-radius: 0 0 4px 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-report {
  background-color: #3b82f6;
}

.badge-diary {
  background-color: #10b981;
}

.content {
  height: 40%;
  padding: 14px 12px 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  background-color: #f7f8fa;
}

.product-name {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 4px 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-title {
  font-size: 1rem;
  color: #1f2937;
  margin: 0;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.item-date {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: auto;
  flex-shrink: 0;
}

.empty-message {
  text-align: center;
  padding: 80px 0;
  color: #6b7280;
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .combined-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .combined-grid {
    grid-template-columns: 1fr;
  }
}
</style>
