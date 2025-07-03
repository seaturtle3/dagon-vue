<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import api from '@/lib/axios'
import { useFreshwaterProdStore } from '@/store/product/fishing-filter/useFreshwaterProdStore.js'

const emit = defineEmits(['update:filter'])
const freshwaterStore = useFreshwaterProdStore()

const regionMap = {
  SEOUL: '서울',
  GYEONGGI: '경기도',
  INCHEON: '인천',
  BUSAN: '부산',
  DAEGU: '대구',
  GWANGJU: '광주',
  DAEJEON: '대전',
  ULSAN: '울산',
  SEJONG: '세종',
  GANGWON: '강원도',
  JEJU: '제주도',
  GYEONGBUK: '경상북도',
  GYEONGNAM: '경상남도',
  JEONBUK: '전라북도',
  JEONNAM: '전라남도',
  CHUNGBUK: '충청북도',
  CHUNGNAM: '충청남도'
}

const subTypeMap = {
  RIVER: "강",
  RESERVOIR: "저수지",
  DAM: "댐",
  POND: "연못",
  SMALL_LAKE: "소류지",
  CANAL: "수로",
  FLOATING_PLATFORM: "좌대",
  OPEN_AREA: "노지",
  OTHER_FRESHWATER: "기타_민물",
};

// 필터 옵션
const filters = ref({
  regions: [],
  subTypes: [],
  fishSpecies: []
})

// 선택된 값들
const selected = ref({
  region: '',
  subType: '',
  species: ''
})

// 필터된 상품 조회 함수
const fetchProducts = async (filterValues) => {
  const normalizedVal = {
    region: filterValues.region || null,
    subType: filterValues.subType || null,
    species: filterValues.species || null,
  }
  await freshwaterStore.fetchFilteredProducts(normalizedVal)
}

// 마운트 시 초기 필터 옵션 불러오기 및 상품 조회
onMounted(async () => {
  const { data } = await api.get('api/product/freshwater/filter')
  filters.value = data

  fetchProducts({})  // 전체 조회
})

// 선택 값 변경 감지
watch(selected, (val) => {
  emit('update:filter', val)
  fetchProducts(val)
}, { deep: true })
</script>

<template>
  <div class="freshwater-filter-detail">
    <div class="filter-row">

      <div class="filter-item">
        <label>지역 : </label>
        <select v-model="selected.region">
          <option value="">전체</option>
          <option v-for="(label, key) in regionMap" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <div class="filter-item">
        <label>세부장소 : </label>
        <select v-model="selected.subType">
          <option value="">전체</option>
          <option v-for="(label, key) in subTypeMap" :key="key" :value="key">{{ label }}</option>
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
.freshwater-filter-detail {
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