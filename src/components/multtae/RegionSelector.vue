<template>
  <div class="region-buttons" v-if="regionsWithStations">
    <button 
      v-for="(hasStation, region) in regionsWithStations" 
      :key="region"
      @click="selectRegion(region)"
      :class="['region-btn', { active: selectedRegion === region, disabled: !hasStation }]"
      :disabled="!hasStation"
    >
      {{ region }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'RegionSelector',
  props: {
    regionsWithStations: {
      type: Object,
      default: () => ({})
    },
    selectedRegion: {
      type: String,
      default: ''
    }
  },
  emits: ['region-selected'],
  setup(props, { emit }) {
    const selectRegion = (region) => {
      if (!props.regionsWithStations[region]) return
      emit('region-selected', region)
    }

    return {
      selectRegion
    }
  }
}
</script>

<style scoped>
.region-buttons {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.region-btn {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background-color: #ffffff;
  color: #212529;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.region-btn:hover:not(:disabled) {
  background-color: #e2e6ea;
}

.region-btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.region-btn.disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  border-color: #ced4da;
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 768px) {
  .region-buttons {
    justify-content: center;
  }
}
</style> 