<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import api from '@/lib/axios'
import { useSeaProdStore } from '@/store/product/fishing-filter/useSeaProdStore.js'

const emit = defineEmits(['update:filter'])
const seaStore = useSeaProdStore()

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
  BREAK_WATER: "방파제",
  ROCKY_SHORE: "갯바위",
  ESTUARY: "하구",
  BOAT: "선상",
  MUD_FLAT: "갯벌",
  ARTIFICIAL: "인공낚시터",
  OPEN_SEA: "해상",
  BEACH: "해변",
  REEF: "암초",
  OTHER_SEA: "기타_바다",
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
  subTypes: [],   // API에서 subTypes 키라면 여기도 맞춰야 함
  fishSpecies: []
})

// 선택된 값들
const selected = ref({
  region: '',
  subType: '',
  species: []
})

const showSpeciesModal = ref(false)
const tempSelectedSpecies = ref([])

function openSpeciesModal() {
  tempSelectedSpecies.value = [...selected.value.species]
  showSpeciesModal.value = true
}

function toggleSpecies(f) {
  const idx = tempSelectedSpecies.value.indexOf(f)
  if (idx === -1) tempSelectedSpecies.value.push(f)
  else tempSelectedSpecies.value.splice(idx, 1)
}

function applySpecies() {
  selected.value.species = [...tempSelectedSpecies.value]
  showSpeciesModal.value = false
}

function resetSpeciesSelection() {
  tempSelectedSpecies.value = []
}

// 필터된 상품 조회 함수
const fetchProducts = async (filterValues, page = 0, size = 15) => {
  const normalizedVal = {
    region: filterValues.region || '',
    subType: filterValues.subType || '',
    species: filterValues.species || [],
    page,
    size
  }
  await seaStore.fetchFilteredProducts(normalizedVal)
}

// 마운트 시 초기 필터 옵션 불러오기 및 상품 조회
onMounted(async () => {
  const { data } = await api.get('/api/product/sea/filter')
  filters.value = data

  fetchProducts({}, 0, 15)  // 전체 조회, 첫 페이지, 15개씩
})

// 선택 값 변경 감지
watch(selected, (val) => {
  emit('update:filter', val)
  fetchProducts(val, 0, 15)
}, { deep: true })
</script>

<template>
  <div class="sea-filter-detail">
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
        <button type="button" class="species-select-btn" @click="openSpeciesModal">
          <template v-if="selected.species.length === 0">
            전체
          </template>
          <template v-else-if="selected.species.length <= 3">
            {{ selected.species.join(', ') }}
          </template>
          <template v-else>
            {{ selected.species.slice(0, 3).join(', ') }} 외 {{ selected.species.length - 3 }}개
          </template>
        </button>
      </div>

    </div>
    <!-- 어종 선택 모달 -->
    <div v-if="showSpeciesModal" class="modal-backdrop" @click.self="showSpeciesModal = false">
      <div class="modal-content">
        <h3>어종 선택</h3>
        <div class="species-grid">
          <button
            :class="['species-box', { selected: tempSelectedSpecies.length === 0 }]"
            @click="resetSpeciesSelection"
            type="button"
          >
            전체
          </button>
          <button
            v-for="f in filters.fishSpecies"
            :key="f"
            :class="['species-box', { selected: tempSelectedSpecies.includes(f) }]"
            @click="toggleSpecies(f)"
            type="button"
          >
            {{ f }}
          </button>
        </div>
        <div class="modal-actions">
          <button @click="resetSpeciesSelection" class="reset-btn">초기화</button>
          <button @click="applySpecies" class="apply-btn">적용</button>
          <button @click="showSpeciesModal = false" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sea-filter-detail {
  width: 80%;
  max-width: 1000px;
  height:106px;
  margin: 0 auto;
  padding: 2rem;
  border-radius:53px;
  border: 1px solid #4a91e25e;
  background: rgb(227, 240, 255) ;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: space-evenly;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-item label {
  font-weight: 600;
  text-align: right;
  user-select: none;
}

.filter-item select {
  min-width: 150px;
  padding: 0.5rem 0.75rem;
  border: none;
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

.species-select-btn {
  min-width: 150px;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #2c3e50;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
  text-align: left;
}
.species-select-btn:hover,
.species-select-btn:focus {
  border-color: #3366cc;
  outline: none;
  box-shadow: 0 0 6px #7aa9f7;
}

.modal-backdrop {
  position: fixed; left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  min-width: 320px;
  max-width: 50vw;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.species-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}
.species-box {
  border: 1px solid #4a91e25e;
  border-radius: 8px;
  padding: 8px 16px;
  background: #fff;
  color: #2c3e50; /* 어종 모달 글자 색 */
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.species-box:hover {
  border: 1px solid #4a90e2;
  font-weight: bold;
}
.species-box.selected {
  background: #4a90e2;
  color: #fff;
  font-weight: bold;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
.apply-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.apply-btn:hover {
  background: #1565c0;
}
.cancel-btn {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-btn:hover {
  background: #ccc;
}
.reset-btn {
  background: #fff;
  color: #1976d2;
  border: 1px solid #1976d2;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.reset-btn:hover {
  background: #e3f2fd;
  color: #1565c0;
}

@media (max-width: 900px) {
  .sea-filter-detail {
    width: 98%;
    padding: 1.2rem 0.5rem;
    border-radius: 32px;
    height: auto;
  }
  .filter-row {
    gap: 1.2rem;
  }
  .filter-item select,
  .species-select-btn {
    min-width: 120px;
    font-size: 0.93rem;
    padding: 0.45rem 0.7rem;
  }
}

@media (max-width: 600px) {
  .sea-filter-detail {
    width: 100%;
    padding: 0.7rem 0.2rem;
    border-radius: 18px;
    height: auto;
  }
  .filter-row {
    flex-direction: column;
    gap: 0.7rem;
    align-items: stretch;
  }
  .filter-item {
    width: 100%;
    justify-content: flex-start;
  }
  .filter-item label {
    min-width: 60px;
    font-size: 0.98rem;
  }
  .filter-item select,
  .species-select-btn {
    width: 100%;
    min-width: 0;
    font-size: 0.98rem;
    padding: 0.45rem 0.7rem;
  }
}
</style>
