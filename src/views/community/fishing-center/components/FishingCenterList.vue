<script setup>
import {ref, computed} from 'vue'
import {IMAGE_BASE_URL} from '@/constants/imageBaseUrl.js'
import {useRouter} from "vue-router";

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

// 상세 페이지로 이동 함수
const goToDetail = (item) => {
  if (item._type === 'report') {
    window.open(`/fishing-report/${item.frId}`, '_blank')
  } else if (item._type === 'diary') {
    window.open(`/fishing-diary/${item.fdId}`, '_blank')
  }
}
</script>

<template>
  <div>
    <h4 class="mb-3 font-bold text-lg">
      전체 조황정보/조행기
      <span class="count">({{ combinedList.length }})</span>
    </h4>

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
              v-if="item.thumbnailUrl"
              class="thumbnail"
              :src="`${IMAGE_BASE_URL}/${item._type === 'report' ? 'fishing-report' : 'fishing-diary'}/${item.thumbnailUrl}`"
              alt="썸네일"
          />
          <div
              class="badge"
              :class="item._type === 'report' ? 'badge-report' : 'badge-diary'"
          >
            {{ item._type === 'report' ? '조황정보' : '조행기' }}
          </div>
        </div>

        <div class="content">
          <strong> {{ item.product?.prodName }} </strong>
          <h6>{{ item.title }}</h6>
          <small>날짜: {{ item.fishingAt || '날짜 없음' }}</small>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500">표시할 조황정보나 조행기가 없습니다.</div>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">다음</button>
    </div>
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
  position: relative;
  width: 100%;
  height: 60%;
  overflow: hidden; /* 이게 있어야 뱃지가 박스 밖으로 안 튀어나감 */
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
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
  padding: 8px 12px;
}
</style>
