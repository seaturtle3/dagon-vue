<script setup>
import { useRouter } from 'vue-router'
import ProductCard from "@/views/product/all-products/components/ProductCard.vue";
import Pagination from "@/components/common-function/Pagination.vue";

defineProps({
  products: Array,
  page: Number,
  totalPages: Number,
})

const emit = defineEmits(['page-change'])
const router = useRouter()

function goToPage(num) {
  emit('page-change', num)
}

function goToProductForm() {
  router.push('/products/form')
}
</script>

<template>
  <div class="product-list-view">
    <!-- 헤더 섹션 -->
    <div class="header-section">
      <h2 class="page-title">모든 선박 리스트</h2>
      <button
          type="button"
          class="btn-register"
          @click="goToProductForm">
        <i class="fas fa-plus"></i>
        배 등록하기
      </button>
    </div>

    <!-- 상품 그리드 -->
    <div class="products-grid">
      <div
          v-for="product in products"
          :key="product.prodId"
          class="product-item"
      >
        <ProductCard :product="product" />
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination-section">
      <Pagination
          :page="page"
          :total-pages="totalPages"
          @page-change="goToPage"
      />
    </div>
  </div>
</template>

<style scoped>
.product-list-view {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  backdrop-filter: blur(10px);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e3f2fd;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #0d47a1;
  margin: 0;
}

.btn-register {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-register:hover {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
}

.btn-register i {
  font-size: 0.9rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.product-item {
  display: flex;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .product-list-view {
    padding: 1.5rem;
    border-radius: 12px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .btn-register {
    justify-content: center;
    padding: 0.875rem 1.25rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .product-list-view {
    padding: 1rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
