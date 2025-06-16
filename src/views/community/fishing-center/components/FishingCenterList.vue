<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  centers: {
    type: Array,
    required: true,
    default: () => []
  }
})

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
</script>

<template>
  <div>
    <h2 class="mb-3 font-bold text-lg">
      전체 조황정보/조행기 <span class="count">({{ combinedList.length }})</span>
    </h2>

    <div class="combined-grid" v-if="pagedList.length > 0">
      <div
          v-for="item in pagedList"
          :key="item._type + '-' + (item.frId || item.fdId)"
          class="combined-box"
      >
        <p><strong>구분:</strong> {{ item._type === 'report' ? '조황정보' : '조행기' }}</p>
        <p><strong>제목:</strong> {{ item.title }}</p>
        <p><strong>내용:</strong> {{ item.content }}</p>
        <p>날짜: {{ item.fishingAt || '날짜 없음' }}</p>
        <p><strong>상품명:</strong> 없음</p>
        <p><strong>작성자:</strong> {{ item.user?.uname }}</p>
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
  grid-auto-rows: minmax(150px, auto);
  gap: 16px;
  padding: 10px 0;
  margin-bottom: 40px; /* ← 하단 페이징과 겹치지 않도록 여백 추가 */
}

.combined-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 12px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
}

.count {
  color: #4a90e2;
  font-weight: 600;
  margin-left: 6px;
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

</style>
