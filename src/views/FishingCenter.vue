<script>
import FishingReport from '@/components/fishing-center/FishingReport.vue'
import FishingDiary from '@/components/fishing-center/FishingDiary.vue'
import api from '@/lib/axios.js'

export default {
  name: 'FishingCenter',
  components: {
    FishingReport,
    FishingDiary,
  },
  data() {
    return {
      products: [],
      reports: [],
      diaries: [],
      selectedProduct: null,
      viewType: null // 'report' or 'diary'
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const hasReport = this.reports.some(r => r.productId === product.id);
        const hasDiary = this.diaries.some(d => d.productId === product.id);
        return hasReport || hasDiary;
      });
    }
  },
  async mounted() {
    const [productRes, reportRes, diaryRes] = await Promise.all([
      api.get('/api/product/get-all'),
      api.get('/api/fishing-report/get-all'),
      api.get('/api/fishing-diary/get-all'),
    ]);
    this.products = productRes.data;
    this.reports = reportRes.data;
    this.diaries = diaryRes.data;
  },
  methods: {
    onSelect(product) {
      this.selectedProduct = product;
      const hasReport = this.reports.some(r => r.productId === product.id);
      const hasDiary = this.diaries.some(d => d.productId === product.id);
      this.viewType = hasReport ? 'report' : 'diary';
    }
  }
}
</script>

<template>
  <div class="fishing-center">
    <!-- 상품 목록 -->
    <div v-if="!selectedProduct" class="product-grid">
      <div
          v-for="product in filteredProducts.slice(0, 10)"
          :key="product.id"
          class="product-card"
          @click="onSelect(product)"
      >
        <h5>{{ product.name }}</h5>
        <!-- 필요 시 이미지 등 추가 -->
      </div>
    </div>

    <!-- 선택된 상품의 상세 (조황 or 조행기) -->
    <div v-else>
      <button @click="selectedProduct = null">← 뒤로가기</button>
      <FishingReport v-if="viewType === 'report'" />
      <FishingDiary v-else />
    </div>
  </div>
</template>

<style scoped>
.fishing-center {
  width: 90%;
  margin: auto;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.product-card {
  border: 1px solid #ccc;
  padding: 12px;
  cursor: pointer;
  text-align: center;
  border-radius: 8px;
  background: #f9f9f9;
  transition: 0.2s ease;
}
.product-card:hover {
  background: #eef;
}
</style>
