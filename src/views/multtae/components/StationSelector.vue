<template>
  <div class="station-selector" v-if="selectedRegion">
    <div class="selector-group">
      <label for="station-select">관측소 선택:</label>
      <select id="station-select" v-model="selectedStationCode">
        <option value="">관측소를 선택하세요</option>
        <option v-for="station in stations" :key="station.stationCode" :value="station.stationCode">
          {{ station.stationName }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  selectedRegion: String,
  stations: Array,
  modelValue: String // v-model로 받음
})
const emit = defineEmits(['update:modelValue', 'station-selected'])

const selectedStationCode = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('station-selected', val)
  }
})

// 관측소 목록이 바뀌면 첫 번째 관측소 자동 선택
watch(() => props.stations, (newStations) => {
  if (newStations.length > 0) {
    selectedStationCode.value = newStations[0].stationCode
  }
}, { immediate: true })

// 지역이 바뀌면 관측소 선택 초기화
watch(() => props.selectedRegion, () => {
  selectedStationCode.value = ''
})
</script>

<style scoped>
.station-selector {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.selector-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  max-width: 300px;
}

.selector-group select:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.2);
}
</style> 