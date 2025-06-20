<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import axios from 'axios'
import { useSeaProdStore } from '@/store/product/fishing-filter/useSeaProdStore.js'

const emit = defineEmits(['update:filters'])
const seaStore = useSeaProdStore()
const regionKorean = ref('부산') // 사용자 선택값

const regionMap = {
  '서울': 'SEOUL',
  '경기도': 'GYEONGGI',
  '인천': 'INCHEON',
  '부산': 'BUSAN',
  '대구': 'DAEGU',
  '광주': 'GWANGJU',
  '대전': 'DAEJEON',
  '울산': 'ULSAN',
  '세종': 'SEJONG',
  '강원도': 'GANGWON',
  '제주도': 'JEJU',
  '경상북도': 'GYEONGBUK',
  '경상남도': 'GYEONGNAM',
  '전라북도': 'JEONBUK',
  '전라남도': 'JEONNAM',
  '충청북도': 'CHUNGBUK',
  '충청남도': 'CHUNGNAM'
}
const fetchProducts = () => {
  const regionEnum = regionMap[regionKorean.value] || ''
  productStore.fetchFilteredProducts({
    region: regionEnum
  })
}

// 실제 필터에서 보여줄 옵션들
const filters = ref({
  regions: [],
  subType: [],
  fishSpecies: []
})

// 사용자가 선택한 필터 값들
const selected = ref({
  region: '',
  subType: '',
  species: ''
})

// 필터 옵션 불러오기
onMounted(async () => {
  const { data } = await axios.get('/api/product/sea/filters')
  filters.value = data
})

// 선택된 값이 바뀔 때마다 필터된 상품 API 호출
watch(selected, async (val) => {
  emit('update:filters', val)
  await seaStore.fetchFilteredProducts(val) // API 호출 이 타이밍에!
}, { deep: true })
</script>

<template>
  <div class="sea-filter-detail">
    <div class="filter-row">

      <div class="filter-item">
        <label>지역 : </label>
        <select v-model="selected.region">
          <option value="">전체</option>
          <option v-for="r in filters.regions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div class="filter-item">
        <label>세부장소 : </label>
        <select v-model="selected.subType">
          <option value="">전체</option>
          <option v-for="l in filters.subTypes" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>

      <div class="filter-item">
        <label>어종 : </label>
        <select v-model="selected.species">
          <option value="">전체</option>
          <option v-for="f in filters.fishSpecies" :key="f" :value="f">{{ f }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sea-filter-detail {
  width: 80%;
  margin: 0 auto;
  padding: 2rem;
  border: 2px solid #4a90e2;
  border-radius: 16px;
  background-color: #f9fbff;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem; /* 묶음 간 넉넉한 간격 */
  justify-content: space-evenly;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* label과 select 간 간격 */
}

.filter-item label {
  font-weight: 600;
  color: #2c3e50;
  text-align: right;
  user-select: none;
}

.filter-item select {
  min-width: 150px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #4a90e2;
  border-radius: 8px;
  background-color: #fff;
  color: #2c3e50;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-item select:hover,
.filter-item select:focus {
  border-color: #3366cc;
  outline: none;
  box-shadow: 0 0 6px #7aa9f7;
}
</style>
