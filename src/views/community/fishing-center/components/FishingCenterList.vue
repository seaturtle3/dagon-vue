<script setup>
import { computed } from 'vue'

const props = defineProps({
  centers: {
    type: Array,
    required: true,
    default: () => []
  }
})

const combinedList = computed(() => {
  if (!Array.isArray(props.centers)) return [] // 이거 필수

  return props.centers.flatMap(center => {
    const product = center.product
    const reports = (center.reports || []).map(r => ({
      ...r,
      _type: 'report',
      product,
    }))
    const diaries = (center.diaries || []).map(d => ({
      ...d,
      _type: 'diary',
      product,
    }))
    return [...reports, ...diaries]
  }).sort((a, b) => {
    if (!a.fishingAt && !b.fishingAt) return 0
    if (!a.fishingAt) return 1
    if (!b.fishingAt) return -1
    return new Date(b.fishingAt) - new Date(a.fishingAt)
  }).slice(0, 30)
})

</script>

<template>
  <div>
    <h2 class="mb-3 font-bold text-lg">
      전체 조황정보/조행기 <span class="count">({{ combinedList.length }})</span>
    </h2>

    <div class="combined-grid" v-if="combinedList.length > 0">
      <div
          v-for="item in combinedList"
          :key="item._type + '-' + (item.frId || item.fdId)"
          class="combined-box"
      >
        <p><strong>구분:</strong> {{ item._type === 'report' ? '조황정보' : '조행기' }}</p>
        <p><strong>제목:</strong> {{ item.title }}</p>
        <p><strong>내용:</strong> {{ item.content }}</p>
        <p>날짜: {{ item.fishingAt?.slice(0, 10) || '날짜 없음' }}</p>
        <p><strong>상품명:</strong> {{ item.product?.prodName }}</p>
        <p><strong>작성자:</strong> {{ item.user?.uname }}</p>
      </div>
    </div>

    <div v-else class="text-gray-500">표시할 조황정보나 조행기가 없습니다.</div>
  </div>
</template>

<style scoped>
.combined-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(150px, auto);
  gap: 16px;
  max-height: calc(150px * 5 + 16px * 4);
  overflow-y: auto;
  padding: 10px 0;
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
</style>
