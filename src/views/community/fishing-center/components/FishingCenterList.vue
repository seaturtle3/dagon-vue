<script setup>
import {ref, computed} from 'vue'
import {IMAGE_BASE_URL} from '@/constants/imageBaseUrl.js'
import {useRouter} from "vue-router";
import Pagination from "@/components/common-function/Pagination.vue";

const props = defineProps({
  centers: {
    type: Array,
    required: true,
    default: () => []
  }
})

const router = useRouter()  // 라우터 인스턴스 생성

const itemsPerPage = 18
const currentPage = ref(1)

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
  const start = (currentPage.value - 1) * itemsPerPage
  return combinedList.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
    Math.ceil(combinedList.value.length / itemsPerPage)
)

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}


console.log("pagedList---<>", pagedList.value)

// 상세 페이지로 이동 함수
const goToDetail = (item) => {
  if (item._type === 'report') {
    router.push(`/fishing-report/${item.frId}`)
  } else if (item._type === 'diary') {
    router.push(`/fishing-diary/${item.fdId}`)
  }
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
          <template v-if="item.images && item.images.length > 0">
            <div v-for="(img, idx) in item.images" :key="idx" class="image-thumb">
              <img :src="`data:image/png;base64,${img.imageData}`" :alt="`이미지 ${idx + 1}`" />
            </div>
          </template>
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

    <div v-else class="text-gray-500">표시할 조황정보나 조행기가 없습니다.</div>

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
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding: 10px 0;
  margin-bottom: 40px;
}

.combined-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 300px;
  overflow: hidden;
}

.combined-box p {
  margin: 2px 0;
  font-size: 14px;
}

.thumbnail-wrapper {
  display: flex;
  gap: 8px;
}

.image-thumb img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  z-index: 1;
  line-height: 1;
  border-radius: 0 0 6px 0; /* 오른쪽 아래만 둥글게 */
}

.badge-report {
  background-color: #007bff; /* 파랑 */
}

.badge-diary {
  background-color: #28a745; /* 초록 */
}

.count {
  color: #4a90e2;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-bottom: 20px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content {
  height: 40%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 4px 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-title {
  font-size: 1rem;
  color: #333;
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
  color: #999;
  font-size: 0.8rem;
  margin-top: auto;
  flex-shrink: 0;
}
</style>
