<template>
  <div class="sea-filter-detail">
    <div class="filter-row">
      <div class="filter-item">
        <label>날짜 : </label>
        <select v-model="selected.date">
          <option value="">전체</option>
          <option v-for="d in filters.availableDates" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>

      <div class="filter-item">
        <label>지역 : </label>
        <select v-model="selected.region">
          <option value="">전체</option>
          <option v-for="r in filters.regions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div class="filter-item">
        <label>세부장소 : </label>
        <select v-model="selected.location">
          <option value="">전체</option>
          <option v-for="l in filters.locations" :key="l" :value="l">{{ l }}</option>
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

<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import axios from 'axios'

const emit = defineEmits(['update:filters'])

const filters = ref({
  availableDates: [],
  regions: [],
  locations: [],
  fishSpecies: [],
})

const selected = ref({
  date: '',
  region: '',
  location: '',
  species: '',
})

onMounted(async () => {
  const { data } = await axios.get('/api/fishing-reports/sea/filters')
  filters.value = data
})

watch(selected, (val) => {
  emit('update:filters', val)
}, { deep: true })
</script>

<style scoped>
.sea-filter-detail {
  width: 100%;
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
