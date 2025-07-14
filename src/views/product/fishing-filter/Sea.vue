<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import { useSeaProdStore } from '@/store/product/fishing-filter/useSeaProdStore.js'
import SeaProd from "@/views/product/fishing-filter/components/SeaProd.vue";
import SeaFilter from "@/views/product/fishing-filter/components/SeaFilter.vue";

const store = useSeaProdStore()

// 필터 컴포넌트에서 초기 데이터를 로드하므로 여기서는 제거

const products = computed(() => store.products)

const onFilterChange = async (filter) => {
  await store.fetchFilteredProducts(filter)
}
</script>

<template>
  <div class="sea">
    <div class="sea-title">
      <h4>바다낚시</h4>
    </div>

    <div class="filter-detail-wrapper">
      <SeaFilter @update:filter="onFilterChange" />
    </div>

    <SeaProd :seaProducts="products"/>

  </div>
</template>

<style scoped>
.sea {
  width: 80%;
  margin: 5% auto;
}

.sea-title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;

}
.fresh-title h4 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  padding: 0.5em 2em;
}

.sea-title h4 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  padding: 0.5em 2em;
}

.filter-detail-wrapper {
  display: flex;
  justify-content: center; /* 수평 중앙 정렬 */
  margin-bottom: 100px; /* 아래쪽 여백 */
}
</style>