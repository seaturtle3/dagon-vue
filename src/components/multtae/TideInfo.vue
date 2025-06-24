<template>
  <div class="data-section" v-if="tideItems && tideItems.length > 0">
    <h5>조위 정보</h5>
    <div class="tide-list">
      <div v-for="(tide, index) in tideItems" :key="index" class="tide-item">
        {{ tide.hl_code }} {{ tide.tph_time }} ({{ tide.tph_level }})
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TideInfo',
  props: {
    tideItems: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.data-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.data-section h5 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 10px;
}

.tide-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tide-item {
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 5px;
  border-left: 3px solid #0d6efd;
  font-weight: 500;
}

@media (max-width: 768px) {
  .tide-list {
    flex-direction: column;
  }
}
</style> 